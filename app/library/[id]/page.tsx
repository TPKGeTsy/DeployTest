import { prisma } from "@/lib/prisma"
import SongLearningTools from "@/components/SongLearningTools"
import AddVocabManual from "@/components/AddVocabManual"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { getWords } from "@/lib/japanese"

export default async function SongDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params

  const song = await prisma.song.findUnique({
    where: { id },
    include: {
      vocabs: true
    }
  })

  if (!song) {
    return notFound()
  }

  // ใช้ tokens จาก Cache ใน DB ถ้ามี ถ้าไม่มีค่อยตัดใหม่ (เพื่อความเร็ว)
  let tokens: any[] = []
  if (song.tokens) {
    tokens = song.tokens as any[]
  } else {
    tokens = await getWords(song.lyrics)
    // Optional: update DB with tokens if they were missing
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <Link 
          href="/library" 
          className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ChevronLeft size={20} /> Back to Library
        </Link>
        
        <AddVocabManual songId={song.id} />
      </div>
      
      <SongLearningTools song={song} initialTokens={tokens} />
    </div>
  )
}
