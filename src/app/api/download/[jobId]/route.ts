import { NextRequest, NextResponse } from "next/server";
import { jobManager } from "@/lib/jobs/job-manager";
import { ERROR_CODES, ERROR_MESSAGES } from "@/lib/errors";
import fs from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    const job = jobManager.getJob(jobId);

    if (!job || job.status !== "completed" || !job.outputPath) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.JOB_NOT_FOUND, code: ERROR_CODES.JOB_NOT_FOUND },
        { status: 404 }
      );
    }

    if (!token || token !== job.downloadToken) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.DOWNLOAD_TOKEN_INVALID, code: ERROR_CODES.DOWNLOAD_TOKEN_INVALID },
        { status: 403 }
      );
    }

    if (!fs.existsSync(job.outputPath)) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INTERNAL_ERROR, code: ERROR_CODES.INTERNAL_ERROR },
        { status: 410 }
      );
    }

    const fileStream = fs.createReadStream(job.outputPath);
    
    // Convert ReadableStream to what Next.js expects
    const readable = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => controller.enqueue(chunk));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (err) => controller.error(err));
      },
      cancel() {
        fileStream.destroy();
      }
    });

    const response = new NextResponse(readable, {
      headers: {
        "Content-Disposition": `attachment; filename="${encodeURIComponent(job.outputFileName || "download")}"`,
        "Content-Type": job.mimeType || "application/octet-stream",
        "Content-Length": job.fileSize?.toString() || "",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });

    return response;
  } catch (error: unknown) {
    console.error("Download API Error:", error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_ERROR, code: ERROR_CODES.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}
