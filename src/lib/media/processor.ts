import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { CONFIG } from "../config";
import { jobManager } from "../jobs/job-manager";
import { buildConversionArgs } from "./command-builder";
import { parseProgress } from "./progress-parser";
import { verifyFile } from "./probe";
import { sanitizeFilename } from "../security/sanitize-filename";
import { getVideoMetadata } from "./metadata";
import crypto from "crypto";

export async function processJob(jobId: string) {
  const job = jobManager.getJob(jobId);
  if (!job) return;

  try {
    const url = `https://www.youtube.com/watch?v=${job.videoId}`;
    const metadata = await getVideoMetadata(url);
    const safeTitle = sanitizeFilename(metadata.title);
    const extension = job.format === "mp3" ? ".mp3" : ".mp4";
    const finalFileName = `${safeTitle}${extension}`;

    const jobDir = path.join(CONFIG.media.tempDir, jobId);
    if (!fs.existsSync(jobDir)) {
      fs.mkdirSync(jobDir, { recursive: true });
    }

    const outputPath = path.join(jobDir, `output${extension}`);

    const args = buildConversionArgs({
      url,
      format: job.format,
      quality: job.quality,
      outputPath,
    });

    jobManager.updateJob(jobId, {
      status: "downloading",
      stage: "Descargando y convirtiendo",
      outputFileName: finalFileName,
      outputPath,
    });

    const proc = spawn(CONFIG.media.binaries.ytdlp, args, {
      shell: false,
      windowsHide: true,
      timeout: CONFIG.media.limits.conversionTimeoutSeconds * 1000,
    });

    proc.stdout.on("data", (data) => {
      const line = data.toString();
      const progress = parseProgress(line);
      if (progress !== null) {
        jobManager.updateJob(jobId, { progress });
      }
    });

    proc.on("close", async (code) => {
      if (code !== 0) {
        jobManager.updateJob(jobId, {
          status: "failed",
          error: "Error durante la conversión.",
          stage: "Error",
        });
        return;
      }

      jobManager.updateJob(jobId, {
        status: "verifying",
        stage: "Verificando archivo",
        progress: 100,
      });

      try {
        const stats = fs.statSync(outputPath);
        const verification = await verifyFile(outputPath, job.format);

        if (!verification.isValid) {
          jobManager.updateJob(jobId, {
            status: "failed",
            error: "La verificación del archivo ha fallado.",
            stage: "Error",
          });
          return;
        }

        const downloadToken = crypto.randomBytes(32).toString("hex");

        jobManager.updateJob(jobId, {
          status: "completed",
          stage: "Completado",
          fileSize: stats.size,
          mimeType: job.format === "mp3" ? "audio/mpeg" : "video/mp4",
          downloadToken,
        });
      } catch {
        jobManager.updateJob(jobId, {
          status: "failed",
          error: "Error al verificar el archivo final.",
          stage: "Error",
        });
      }
    });

    proc.on("error", (err: NodeJS.ErrnoException) => {
      let errorMsg = "Error al iniciar el proceso de conversión.";
      if (err.code === "ENOENT") {
        errorMsg = "Dependencia no encontrada. Comprueba que yt-dlp y ffmpeg están disponibles.";
      }
      jobManager.updateJob(jobId, {
        status: "failed",
        error: errorMsg,
        stage: "Error",
      });
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error interno del procesador.";
    jobManager.updateJob(jobId, {
      status: "failed",
      error: message,
      stage: "Error",
    });
  }
}
