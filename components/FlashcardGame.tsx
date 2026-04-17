"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Shuffle, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Star,
  CheckCircle2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "./ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { deleteVocabAction, updateVocabAction } from "@/lib/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface VocabItem {
  id: string
  kanji: string
  reading: string
  meaning: string
}

export default function FlashcardGame({ vocabs: initialVocabs }: { vocabs: VocabItem[] }) {
  const router = useRouter()
  const [vocabs, setVocabs] = useState<VocabItem[]>(initialVocabs)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ kanji: "", reading: "", meaning: "" })
  const [difficultWords, setDifficultWords] = useState<Set<string>>(new Set())

  // Keep state in sync with props
  useEffect(() => {
    setVocabs(initialVocabs)
  }, [initialVocabs])

  if (vocabs.length === 0) return (
    <div className="text-center p-10 bg-accent/20 rounded-xl border">
      <p className="text-muted-foreground">ยังไม่มีคำศัพท์ให้แสดงผล</p>
    </div>
  )

  const current = vocabs[currentIndex]

  const nextCard = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev + 1) % vocabs.length)
  }

  const prevCard = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev - 1 + vocabs.length) % vocabs.length)
  }

  const handleShuffle = () => {
    const shuffled = [...vocabs].sort(() => Math.random() - 0.5)
    setVocabs(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
    toast.success("สลับลำดับคำศัพท์แล้ว")
  }

  const handleDelete = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบคำศัพท์นี้?")) return
    
    const res = await deleteVocabAction(current.id)
    if (res.success) {
      toast.success("ลบคำศัพท์แล้ว")
      router.refresh()
    } else {
      toast.error("ลบไม่สำเร็จ")
    }
  }

  const handleEditOpen = () => {
    setEditData({
      kanji: current.kanji,
      reading: current.reading,
      meaning: current.meaning
    })
    setIsEditing(true)
  }

  const handleUpdate = async () => {
    const res = await updateVocabAction(current.id, editData)
    if (res.success) {
      toast.success("อัปเดตคำศัพท์แล้ว")
      setIsEditing(false)
      router.refresh()
    } else {
      toast.error("อัปเดตไม่สำเร็จ")
    }
  }

  const toggleDifficult = () => {
    const newSet = new Set(difficultWords)
    if (newSet.has(current.id)) {
      newSet.delete(current.id)
      toast("นำออกจากรายการคำที่จำยาก")
    } else {
      newSet.add(current.id)
      toast("เพิ่มในรายการคำที่จำยากแล้ว")
    }
    setDifficultWords(newSet)
  }

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 bg-accent/30 rounded-2xl relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-primary">Flashcards</h2>
        
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className={difficultWords.has(current.id) ? "text-yellow-500" : "text-muted-foreground"}
            onClick={toggleDifficult}
          >
            <Star size={18} fill={difficultWords.has(current.id) ? "currentColor" : "none"} />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShuffle}>
                <Shuffle className="mr-2 h-4 w-4" /> สลับลำดับ (Shuffle)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEditOpen}>
                <Edit className="mr-2 h-4 w-4" /> แก้ไขคำนี้
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> ลบคำนี้
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div 
        className="relative h-64 w-full cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-all duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front */}
          <Card className="absolute inset-0 backface-hidden flex items-center justify-center border-2 border-primary/20 shadow-xl bg-background">
            <CardContent className="text-center p-0">
              <p className="text-5xl font-bold mb-2">{current.kanji}</p>
              <p className="text-muted-foreground text-xs uppercase tracking-widest animate-pulse mt-4">คลิกเพื่อพลิกดูคำอ่าน</p>
            </CardContent>
          </Card>

          {/* Back */}
          <Card className="absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center border-2 border-primary/50 shadow-xl bg-primary/5">
            <CardContent className="text-center p-0 px-4">
              <p className="text-2xl font-medium text-primary mb-2">{current.reading}</p>
              <p className="text-3xl font-bold">{current.meaning}</p>
              {difficultWords.has(current.id) && (
                <div className="mt-4 inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase">
                  <Star size={10} fill="currentColor" /> จำยาก
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <Button variant="outline" size="icon" className="rounded-full" onClick={prevCard}>
          <ChevronLeft />
        </Button>
        <div className="text-center">
          <p className="text-sm font-bold">
            {currentIndex + 1} / {vocabs.length}
          </p>
          <div className="flex gap-1 mt-1">
            {vocabs.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all ${i === currentIndex ? 'w-4 bg-primary' : 'w-1 bg-primary/20'}`} 
              />
            ))}
          </div>
        </div>
        <Button variant="outline" size="icon" className="rounded-full" onClick={nextCard}>
          <ChevronRight />
        </Button>
      </div>

      <div className="flex gap-2 mt-6">
        <Button 
          variant="secondary" 
          className="flex-1 gap-2 font-bold" 
          onClick={() => {setCurrentIndex(0); setIsFlipped(false)}}
        >
          <RotateCcw size={16} /> เริ่มใหม่
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขคำศัพท์</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>คำศัพท์ (Kanji)</Label>
              <Input 
                value={editData.kanji} 
                onChange={(e) => setEditData({...editData, kanji: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>คำอ่าน (Reading)</Label>
              <Input 
                value={editData.reading} 
                onChange={(e) => setEditData({...editData, reading: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>ความหมาย (Meaning)</Label>
              <Input 
                value={editData.meaning} 
                onChange={(e) => setEditData({...editData, meaning: e.target.value})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>ยกเลิก</Button>
            <Button onClick={handleUpdate}>บันทึกการแก้ไข</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  )
}
