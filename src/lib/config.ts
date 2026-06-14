import path from "path";
import { env } from "./env";

export const CONFIG = {
  app: {
    name: env.APP_NAME,
    version: env.APP_VERSION,
  },
  media: {
    tempDir: path.resolve(process.cwd(), env.MEDIA_TEMP_DIR),
    binaries: {
      ytdlp: env.YTDLP_BINARY,
      ffmpeg: env.FFMPEG_BINARY,
      ffprobe: env.FFPROBE_BINARY,
    },
    limits: {
      maxDurationSeconds: env.MAX_VIDEO_DURATION_SECONDS,
      maxConcurrentJobs: env.MAX_CONCURRENT_JOBS,
      maxActiveJobsPerClient: env.MAX_ACTIVE_JOBS_PER_CLIENT,
      metadataTimeoutSeconds: env.METADATA_TIMEOUT_SECONDS,
      conversionTimeoutSeconds: env.CONVERSION_TIMEOUT_SECONDS,
      jobTtlMinutes: env.JOB_TTL_MINUTES,
      downloadTokenTtlMinutes: env.DOWNLOAD_TOKEN_TTL_MINUTES,
    },
  },
  security: {
    rateLimit: {
      windowSeconds: env.RATE_LIMIT_WINDOW_SECONDS,
      maxMetadataRequests: env.RATE_LIMIT_MAX_METADATA_REQUESTS,
      maxJobRequests: env.RATE_LIMIT_MAX_JOB_REQUESTS,
    },
  },
} as const;
