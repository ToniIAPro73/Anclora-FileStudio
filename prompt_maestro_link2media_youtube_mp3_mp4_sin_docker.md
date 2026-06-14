# Prompt maestro end-to-end: conversor de enlaces de YouTube a MP3 o MP4

## 1. Rol del agente

Actúa como **arquitecto de software, desarrollador full-stack senior, especialista en UX/UI, seguridad de aplicaciones y QA**.

Debes crear de principio a fin una aplicación web sencilla, moderna y funcional que permita:

1. Pegar un enlace válido de YouTube.
2. Analizar el vídeo y mostrar sus metadatos básicos.
3. Elegir la conversión a **MP3** o **MP4**.
4. Seleccionar una calidad compatible.
5. Ejecutar la descarga y conversión en el servidor.
6. Mostrar el progreso y el estado del proceso.
7. Habilitar un botón de descarga únicamente cuando el archivo esté preparado.

No te limites a elaborar un plan. Debes implementar, probar, documentar y dejar el proyecto ejecutable.

---

## 2. Objetivo del producto

Construye un MVP denominado provisionalmente **Link2Media**, fácil de renombrar desde una configuración centralizada.

La aplicación debe transmitir sencillez y confianza:

- Una sola tarea principal.
- Flujo corto y evidente.
- Diseño contemporáneo.
- Respuesta visual inmediata.
- Mensajes de error comprensibles.
- Funcionamiento correcto en escritorio y móvil.
- Sin registro de usuarios.
- Sin base de datos.
- Sin Docker.
- Sin servicios de pago.
- Sin dependencia obligatoria de APIs externas.

El entorno prioritario de desarrollo y ejecución es **Ubuntu o WSL sobre Windows**.

---

## 3. Condiciones no negociables

### 3.1. Restricciones técnicas

- No usar Docker, Docker Compose ni contenedores.
- No crear microservicios innecesarios.
- No usar una base de datos para el MVP.
- No usar Python como servidor separado.
- No ejecutar comandos mediante `shell: true`.
- No concatenar datos del usuario en comandos del sistema.
- No permitir que el usuario introduzca parámetros de `yt-dlp` o FFmpeg.
- No usar el runtime Edge.
- No asumir que la aplicación podrá desplegarse en un entorno serverless.
- No depender de almacenamiento persistente para completar una conversión.
- No guardar indefinidamente vídeos, audios, enlaces ni metadatos.

### 3.2. Uso autorizado

La aplicación debe estar diseñada únicamente para contenido:

- Propiedad del usuario.
- Publicado con permiso de descarga.
- De dominio público.
- Con licencia compatible.
- Para el que el usuario disponga de autorización expresa.

No implementes mecanismos para:

- Eludir DRM.
- Saltar autenticación.
- Descargar vídeos privados.
- Usar cookies de cuentas personales.
- Evitar restricciones geográficas.
- Evitar límites del proveedor.
- Acceder a contenido de pago.
- Suplantar clientes o usuarios.
- Descargar contenido protegido sin autorización.

Antes de iniciar la conversión, la interfaz debe exigir una casilla no premarcada con un texto equivalente a:

> Confirmo que soy titular del contenido o que dispongo de permiso para descargarlo y convertirlo.

Incluye un aviso discreto indicando que el usuario es responsable de respetar derechos de autor, licencias y condiciones de uso aplicables.

---

## 4. Stack tecnológico

Utiliza versiones estables y compatibles verificadas en el momento de ejecutar el trabajo.

### Aplicación

- Next.js con App Router.
- TypeScript estricto.
- React.
- Tailwind CSS.
- Componentes accesibles propios o shadcn/ui, evitando instalar un catálogo innecesario.
- Lucide React para iconografía.
- Zod para validación.
- Gestor de paquetes `pnpm`.
- Vitest para pruebas unitarias y de integración.
- Playwright únicamente para un flujo E2E mínimo.
- ESLint.
- Prettier solo si aporta una configuración clara y no entra en conflicto con ESLint.

### Procesamiento multimedia

- `yt-dlp` como ejecutable instalado en el sistema.
- FFmpeg y FFprobe instalados en el sistema.
- Ejecución mediante `child_process.spawn`.
- Argumentos suministrados como array.
- Procesamiento en el runtime Node.js.

Antes de generar el proyecto:

1. Comprueba las versiones estables actuales.
2. Comprueba la compatibilidad entre Node.js, Next.js y las herramientas de pruebas.
3. Evita versiones canary, nightly o experimentales.
4. Registra las versiones realmente utilizadas en el README.
5. No fijes una versión antigua solo porque aparezca en este prompt.

---

## 5. Alcance funcional del MVP

### 5.1. Pantalla principal

