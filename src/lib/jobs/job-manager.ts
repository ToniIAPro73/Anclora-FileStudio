import { Job } from "./job-types";
import { CONFIG } from "../config";
import crypto from "crypto";
import { cleanupTempDir } from "./cleanup";

class JobManager {
  private static instance: JobManager;
  private jobs: Map<string, Job> = new Map();

  private constructor() {
    // Run initial cleanup
    if (typeof window === "undefined") {
      cleanupTempDir();
      // Start periodic cleanup
      setInterval(() => this.cleanupExpiredJobs(), 5 * 60 * 1000);
    }
  }

  public static getInstance(): JobManager {
    if (!JobManager.instance) {
      JobManager.instance = new JobManager();
    }
    return JobManager.instance;
  }

  public createJob(videoId: string, format: "mp3" | "mp4", quality: string, clientIp: string): Job {
    const id = crypto.randomBytes(16).toString("hex");
    const now = Date.now();
    
    const job: Job = {
      id,
      videoId,
      format,
      quality,
      status: "queued",
      progress: 0,
      stage: "En cola",
      createdAt: now,
      updatedAt: now,
      expiresAt: now + CONFIG.media.limits.jobTtlMinutes * 60 * 1000,
      clientIp,
    };

    this.jobs.set(id, job);
    return job;
  }

  public getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  public updateJob(id: string, updates: Partial<Job>): void {
    const job = this.jobs.get(id);
    if (job) {
      const updatedJob = { 
        ...job, 
        ...updates, 
        updatedAt: Date.now() 
      };
      this.jobs.set(id, updatedJob);
    }
  }

  public getActiveJobsCount(): number {
    return Array.from(this.jobs.values()).filter(
      (j) => ["queued", "downloading", "processing", "verifying"].includes(j.status)
    ).length;
  }

  public getClientActiveJob(clientIp: string): Job | undefined {
    return Array.from(this.jobs.values()).find(
      (j) => j.clientIp === clientIp && ["queued", "downloading", "processing", "verifying"].includes(j.status)
    );
  }

  private cleanupExpiredJobs(): void {
    const now = Date.now();
    for (const [id, job] of this.jobs.entries()) {
      if (now > job.expiresAt) {
        this.jobs.delete(id);
        // Note: Actual file cleanup would be handled by cleanup-temp.mjs
        // or we could add specific file deletion logic here.
      }
    }
  }
}

export const jobManager = JobManager.getInstance();
