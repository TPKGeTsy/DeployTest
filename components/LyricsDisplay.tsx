"use client"

import { useState } from "react"
import { WordToken } from "@/lib/japanese"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { toast } from "sonner"
import { saveVocabAction, translateToThai } from "@/lib/actions"
import { useUser } from "@clerk/nextjs"
import FlashcardGame from "./FlashcardGame"

interface LyricsDisplayProps {
  tokens: WordToken[]
  songId?: string
}

interface SavedVocab {
  id: string
  kanji: string
  reading: string
  meaning: string
}

export default function LyricsDisplay({ tokens, songId }: LyricsDisplayProps) {
  const { user } = useUser()
  const [selectedWord, setSelectedWord] = useState<WordToken | null>(null)
  const [meaning, setMeaning] = useState("")
  const [translating, setTranslating] = useState(false)
  const [savedVocabs, setSavedVocabs] = useState<SavedVocab[]>([])

  const handleWordClick = async (token: WordToken) => {
    setSelectedWord(token)
    setMeaning("")
    setTranslating(true)
    
    // Auto translate to Thai
    const translated = await translateToThai(token.surface_form)
    setMeaning(translated)
    setTranslating(false)
  }

  const handleSaveVocab = async () => {
    if (!selectedWord || !songId || !user) return

    const res = await saveVocabAction({
      kanji: selectedWord.surface_form,
      reading: selectedWord.reading || "",
      meaning: meaning || "N/A",
      songId: songId,
      userId: user.id
    })

    if (res.success && res.vocabId) {
      toast.success(`เพิ่มคำศัพท์ "${selectedWord.surface_form}" แล้ว!`)
      
      // Add to local list for the mini game with the ID from DB
      setSavedVocabs(prev => [...prev, {
        id: res.vocabId as string,
        kanji: selectedWord.surface_form,
        reading: selectedWord.reading || "",
        meaning: meaning || "N/A"
      }])
      
      setSelectedWord(null)
    } else {
      toast.error("บันทึกไม่สำเร็จ")
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 p-6 border rounded-xl bg-background/50 backdrop-blur shadow-inner min-h-[400px]">
          <h2 className="text-xl font-bold mb-6 text-primary border-b pb-2">Lyrics (Interactive)</h2>
          <div className="leading-relaxed flex flex-wrap gap-x-1 gap-y-3">
            {tokens.map((token, index) => (
              <div key={index} className="group relative flex flex-col items-center">
                <span className="text-[10px] text-muted-foreground h-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  {token.reading}
                </span>
                <span
                  onClick={() => handleWordClick(token)}
                  className={`cursor-pointer px-1 rounded-md text-lg transition-all ${
                    selectedWord === token 
                    ? "bg-primary text-primary-foreground scale-110 shadow-lg" 
                    : "hover:bg-primary/20 hover:scale-105"
                  }`}
                >
                  {token.surface_form}
                </span>
              </div>
            ))}
          </div>
        </div>

        {selectedWord && (
          <Card className="w-full md:w-80 h-fit sticky top-8 shadow-2xl border-primary/20 animate-in slide-in-from-right">
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <h3 className="text-4xl font-bold mb-1">{selectedWord.surface_form}</h3>
                <p className="text-lg text-primary font-medium">
                  {selectedWord.reading || "---"}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-accent/50 p-3 rounded-lg">
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Base Form</p>
                  <p>{selectedWord.base_form || selectedWord.surface_form}</p>
                </div>

                <div>
                  <label className="text-sm font-bold text-primary">ความหมายไทย (Auto-Translate)</label>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      value={meaning}
                      onChange={(e) => setMeaning(e.target.value)}
                      placeholder={translating ? "กำลังแปล..." : "ใส่ความหมายตรงนี้"}
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                    {translating && (
                      <div className="absolute right-3 top-3 animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button onClick={handleSaveVocab} className="w-full font-bold">บันทึกคำศัพท์</Button>
                  <Button variant="outline" onClick={() => setSelectedWord(null)} className="w-full">ยกเลิก</Button>
                </div>
                
                <a
                  href={`https://jisho.org/search/${selectedWord.surface_form}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center text-xs text-blue-500 hover:underline"
                >
                  ค้นหาเพิ่มเติมบน Jisho.org
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {savedVocabs.length > 0 && (
        <div className="pt-10 border-t">
          <FlashcardGame vocabs={savedVocabs} />
        </div>
      )}
    </div>
  )
}
