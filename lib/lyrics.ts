import { getLyrics } from 'genius-lyrics-api'

const getAccessToken = () => process.env.GENIUS_ACCESS_TOKEN

export async function searchSongs(query: string) {
  const token = getAccessToken()
  if (!token) return { error: 'Missing API Token' }

  const url = `https://api.genius.com/search?q=${encodeURIComponent(query)}&access_token=${token}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 0 }
    })

    if (!response.ok) return { error: `API Error: ${response.status}` }
    const data = await response.json()
    if (!data.response || !data.response.hits) return []

    return data.response.hits.map((hit: any) => ({
      id: hit.result.id,
      title: hit.result.title,
      artist: hit.result.primary_artist.name,
      url: hit.result.url,
      thumbnail: hit.result.song_art_image_thumbnail_url
    }))
  } catch (error) {
    return { error: 'Network Error' }
  }
}

export async function getSongDetails(songId: number) {
  const token = getAccessToken()
  if (!token) return null
  const url = `https://api.genius.com/songs/${songId}?access_token=${token}`
  try {
    const response = await fetch(url)
    const data = await response.json()
    const youtubeMedia = data.response.song.media.find((m: any) => m.provider === 'youtube')
    return { youtubeUrl: youtubeMedia ? youtubeMedia.url : null }
  } catch (e) { return null }
}

/**
 * ดึงเนื้อเพลงจากสำรอง (Lyrics.ovh) - เป็น API แท้ ไม่โดนบล็อก
 */
async function fetchFromLyricsOvh(artist: string, title: string) {
  try {
    const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.lyrics || null
  } catch (e) {
    return null
  }
}

export async function fetchLyricsByUrl(url: string, artist?: string, title?: string) {
  try {
    // ก๊อก 1: ลอง Genius (ใส่ Header เต็มสูบ)
    const options = {
      apiKey: getAccessToken() || '',
      title: '',
      artist: '',
      optimizeQuery: false,
      url: url
    }

    let lyrics = await getLyrics(options)
    if (lyrics && lyrics.length > 100) return cleanLyrics(lyrics)

    // ก๊อก 2: ถ้า Genius แป้ก ลองใช้ Lyrics.ovh API (ถ้ามีข้อมูล artist/title)
    if (artist && title) {
      lyrics = await fetchFromLyricsOvh(artist, title)
      if (lyrics && lyrics.length > 100) return cleanLyrics(lyrics)
    }

    // ก๊อก 3: ลองขุดจาก HTML ตรงๆ ด้วย fetch
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      }
    })
    
    if (response.ok) {
      const html = await response.text()
      const match = html.match(/<div data-lyrics-container="true".*?>(.*?)<\/div>/g)
      if (match) {
        const text = match.join('\n')
          .replace(/<br.*?>/g, '\n')
          .replace(/<.*?>/g, '')
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
        
        if (text.length > 100) return cleanLyrics(text)
      }
    }

    return null
  } catch (error) {
    return null
  }
}

function cleanLyrics(text: string) {
  return text
    .replace(/\[.*?\]/g, '')
    .replace(/\n\s*\n/g, '\n\n')
    .trim()
}
