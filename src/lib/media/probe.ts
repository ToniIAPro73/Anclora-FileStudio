import { spawn } from "child_process";
import { CONFIG } from "../config";

export interface VerificationResult {
  isValid: boolean;
  hasAudio: boolean;
  hasVideo: boolean;
  technicalInfo?: unknown;
}

interface FfprobeStream {
  codec_type: string;
}

interface FfprobeData {
  streams: FfprobeStream[];
}

export async function verifyFile(filePath: string, format: "mp3" | "mp4"): Promise<VerificationResult> {
  return new Promise((resolve) => {
    const args = [
      "-v", "quiet",
      "-print_format", "json",
      "-show_streams",
      "-show_format",
      filePath,
    ];

    const process = spawn(CONFIG.media.binaries.ffprobe, args);

    let stdout = "";

    process.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    process.on("close", (code) => {
      if (code !== 0) {
        return resolve({ isValid: false, hasAudio: false, hasVideo: false });
      }

      try {
        const data = JSON.parse(stdout) as FfprobeData;
        const hasAudio = data.streams.some((s) => s.codec_type === "audio");
        const hasVideo = data.streams.some((s) => s.codec_type === "video");

        if (format === "mp3") {
          resolve({ isValid: hasAudio, hasAudio, hasVideo });
        } else {
          resolve({ isValid: hasAudio && hasVideo, hasAudio, hasVideo });
        }
      } catch {
        resolve({ isValid: false, hasAudio: false, hasVideo: false });
      }
    });
  });
}
