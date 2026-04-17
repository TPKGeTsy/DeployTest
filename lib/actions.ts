'use server'

import { prisma } from "./prisma"
import { searchSongs, fetchLyricsByUrl, getSongDetails } from "./lyrics"
import { getWords } from "./japanese"
import { songSchema, vocabSchema } from "./schemas"

export async function searchSongAction(query: string) {
  if (!query) return []
  const res = await searchSongs(query)
  if (res && typeof res === 'object' && 'error' in res) {
    return { error: res.error }
  }
  return res
}

export async function fetchSongDetailsAction(songId: number) {
  return await getSongDetails(songId)
}

export async function fetchLyricsAction(url: string, artist?: string, title?: string) {
  if (!url) return null
  const lyrics = await fetchLyricsByUrl(url, artist, title)
  return lyrics
}

/**
 * ฟังก์ชันช่วยหาคำอ่านที่ถูกต้องสำหรับรูปพจนานุกรม
 */
async function getBaseFormDetails(word: string) {
  try {
    const tokens = await getWords(word)
    if (tokens.length > 0) {
      return {
        reading: tokens[0].reading || "",
        meaning: "" // จะไปหาจาก Batch แปลอีกที
      }
    }
    return { reading: "", meaning: "" }
  } catch (e) {
    return { reading: "", meaning: "" }
  }
}

async function batchTranslate(words: string[]) {
  const uniqueWords = Array.from(new Set(words.filter(w => w.trim().length > 0 && !/[\u3000-\u303f\uff01-\uff0f\uff1a-\uff1f]/.test(w))))
  const wordsToTranslate = uniqueWords.slice(0, 30) 
  const results: Record<string, string> = {}

  for (let i = 0; i < wordsToTranslate.length; i += 5) {
    const chunk = wordsToTranslate.slice(i, i + 5)
    const promises = chunk.map(async (word) => {
      try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=ja|th`, {
          next: { revalidate: 3600 }
        })
        const data = await res.json()
        return { word, meaning: data.responseData.translatedText }
      } catch (e) {
        return { word, meaning: "" }
      }
    })

    const chunkResults = await Promise.all(promises)
    chunkResults.forEach(r => {
      if (r.meaning) results[r.word] = r.meaning
    })
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  return results
}

export async function addSongAction(title: string, artist: string, lyrics: string, userId: string, videoUrl?: string) {
  const validation = songSchema.safeParse({ title: `${title} - ${artist}`, lyrics, userId, videoUrl })
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  try {
    const rawTokens = await getWords(lyrics)
    const kanjiRegex = /[\u4e00-\u9faf]/
    
    // แปลล่วงหน้าโดยใช้รูป Dic-form เป็นหลักถ้ามี
    const wordsToTranslate = rawTokens
      .filter(t => kanjiRegex.test(t.surface_form) || (t.pos === "noun" && t.surface_form.length > 1))
      .map(t => t.base_form || t.surface_form)
    
    const translationMap = await batchTranslate(wordsToTranslate)

    const tokens = rawTokens.map(t => ({
      ...t,
      meaning: translationMap[t.base_form || t.surface_form] || ""
    }))

    const song = await prisma.song.create({
      data: {
        title: validation.data.title,
        lyrics: validation.data.lyrics,
        tokens: tokens as any,
        videoUrl: validation.data.videoUrl,
        userId: validation.data.userId,
      }
    })
    return { success: true, songId: song.id }
  } catch (error) {
    console.error('Error adding song:', error)
    return { error: 'Failed to add song' }
  }
}

export async function saveVocabAction(data: {
  kanji: string
  reading: string
  meaning: string
  songId: string
  userId: string
}) {
  const validation = vocabSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  try {
    const vocab = await prisma.vocab.create({
      data: validation.data
    })
    return { success: true, vocabId: vocab.id }
  } catch (error) {
    console.error('Error saving vocab:', error)
    return { error: 'Failed to save vocabulary' }
  }
}

export async function saveMultipleVocabAction(vocabs: {
  kanji: string
  reading: string
  meaning: string
  songId: string
  userId: string
}[]) {
  if (vocabs.length === 0) return { success: true, count: 0 }

  try {
    const result = await prisma.vocab.createMany({
      data: vocabs,
      skipDuplicates: true
    })
    return { success: true, count: result.count }
  } catch (error) {
    console.error('Error bulk saving vocab:', error)
    return { error: 'Failed to bulk save vocabulary' }
  }
}

export async function getLyricsWords(lyrics: string) {
  try {
    const tokens = await getWords(lyrics)
    return tokens
  } catch (error) {
    console.error('Error tokenizing lyrics:', error)
    return []
  }
}

const translationCache: Record<string, string> = {}

export async function translateToThai(text: string) {
  if (translationCache[text]) return translationCache[text]

  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ja|th`)
    const data = await res.json()
    const translatedText = data.responseData.translatedText
    if (translatedText) translationCache[text] = translatedText
    return translatedText
  } catch (error) {
    console.error("Translation error:", error)
    return ""
  }
}

export async function updateSongVideoAction(songId: string, videoUrl: string) {
  try {
    await prisma.song.update({
      where: { id: songId },
      data: { videoUrl }
    })
    return { success: true }
  } catch (error) {
    console.error('Error updating song video:', error)
    return { error: 'Failed to update video URL' }
  }
}

export async function deleteVocabAction(vocabId: string) {
  try {
    await prisma.vocab.delete({
      where: { id: vocabId }
    })
    return { success: true }
  } catch (error) {
    console.error('Error deleting vocab:', error)
    return { error: 'Failed to delete vocabulary' }
  }
}

export async function updateVocabAction(vocabId: string, data: {
  kanji: string
  reading: string
  meaning: string
}) {
  try {
    await prisma.vocab.update({
      where: { id: vocabId },
      data
    })
    return { success: true }
  } catch (error) {
    console.error('Error updating vocab:', error)
    return { error: 'Failed to update vocabulary' }
  }
}
