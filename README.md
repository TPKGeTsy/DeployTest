# 🎵 Lyrical Nihongo - Learn Japanese Through Music

**Lyrical Nihongo** เป็นเว็บแอปพลิเคชันที่เปลี่ยนการฟังเพลงญี่ปุ่นที่คุณรักให้กลายเป็นการเรียนรู้คำศัพท์แสนสนุก ด้วยระบบตัดคำอัจฉริยะ การแปลอัตโนมัติ และมินิเกมฝึกฝนความจำที่ออกแบบมาเพื่อคนรักเสียงเพลงโดยเฉพาะ

---

## 🚀 Tech Stack

### Frontend & Framework
- **Next.js 15 (App Router)** - React Framework ล่าสุดพร้อมความเร็วระดับ Turbopack
- **Tailwind CSS** - สำหรับการดีไซน์ UI ที่ทันสมัยและรองรับทุกหน้าจอ (Responsive)
- **shadcn/ui** - ชุด UI Components ระดับพรีเมียม (Tabs, Dialog, Cards, etc.)
- **Zustand** - สำหรับจัดการ State ของเครื่องเล่นเพลงแบบ Global

### Backend & Database
- **Neon (PostgreSQL)** - Database แบบ Serverless บน Cloud ที่รวดเร็ว
- **Prisma ORM** - สำหรับจัดการ Schema และการจัดการข้อมูลแบบ Type-safe
- **Clerk Auth** - ระบบจัดการผู้ใช้และความปลอดภัยระดับองค์กร (Login/Register)

### Language Processing & APIs
- **Kuroshiro + Kuromoji** - ระบบ Tokenization สำหรับตัดคำภาษาญี่ปุ่นและหาคำอ่าน (Furigana)
- **Genius Lyrics API** - สำหรับดึงข้อมูลเพลง เนื้อเพลง และลิงก์วิดีโอจากฐานข้อมูลระดับโลก
- **MyMemory API** - ระบบแปลภาษาไทยอัตโนมัติ (Auto-Translation)
- **Zod** - สำหรับการทำ Data Validation เพื่อความปลอดภัยของข้อมูล

---

## 📁 File Structure & Component Overview

โปรเจกต์นี้แบ่งการทำงานออกเป็นสัดส่วนที่ชัดเจนเพื่อให้ง่ายต่อการขยายผล:

### 1. 📂 `lib/` (Core Logic)
- `japanese.ts`: หัวใจสำคัญที่ใช้ **Kuromoji** ในการตัดคำ (Tokenize) เนื้อเพลงภาษาญี่ปุ่น และมีฟังก์ชันแปลง Katakana เป็น Hiragana เพื่อให้อ่านง่ายขึ้น
- `lyrics.ts`: เชื่อมต่อกับ **Genius API** เพื่อค้นหาชื่อเพลง ดึงเนื้อเพลง และดึง URL วิดีโอจาก YouTube
- `actions.ts`: รวม **Server Actions** ทั้งหมด (บันทึกเพลง, แปลภาษา, บันทึกคำศัพท์) มีระบบ **Batch Translation** เพื่อแปลศัพท์ล่วงหน้า 40 คำแรก ทำให้หน้าเว็บเร็วขึ้น
- `schemas.ts`: กำหนดกฎการตรวจสอบข้อมูลด้วย **Zod** เพื่อป้องกันข้อมูลผิดพลาดเข้า Database

### 2. 📂 `components/` (UI Logic)
- `SongManager.tsx`: หน้าจอสำหรับค้นหาเพลงและเลือกเพลง มีทั้งโหมด Search และ Paste (วางเอง)
- `LyricsDisplay.tsx`: ตัวแสดงผลเนื้อเพลงแบบ Interactive (จิ้มได้) พร้อมระบบแปลไทยในตัว
- `SongLearningTools.tsx`: ศูนย์กลางการเรียนรู้ในหน้า Library ที่รวม 4 โหมดการเรียนไว้ใน Tab เดียว
- `FlashcardGame.tsx`: มินิเกมเปิดแผ่นป้ายคำศัพท์ มีระบบ Shuffle และติดดาวคำจำยาก
- `QuizGame.tsx`: เกมตอบคำถามแบบตัวเลือก (Multiple Choice)
- `TypingGame.tsx`: เกมฝึกพิมพ์คำอ่าน Hiragana ตามตัวคันจิ
- `GlobalPlayer.tsx`: เครื่องเล่นเพลงลอยตัว (YouTube IFrame) ที่เล่นต่อเนื่องข้ามหน้าได้

### 3. 📂 `app/` (Routing & Pages)
- `library/`: หน้าแสดงรายการเพลงทั้งหมดของผู้ใช้ (Private)
- `library/[id]/`: หน้าเจาะลึกของแต่ละเพลงที่รวมเครื่องมือเรียนรู้ทั้งหมดไว้
- `song/create/`: หน้าสำหรับเพิ่มเพลงใหม่เข้าสู่ระบบ

---

## ⚙️ การทำงานของระบบ (Workflow)

1. **Import:** เมื่อผู้ใช้เพิ่มเพลง ระบบจะไปดึงเนื้อเพลงจาก API และส่งไปให้ `japanese.ts` เพื่อตัดเป็นคำๆ (Tokens)
2. **Pre-translate:** ระบบจะเลือกคำศัพท์ที่สำคัญ 40 คำแรกไปแปลผ่าน `MyMemory API` และบันทึกคำแปลลง Database พร้อมกับ Tokens (ทำให้เวลาเปิดดูใน Library จะโหลดเร็วมาก)
3. **Interactive Study:** เมื่อผู้ใช้คลิกคำศัพท์ในเนื้อเพลง ระบบจะโชว์คำอ่าน Hiragana และความหมายไทย (ถ้ามีใน Cache จะขึ้นทันที ถ้าไม่มีจะไปดึงสดให้)
4. **Practice:** ผู้ใช้สามารถบันทึกคำศัพท์ที่ชอบ และนำไปฝึกผ่านมินิเกมทั้ง 3 แบบ เพื่อเปลี่ยนความจำระยะสั้นให้เป็นความจำระยะยาว

---

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
สร้างไฟล์ `.env` และใส่ค่าดังนี้:
```env
DATABASE_URL=your_postgresql_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
GENIUS_ACCESS_TOKEN=your_genius_token
```

---

## 📦 Deployment
แอปพลิเคชันนี้พร้อมสำหรับการ Deploy บน **Vercel** ทันที!
```bash
npm run build
```
