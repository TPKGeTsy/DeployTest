"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { CheckCircle2, XCircle } from "lucide-react"

interface VocabItem {
  kanji: string
  reading: string
  meaning: string
}

export default function QuizGame({ vocabs }: { vocabs: VocabItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [options, setOptions] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)

  const current = vocabs[currentIndex]

  useEffect(() => {
    if (vocabs.length > 0) {
      generateOptions()
    }
  }, [currentIndex])

  const generateOptions = () => {
    const correct = current.kanji
    let choices = [correct]
    
    // Pick 3 random wrong answers from the list
    const otherVocabs = vocabs.filter(v => v.kanji !== correct)
    const shuffledOthers = [...otherVocabs].sort(() => 0.5 - Math.random())
    
    shuffledOthers.slice(0, 3).forEach(v => choices.push(v.kanji))
    
    // If not enough words, add some placeholders
    while (choices.length < 4) {
      choices.push("---")
    }

    setOptions(choices.sort(() => 0.5 - Math.random()))
    setSelectedOption(null)
    setIsCorrect(null)
  }

  const handleSelect = (option: string) => {
    if (selectedOption) return // prevent double clicking
    
    setSelectedOption(option)
    const correct = option === current.kanji
    setIsCorrect(correct)
    if (correct) setScore(score + 1)

    setTimeout(() => {
      if (currentIndex < vocabs.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        setIsGameOver(true)
      }
    }, 1500)
  }

  if (isGameOver) {
    return (
      <div className="text-center p-10 bg-accent/20 rounded-xl border">
        <h3 className="text-3xl font-bold mb-4">จบเกม!</h3>
        <p className="text-xl mb-6">คะแนนของคุณ: {score} / {vocabs.length}</p>
        <Button onClick={() => {
          setCurrentIndex(0)
          setScore(0)
          setIsGameOver(false)
        }}>เล่นอีกครั้ง</Button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-background border rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-bold text-primary">Score: {score}</span>
        <span className="text-sm text-muted-foreground">Question {currentIndex + 1} / {vocabs.length}</span>
      </div>

      <div className="text-center mb-8">
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">ความหมายคืออะไร?</p>
        <h3 className="text-3xl font-bold text-primary">{current.meaning}</h3>
        {current.reading && <p className="text-sm text-muted-foreground mt-1">({current.reading})</p>}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {options.map((option, idx) => (
          <Button
            key={idx}
            variant={selectedOption === option ? (isCorrect ? "default" : "destructive") : "outline"}
            className={`h-16 text-xl font-bold transition-all ${
              selectedOption === option ? "scale-105" : ""
            } ${selectedOption && option === current.kanji && !isCorrect ? "border-green-500 border-2" : ""}`}
            onClick={() => handleSelect(option)}
            disabled={!!selectedOption}
          >
            {option}
            {selectedOption === option && (
              <span className="ml-2">
                {isCorrect ? <CheckCircle2 /> : <XCircle />}
              </span>
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}