La pantalla inicial debe contener:

- Logotipo tipográfico o isotipo abstracto sencillo, sin copiar la identidad de YouTube.
- Nombre provisional `Link2Media`.
- Título principal claro.
- Subtítulo breve.
- Campo para pegar la URL.
- Botón `Analizar enlace`.
- Ejemplo de formato aceptado, sin incluir vídeos reales de terceros.
- Aviso legal compacto.
- Pie con versión de la aplicación.

Texto principal orientativo:

> Convierte contenido autorizado de YouTube a MP3 o MP4

Texto secundario orientativo:

> Pega un enlace, selecciona el formato y descarga el archivo cuando esté listo.

### 5.2. Validación del enlace

Acepta únicamente URLs HTTPS de estos hosts:

- `youtube.com`
- `www.youtube.com`
- `m.youtube.com`
- `music.youtube.com`
- `youtu.be`

Admite, como mínimo:

- `https://www.youtube.com/watch?v=...`
- `https://youtu.be/...`
- Enlaces con parámetros adicionales que no alteren el identificador del vídeo.

Rechaza:

- Texto que no sea una URL.
- Protocolos distintos de HTTPS.
- URLs con credenciales embebidas.
- Hosts parecidos o manipulados.
- Direcciones IP.
- `localhost`.
- URLs internas.
- Listas de reproducción.
- Canales.
- Shorts múltiples o colecciones.
- Parámetros que intenten inyectar opciones.
- Enlaces sin un identificador de vídeo válido.

Normaliza la URL antes de utilizarla. Conserva únicamente el identificador del vídeo y reconstruye internamente una URL canónica.

Nunca confíes en la URL recibida del cliente.

### 5.3. Análisis previo

Al pulsar `Analizar enlace`:

1. Valida el enlace en cliente.
2. Valídalo de nuevo en servidor.
3. Ejecuta una consulta de metadatos sin descargar el vídeo.
4. Devuelve únicamente la información necesaria.
5. Muestra una tarjeta de vista previa.

Metadatos permitidos:

- Título.
- Autor o canal.
- Miniatura.
- Duración.
- Identificador del vídeo.
- Formatos o resoluciones disponibles relevantes.
- Tamaño estimado solo cuando sea fiable.
- Indicación de si el contenido es compatible.

No devuelvas al navegador la respuesta completa de `yt-dlp`.

Comando conceptual de referencia, que debe adaptarse y encapsularse de forma segura:

```bash
yt-dlp --dump-single-json --skip-download --no-playlist <URL_CANONICA>
```

Añade un timeout al análisis.

### 5.4. Límites del MVP

Configura límites mediante variables de entorno:

- Duración máxima predeterminada: 2 horas.
- Máximo de trabajos concurrentes globales: 2.
- Máximo de un trabajo activo por cliente.
- Tiempo máximo de conversión predeterminado: 20 minutos.
- Caducidad del archivo generado: 60 minutos.
- Caducidad del token de descarga: 15 minutos.

Cuando se supere un límite, no inicies el trabajo y explica la causa.

### 5.5. Selector de formato

Después del análisis, muestra un selector segmentado grande:

- `MP3 · Solo audio`
- `MP4 · Vídeo`

El cambio de formato debe actualizar las opciones de calidad sin recargar la página.

#### MP3

Calidades disponibles:

- 128 kbps.
- 192 kbps.
- 256 kbps.
- 320 kbps.

Valor predeterminado: 192 kbps.

Aclara mediante tooltip o texto auxiliar:

> La conversión no puede mejorar la calidad del audio original.

#### MP4

Resoluciones solicitables:

- 360p.
- 480p.
- 720p.
- 1080p.

Muestra únicamente resoluciones razonablemente compatibles con el vídeo analizado.

Valor predeterminado:

- 720p cuando esté disponible.
- En caso contrario, la mejor resolución inferior disponible.

No prometas una resolución exacta cuando la fuente no la tenga. Muestra que se utilizará la mejor alternativa compatible.

### 5.6. Inicio de la conversión

El botón principal debe mostrar:

- `Convertir a MP3`, o
- `Convertir a MP4`.

Debe permanecer deshabilitado hasta que:

- La URL haya sido analizada correctamente.
- Exista un formato seleccionado.
- Exista una calidad seleccionada.
- La casilla de autorización esté marcada.
- No haya otro trabajo activo para el mismo cliente.

Al iniciar:

1. Crea un identificador aleatorio de trabajo.
2. Crea un directorio temporal exclusivo.
3. Construye el comando desde funciones tipadas.
4. Lanza el proceso con `spawn`.
5. Captura salida estándar y errores.
6. Analiza el progreso.
7. Actualiza el estado del trabajo.
8. Genera el nombre final seguro.
9. Verifica la existencia y tamaño del archivo.
10. Crea un token de descarga temporal.
11. Cambia el estado a completado.

