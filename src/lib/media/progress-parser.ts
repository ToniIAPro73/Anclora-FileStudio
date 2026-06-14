export function parseProgress(line: string): number | null {
  // [download]  12.3% of 10.00MiB at 1.23MiB/s ETA 00:01
  const match = line.match(/\[download\]\s+([\d.]+)%/);
  if (match) {
    return parseFloat(match[1]);
  }
  return null;
}
