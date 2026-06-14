import { NextRequest, NextResponse } from "next/server";
import { JobRequestSchema } from "@/lib/youtube/schemas";
import { jobManager } from "@/lib/jobs/job-manager";
import { processJob } from "@/lib/media/processor";
import { CONFIG } from "@/lib/config";
import { ERROR_CODES, ERROR_MESSAGES } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = JobRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message, code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";

    // Check concurrency limits
    if (jobManager.getActiveJobsCount() >= CONFIG.media.limits.maxConcurrentJobs) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.QUEUE_FULL, code: ERROR_CODES.QUEUE_FULL },
        { status: 503 }
      );
    }

    if (jobManager.getClientActiveJob(clientIp)) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.JOB_ALREADY_ACTIVE, code: ERROR_CODES.JOB_ALREADY_ACTIVE },
        { status: 429 }
      );
    }

    const job = jobManager.createJob(
      validated.data.videoId,
      validated.data.format,
      validated.data.quality,
      clientIp
    );

    // Fire and forget processing
    processJob(job.id).catch(console.error);

    return NextResponse.json({ jobId: job.id, status: job.status });
  } catch (error: unknown) {
    console.error("Jobs API Error:", error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_ERROR, code: ERROR_CODES.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}
