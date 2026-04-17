import { create } from 'zustand'

interface PlayerStore {
  videoUrl: string | null
  isPlaying: boolean
  setVideoUrl: (url: string | null) => void
  setIsPlaying: (playing: boolean) => void
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  videoUrl: null,
  isPlaying: false,
  setVideoUrl: (url) => set({ videoUrl: url, isPlaying: !!url }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
}))
