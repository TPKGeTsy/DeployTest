import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Music, BookOpen, Brain, Keyboard, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 opacity-20 animate-pulse">
          <Music size={400} className="text-primary rotate-12" />
        </div>
        
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6 border border-primary/20">
            <Sparkles size={16} />
            <span>เรียนภาษาญี่ปุ่นผ่านเสียงเพลงที่ชอบ</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
            LEARN JAPANESE <br />
            <span className="text-primary">THROUGH MUSIC</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            เปลี่ยนเนื้อเพลงที่ชอบให้เป็นคลังคำศัพท์ส่วนตัว 
            ดึงเนื้อเพลงอัตโนมัติ ตัดคำภาษาญี่ปุ่นให้พร้อมเรียน 
            และฝึกฝนผ่าน Mini Games แสนสนุก
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button size="lg" asChild className="h-14 px-8 text-lg font-bold rounded-2xl">
              <Link href="/song/create">เริ่มใช้งานเลย →</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-14 px-8 text-lg font-bold rounded-2xl">
              <Link href="/library">ดูคลังเพลงของคุณ</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-8 bg-accent/20 rounded-3xl border border-accent hover:border-primary/50 transition-all hover:shadow-xl group">
          <div className="bg-primary/10 p-4 rounded-2xl w-fit mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Music size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Import Songs</h3>
          <p className="text-muted-foreground">ค้นหาเพลงจาก Genius หรือวางเนื้อเพลงเองได้จากทุกแหล่ง</p>
        </div>

        <div className="p-8 bg-accent/20 rounded-3xl border border-accent hover:border-primary/50 transition-all hover:shadow-xl group">
          <div className="bg-primary/10 p-4 rounded-2xl w-fit mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Interactive Lyrics</h3>
          <p className="text-muted-foreground">จิ้มที่เนื้อเพลงเพื่อดูคำอ่าน คำราก และแปลไทยอัตโนมัติ</p>
        </div>

        <div className="p-8 bg-accent/20 rounded-3xl border border-accent hover:border-primary/50 transition-all hover:shadow-xl group">
          <div className="bg-primary/10 p-4 rounded-2xl w-fit mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Brain size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Smart Games</h3>
          <p className="text-muted-foreground">ฝึกจำผ่าน Flashcards และ Quiz ที่สร้างจากศัพท์ในเพลงนั้น</p>
        </div>

        <div className="p-8 bg-accent/20 rounded-3xl border border-accent hover:border-primary/50 transition-all hover:shadow-xl group">
          <div className="bg-primary/10 p-4 rounded-2xl w-fit mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Keyboard size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Typing Practice</h3>
          <p className="text-muted-foreground">ฝึกพิมพ์ฮิรางานะตามคันจิ เพื่อการจำที่แม่นยำยิ่งขึ้น</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="p-10 md:p-20 bg-primary text-primary-foreground rounded-[3rem] text-center shadow-2xl">
        <h2 className="text-4xl md:text-6xl font-black mb-8">
          เริ่มสะสมคลังคำศัพท์ของคุณ <br className="hidden md:block" />
          ไปพร้อมกับบทเพลงที่รัก
        </h2>
        <Button size="lg" variant="secondary" asChild className="h-16 px-12 text-xl font-black rounded-3xl hover:scale-105 transition-transform">
          <Link href="/song/create">GET STARTED NOW</Link>
        </Button>
      </section>
    </div>
  )
}
