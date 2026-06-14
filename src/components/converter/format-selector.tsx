"use client";

import { Music, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormatSelectorProps {
  format: "mp3" | "mp4";
  onFormatChange: (format: "mp3" | "mp4") => void;
}

const OPTIONS = [
  {
    value: "mp3" as const,
    label: "MP3",
    sub: "Solo audio",
    Icon: Music,
    gradient: "from-cyan-500 to-blue-600",
    glowColor: "rgba(6,182,212,0.2)",
    activeBorder: "border-cyan-500/30",
    activeBg: "bg-gradient-to-br from-cyan-500/15 to-blue-600/10",
    activeText: "text-cyan-300",
    activeIcon: "bg-cyan-500/20",
    dot: "bg-cyan-400",
  },
  {
    value: "mp4" as const,
    label: "MP4",
    sub: "Vídeo",
    Icon: Video,
    gradient: "from-violet-500 to-purple-600",
    glowColor: "rgba(139,92,246,0.2)",
    activeBorder: "border-violet-500/30",
    activeBg: "bg-gradient-to-br from-violet-500/15 to-purple-600/10",
    activeText: "text-violet-300",
    activeIcon: "bg-violet-500/20",
    dot: "bg-violet-400",
  },
] as const;

export function FormatSelector({ format, onFormatChange }: FormatSelectorProps) {
  return (
    <div className="space-y-2.5">
      <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35 ml-0.5">
        Selecciona el formato
      </label>

      <div className="flex gap-2 p-1.5 bg-white/[0.025] border border-white/[0.06] rounded-2xl backdrop-blur-sm">
        {OPTIONS.map((opt) => {
          const isActive = format === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onFormatChange(opt.value)}
              className={cn(
                "relative flex-1 flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
                isActive
                  ? [opt.activeBg, "border", opt.activeBorder]
                  : "border border-transparent hover:bg-white/[0.04] text-white/35 hover:text-white/60"
              )}
              style={
                isActive
                  ? { boxShadow: `0 0 24px ${opt.glowColor}, inset 0 1px 0 rgba(255,255,255,0.08)` }
                  : undefined
              }
            >
              {/* Icon container */}
              <div
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300",
                  isActive ? opt.activeIcon : "bg-white/[0.05]"
                )}
              >
                <opt.Icon
                  className={cn(
                    "h-5 w-5 transition-colors duration-300",
                    isActive ? opt.activeText : "text-white/30"
                  )}
                />
              </div>

              {/* Label */}
              <div className="text-left">
                <div
                  className={cn(
                    "text-sm font-bold tracking-tight transition-colors duration-300",
                    isActive ? "text-white" : "text-white/40"
                  )}
                >
                  {opt.label}
                </div>
                <div
                  className={cn(
                    "text-[10px] font-medium tracking-wide transition-colors duration-300",
                    isActive ? opt.activeText : "text-white/25"
                  )}
                >
                  {opt.sub}
                </div>
              </div>

              {/* Active indicator dot */}
              {isActive && (
                <div className="ml-auto flex-shrink-0">
                  <span
                    className={cn("block h-2 w-2 rounded-full animate-pulse", opt.dot)}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
