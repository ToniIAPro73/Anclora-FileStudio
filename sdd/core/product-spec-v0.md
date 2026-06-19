# Anclora FileStudio Product Spec v0

## Product Identity

`Anclora FileStudio` is a file conversion workspace for browser-safe conversions,
desktop-grade local processing, and controlled integration with Anclora Nexus.

## Problem

Users need a reliable way to convert, inspect, and process files without losing
privacy, conversion fidelity, or operational clarity. Browser-only tools cannot
handle every format, while desktop tools often lack governance, diagnostics, and
repeatable packaging.

## Product Goal

Provide a trusted Anclora conversion product that routes each file operation to
the safest available surface: browser, local desktop, service API, or local agent.

## Scope v0

- Browser web app for safe client-side conversions.
- Desktop/portable runtime for native tool conversions.
- Conversion engine registry and capability diagnostics.
- Secure job handling, tokenized downloads, and path safety.
- Nexus integration contracts for routing and local agent flows.

## Non-Goals

- No hidden upload of private local files.
- No server-side conversion for browser-only deployments unless explicitly
  enabled.
- No mixing desktop-only engines into the Vercel web bundle.
- No unsupported conversion advertised without capability diagnostics.

## Primary Users

- Anclora internal operators.
- Business users converting documents, images, data files, audio, and video.
- Nexus users who need privacy-preserving conversion workflows.
- Release operators packaging portable builds.

## Success Criteria

The product is successful when a user can:

- Understand which conversions are available in the current mode.
- Convert supported files with clear progress, errors, and output validation.
- Keep private local files local unless they explicitly choose otherwise.
- Run portable builds with reproducible smoke tests.

