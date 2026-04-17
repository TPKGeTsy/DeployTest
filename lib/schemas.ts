import { z } from "zod"

export const songSchema = z.object({
  title: z.string().min(2, "ชื่อเพลงต้องมีอย่างน้อย 2 ตัวอักษร"),
  lyrics: z.string().min(10, "เนื้อเพลงต้องมีอย่างน้อย 10 ตัวอักษร"),
  videoUrl: z.string().url("URL วิดีโอไม่ถูกต้อง").optional().or(z.literal("")),
  userId: z.string().min(1, "UserId is required"),
})

export const vocabSchema = z.object({
  kanji: z.string().min(1, "คำศัพท์ต้องไม่ว่าง"),
  reading: z.string().default(""), // ทำให้เป็น string เสมอเพื่อ Prisma
  meaning: z.string().min(2, "ความหมายต้องมีอย่างน้อย 2 ตัวอักษร"),
  songId: z.string().min(1, "SongId is required"),
  userId: z.string().min(1, "UserId is required"),
})
