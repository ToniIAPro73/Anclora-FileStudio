import { z } from "zod";

export const MetadataRequestSchema = z.object({
  url: z.string().trim().url(),
});

export const MetadataResponseSchema = z.object({
  videoId: z.string(),
  title: z.string(),
  channel: z.string(),
  thumbnailUrl: z.string().url(),
  durationSeconds: z.number(),
  durationLabel: z.string(),
  availableHeights: z.array(z.number()),
  supported: z.boolean(),
});

export const JobRequestSchema = z.object({
  videoId: z.string().length(11),
  format: z.enum(["mp3", "mp4"]),
  quality: z.string(),
  rightsConfirmed: z.boolean().refine(val => val === true, {
    message: "Debes confirmar que tienes los derechos para descargar este contenido.",
  }),
});

export type MetadataRequest = z.infer<typeof MetadataRequestSchema>;
export type MetadataResponse = z.infer<typeof MetadataResponseSchema>;
export type JobRequest = z.infer<typeof JobRequestSchema>;
