import { prisma } from "@/lib/prisma"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Music, BookOpen } from "lucide-react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function LibraryPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/")
  }

  const songs = await prisma.song.findMany({
    where: {
      userId: userId
    },
    include: {
      _count: {
        select: { vocabs: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">My Private Library</h1>
          <p className="text-muted-foreground mt-2">สะสมบทเพลงที่คุณบันทึกไว้คนเดียวที่นี่</p>
        </div>
        <Link 
          href="/song/create" 
          className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold hover:opacity-90 transition-all flex items-center gap-2"
        >
          + Add New Song
        </Link>
      </div>
      
      {songs.length === 0 ? (
        <div className="text-center py-20 bg-accent/20 rounded-3xl border-2 border-dashed border-primary/20">
          <Music className="mx-auto h-16 w-16 text-muted-foreground mb-4 opacity-20" />
          <h2 className="text-2xl font-bold">ยังไม่มีเพลงในคลังส่วนตัว</h2>
          <p className="text-muted-foreground mt-2 mb-6">เริ่มเพิ่มเพลงแรกของคุณเพื่อฝึกศัพท์ได้ทันที!</p>
          <Link href="/song/create" className="text-primary font-bold underline">ไปหน้าเพิ่มเพลง</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {songs.map((song) => (
            <Link href={`/library/${song.id}`} key={song.id} className="group">
              <Card className="h-full hover:border-primary/50 transition-all hover:shadow-xl group-hover:-translate-y-1 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                    {song.title}
                  </CardTitle>
                  <CardDescription>
                    บันทึกเมื่อ {new Date(song.createdAt).toLocaleDateString('th-TH')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <BookOpen size={16} />
                    <span>{song._count.vocabs} คำศัพท์ที่บันทึกไว้</span>
                  </div>
                  <div className="mt-4 text-xs font-bold text-primary uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to study →
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
