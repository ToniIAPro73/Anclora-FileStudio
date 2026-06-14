# AI Agent Documentation - Link2Media Implementation

Este documento registra el proceso de implementación realizado por el agente Gemini CLI.

## Perfil del Agente
- **Nombre:** Gemini CLI Agent
- **Modo:** Auto-Edit
- **Rol:** Full-stack Developer & Architect

## Proceso de Desarrollo
La implementación se realizó siguiendo estrictamente el "Prompt Maestro" proporcionado, dividido en las siguientes fases:

1.  **Diagnóstico y Configuración:** Verificación de dependencias (`yt-dlp`, `ffmpeg`, `ffprobe`) e inicialización del proyecto Next.js con pnpm.
2.  **Arquitectura y Seguridad:** Implementación de validación de URLs de YouTube, normalización, y capas de seguridad para ejecución de procesos y gestión de archivos.
3.  **Core de Procesamiento:** Implementación de extracción de metadatos y lógica de conversión MP3/MP4 usando `yt-dlp` y `spawn`.
4.  **Gestión de Trabajos:** Sistema de cola en memoria con seguimiento de estados y progreso en tiempo real.
5.  **Interfaz de Usuario:** Creación de componentes reactivos con Tailwind CSS y shadcn/ui, asegurando accesibilidad y respuesta visual.
6.  **QA y Refactorización:** Ciclos de corrección de errores de linting, tipos y hooks de React para asegurar un build limpio y optimizado.

## Decisiones Técnicas Destacadas
- **Derived State:** Se utilizó `useMemo` para la calidad predeterminada en el frontend, evitando efectos secundarios innecesarios y cumpliendo con las reglas de React.
- **Seguridad en Spawn:** Todos los comandos externos se ejecutan con `shell: false` y argumentos pasados como array para prevenir inyecciones.
- **Tokens de Descarga:** Se implementó un sistema de tokens criptográficos temporales para proteger el acceso a los archivos finales.
- **Clean Architecture Lite:** Separación clara entre lógica de dominio (youtube), servicios (media), seguridad y rutas API.

## Notas para Futuros Agentes
- El gestor de trabajos es un Singleton en memoria. Si se escala a múltiples instancias, deberá migrarse a Redis.
- La limpieza de archivos se realiza al arranque y periódicamente. Asegurar que el proceso tiene permisos de escritura en `.tmp/media`.
- Mantener `yt-dlp` actualizado para evitar fallos por cambios en la plataforma de YouTube.
