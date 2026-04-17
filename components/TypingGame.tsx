"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { CheckCircle2, XCircle, Keyboard } from "lucide-react"
import { toast } from "sonner"

interface VocabItem {
  kanji: string
  reading: string
  meaning: string
}

export default function TypingGame({ vocabs }: { vocabs: VocabItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const current = vocabs[currentIndex]

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentIndex])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (showAnswer) {
      nextQuestion()
      return
    }

    const correct = userInput.trim() === current.reading || userInput.trim() === current.kanji
    
    if (correct) {
      setIsCorrect(true)
      setScore(score + 1)
      toast.success("ถูกต้อง!")
      setTimeout(nextQuestion, 1000)
    } else {
      setIsCorrect(false)
      setShowAnswer(true)
      toast.error("ยังไม่ถูกนะ")
    }
  }

  const nextQuestion = () => {
    setUserInput("")
    setIsCorrect(null)
    setShowAnswer(false)
    if (currentIndex < vocabs.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setIsGameOver(true)
    }
  }

  if (isGameOver) {
    return (
      <div className="text-center p-10 bg-primary/5 rounded-xl border-2 border-primary/20">
        <h3 className="text-3xl font-bold mb-4">จบการฝึกพิมพ์!</h3>
        <p className="text-xl mb-6">คะแนนความแม่นยำ: {score} / {vocabs.length}</p>
        <Button onClick={() => {
          setCurrentIndex(0)
          setScore(0)
          setIsGameOver(false)
          setUserInput("")
        }}>เริ่มใหม่</Button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-background border-2 rounded-2xl shadow-xl">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Keyboard className="text-primary" size={20} />
          <span className="font-bold">Typing Mode</span>
        </div>
        <span className="text-sm font-medium bg-accent px-3 py-1 rounded-full">
          {currentIndex + 1} / {vocabs.length}
        </span>
      </div>

      <div className="text-center mb-10">
        <h3 className="text-5xl font-bold mb-4 text-primary">{current.kanji}</h3>
        <p className="text-xl text-muted-foreground">{current.meaning}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            ref={inputRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="พิมพ์คำอ่าน (Hiragana)..."
            className={`text-center h-16 text-2xl font-medium transition-all ${
              isCorrect === true ? "border-green-500 bg-green-50" : 
              isCorrect === false ? "border-red-500 bg-red-50" : ""
            }`}
            autoFocus
            disabled={isCorrect === true}
          />
          {isCorrect === true && (
            <CheckCircle2 className="absolute right-4 top-4 text-green-500" size={32} />
          )}
          {isCorrect === false && (
            <XCircle className="absolute right-4 top-4 text-red-500" size={32} />
          )}
        </div>

        {showAnswer && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center animate-in fade-in slide-in-from-top-2">
            <p className="text-sm text-orange-600 font-bold uppercase mb-1">คำตอบที่ถูกต้องคือ:</p>
            <p className="text-2xl font-bold text-orange-700">{current.reading}</p>
            <Button 
              type="button" 
              variant="ghost" 
              className="mt-2 text-orange-700 hover:bg-orange-100"
              onClick={nextQuestion}
            >
              กด Enter เพื่อไปต่อ
            </Button>
          </div>
        )}

        <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isCorrect === true}>
          {showAnswer ? "ต่อไป" : "ตรวจสอบ"}
        </Button>
      </form>
      
      <p className="text-center text-xs text-muted-foreground mt-6">
        ทิป: พิมพ์ได้ทั้งตัวคันจิหรือคำอ่าน Hiragana
      </p>
    </div>
  )
}
