"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "./ui/card"
import FlashcardGame from "./FlashcardGame"
import QuizGame from "./QuizGame"
import TypingGame from "./TypingGame"
import { Music, Brain, Layout, Keyboard, Search, Save, X, Play, Loader2, Video, Edit2, Zap } from "lucide-react"
import { WordToken } from "@/lib/japanese"
import { Button } from "./ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { saveVocabAction, translateToThai, updateSongVideoAction, saveMultipleVocabAction } from "@/lib/actions"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { usePlayerStore } from "@/lib/player-store"

interface Vocab {
  id: string
  kanji: string
  reading: string
  meaning: string
}

interface SongLearningToolsProps {
  song: {
    id: string
    title: string
    lyrics: string
    vocabs: Vocab[]
    videoUrl?: string | null
  }
  initialTokens: WordToken[]
}

export default function SongLearningTools({ song, initialTokens }: SongLearningToolsProps) {
  const { user } = useUser()
  const router = useRouter()
  const { setVideoUrl } = usePlayerStore()
  const [activeTab, setActiveTab] = useState("lyrics")
  
  // States
  const [newVideoUrl, setNewVideoUrl] = useState(song.videoUrl || "")
  const [isUpdatingVideo, setIsUpdatingVideo] = useState(false)
  const [selectedWord, setSelectedWord] = useState<WordToken | null>(null)
  const [meaning, setMeaning] = useState("")
  const [translating, setTranslating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isBulkSaving, setIsBulkSaving] = useState(false)

  const handleWordClick = async (token: WordToken & { meaning?: string }) => {
    setSelectedWord(token)
    setMeaning("")
    if (token.meaning) {
      setMeaning(token.meaning)
      return
    }
    setTranslating(true)
    const translated = await translateToThai(token.surface_form)
    setMeaning(translated)
    setTranslating(false)
  }

  const handleSaveVocab = async () => {
    if (!selectedWord || !user) return
    setSaving(true)
    const res = await saveVocabAction({
      kanji: selectedWord.surface_form,
      reading: selectedWord.reading || "",
      meaning: meaning || "N/A",
      songId: song.id,
      userId: user.id
    })
    if (res.success) {
      toast.success(`บันทึก "${selectedWord.surface_form}" แล้ว`)
      setSelectedWord(null)
      router.refresh()
    } else {
      toast.error(res.error || "บันทึกไม่สำเร็จ")
    }
    setSaving(false)
  }

  const handleAddAllKanji = async () => {
    if (!user) return
    setIsBulkSaving(true)
    
    // 1. Filter: เอาเฉพาะคำที่มี "คันจิ" และไม่ใช่คำช่วย (Particles)
    // RegExp สำหรับคันจิ: [\u4e00-\u9faf]
    const kanjiRegex = /[\u4e00-\u9faf]/
    
    // กรองเอาเฉพาะ Token ที่มีคันจิ และไม่อยู่ใน List ที่เซฟไปแล้ว
    const kanjiTokens = initialTokens.filter(token => {
      const hasKanji = kanjiRegex.test(token.surface_form)
      const isAlreadySaved = song.vocabs.some(v => v.kanji === token.surface_form)
      const isNotParticle = !["particle", "conjunction", "adnominal", "auxiliary_verb"].includes(token.pos)
      return hasKanji && !isAlreadySaved && isNotParticle
    })

    // ลบคำที่ซ้ำกันในเพลง (เช่น คำว่า "私" มีหลายจุด ให้เอาอันเดียว)
    const uniqueKanjiTokens = Array.from(new Map(kanjiTokens.map(item => [item.surface_form, item])).values())

    if (uniqueKanjiTokens.length === 0) {
      toast.info("ไม่พบคำศัพท์คันจิใหม่ๆ เพิ่มเติมในเพลงนี้")
      setIsBulkSaving(false)
      return
    }

    toast.info(`กำลังบันทึกคันจิ ${uniqueKanjiTokens.length} คำ...`)

    // 2. เตรียมข้อมูลบันทึก
    const vocabsToSave = uniqueKanjiTokens.map(token => ({
      kanji: token.surface_form,
      reading: token.reading || "",
      meaning: (token as any).meaning || "N/A",
      songId: song.id,
      userId: user.id
    }))

    // 3. เรียก Action บันทึกเป็นกลุ่ม
    const res = await saveMultipleVocabAction(vocabsToSave)
    
    if (res.success) {
      toast.success(`บันทึกสำเร็จ! เพิ่มคันจิใหม่เข้าคลัง ${res.count} คำ`)
      router.refresh()
    } else {
      toast.error("เกิดข้อผิดพลาดในการบันทึกแบบกลุ่ม")
    }
    setIsBulkSaving(false)
  }

  const handleUpdateVideo = async () => {
    setIsUpdatingVideo(true)
    const res = await updateSongVideoAction(song.id, newVideoUrl)
    if (res.success) {
      toast.success("อัปเดตวิดีโอเรียบร้อย")
      router.refresh()
    } else {
      toast.error("อัปเดตไม่สำเร็จ")
    }
    setIsUpdatingVideo(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">{song.title}</h1>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-2">
          <p className="text-muted-foreground text-sm">คลิกที่คำศัพท์ในเนื้อเพลงเพื่อบันทึกเข้าคลัง</p>
          
          <div className="flex items-center gap-3">
            {song.videoUrl && (
              <Button 
                size="sm" 
                variant="outline" 
                className="rounded-full gap-2 bg-primary/10 border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all px-4"
                onClick={() => setVideoUrl(song.videoUrl || null)}
              >
                <Play size={14} className="fill-current" />
                <span className="font-bold">Play Music</span>
              </Button>
            )}

            <Button
              size="sm"
              variant="secondary"
              className="rounded-full gap-2 font-bold px-4 hover:scale-105 transition-transform"
              onClick={handleAddAllKanji}
              disabled={isBulkSaving}
            >
              {isBulkSaving ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} className="fill-current" />}
              Add All Kanji
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary">
                  <Edit2 size={14} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>ตั้งค่า YouTube URL</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-2">
                  <Label>ลิงก์วิดีโอ YouTube</Label>
                  <Input 
                    placeholder="https://www.youtube.com/watch?v=..." 
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleUpdateVideo} disabled={isUpdatingVideo}>
                    {isUpdatingVideo ? "กำลังบันทึก..." : "บันทึก URL"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto h-auto p-1 bg-accent/50 rounded-2xl">
          <TabsTrigger value="lyrics" className="flex flex-col gap-1 py-3 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md">
            <Music size={20} />
            <span className="text-xs font-bold">Lyrics</span>
          </TabsTrigger>
          <TabsTrigger value="flashcard" className="flex flex-col gap-1 py-3 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md">
            <Layout size={20} />
            <span className="text-xs font-bold">Flashcard</span>
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex flex-col gap-1 py-3 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md">
            <Brain size={20} />
            <span className="text-xs font-bold">Quiz</span>
          </TabsTrigger>
          <TabsTrigger value="typing" className="flex flex-col gap-1 py-3 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md">
            <Keyboard size={20} />
            <span className="text-xs font-bold">Typing</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-10 min-h-[500px]">
          <TabsContent value="lyrics" className="animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col lg:flex-row gap-8">
              <Card className="flex-1 border-none bg-accent/10 shadow-inner overflow-hidden">
                <CardContent className="p-8">
                  <div className="leading-relaxed flex flex-wrap gap-x-1 gap-y-4 justify-center">
                    {initialTokens.map((token, index) => (
                      <div key={index} className="group relative flex flex-col items-center">
                        <span className="text-[10px] text-primary/60 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                          {token.reading}
                        </span>
                        <span
                          onClick={() => handleWordClick(token)}
                          className={`cursor-pointer px-1.5 py-0.5 rounded-md text-xl transition-all ${
                            selectedWord === token 
                            ? "bg-primary text-primary-foreground scale-110 shadow-lg" 
                            : "hover:bg-primary/20 hover:scale-110"
                          } ${song.vocabs.some(v => v.kanji === token.surface_form) ? "border-b-2 border-primary/40" : ""}`}
                        >
                          {token.surface_form}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedWord && (
                <div className="w-full lg:w-80 animate-in slide-in-from-right duration-300">
                  <Card className="sticky top-8 border-2 border-primary/20 shadow-2xl overflow-hidden">
                    <div className="bg-primary p-4 text-primary-foreground flex justify-between items-center">
                      <span className="font-bold">Word Detail</span>
                      <button onClick={() => setSelectedWord(null)}><X size={20} /></button>
                    </div>
                    <CardContent className="p-6 space-y-6">
                      <div className="text-center">
                        <h3 className="text-5xl font-bold mb-1">{selectedWord.surface_form}</h3>
                        <p className="text-xl text-primary font-medium">{selectedWord.reading}</p>
                      </div>

                      <div className="space-y-4">
                        {selectedWord.base_form && selectedWord.base_form !== selectedWord.surface_form && (
                          <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                            <p className="text-xs font-bold uppercase text-primary/60 mb-1">Base Form (รูปพจนานุกรม)</p>
                            <p className="text-xl font-bold">{selectedWord.base_form}</p>
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-muted-foreground">ความหมายไทย</label>
                          <div className="relative">
                            <input 
                              className="w-full p-3 bg-accent/50 rounded-lg border-2 border-transparent focus:border-primary outline-none transition-all"
                              value={meaning}
                              onChange={(e) => setMeaning(e.target.value)}
                              placeholder={translating ? "กำลังแปล..." : "พิมพ์ความหมาย..."}
                            />
                            {translating && <div className="absolute right-3 top-3 animate-spin border-2 border-primary border-t-transparent rounded-full h-4 w-4" />}
                          </div>
                        </div>

                        <Button 
                          className="w-full h-12 gap-2 font-bold text-lg" 
                          onClick={handleSaveVocab}
                          disabled={saving}
                        >
                          {saving ? <div className="animate-spin border-2 border-current border-t-transparent rounded-full h-4 w-4" /> : <Save size={20} />}
                          บันทึกเข้าคลัง
                        </Button>
                        
                        <a 
                          href={`https://jisho.org/search/${selectedWord.surface_form}`}
                          target="_blank"
                          className="flex items-center justify-center gap-1 text-xs text-blue-500 hover:underline"
                        >
                          <Search size={12} /> ดูเพิ่มเติมบน Jisho.org
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="flashcard" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <FlashcardGame vocabs={song.vocabs} />
          </TabsContent>

          <TabsContent value="quiz" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <QuizGame vocabs={song.vocabs} />
          </TabsContent>

          <TabsContent value="typing" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <TypingGame vocabs={song.vocabs} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
