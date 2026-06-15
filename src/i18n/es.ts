export const messages = {
  // Navigation
  "nav.convert": "Convertir",
  "nav.history": "Historial",
  "nav.diagnostics": "Diagnóstico",

  // Source selector
  "source.title": "Multimedia local",
  "source.subtitle": "Audio, vídeo, imágenes, documentos, datos y más",
  "source.url.tab": "Desde enlace",
  "source.file.tab": "Archivo local",
  "source.drop.idle": "Arrastra un archivo aquí o haz clic para seleccionar",
  "source.drop.dragValid": "Suelta el archivo para analizarlo",
  "source.drop.dragInvalid": "Tipo de archivo no soportado",
  "source.drop.uploading": "Analizando archivo...",
  "source.drop.error": "Error al procesar el archivo",

  // Analysis
  "analysis.category.audio": "Audio",
  "analysis.category.video": "Vídeo",
  "analysis.category.image": "Imagen",
  "analysis.category.document": "Documento",
  "analysis.category.spreadsheet": "Hoja de cálculo",
  "analysis.category.presentation": "Presentación",
  "analysis.category.pdf": "PDF",
  "analysis.category.ebook": "Ebook",
  "analysis.category.archive": "Archivo comprimido",
  "analysis.category.structured-data": "Datos estructurados",
  "analysis.category.plain-text": "Texto",

  // Loss profiles
  "loss.lossless": "Sin pérdida",
  "loss.metadata-risk": "Riesgo de metadatos",
  "loss.layout-risk": "Riesgo de formato",
  "loss.lossy": "Con pérdida",
  "loss.experimental": "Experimental",

  // Progress phases
  "progress.queued": "En cola",
  "progress.acquiring": "Adquiriendo",
  "progress.analyzing": "Analizando",
  "progress.converting": "Convirtiendo",
  "progress.validating": "Validando",
  "progress.packaging": "Empaquetando",

  // Errors
  "error.tool-not-available": "Herramienta no disponible",
  "error.input-unsupported": "Formato de entrada no soportado",
  "error.process-timeout": "Tiempo de espera agotado",
  "error.process-cancelled": "Conversión cancelada",
  "error.validation-failed": "La validación del resultado falló",
  "error.generic": "Error en la conversión",

  // Format selector
  "format.select": "Selecciona formato de salida",
  "format.recommended": "Recomendado",

  // Conversion
  "convert.start": "Convertir",
  "convert.cancel": "Cancelar",
  "convert.download": "Descargar",
  "convert.new": "Nueva conversión",
  "convert.rights": "Confirmo que tengo derechos sobre este contenido",

  // Diagnostics
  "diagnostics.title": "Diagnóstico de herramientas",
  "diagnostics.available": "Disponible",
  "diagnostics.missing": "No encontrado",
  "diagnostics.version": "Versión",
  "diagnostics.action": "Acción recomendada",
  "diagnostics.refresh": "Actualizar",
  "diagnostics.summary": "{available} de {total} herramientas disponibles",

  // History
  "history.title": "Historial de conversiones",
  "history.all": "Todas",
  "history.completed": "Completadas",
  "history.failed": "Fallidas",
  "history.expired": "Archivo expirado",
  "history.empty": "No hay conversiones en el historial",

  // General
  "general.bytes": "{n} bytes",
  "general.kb": "{n} KB",
  "general.mb": "{n} MB",
} as const;

export type MessageKey = keyof typeof messages;
