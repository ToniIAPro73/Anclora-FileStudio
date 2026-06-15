export const messages = {
  // Navigation
  "nav.convert": "Convert",
  "nav.history": "History",
  "nav.diagnostics": "Diagnostics",

  // Source selector
  "source.title": "Local multimedia",
  "source.subtitle": "Audio, video, images, documents, data and more",
  "source.url.tab": "From URL",
  "source.file.tab": "Local file",
  "source.drop.idle": "Drop a file here or click to select",
  "source.drop.dragValid": "Drop the file to analyze it",
  "source.drop.dragInvalid": "Unsupported file type",
  "source.drop.uploading": "Analyzing file...",
  "source.drop.error": "Error processing file",

  // Analysis
  "analysis.category.audio": "Audio",
  "analysis.category.video": "Video",
  "analysis.category.image": "Image",
  "analysis.category.document": "Document",
  "analysis.category.spreadsheet": "Spreadsheet",
  "analysis.category.presentation": "Presentation",
  "analysis.category.pdf": "PDF",
  "analysis.category.ebook": "Ebook",
  "analysis.category.archive": "Compressed archive",
  "analysis.category.structured-data": "Structured data",
  "analysis.category.plain-text": "Text",

  // Loss profiles
  "loss.lossless": "Lossless",
  "loss.metadata-risk": "Metadata risk",
  "loss.layout-risk": "Layout risk",
  "loss.lossy": "Lossy",
  "loss.experimental": "Experimental",

  // Progress phases
  "progress.queued": "Queued",
  "progress.acquiring": "Acquiring",
  "progress.analyzing": "Analyzing",
  "progress.converting": "Converting",
  "progress.validating": "Validating",
  "progress.packaging": "Packaging",

  // Errors
  "error.tool-not-available": "Tool not available",
  "error.input-unsupported": "Unsupported input format",
  "error.process-timeout": "Process timed out",
  "error.process-cancelled": "Conversion cancelled",
  "error.validation-failed": "Output validation failed",
  "error.generic": "Conversion error",

  // Format selector
  "format.select": "Select output format",
  "format.recommended": "Recommended",

  // Conversion
  "convert.start": "Convert",
  "convert.cancel": "Cancel",
  "convert.download": "Download",
  "convert.new": "New conversion",
  "convert.rights": "I confirm I have rights to this content",

  // Diagnostics
  "diagnostics.title": "Tool diagnostics",
  "diagnostics.available": "Available",
  "diagnostics.missing": "Not found",
  "diagnostics.version": "Version",
  "diagnostics.action": "Recommended action",
  "diagnostics.refresh": "Refresh",
  "diagnostics.summary": "{available} of {total} tools available",

  // History
  "history.title": "Conversion history",
  "history.all": "All",
  "history.completed": "Completed",
  "history.failed": "Failed",
  "history.expired": "File expired",
  "history.empty": "No conversions in history",

  // General
  "general.bytes": "{n} bytes",
  "general.kb": "{n} KB",
  "general.mb": "{n} MB",
} as const;

export type MessageKey = keyof typeof messages;
