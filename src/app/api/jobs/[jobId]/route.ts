import { NextRequest, NextResponse } from "next/server";
import { jobManager } from "@/lib/jobs/job-manager";
import { ERROR_CODES, ERROR_MESSAGES } from "@/lib/errors";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const job = jobManager.getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.JOB_NOT_FOUND, code: ERROR_CODES.JOB_NOT_FOUND },
        { status: 404 }
      );
    }

    // Prepare public job object
    const publicJob = {
      jobId: job.id,
      status: job.status,
      stage: job.stage,
      progress: job.progress,
      error: job.error,
      file: job.status === "completed" ? {
        name: job.outputFileName,
        mimeType: job.mimeType,
        sizeBytes: job.fileSize,
        quality: job.format === "mp3" ? `${job.quality} kbps` : `${job.quality}p`,
      } : undefined,
      downloadToken: job.status === "completed" ? job.downloadToken : undefined,
    };

    return NextResponse.json(publicJob);
  } catch (error: unknown) {
    console.error("Job Status API Error:", error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_ERROR, code: ERROR_CODES.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}