### 5.7. Conversión a MP3

Usa `yt-dlp` para seleccionar el mejor audio disponible y FFmpeg para convertirlo a MP3.

Comportamiento esperado:

- Extraer solo audio.
- Convertir al bitrate solicitado.
- Incluir metadatos básicos cuando sea posible.
- Incluir miniatura únicamente si la operación es estable y compatible.
- No conservar el archivo intermedio.
- Producir extensión `.mp3`.
- Verificar con FFprobe que el resultado contiene audio.

Comando conceptual orientativo:

```bash
yt-dlp \
  --no-playlist \
  --extract-audio \
  --audio-format mp3 \
  --audio-quality <CALIDAD_VALIDADA> \
  --embed-metadata \
  --newline \
  --output <RUTA_CONTROLADA> \
  <URL_CANONICA>
```

No copies literalmente el comando si la versión instalada requiere otros parámetros. Encapsula las diferencias en un constructor de comandos probado.

### 5.8. Conversión a MP4

Selecciona vídeo y audio compatibles con la resolución solicitada y fusiónalos en un contenedor MP4.

Orden de preferencia conceptual:

1. Mejor vídeo MP4 con altura igual o inferior a la solicitada más audio M4A.
2. Mejor vídeo compatible más mejor audio compatible, fusionados a MP4.
3. Mejor archivo MP4 combinado igual o inferior a la resolución solicitada.
4. Mejor alternativa inferior disponible.

Comportamiento esperado:

- No superar deliberadamente la resolución solicitada.
- Fusionar pistas con FFmpeg cuando sea necesario.
- Producir extensión `.mp4`.
- Incluir metadatos básicos cuando sea estable.
- No conservar archivos intermedios.
- Verificar con FFprobe que el resultado contiene una pista de vídeo y una pista de audio.
- Informar de la resolución real obtenida.

Comando conceptual orientativo:

```bash
yt-dlp \
  --no-playlist \
  --format "<SELECTOR_VALIDADO>" \
  --merge-output-format mp4 \
  --embed-metadata \
  --newline \
  --output <RUTA_CONTROLADA> \
  <URL_CANONICA>
```

El selector de formato debe generarse exclusivamente desde valores internos permitidos.

### 5.9. Progreso y estados

Implementa estos estados:

- `idle`
- `validating`
- `analyzing`
- `ready`
- `queued`
- `downloading`
- `processing`
- `verifying`
- `completed`
- `failed`
- `cancelled`
- `expired`

Muestra:

- Barra de progreso.
- Porcentaje cuando sea fiable.
- Fase actual.
- Mensaje breve.
- Tiempo transcurrido.
- Botón de cancelación mientras el proceso lo permita.

Para el MVP puede utilizarse polling cada 1–2 segundos. No implementes WebSockets si no son necesarios.

La interfaz no debe inventar porcentajes. Cuando no exista un valor fiable, utiliza un progreso indeterminado y muestra la fase.

### 5.10. Descarga

Cuando el trabajo finalice correctamente:

- Muestra una tarjeta de éxito.
- Muestra el nombre del archivo.
- Muestra el formato.
- Muestra la calidad o resolución final.
- Muestra el tamaño.
- Habilita un botón destacado `Descargar MP3` o `Descargar MP4`.
- Añade un botón secundario `Convertir otro enlace`.

El endpoint de descarga debe:

- Exigir un token aleatorio de un solo propósito.
- Comprobar que no ha caducado.
- Comprobar que corresponde al trabajo solicitado.
- Resolver la ruta desde datos internos, nunca desde un path del usuario.
- Enviar `Content-Disposition: attachment`.
- Definir un `Content-Type` correcto.
- Evitar caché pública.
- Transmitir el archivo mediante stream.
- No exponer la ruta real del servidor.
- Rechazar trabajos incompletos o caducados.

Tras la descarga, el archivo puede mantenerse hasta completar su TTL, pero debe eliminarse automáticamente al caducar.

### 5.11. Cancelación y limpieza

El botón `Cancelar` debe:

- Enviar una petición al servidor.
- Terminar el proceso hijo y sus procesos asociados de forma segura.
- Marcar el trabajo como cancelado.
- Eliminar archivos parciales.
- Devolver la interfaz a un estado recuperable.

Implementa limpieza:

- Al completar.
- Al fallar.
- Al cancelar.
- Al caducar.
- Al arrancar el servidor, para directorios temporales antiguos.
- Al cerrar el proceso de desarrollo cuando sea posible.

No borres nunca rutas fuera del directorio temporal configurado.

