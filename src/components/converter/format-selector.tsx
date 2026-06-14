"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Video } from "lucide-react";

interface FormatSelectorProps {
  format: "mp3" | "mp4";
  onFormatChange: (format: "mp3" | "mp4") => void;
}

export function FormatSelector({ format, onFormatChange }: FormatSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white/80">Selecciona el formato</label>
      <Tabs 
        value={format} 
        onValueChange={(v) => onFormatChange(v as "mp3" | "mp4")} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 h-14 bg-white/5 border border-white/10 p-1">
          <TabsTrigger 
            value="mp3" 
            className="flex items-center gap-2 text-white/60 data-[state=active]:bg-cyan-600 data-[state=active]:text-white transition-all h-full"
          >
            <Music className="h-4 w-4" />
            <div className="text-left">
              <div className="text-sm font-medium">MP3</div>
              <div className="text-[10px] opacity-70">Solo audio</div>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="mp4" 
            className="flex items-center gap-2 text-white/60 data-[state=active]:bg-cyan-600 data-[state=active]:text-white transition-all h-full"
          >
            <Video className="h-4 w-4" />
            <div className="text-left">
              <div className="text-sm font-medium">MP4</div>
              <div className="text-[10px] opacity-70">Vídeo</div>
            </div>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
