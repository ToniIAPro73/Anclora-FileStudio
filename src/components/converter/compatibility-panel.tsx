"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, ChevronDown, Wrench, XCircle } from "lucide-react";
import type { CapabilityInfo, CapabilityLossProfile } from "@/lib/domain/unified-analysis";

// Loss profile badge configuration
const LOSS_PROFILE_CONFIG: Record<CapabilityLossProfile, { label: string; cls: string }> = {
  lossless: { label: "Sin pérdida", cls: "bg-emerald-500/20 text-emerald-400" },
  "metadata-risk": { label: "Riesgo metadatos", cls: "bg-amber-500/20 text-amber-400" },
  "layout-risk": { label: "Riesgo formato", cls: "bg-orange-500/20 text-orange-400" },
  lossy: { label: "Con pérdida", cls: "bg-red-500/20 text-red-400" },
  experimental: { label: "Experimental", cls: "bg-purple-500/20 text-purple-400" },
};

// Engine display names
const ENGINE_DISPLAY_NAMES: Record<string, string> = {
  "ffmpeg-media": "FFmpeg",
  "sharp-image": "Sharp",
  "data-ts": "Data Engine",
  qpdf: "QPDF",
  sevenzip: "7-Zip",
  pandoc: "Pandoc",
  libreoffice: "LibreOffice",
  calibre: "Calibre",
  tesseract: "Tesseract",
};

interface Props {
  capabilities: CapabilityInfo[];
  recommended: CapabilityInfo | null;
  onSelect: (cap: CapabilityInfo) => void;
  selectedKey: string | null;
}

export function CompatibilityPanel({ capabilities, recommended, onSelect, selectedKey }: Props) {
  const [showAll, setShowAll] = useState(false);
  // Show available first, then unavailable
  const available = capabilities.filter((c) => c.state === "available");
  const unavailable = capabilities.filter((c) => c.state !== "available");
  const sorted = [...available, ...unavailable];
  const visible = showAll ? sorted : sorted.slice(0, 5);

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">¿Qué quieres hacer?</h2>

      <div className="space-y-2" role="listbox" aria-label="Operaciones disponibles">
        {visible.map((cap) => {
          const isSelected = selectedKey === cap.id;
          const isRecommended = recommended?.id === cap.id;

          return (
            <CapabilityCard
              key={cap.id}
              cap={cap}
              isSelected={isSelected}
              isRecommended={isRecommended}
              onSelect={() => onSelect(cap)}
            />
          );
        })}
      </div>

      {sorted.length > 5 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mx-auto"
        >
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAll ? "rotate-180" : ""}`} />
          {showAll ? "Mostrar menos" : `Ver ${sorted.length - 5} opciones más`}
        </button>
      )}

      {available.length === 0 && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-400 flex gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>No se encontraron conversiones compatibles para este archivo.</span>
        </div>
      )}
    </div>
  );
}

function CapabilityCard({
  cap,
  isSelected,
  isRecommended,
  onSelect,
}: {
  cap: CapabilityInfo;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
}) {
  const isAvailable = cap.state === "available";
  const isUnavailableTool = cap.state === "unavailable-tool";
  const lossConfig = LOSS_PROFILE_CONFIG[cap.lossProfile] ?? LOSS_PROFILE_CONFIG.lossy;
  const engineName = ENGINE_DISPLAY_NAMES[cap.engineId] ?? cap.engineId;

  return (
    <div
      className={`rounded-xl border transition-all ${
        isSelected
          ? "border-cyan-500/60 bg-cyan-500/10"
          : isAvailable
            ? "border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5"
            : "border-white/5 bg-white/1 opacity-60"
      }`}
    >
      <button
        type="button"
        onClick={isAvailable ? onSelect : undefined}
        role="option"
        aria-selected={isSelected}
        disabled={!isAvailable}
        className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl disabled:cursor-not-allowed"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-white">
                {cap.outputLabel}
              </span>
              {isRecommended && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 font-medium">
                  Recomendado
                </span>
              )}
              {/* Loss profile badge */}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${lossConfig.cls}`}>
                {lossConfig.label}
              </span>
              {/* Engine badge */}
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/8 text-white/35 font-medium">
                {engineName}
              </span>
            </div>
            <p className="text-xs text-white/45 mt-0.5">
              {cap.outputFormat.toUpperCase()}
            </p>

            {/* Tool not installed warning */}
            {isUnavailableTool && (
              <p className="text-[11px] text-red-400/80 mt-1 flex items-center gap-1">
                <Wrench className="h-3 w-3 shrink-0" />
                Herramienta no instalada — {engineName} es necesario
              </p>
            )}

            {/* Unsupported state */}
            {cap.state === "unsupported" && (
              <p className="text-[11px] text-white/30 mt-1 flex items-center gap-1">
                <XCircle className="h-3 w-3 shrink-0" />
                No soportado para este archivo
              </p>
            )}

            {/* Warnings */}
            {cap.warnings.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {cap.warnings.map((w, i) => (
                  <p key={i} className="text-[11px] text-amber-400/80 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    {w}
                  </p>
                ))}
              </div>
            )}
          </div>
          {isSelected && <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0" />}
        </div>
      </button>
    </div>
  );
}