---

## 6. Arquitectura propuesta

Implementa una única aplicación Next.js full-stack.

### 6.1. Componentes principales

```text
Navegador
  ├─ Formulario y validación inicial
  ├─ Vista previa de metadatos
  ├─ Selector MP3/MP4
  ├─ Selector de calidad
  ├─ Seguimiento del trabajo
  └─ Descarga final

Servidor Next.js con runtime Node
  ├─ Validación y normalización de URL
  ├─ Consulta segura de metadatos
  ├─ Gestor de trabajos en memoria
  ├─ Cola y límites de concurrencia
  ├─ Ejecución segura de yt-dlp
  ├─ Verificación mediante FFprobe
  ├─ Tokens temporales de descarga
  └─ Limpieza de archivos temporales

Sistema operativo
  ├─ yt-dlp
  ├─ FFmpeg
  └─ FFprobe
```

### 6.2. Endpoints mínimos

#### `POST /api/metadata`

Entrada:

```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

Salida normalizada:

```json
{
  "videoId": "VIDEO_ID",
  "title": "Título",
  "channel": "Canal",
  "thumbnailUrl": "https://...",
  "durationSeconds": 245,
  "durationLabel": "04:05",
  "availableHeights": [360, 480, 720, 1080],
  "supported": true
}
```

#### `POST /api/jobs`

Entrada:

```json
{
  "videoId": "VIDEO_ID",
  "format": "mp3",
  "quality": "192",
  "rightsConfirmed": true
}
```

No aceptes nuevamente una URL arbitraria. Reconstruye la URL canónica desde `videoId`.

Salida:

```json
{
  "jobId": "identificador",
  "status": "queued"
}
```

#### `GET /api/jobs/:jobId`

Salida:

```json
{
  "jobId": "identificador",
  "status": "processing",
  "stage": "Convirtiendo el archivo",
  "progress": 76,
  "elapsedSeconds": 18
}
```

Cuando esté completado:

```json
{
  "jobId": "identificador",
  "status": "completed",
  "file": {
    "name": "titulo-seguro.mp3",
    "mimeType": "audio/mpeg",
    "sizeBytes": 7340032,
    "quality": "192 kbps"
  },
  "downloadToken": "token-temporal"
}
```

#### `POST /api/jobs/:jobId/cancel`

Cancela el proceso y limpia archivos parciales.

#### `GET /api/download/:jobId?token=...`

Transmite el archivo final.

### 6.3. Gestor de trabajos

Para el MVP usa un `Map` en memoria, encapsulado en un singleton seguro para desarrollo.

Cada trabajo debe conservar únicamente:

- ID.
- ID del vídeo.
- Formato.
- Calidad.
- Estado.
- Progreso.
- Fase.
- Fechas.
- Ruta interna.
- Nombre seguro.
- Tamaño.
- PID o referencia al proceso.
- Error público.
- Error técnico interno.
- Token de descarga hash o valor protegido.
- Caducidad.

No guardes datos en localStorage salvo preferencias visuales no sensibles.

Documenta claramente que el almacenamiento en memoria exige una única instancia de servidor y que una futura versión distribuida necesitaría una cola y un almacén compartido.

---

## 7. Seguridad

### 7.1. Ejecución de procesos

- Usa `spawn(executable, args, options)`.
- Usa `shell: false`.
- Define `cwd` dentro del directorio temporal.
- Define un entorno mínimo.
- No aceptes nombres de ejecutable desde el cliente.
- No aceptes argumentos libres.
- Construye los argumentos con enums y tablas internas.
- Limita el tamaño de stdout y stderr almacenado.
- Redacta tokens y rutas en logs.
- Mata procesos que excedan el timeout.
- Controla códigos de salida.
- Trata las líneas de salida como datos no confiables.

### 7.2. Archivos

- Usa IDs aleatorios criptográficamente seguros.
- Crea un subdirectorio por trabajo.
- Usa permisos restrictivos cuando el sistema lo permita.
- Sanitiza títulos para crear nombres de descarga.
- Limita la longitud del nombre.
- Evita nombres reservados.
- No permitas `..`, separadores ni caracteres de control.
- Genera internamente la ruta real.
- Comprueba con `realpath` que permanece dentro de `TEMP_DIR`.
- No sirvas el directorio temporal como carpeta pública.
- No aceptes uploads.

### 7.3. Red y abuso

- Aplica rate limiting ligero en memoria.
- Aplica límites por IP o identificador de cliente.
- No confíes ciegamente en cabeceras proxy.
- Mantén la aplicación same-origin.
- No habilites CORS abierto.
- Añade cabeceras de seguridad razonables.
- Restringe las miniaturas a hosts de imágenes de YouTube conocidos.
- No conviertas URLs genéricas de otros sitios.
- No expongas trazas internas al usuario.
- Registra errores técnicos solo en el servidor.

### 7.4. Privacidad

- No implementes analítica por defecto.
- No uses cookies de seguimiento.
- No almacenes historial.
- No registres la URL completa salvo durante depuración local explícita.
- No guardes archivos una vez superado su TTL.
- Incluye en el README una descripción exacta de los datos temporales.

---

## 8. Diseño UX/UI

### 8.1. Dirección visual

Crea una interfaz moderna, limpia y diferenciada sin imitar la interfaz de YouTube.

Propuesta visual:

- Fondo oscuro con degradado radial sutil.
- Tonos grafito, azul profundo, índigo y acentos cian.
- Tarjeta principal semitransparente.
- Bordes suaves.
- Sombras discretas.
- Tipografía sans-serif legible.
- Iconografía lineal.
- Animaciones cortas y funcionales.
- Estados de foco claramente visibles.
- Contraste AA como mínimo.

No abuses de:

- Glassmorphism.
- Gradientes.
- Sombras.
- Animaciones.
- Textos promocionales.
- Iconos decorativos.

### 8.2. Jerarquía

Orden visual:

1. Marca y título.
2. Campo de URL.
3. Acción de análisis.
4. Vista previa.
5. Selector de formato.
6. Selector de calidad.
7. Confirmación de derechos.
8. Acción de conversión.
9. Progreso.
10. Descarga.

### 8.3. Vista previa

La tarjeta de vídeo debe mostrar:

- Miniatura 16:9.
- Título limitado a dos líneas.
- Canal.
- Duración.
- Badge `Compatible`.
- Botón o enlace `Cambiar enlace`.

No reproduzcas el vídeo dentro de la aplicación.

### 8.4. Estados visuales

#### Cargando

- Skeleton o spinner discreto.
- Texto específico: `Analizando el enlace…`.

#### Convirtiendo

- Barra de progreso.
- Icono animado moderado.
- Fase actual.
- Botón de cancelación.

#### Éxito

- Icono de confirmación.
- Información del archivo.
- Botón de descarga dominante.

#### Error

- Mensaje directo.
- Acción recomendada.
- Botón `Intentar de nuevo`.
- Código de referencia corto opcional.

### 8.5. Accesibilidad

- Navegación completa por teclado.
- Labels reales.
- `aria-live` para cambios de estado.
- No comunicar estados solo mediante color.
- Focus management al cambiar de fase.
- Soporte para `prefers-reduced-motion`.
- Áreas táctiles suficientes.
- Texto legible en pantallas pequeñas.
- Mensajes de validación asociados al campo.

---

## 9. Estructura orientativa del repositorio

```text
link2media/
├─ app/
│  ├─ api/
│  │  ├─ metadata/route.ts
│  │  ├─ jobs/route.ts
│  │  ├─ jobs/[jobId]/route.ts
│  │  ├─ jobs/[jobId]/cancel/route.ts
│  │  └─ download/[jobId]/route.ts
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  ├─ converter/
│  │  ├─ url-form.tsx
│  │  ├─ media-preview.tsx
│  │  ├─ format-selector.tsx
│  │  ├─ quality-selector.tsx
│  │  ├─ conversion-progress.tsx
│  │  └─ download-card.tsx
│  └─ ui/
├─ lib/
│  ├─ config.ts
│  ├─ env.ts
│  ├─ errors.ts
│  ├─ jobs/
│  │  ├─ job-manager.ts
│  │  ├─ job-types.ts
│  │  └─ cleanup.ts
│  ├─ media/
│  │  ├─ command-builder.ts
│  │  ├─ metadata.ts
│  │  ├─ progress-parser.ts
│  │  ├─ processor.ts
│  │  └─ probe.ts
│  ├─ security/
│  │  ├─ download-token.ts
│  │  ├─ path-safety.ts
│  │  ├─ rate-limit.ts
│  │  └─ sanitize-filename.ts
│  └─ youtube/
│     ├─ normalize-url.ts
│     └─ schemas.ts
├─ scripts/
│  ├─ check-dependencies.mjs
│  ├─ cleanup-temp.mjs
│  └─ setup-ubuntu.sh
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  └─ e2e/
├─ .env.example
├─ .gitignore
├─ AGENTS.md
├─ README.md
├─ package.json
├─ pnpm-lock.yaml
├─ next.config.ts
├─ tsconfig.json
└─ vitest.config.ts
```

Puedes ajustar la estructura si justificas una alternativa más simple o segura.

---

## 10. Variables de entorno

Crea `.env.example` sin secretos reales:

```dotenv
APP_NAME=Link2Media
APP_VERSION=0.1.0

