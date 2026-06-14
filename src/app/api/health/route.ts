import { NextResponse } from "next/server";
import fs from "fs";
import { CONFIG } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const ytdlpOk = fileExists(CONFIG.media.binaries.ytdlp);
  const ffmpegOk = fileExists(CONFIG.media.binaries.ffmpeg);
  const ffprobeOk = fileExists(CONFIG.media.binaries.ffprobe);

  const allDepsOk = ytdlpOk && ffmpegOk && ffprobeOk;

  return NextResponse.json(
    {
      ok: allDepsOk,
      app: "Link2Media",
      status: allDepsOk ? "ready" : "degraded",
      dependencies: {
        ytdlp: ytdlpOk,
        ffmpeg: ffmpegOk,
        ffprobe: ffprobeOk,
      },
    },
    { status: 200 }
  );
}

function fileExists(binaryPath: string): boolean {
  // If the path is just a command name (no separators), assume it's on PATH
  if (!binaryPath.includes("/") && !binaryPath.includes("\\")) {
    return true;
  }
  try {
    return fs.existsSync(binaryPath);
  } catch {
    return false;
  }
}
