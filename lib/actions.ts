'use server'

import { prisma } from "./prisma"
import { searchSongs, fetchLyricsByUrl, getSongDetails } from "./lyrics"
import { getWords } from "./japanese"

export async function searchSongAction(query: string) {
  if (!query) return []
  const results = await searchSongs(query)
  return results
}

export async function fetchSongDetailsAction(songId: number) {
  return await getSongDetails(songId)
}

export async function fetchLyricsAction(url: string) {
  if (!url) return null
  const lyrics = await fetchLyricsByUrl(url)
  return lyrics
}

export async function addSongAction(title: string, artist: string, lyrics: string, userId: string, videoUrl?: string) {
  if (!title || !lyrics) return { error: 'Missing information' }

  try {
    const tokens = await getWords(lyrics)

    const song = await prisma.song.create({
      data: {
        title: `${title} - ${artist}`,
        lyrics: lyrics,
        tokens: tokens as any,
        videoUrl: videoUrl,
        userId: userId,
      }
    })
    return { success: true, songId: song.id }
  } catch (error) {
    console.error('Error adding song:', error)
    return { error: 'Failed to add song' }
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

// Simple in-memory cache to avoid repeated API calls for the same word in a session
const translationCache: Record<string, string> = {}

export async function translateToThai(text: string) {
  if (translationCache[text]) return translationCache[text]

  try {
    // ใช้ MyMemory API (ฟรี ไม่ต้องใช้ Key สำหรับปริมาณไม่มาก)
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ja|th`)
    const data = await res.json()
    const translatedText = data.responseData.translatedText
    
    if (translatedText) {
      translationCache[text] = translatedText
    }
    
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

export async function saveVocabAction(data: {
  kanji: string
  reading: string
  meaning: string
  songId: string
  userId: string
}) {
  try {
    await prisma.vocab.create({
      data
    })
    return { success: true }
  } catch (error) {
    console.error('Error saving vocab:', error)
    return { error: 'Failed to save vocabulary' }
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