MEDIA_TEMP_DIR=.tmp/media
YTDLP_BINARY=yt-dlp
FFMPEG_BINARY=ffmpeg
FFPROBE_BINARY=ffprobe

MAX_VIDEO_DURATION_SECONDS=7200
MAX_CONCURRENT_JOBS=2
MAX_ACTIVE_JOBS_PER_CLIENT=1
METADATA_TIMEOUT_SECONDS=30
CONVERSION_TIMEOUT_SECONDS=1200
JOB_TTL_MINUTES=60
DOWNLOAD_TOKEN_TTL_MINUTES=15

RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_METADATA_REQUESTS=10
RATE_LIMIT_MAX_JOB_REQUESTS=3
```

Valida todas las variables al iniciar. Falla de forma clara si falta una dependencia o un valor es inválido.

---

## 11. Instalación sin Docker

### 11.1. Ubuntu o WSL

Crea un script `scripts/setup-ubuntu.sh` idempotente que:

1. Compruebe que se ejecuta en un sistema compatible.
2. Compruebe Node.js y `pnpm`.
3. Compruebe `yt-dlp`.
4. Compruebe FFmpeg y FFprobe.
5. Muestre comandos recomendados para instalar lo que falte.
6. No ejecute cambios destructivos.
7. No use `sudo` silenciosamente.
8. No instale Docker.

Documenta una instalación equivalente a:

```bash
sudo apt update
sudo apt install -y ffmpeg pipx
pipx ensurepath
pipx install yt-dlp

