"use client"

import { useState } from "react"
import { searchSongAction, addSongAction, getLyricsWords, fetchLyricsAction, fetchSongDetailsAction } from "@/lib/actions"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { WordToken } from "@/lib/japanese"
import LyricsDisplay from "./LyricsDisplay"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"

export default function SongManager() {
  const { user } = useUser()
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [tokens, setTokens] = useState<WordToken[]>([])
  const [songId, setSongId] = useState<string | undefined>(undefined)

  const [manualMode, setManualMode] = useState(false)
  const [manualLyrics, setManualLyrics] = useState("")
  const [manualTitle, setManualTitle] = useState("")
  const [manualVideo, setManualVideo] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query) return
    setLoading(true)
    setResults([])
    setTokens([])
    
    try {
      const res = await searchSongAction(query)
      setResults(res)
      if (res.length === 0) toast.error("ไม่พบเพลงที่ค้นหา")
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการค้นหา")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSong = async (song: any) => {
    setLoading(true)
    setResults([]) // Clear search results after selection
    
    try {
      toast.info("กำลังดึงเนื้อเพลงและข้อมูลวิดีโอ...")
      
      // Fetch details and lyrics in parallel
      const [lyricsText, details] = await Promise.all([
        fetchLyricsAction(song.url),
        fetchSongDetailsAction(song.id)
      ])
      
      if (!lyricsText) {
        toast.error("ดึงเนื้อเพลงไม่สำเร็จ กรุณาลองใหม่หรือใช้วิธีวางเนื้อเพลงเอง")
        setLoading(false)
        return
      }

      // Save song to DB with videoUrl
      if (user) {
        const dbRes = await addSongAction(song.title, song.artist, lyricsText, user.id, details?.youtubeUrl)
        if (dbRes.success) {
          setSongId(dbRes.songId)
          toast.success("บันทึกเพลงและวิดีโอลงคลังแล้ว")
        }
      }

      // Tokenize
      const words = await getLyricsWords(lyricsText)
      setTokens(words)
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการประมวลผล")
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTokens([])
    
    if (user) {
      const dbRes = await addSongAction(manualTitle, "Manual Entry", manualLyrics, user.id, manualVideo)
      if (dbRes.success) {
        setSongId(dbRes.songId)
        toast.success("บันทึกเพลงลงคลังแล้ว")
      }
    }

    const words = await getLyricsWords(manualLyrics)
    setTokens(words)
    setLoading(false)
    setManualMode(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{manualMode ? "Manual Entry" : "Search Song"}</h2>
        <Button variant="ghost" onClick={() => {
          setManualMode(!manualMode)
          setResults([])
          setTokens([])
        }}>
          {manualMode ? "Switch to Search" : "Paste Lyrics Manually"}
        </Button>
      </div>

      {!manualMode ? (
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ใส่ชื่อเพลงที่ต้องการ (เช่น Lemon - Kenshi Yonezu)"
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-4 mb-8">
          <Input
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            placeholder="ชื่อเพลง"
            required
          />
          <Input
            value={manualVideo}
            onChange={(e) => setManualVideo(e.target.value)}
            placeholder="YouTube URL (ถ้ามี)"
          />
          <textarea
            value={manualLyrics}
            onChange={(e) => setManualLyrics(e.target.value)}
            placeholder="วางเนื้อเพลงที่นี่..."
            className="w-full min-h-[200px] p-2 border rounded bg-background"
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : "Submit Lyrics"}
          </Button>
        </form>
      )}

      {results.length > 0 && (
        <div className="mb-8 p-4 border rounded bg-muted/50">
          <h3 className="font-bold mb-4">ผลการค้นหา ({results.length}):</h3>
          <div className="space-y-2">
            {results.map((song) => (
              <div key={song.id} className="flex items-center justify-between p-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  {song.thumbnail && (
                    <img src={song.thumbnail} alt={song.title} className="w-12 h-12 object-cover rounded" />
                  )}
                  <div>
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-muted-foreground">{song.artist}</p>
                  </div>
                </div>
                <Button variant="secondary" onClick={() => handleSelectSong(song)}>เลือกเพลงนี้</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tokens.length > 0 && (
        <LyricsDisplay tokens={tokens} songId={songId} />
      )}
      
      {loading && (
        <div className="text-center py-10">
          <p className="animate-pulse text-lg font-medium">กำลังดำเนินการ...</p>
        </div>
      )}
    </div>
  )
}
