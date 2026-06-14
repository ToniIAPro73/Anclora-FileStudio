"use client";

import { cn } from "@/lib/utils";

interface QualitySelectorProps {
  format: "mp3" | "mp4";
  quality: string;
  onQualityChange: (quality: string) => void;
  availableHeights: number[];
}

const MP3_QUALITIES = ["128", "192", "256", "320"] as const;

function getAccentClasses(format: "mp3" | "mp4", isActive: boolean) {
  if (!isActive) return {};
  if (format === "mp3") {
    return {
      container:
        "border-cyan-500/35 bg-gradient-to-b from-cyan-500/[0.15] to-blue-600/[0.08] shadow-[0_0_20px_rgba(6,182,212,0.18),inset_0_1px_0_rgba(255,255,255,0.07)]",
      value: "text-white",
      unit: "text-cyan-400/70",
      bar: "bg-cyan-400",
    };
  }
  return {
    container:
      "border-violet-500/35 bg-gradient-to-b from-violet-500/[0.15] to-purple-600/[0.08] shadow-[0_0_20px_rgba(139,92,246,0.18),inset_0_1px_0_rgba(255,255,255,0.07)]",
    value: "text-white",
    unit: "text-violet-400/70",
    bar: "bg-violet-400",
  };
}

export function QualitySelector({
  format,
  quality,
  onQualityChange,
  availableHeights,
}: QualitySelectorProps) {
  const mp4Qualities = (["360", "480", "720", "1080"] as const).filter(
    (h) =>
      availableHeights.some((ah) => ah >= parseInt(h)) ||
      parseInt(h) === 360
  );

  const currentQualities: readonly string[] =
    format === "mp3" ? MP3_QUALITIES : mp4Qualities;

  return (
    <div className="space-y-2.5">
      <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35 ml-0.5">
        Selecciona la calidad
      </label>

      <div className="flex gap-1.5 p-1.5 bg-white/[0.025] border border-white/[0.06] rounded-2xl backdrop-blur-sm">
        {currentQualities.map((q, index) => {
          const isActive = quality === q;
          const accent = getAccentClasses(format, isActive);
          // bar count: 1 bar for index 0, …, 4 bars for index 3
          const filledBars = index + 1;

          return (
            <button
              key={q}
              type="button"
              onClick={() => onQualityChange(q)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-xl transition-all duration-300",
                "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
                isActive
                  ? accent.container
                  : "border-transparent text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
              )}
            >
              {/* Quality bars */}
              <div className="flex items-end gap-[2.5px] h-[14px]">
                {[1, 2, 3, 4].map((b) => {
                  const filled = b <= filledBars;
                  return (
                    <div
                      key={b}
                      className={cn(
                        "w-[3px] rounded-[1.5px] transition-all duration-300",
                        filled
                          ? isActive
                            ? accent.bar
                            : "bg-white/25"
                          : "bg-white/[0.08]"
                      )}
                      style={{ height: `${b * 3 + 2}px` }}
                    />
                  );
                })}
              </div>

              {/* Value */}
              <span
                className={cn(
                  "text-[13px] font-bold leading-none transition-colors duration-300",
                  isActive ? accent.value : "text-white/40"
                )}
              >
                {q}
              </span>

              {/* Unit */}
              <span
                className={cn(
                  "text-[8px] font-semibold uppercase tracking-[0.1em] transition-colors duration-300",
                  isActive ? accent.unit : "text-white/20"
                )}
              >
                {format === "mp3" ? "kbps" : "p"}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-white/25 italic ml-0.5 leading-relaxed">
        {format === "mp3"
          ? "La conversión no puede mejorar la calidad del audio original."
          : "Se utilizará la mejor alternativa si la resolución exacta no está disponible."}
      </p>
    </div>
  );
}