corepack enable
corepack prepare pnpm@latest --activate

pnpm install
cp .env.example .env.local
pnpm dev
```

Antes de fijar estos comandos, verifica el método recomendado y compatible con el entorno real. Si `yt-dlp` ya se gestiona mediante `uv tool`, `pipx` u otro sistema limpio, respétalo.

### 11.2. Comprobación previa

Implementa:

```bash
pnpm check:deps
```

Debe comprobar:

- Que los tres binarios existen.
- Sus versiones.
- Que FFmpeg reconoce MP3 y MP4.
- Que el directorio temporal puede crearse y escribirse.
- Que la configuración es válida.

No realices una descarga real durante esta comprobación.

---

## 12. Scripts npm/pnpm

Incluye como mínimo:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "check": "pnpm lint && pnpm typecheck && pnpm test && pnpm build",
    "check:deps": "node scripts/check-dependencies.mjs",
    "cleanup": "node scripts/cleanup-temp.mjs"
  }
}
```

Adapta la sintaxis a las versiones estables realmente instaladas.

---

## 13. Modelo de errores

Define errores públicos tipados:

- `INVALID_URL`
- `UNSUPPORTED_HOST`
- `PLAYLIST_NOT_SUPPORTED`
- `VIDEO_NOT_FOUND`
- `VIDEO_UNAVAILABLE`
- `CONTENT_RESTRICTED`
- `DURATION_LIMIT_EXCEEDED`
- `FORMAT_NOT_AVAILABLE`
- `DEPENDENCY_MISSING`
- `RATE_LIMITED`
- `JOB_ALREADY_ACTIVE`
- `QUEUE_FULL`
- `CONVERSION_TIMEOUT`
- `CONVERSION_FAILED`
- `OUTPUT_VERIFICATION_FAILED`
- `JOB_NOT_FOUND`
- `JOB_EXPIRED`
- `DOWNLOAD_TOKEN_INVALID`
- `DOWNLOAD_TOKEN_EXPIRED`
- `CANCELLED`

Cada error debe tener:

- Código estable.
- HTTP status adecuado.
- Mensaje público en español.
- Detalle técnico solo en logs.
- Siguiente acción sugerida cuando proceda.

No muestres stderr completo de `yt-dlp` o FFmpeg en la UI.

---

## 14. Pruebas

### 14.1. Unitarias

Cubre:

- URLs válidas.
- URLs inválidas.
- Normalización de URL.
- Rechazo de listas.
- Rechazo de hosts manipulados.
- Extracción del ID.
- Saneamiento de nombres.
- Seguridad de rutas.
- Constructor de comandos MP3.
- Constructor de comandos MP4.
- Mapeo de calidad.
- Parser de progreso.
- Caducidad de tokens.
- Transiciones de estados.
- Límites de duración.
- Configuración de entorno.

Los tests del constructor de comandos deben demostrar que ningún dato arbitrario del usuario se transforma en argumentos libres.

### 14.2. Integración

Mockea `child_process.spawn` o encapsúlalo detrás de un adaptador.

Cubre:

