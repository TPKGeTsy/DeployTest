"use client"

import { useState } from "react"
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
import { PlusCircle, Loader2 } from "lucide-react"
import { saveVocabAction, translateToThai } from "@/lib/actions"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function AddVocabManual({ songId }: { songId: string }) {
  const { user } = useUser()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [translating, setTranslating] = useState(false)
  
  const [formData, setFormData] = useState({
    kanji: "",
    reading: "",
    meaning: ""
  })

  const handleTranslate = async () => {
    if (!formData.kanji) return
    setTranslating(true)
    const res = await translateToThai(formData.kanji)
    setFormData(prev => ({ ...prev, meaning: res }))
    setTranslating(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.kanji || !formData.meaning) return

    setLoading(true)
    try {
      const res = await saveVocabAction({
        ...formData,
        songId,
        userId: user.id
      })

      if (res.success) {
        toast.success("เพิ่มคำศัพท์เรียบร้อยแล้ว")
        setFormData({ kanji: "", reading: "", meaning: "" })
        setOpen(false)
        router.refresh() // Refresh page to show new vocab in games
      } else {
        toast.error("เกิดข้อผิดพลาดในการบันทึก")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-dashed border-2 hover:border-primary hover:text-primary transition-all">
          <PlusCircle size={18} />
          เพิ่มศัพท์ด้วยตัวเอง
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>เพิ่มคำศัพท์ใหม่ลงในเพลงนี้</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="kanji">คำศัพท์ (Kanji/Word)</Label>
            <div className="flex gap-2">
              <Input
                id="kanji"
                value={formData.kanji}
                onChange={(e) => setFormData(prev => ({ ...prev, kanji: e.target.value }))}
                placeholder="เช่น 先生"
                required
              />
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                onClick={handleTranslate}
                disabled={translating}
              >
                {translating ? <Loader2 className="animate-spin" size={16} /> : "แปลไทย"}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reading">คำอ่าน (Reading)</Label>
            <Input
              id="reading"
              value={formData.reading}
              onChange={(e) => setFormData(prev => ({ ...prev, reading: e.target.value }))}
              placeholder="เช่น せんせい"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meaning">ความหมาย (Meaning)</Label>
            <Input
              id="meaning"
              value={formData.meaning}
              onChange={(e) => setFormData(prev => ({ ...prev, meaning: e.target.value }))}
              placeholder="เช่น คุณครู"
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "กำลังบันทึก..." : "บันทึกคำศัพท์"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
