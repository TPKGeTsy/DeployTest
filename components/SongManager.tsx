"use client"

import { useState } from "react"
import { searchSongAction, addSongAction, getLyricsWords, fetchLyricsAction, fetchSongDetailsAction } from "@/lib/actions"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { WordToken } from "@/lib/japanese"
import LyricsDisplay from "./LyricsDisplay"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"
import { Music, AlertCircle } from "lucide-react"

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
      if (res && typeof res === 'object' && 'error' in res) {
        toast.error(res.error as string)
        setLoading(false)
        return
      }
      const songResults = Array.isArray(res) ? res : []
      setResults(songResults)
      if (songResults.length === 0) toast.error("ไม่พบเพลงที่ค้นหา")
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการค้นหา")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSong = async (song: any) => {
    setLoading(true)
    setResults([]) 
    
    try {
      toast.info("กำลังดึงข้อมูลเพลงและวิดีโอ...")
      
      const [lyricsText, details] = await Promise.all([
        fetchLyricsAction(song.url, song.artist, song.title),
        fetchSongDetailsAction(song.id)
      ])
      
      // กรณีดึงเนื้อเพลงไม่ได้ (โดนบล็อก)
      if (!lyricsText) {
        toast.warning("ดึงเนื้อเพลงไม่สำเร็จเนื่องจากระบบป้องกันต้นทาง", {
          description: "แต่เราหาลิงก์วิดีโอให้แล้ว! กรุณาวางเนื้อเพลงด้วยตัวเองด้านล่างครับ",
          duration: 6000
        })
        
        // สลับไปโหมดแมนนวล แต่ใส่ข้อมูลที่หามาได้ให้เลย!
        setManualTitle(`${song.title} - ${song.artist}`)
        setManualVideo(details?.youtubeUrl || "")
        setManualMode(true)
        setLoading(false)
        return
      }

      // กรณีดึงได้ปกติ
      if (user) {
        const dbRes = await addSongAction(song.title, song.artist, lyricsText, user.id, details?.youtubeUrl)
        if (dbRes.success) {
          setSongId(dbRes.songId)
          toast.success("บันทึกเพลงและวิดีโอลงคลังแล้ว")
        } else if (dbRes.error) {
          toast.error(dbRes.error)
          setLoading(false)
          return
        }
      }

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
        toast.success("บันทึกเพลงลงคลังเรียบร้อย")
      } else if (dbRes.error) {
        toast.error(dbRes.error)
        setLoading(false)
        return
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
        <h2 className="text-xl font-semibold flex items-center gap-2">
          {manualMode ? <AlertCircle className="text-orange-500" /> : <Music className="text-primary" />}
          {manualMode ? "Complete Song Info" : "Search Song"}
        </h2>
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
            className="flex-1 h-12 text-lg"
          />
          <Button type="submit" size="lg" disabled={loading} className="h-12 px-8 font-bold">
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-4 mb-8 bg-accent/20 p-6 rounded-2xl border-2 border-primary/20 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground ml-1">ชื่อเพลง - ศิลปิน</label>
              <Input
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="เช่น Lemon - Kenshi Yonezu"
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground ml-1">YouTube URL (ระบบหาให้แล้วถ้ามี)</label>
              <Input
                value={manualVideo}
                onChange={(e) => setManualVideo(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="bg-background border-primary/30"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-muted-foreground ml-1">วางเนื้อเพลงภาษาญี่ปุ่นที่นี่</label>
            <textarea
              value={manualLyrics}
              onChange={(e) => setManualLyrics(e.target.value)}
              placeholder="วางเนื้อเพลงญี่ปุ่นที่ก๊อปมา..."
              className="w-full min-h-[250px] p-4 border-2 rounded-xl bg-background focus:border-primary outline-none transition-all"
              required
            />
          </div>
          <Button type="submit" size="lg" className="w-full font-bold text-lg h-14" disabled={loading}>
            {loading ? "Processing Tokens..." : "Import & Start Learning ✨"}
          </Button>
        </form>
      )}

      {results.length > 0 && (
        <div className="mb-8 p-4 border rounded-2xl bg-muted/50 shadow-inner overflow-hidden animate-in fade-in zoom-in-95">
          <h3 className="font-bold mb-4 px-2">ผลการค้นหา ({results.length}):</h3>
          <div className="space-y-2">
            {results.map((song) => (
              <div key={song.id} className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-background/50 rounded-xl transition-colors">
                <div className="flex items-center gap-4">
                  {song.thumbnail ? (
                    <img src={song.thumbnail} alt={song.title} className="w-14 h-14 object-cover rounded-lg shadow-md" />
                  ) : (
                    <div className="w-14 h-14 bg-accent flex items-center justify-center rounded-lg"><Music size={24} /></div>
                  )}
                  <div>
                    <p className="font-bold text-lg leading-tight">{song.title}</p>
                    <p className="text-sm text-muted-foreground">{song.artist}</p>
                  </div>
                </div>
                <Button variant="outline" className="font-bold hover:bg-primary hover:text-primary-foreground transition-all" onClick={() => handleSelectSong(song)}>เลือกเพลงนี้</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tokens.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
          <LyricsDisplay tokens={tokens} songId={songId} />
        </div>
      )}
      
      {loading && !manualMode && (
        <div className="text-center py-20">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
          <p className="animate-pulse text-lg font-bold text-primary">กำลังประมวลผลบทเพลงของคุณ...</p>
        </div>
      )}
    </div>
  )
}