- Análisis correcto.
- Error de metadatos.
- Creación de trabajo.
- Progreso.
- Conversión completada.
- Conversión fallida.
- Timeout.
- Cancelación.
- Descarga válida.
- Token inválido.
- Trabajo caducado.
- Limpieza.

No dependas de la red ni de YouTube en CI.

### 14.3. E2E

Implementa un flujo mínimo con backend simulado:

1. Pegar URL válida.
2. Analizar.
3. Seleccionar MP3.
4. Confirmar derechos.
5. Convertir.
6. Ver progreso.
7. Descargar.

Añade un segundo flujo para MP4 y uno para URL inválida.

### 14.4. Prueba manual autorizada

El README debe explicar cómo probar manualmente con:

- Un vídeo corto propiedad del probador.
- Un vídeo propio no listado accesible sin autenticación, cuando sea compatible.
- Contenido de dominio público con permiso de descarga.

No añadas enlaces de terceros como fixtures permanentes.

---

## 15. Calidad y observabilidad

Implementa logs estructurados sencillos:

- Timestamp.
- Nivel.
- Job ID.
- Evento.
- Duración.
- Código de error.

No registres:

- Tokens.
- Rutas completas.
- Contenido multimedia.
- Cookies.
- Credenciales.
- URL completa salvo modo debug local explícito.

Eventos mínimos:

- `metadata.requested`
- `metadata.completed`
- `metadata.failed`
- `job.created`
- `job.started`
- `job.progress`
- `job.completed`
- `job.failed`
- `job.cancelled`
- `job.expired`
- `file.deleted`

---

## 16. README obligatorio

El README debe incluir:

1. Descripción.
2. Captura o mock visual opcional.
3. Funcionalidades.
4. Límites del MVP.
5. Requisitos.
6. Instalación en Ubuntu/WSL sin Docker.
7. Variables de entorno.
8. Comandos.
9. Pruebas.
10. Arquitectura.
11. Seguridad.
12. Gestión temporal de archivos.
13. Uso autorizado y limitaciones legales.
14. Solución de problemas.
15. Compatibilidad de despliegue.
16. Roadmap.
17. Licencia elegida.

Incluye problemas habituales:

- `yt-dlp` no encontrado.
- FFmpeg no encontrado.
- FFprobe no encontrado.
- Formato no disponible.
- Vídeo demasiado largo.
- Error de permisos en el directorio temporal.
- Puerto ocupado.
- Cambios en YouTube que requieren actualizar `yt-dlp`.

---

## 17. Despliegue

El objetivo principal del MVP es ejecución local o en un servidor Node persistente.

No despliegues automáticamente.

Documenta que el entorno de destino debe permitir:

- Procesos hijos.
- Binarios del sistema.
- FFmpeg.
- FFprobe.
- `yt-dlp`.
- Escritura temporal.
- Procesos que puedan durar varios minutos.
- Una única instancia para el gestor en memoria del MVP.

No propongas Vercel Edge ni funciones serverless como destino predeterminado.

Una futura versión desplegable y escalable podrá separar:

- Frontend.
- API.
- Cola.
- Workers.
- Almacenamiento temporal.
- Redis.
- Object storage.

No implementes esa arquitectura en este MVP.

---

## 18. Git y forma de trabajo

Si no existe repositorio:

1. Crea `~/projects/link2media`.
2. Inicializa Git.
3. Crea un primer commit mínimo en `main`.
4. Crea la rama:
   - `feat/<agente>-youtube-mp3-mp4-converter`
5. Realiza todo el trabajo en esa rama.

Si ya existe repositorio:

1. Inspecciónalo.
2. Comprueba estado y remotos.
3. No sobrescribas cambios del usuario.
4. Crea la rama de feature desde la rama base acordada o desde `development` si existe.
5. Si no existe `development`, usa `main` y documéntalo.

Commits sugeridos:

1. `chore: scaffold link2media application`
2. `feat: add youtube url analysis`
3. `feat: add mp3 and mp4 conversion jobs`
4. `feat: add progress download and cleanup`
5. `feat: implement responsive accessible interface`
6. `test: cover media conversion workflow`
7. `docs: add local setup and operating guide`

No hagas merge a `main`, `development`, `staging` o `production` sin autorización expresa.

No hagas push si no existe remoto o no tienes permiso. Deja los commits preparados y explica el estado.

---

## 19. Fases de ejecución

### Fase 0. Diagnóstico

- Inspecciona el entorno.
- Comprueba Node.js, pnpm, yt-dlp, FFmpeg y FFprobe.
- Comprueba Git.
- Registra versiones.
- Identifica incompatibilidades.
- Resuelve solo lo necesario.

### Fase 1. Fundación

