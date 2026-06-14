export type JobStatus =
  | "idle"
  | "validating"
  | "analyzing"
  | "ready"
  | "queued"
  | "downloading"
  | "processing"
  | "verifying"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired";

export interface Job {
  id: string;
  videoId: string;
  format: "mp3" | "mp4";
  quality: string;
  status: JobStatus;
  progress: number;
  stage: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  
  // File details
  outputFileName?: string;
  outputPath?: string;
  fileSize?: number;
  mimeType?: string;
  
  // Security
  downloadToken?: string;
  clientIp?: string;
  
  // Error details
  error?: string;
  technicalError?: string;
}
