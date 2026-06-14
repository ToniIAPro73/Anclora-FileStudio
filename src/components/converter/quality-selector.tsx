"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QualitySelectorProps {
  format: "mp3" | "mp4";
  quality: string;
  onQualityChange: (quality: string) => void;
  availableHeights: number[];
}

export function QualitySelector({ format, quality, onQualityChange, availableHeights }: QualitySelectorProps) {
  const mp3Qualities = ["128", "192", "256", "320"];
  const mp4Qualities = ["360", "480", "720", "1080"].filter(h => 
    availableHeights.some(ah => ah >= parseInt(h)) || parseInt(h) === 360
  );

  const currentQualities = format === "mp3" ? mp3Qualities : mp4Qualities;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white/80">Selecciona la calidad</label>
      <Tabs 
        value={quality} 
        onValueChange={onQualityChange} 
        className="w-full"
      >
        <TabsList className={`grid w-full grid-cols-4 bg-white/5 border border-white/10 p-1`}>
          {currentQualities.map((q) => (
            <TabsTrigger 
              key={q}
              value={q} 
              className="text-xs text-white/60 data-[state=active]:bg-cyan-600 data-[state=active]:text-white transition-all py-2"
            >
              {format === "mp3" ? `${q}k` : `${q}p`}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <p className="text-[10px] text-white/40 italic">
        {format === "mp3" 
          ? "La conversión no puede mejorar la calidad del audio original."
          : "Se utilizará la mejor alternativa compatible si la resolución exacta no está disponible."}
      </p>
    </div>
  );
}