- Crea el proyecto.
- Configura TypeScript estricto.
- Configura Tailwind.
- Configura lint y tests.
- Añade variables de entorno.
- Añade comprobación de dependencias.
- Añade estructura base.

### Fase 2. Dominio y seguridad

- Implementa validación.
- Implementa normalización.
- Implementa tipos.
- Implementa errores.
- Implementa nombres y rutas seguras.
- Implementa tokens.
- Implementa rate limiting.

### Fase 3. Metadatos

- Implementa endpoint.
- Ejecuta `yt-dlp` de forma segura.
- Normaliza la respuesta.
- Añade timeouts.
- Añade pruebas.

### Fase 4. Trabajos MP3 y MP4

- Implementa gestor de trabajos.
- Implementa cola.
- Implementa constructores de comandos.
- Implementa procesamiento.
- Implementa progreso.
- Implementa cancelación.
- Implementa verificación.
- Añade pruebas.

### Fase 5. Descarga y limpieza

- Implementa tokens.
- Implementa streaming.
- Implementa caducidad.
- Implementa limpieza.
- Añade pruebas.

### Fase 6. Interfaz

- Implementa el flujo completo.
- Añade diseño responsive.
- Añade estados.
- Añade accesibilidad.
- Añade reduced motion.
- Añade manejo de errores.

### Fase 7. QA

Ejecuta:

```bash
pnpm check:deps
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Corrige los errores. No ocultes fallos mediante exclusiones amplias, `any`, `eslint-disable` generalizados o tests eliminados.

### Fase 8. Documentación y cierre

- Completa README.
- Completa `.env.example`.
- Añade `AGENTS.md`.
- Revisa `.gitignore`.
- Elimina artefactos temporales.
- Comprueba `git status`.
- Genera informe final.

---

## 20. Criterios de aceptación

La tarea se considera completada únicamente si:

- La aplicación arranca sin Docker.
- `pnpm check:deps` detecta correctamente las herramientas.
- Una URL válida puede analizarse.
- Una URL no válida se rechaza.
- Las listas de reproducción se rechazan.
- Puede elegirse MP3 o MP4.
- Puede elegirse una calidad compatible.
- La confirmación de derechos es obligatoria.
- El trabajo muestra un estado real.
- El archivo se verifica antes de ofrecerlo.
- El botón de descarga solo aparece al finalizar.
- La descarga usa un token temporal.
- Los archivos caducan y se eliminan.
- La cancelación limpia archivos parciales.
- No hay ejecución mediante shell.
- No hay inyección de argumentos.
- No hay rutas controladas por el usuario.
- No se muestran errores internos.
- La interfaz es responsive.
- La interfaz es accesible por teclado.
- Lint, typecheck, tests y build finalizan correctamente.
- El README permite instalar y ejecutar el proyecto desde cero en Ubuntu/WSL.
- El repositorio queda limpio y con commits coherentes.

---

## 21. Mejoras fuera del MVP

Documenta, pero no implementes salvo que sean imprescindibles:

- Cola persistente con Redis.
- Workers separados.
- Historial de usuario.
- Cuentas.
- Conversión por lotes.
- Listas de reproducción.
- Subtítulos.
- Recorte por intervalos.
- Normalización de volumen.
- Más formatos.
- Almacenamiento S3 compatible.
- Despliegue multiinstancia.
- Panel administrativo.
- Métricas.
- Internacionalización.
- PWA.
- Modo claro.

---

## 22. Formato del informe final del agente

Al terminar, entrega exactamente estas secciones:

### Resumen

Qué se ha construido y cuál es el flujo.

### Arquitectura aplicada

Decisiones principales y motivos.

### Instalación realizada

Versiones detectadas e instaladas.

### Archivos principales

Listado breve con finalidad.

### Seguridad

Controles implementados.

### Pruebas

Comandos ejecutados y resultado real.

### Uso

Comandos exactos para arrancar la aplicación.

### Git

- Rama.
- Commits.
- Estado del working tree.
- Remoto y push, si procede.

### Limitaciones

Restricciones conocidas del MVP.

### Pendientes

Solo problemas reales o mejoras futuras, sin presentar como completado lo que no lo esté.

### Evidencias

Incluye salida resumida de:

```bash
pnpm check:deps
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git status
git log --oneline -10
```

---

## 23. Regla final de ejecución

Prioriza, en este orden:

1. Seguridad.
2. Funcionamiento real.
3. Simplicidad.
4. Experiencia de usuario.
5. Mantenibilidad.
6. Apariencia visual.
7. Funciones adicionales.

No declares completada ninguna parte que no hayas ejecutado o verificado. Si una dependencia externa impide una prueba real, deja el resto funcionando, documenta exactamente la limitación y aporta el comando preciso que debe ejecutar el usuario para verificarla.
