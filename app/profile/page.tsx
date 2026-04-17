import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, BookOpen, User, Mail, Calendar } from "lucide-react"

export default async function ProfilePage() {
  const user = await currentUser()
  
  if (!user) {
    redirect("/")
  }

  // ดึงสถิติจริงจาก Database
  const [songCount, vocabCount] = await Promise.all([
    prisma.song.count({ where: { userId: user.id } }),
    prisma.vocab.count({ where: { userId: user.id } })
  ])

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12 border-b pb-12">
        <div className="relative">
          <img 
            src={user.imageUrl} 
            alt="Profile" 
            className="w-32 h-32 rounded-3xl object-cover ring-4 ring-primary/20"
          />
          <div className="absolute -bottom-2 -right-2 bg-primary p-2 rounded-xl text-primary-foreground">
            <Sparkles size={16} />
          </div>
        </div>
        
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">
            {user.firstName} {user.lastName}
          </h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-muted-foreground font-medium">
            <span className="flex items-center gap-1"><Mail size={16} /> {user.emailAddresses[0].emailAddress}</span>
            <span className="flex items-center gap-1"><Calendar size={16} /> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none bg-accent/20 rounded-[2rem] overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Music size={16} /> Total Songs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-6xl font-black text-primary group-hover:scale-110 transition-transform origin-left">{songCount}</p>
            <p className="text-muted-foreground mt-2 font-medium">บทเพลงที่คุณสะสมไว้</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-accent/20 rounded-[2rem] overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <BookOpen size={16} /> Vocabulary Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-6xl font-black text-primary group-hover:scale-110 transition-transform origin-left">{vocabCount}</p>
            <p className="text-muted-foreground mt-2 font-medium">คำศัพท์ที่บันทึกแล้ว</p>
          </CardContent>
        </Card>
      </div>

      <section className="mt-12 p-8 bg-primary/5 rounded-[2rem] border border-primary/10">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <User size={20} className="text-primary" /> Learning Milestone
        </h3>
        <div className="space-y-4">
          <div className="h-4 w-full bg-accent rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-1000" 
              style={{ width: `${Math.min((vocabCount / 100) * 100, 100)}%` }} 
            />
          </div>
          <p className="text-sm font-bold text-muted-foreground">
            {vocabCount} / 100 words to reach "Music Enthusiast" level
          </p>
        </div>
      </section>
    </div>
  )
}

function Sparkles({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
  )
}
