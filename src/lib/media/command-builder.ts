export interface ConversionOptions {
  url: string;
  format: "mp3" | "mp4";
  quality: string;
  outputPath: string;
  ffmpegLocation?: string;
}

export function buildConversionArgs(options: ConversionOptions): string[] {
  const { url, format, quality, outputPath, ffmpegLocation } = options;

  const baseArgs = [
    "--no-playlist",
    "--newline",
    "--no-check-certificates",
    ...(ffmpegLocation ? ["--ffmpeg-location", ffmpegLocation] : []),
    "--output",
    outputPath,
    "--embed-metadata",
    url,
  ];

  if (format === "mp3") {
    return [
      "--extract-audio",
      "--audio-format",
      "mp3",
      "--audio-quality",
      quality, // quality is validated before calling this
      ...baseArgs,
    ];
  } else {
    // MP4 resolution mapping
    const height = parseInt(quality, 10);
    const formatSelector = `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${height}][ext=mp4]/best`;
    
    return [
      "--format",
      formatSelector,
      "--merge-output-format",
      "mp4",
      ...baseArgs,
    ];
  }
}
