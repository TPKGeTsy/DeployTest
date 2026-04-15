import { prisma } from "@/lib/prisma"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card" // ใช้ shadcn ซะ!
import VocabActions from "@/components/VocabActions" // เดี๋ยวเราจะสร้างตัวนี้

export default async function VocabPage() {
  const songs = await prisma.song.findMany({
    include: { vocabs: true }
  })

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">My Lyrics Library</h1>
      
      <div className="grid gap-6">
        {songs.map((song) => (
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
                    {/* นี่คือที่ใส่ฟังก์ชัน! ส่ง ID ไปให้ Client Component จัดการ */}
                    <VocabActions vocabId={v.id} />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}