import path from "path";
import { CONFIG } from "../config";

export function ensurePathSafety(targetPath: string): string {
  const absoluteTargetPath = path.resolve(targetPath);
  const absoluteTempDir = CONFIG.media.tempDir;

  if (!absoluteTargetPath.startsWith(absoluteTempDir)) {
    throw new Error("Security Error: Path traversal attempt detected.");
  }

  return absoluteTargetPath;
}
