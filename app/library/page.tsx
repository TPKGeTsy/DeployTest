import { prisma } from "@/lib/prisma"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import VocabActions from "@/components/VocabActions"
import { Song, Vocab } from "@prisma/client"

// 1. สร้าง Type มารองรับข้อมูลเพลงที่รวมศัพท์ไว้ข้างใน
type SongWithVocabs = Song & {
  vocabs: Vocab[]
}

export default async function VocabPage() {
  // 2. ดึงข้อมูลและระบุ Type ให้ตัวแปร songs ชัดเจนว่าเป็น Array ของ SongWithVocabs
  const songs: SongWithVocabs[] = await prisma.song.findMany({
    include: {
      vocabs: true,
    },
  })

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">My Lyrics Library</h1>
      
      <div className="grid gap-6">
        {songs.length === 0 ? (
          <p className="text-center text-gray-500">ยังไม่มีเพลงในคลังเลยไอ้หนู ไปเพิ่มใน Neon ก่อน!</p>
        ) : (
          songs.map((song) => (
            <Card key={song.id}>
              <CardHeader>
                <CardTitle className="text-blue-500">{song.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {song.vocabs.map((v) => (
                    <li key={v.id} className="flex justify-between items-center border-b pb-2">
                      <span>
                        <strong className="text-lg">{v.kanji}</strong> ({v.reading}) - {v.meaning}
                      </span>
                      {/* ส่ง ID ไปที่ปุ่มกด (Client Component) */}
                      <VocabActions vocabId={v.id} />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}