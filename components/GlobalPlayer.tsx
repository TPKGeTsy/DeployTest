"use client"

import { usePlayerStore } from "@/lib/player-store"
import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { X, Maximize2, Minimize2, Play, Pause, Music } from "lucide-react"
import { cn } from "@/lib/utils"

export default function GlobalPlayer() {
  const { videoUrl, isPlaying, setIsPlaying, setVideoUrl } = usePlayerStore()
  const [isMinimized, setIsMinimized] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted || !videoUrl) return null

  // Extract YouTube ID
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const videoId = getYoutubeId(videoUrl)
  if (!videoId) return null

  return (
    <div 
      className={cn(
        "fixed bottom-4 right-4 z-[100] transition-all duration-500 ease-in-out shadow-2xl rounded-2xl overflow-hidden border bg-background",
        isMinimized ? "w-16 h-16" : "w-80 h-auto"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-primary text-primary-foreground">
        <div className="flex items-center gap-2 overflow-hidden">
          <Music size={16} className={cn("shrink-0", isPlaying && "animate-bounce")} />
          {!isMinimized && <span className="text-xs font-bold truncate">Now Playing</span>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-white/20 rounded">
            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button onClick={() => setVideoUrl(null)} className="p-1 hover:bg-white/20 rounded">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* IFrame Player */}
      <div className={cn(
        "bg-black transition-all",
        isMinimized ? "h-0 opacity-0" : "aspect-video opacity-100"
      )}>
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&enablejsapi=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>

      {/* Mini View Controls */}
      {isMinimized && (
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-full h-full flex items-center justify-center bg-background"
        >
          {isPlaying ? (
            <div className="flex gap-0.5 h-4 items-end">
              <div className="w-1 bg-primary animate-music-1 rounded-full" />
              <div className="w-1 bg-primary animate-music-2 rounded-full" />
              <div className="w-1 bg-primary animate-music-3 rounded-full" />
            </div>
          ) : (
            <Play size={20} className="text-primary fill-primary" />
          )}
        </button>
      )}

      {!isMinimized && (
        <div className="p-2 flex items-center justify-center gap-2 border-t text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
          {isPlaying ? "Playing Background" : "Paused"}
        </div>
      )}

      <style jsx global>{`
        @keyframes music-1 { 0%, 100% { height: 4px; } 50% { height: 16px; } }
        @keyframes music-2 { 0%, 100% { height: 12px; } 50% { height: 6px; } }
        @keyframes music-3 { 0%, 100% { height: 8px; } 50% { height: 14px; } }
        .animate-music-1 { animation: music-1 1s infinite; }
        .animate-music-2 { animation: music-2 1.2s infinite; }
        .animate-music-3 { animation: music-3 0.8s infinite; }
      `}</style>
    </div>
  )
}
