import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { CONFIG } from "../config";
import { jobManager } from "../jobs/job-manager";
import { buildYtdlpArgs, buildFfmpegAudioArgs, buildFfmpegVideoArgs } from "./command-builder";
import { parseProgress } from "./progress-parser";
import { verifyFile } from "./probe";
import { sanitizeFilename } from "../security/sanitize-filename";
import { getVideoMetadata } from "./metadata";
import { AudioOutputFormat, VideoOutputFormat } from "../jobs/job-types";
import { createAppError, type ErrorCode } from "../errors/error-codes";
import { checkDiskSpace } from "../jobs/disk-space-check";
import crypto from "crypto";

const AUDIO_FORMATS: AudioOutputFormat[] = ["mp3", "m4a", "wav", "flac", "ogg"];
const VIDEO_FORMATS: VideoOutputFormat[] = ["mp4", "webm", "mkv"];

function getMimeType(format: string): string {
  const map: Record<string, string> = {
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    wav: "audio/wav",
    flac: "audio/flac",
    ogg: "audio/ogg",
    mp4: "video/mp4",
    webm: "video/webm",
    mkv: "video/x-matroska",
  };
  return map[format] ?? "application/octet-stream";
}

export async function processJob(jobId: string) {
  const job = jobManager.getJob(jobId);
  if (!job) return;

  const outputFormat = job.output_format;
  const isAudio = AUDIO_FORMATS.includes(outputFormat as AudioOutputFormat);
  const isVideo = VIDEO_FORMATS.includes(outputFormat as VideoOutputFormat);
  const extension = `.${outputFormat}`;

  const jobDir = path.join(CONFIG.media.tempDir, jobId);
  if (!fs.existsSync(jobDir)) {
    fs.mkdirSync(jobDir, { recursive: true });
  }

  const outputPath = path.join(jobDir, `output${extension}`);

  try {
    // Check disk space before processing
    const estimatedRequired = 100 * 1024 * 1024; // 100 MB estimate for media conversion
    const diskCheck = await checkDiskSpace(estimatedRequired, CONFIG.media.tempDir);
    if (!diskCheck.sufficient) {
      const err = createAppError("INSUFFICIENT_DISK_SPACE", diskCheck.message, { stage: "pre-processing" });
      jobManager.updateJob(jobId, {
        status: "failed",
        error_code: err.code,
        error_message: diskCheck.message,
        stage: "Error",
      });
      return;
    }

    if (job.input_kind === "remote-url") {
      await processRemoteUrl(jobId, job.input_reference, outputFormat, job.quality, outputPath);
    } else if (job.input_kind === "local-file") {
      const inputPath = path.join(CONFIG.media.tempDir, job.input_reference);
      if (isAudio) {
        await processLocalAudio(jobId, inputPath, outputFormat as AudioOutputFormat, job.quality, outputPath);
      } else if (isVideo) {
        await processLocalVideo(jobId, inputPath, outputFormat as VideoOutputFormat, job.quality, outputPath);
      } else {
        const err = createAppError("INPUT_UNSUPPORTED", `Formato no soportado: ${outputFormat}`, { stage: "pre-processing" });
        jobManager.updateJob(jobId, {
          status: "failed",
          error_code: err.code,
          error_message: err.message,
          stage: "Error",
        });
        return;
      }
    } else {
      const err = createAppError("INPUT_UNSUPPORTED", "Tipo de entrada no soportado.", { stage: "pre-processing" });
      jobManager.updateJob(jobId, {
        status: "failed",
        error_code: err.code,
        error_message: err.message,
        stage: "Error",
      });
      return;
    }

    // Verify output
    jobManager.updateJob(jobId, {
      status: "verifying",
      stage: "Verificando archivo",
      progress: 95,
    });

    const stats = fs.statSync(outputPath);
    const verification = await verifyFile(outputPath, isAudio ? "mp3" : "mp4");

    if (!verification.isValid) {
      const err = createAppError("ARTIFACT_VALIDATION_FAILED", "La verificación del archivo ha fallado.", {
        stage: "validation",
      });
      jobManager.updateJob(jobId, {
        status: "failed",
        error_code: err.code,
        error_message: err.message,
        stage: "Error",
      });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Compute safe relative path for the output
    const relOutputPath = path.relative(CONFIG.media.tempDir, outputPath);

    // Retrieve title for filename
    const currentJob = jobManager.getJob(jobId);
    const titleBase = currentJob?.input_title
      ? sanitizeFilename(currentJob.input_title)
      : `output_${jobId.substring(0, 8)}`;
    const finalFileName = `${titleBase}${extension}`;

    jobManager.updateJob(jobId, {
      status: "completed",
      stage: "Completado",
      progress: 100,
      file_size_bytes: stats.size,
      mime_type: getMimeType(outputFormat),
      download_token_hash: tokenHash,
      output_file_name: finalFileName,
      output_relative_path: relOutputPath,
      completed_at: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const appError = error as { code?: ErrorCode; message?: string };
    const code: ErrorCode = appError?.code ?? "ENGINE_EXECUTE_FAILED";
    const message =
      error instanceof Error ? error.message : "Error interno del procesador.";
    jobManager.updateJob(jobId, {
      status: "failed",
      error_code: code,
      error_message: message,
      stage: "Error",
    });
  }
}

async function processRemoteUrl(
  jobId: string,
  inputReference: string,
  outputFormat: string,
  quality: string,
  outputPath: string
): Promise<void> {
  // inputReference is the full URL or videoId
  const url = inputReference.startsWith("http")
    ? inputReference
    : `https://www.youtube.com/watch?v=${inputReference}`;

  const metadata = await getVideoMetadata(url);

  jobManager.updateJob(jobId, {
    status: "downloading",
    stage: "Descargando y convirtiendo",
    started_at: new Date().toISOString(),
  });

  // Update job title if not set
  const currentJob = jobManager.getJob(jobId);
  if (!currentJob?.input_title && metadata.title) {
    jobManager.updateJob(jobId, {
      output_file_name: sanitizeFilename(metadata.title) + `.${outputFormat}`,
    });
  }

  const args = buildYtdlpArgs({
    url,
    format: outputFormat as AudioOutputFormat | VideoOutputFormat,
    quality,
    outputPath,
    ffmpegLocation: path.dirname(CONFIG.media.binaries.ffmpeg),
  });

  await runProcess(CONFIG.media.binaries.ytdlp, args, jobId);
}

async function processLocalAudio(
  jobId: string,
  inputPath: string,
  format: AudioOutputFormat,
  quality: string,
  outputPath: string
): Promise<void> {
  jobManager.updateJob(jobId, {
    status: "processing",
    stage: "Convirtiendo audio",
    started_at: new Date().toISOString(),
  });

  const args = buildFfmpegAudioArgs({ inputPath, outputPath, format, quality });
  await runProcess(CONFIG.media.binaries.ffmpeg, args, jobId);
}

async function processLocalVideo(
  jobId: string,
  inputPath: string,
  format: VideoOutputFormat,
  quality: string,
  outputPath: string
): Promise<void> {
  jobManager.updateJob(jobId, {
    status: "processing",
    stage: "Convirtiendo vídeo",
    started_at: new Date().toISOString(),
  });

  const args = buildFfmpegVideoArgs({ inputPath, outputPath, format, quality });
  await runProcess(CONFIG.media.binaries.ffmpeg, args, jobId);
}

function runProcess(
  binary: string,
  args: string[],
  jobId: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(binary, args, {
      shell: false,
      windowsHide: true,
      timeout: CONFIG.media.limits.conversionTimeoutSeconds * 1000,
    });

    proc.stdout.on("data", (data: Buffer) => {
      const line = data.toString();
      const progress = parseProgress(line);
      if (progress !== null) {
        jobManager.updateJob(jobId, { progress: Math.min(progress, 90) });
      }
    });

    // ffmpeg outputs to stderr
    proc.stderr.on("data", (data: Buffer) => {
      const line = data.toString();
      const progress = parseProgress(line);
      if (progress !== null) {
        jobManager.updateJob(jobId, { progress: Math.min(progress, 90) });
      }
    });

    proc.on("close", (code: number | null) => {
      if (code !== 0) {
        const err = createAppError("ENGINE_EXECUTE_FAILED", `Proceso finalizado con código ${code}`, {
          stage: "execution",
        });
        reject(err);
        return;
      }
      resolve();
    });

    proc.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "ENOENT") {
        reject(createAppError("TOOL_NOT_AVAILABLE", "Dependencia no encontrada. Comprueba que yt-dlp y ffmpeg están disponibles.", {
          stage: "execution",
        }));
      } else {
        reject(createAppError("ENGINE_EXECUTE_FAILED", err.message, {
          stage: "execution",
          cause: err,
        }));
      }
    });
  });
}
