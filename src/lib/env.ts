import { z } from "zod";

const envSchema = z.object({
  APP_NAME: z.string().default("Link2Media"),
  APP_VERSION: z.string().default("0.1.0"),
  
  MEDIA_TEMP_DIR: z.string().default(".tmp/media"),
  YTDLP_BINARY: z.string().default("yt-dlp"),
  FFMPEG_BINARY: z.string().default("ffmpeg"),
  FFPROBE_BINARY: z.string().default("ffprobe"),
  
  MAX_VIDEO_DURATION_SECONDS: z.coerce.number().default(7200),
  MAX_CONCURRENT_JOBS: z.coerce.number().default(2),
  MAX_ACTIVE_JOBS_PER_CLIENT: z.coerce.number().default(1),
  METADATA_TIMEOUT_SECONDS: z.coerce.number().default(30),
  CONVERSION_TIMEOUT_SECONDS: z.coerce.number().default(1200),
  JOB_TTL_MINUTES: z.coerce.number().default(60),
  DOWNLOAD_TOKEN_TTL_MINUTES: z.coerce.number().default(15),
  
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().default(60),
  RATE_LIMIT_MAX_METADATA_REQUESTS: z.coerce.number().default(10),
  RATE_LIMIT_MAX_JOB_REQUESTS: z.coerce.number().default(3),
  
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
