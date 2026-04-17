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
 * ฟังก์ชันพยายามดึงเนื้อเพลงให้ได้มากที่สุด
 */
export async function fetchLyricsByUrl(url: string) {
  try {
    // 1. ลองใช้ Library ปกติ (ใส่ Agent เต็มสูบ)
    const options = {
      apiKey: getAccessToken() || '',
      title: '',
      artist: '',
      optimizeQuery: false,
      url: url
    }

    const lyrics = await getLyrics(options)
    if (lyrics && lyrics.length > 50) return cleanLyrics(lyrics)

    // 2. ถ้าไม่ได้ ลองดึงสดด้วย fetch + Header ปลอม
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,th;q=0.8'
      }
    })
    
    if (response.ok) {
      const html = await response.text()
      
      // ลองใช้ Regex แงะข้อมูลจาก Container ของ Genius
      // Genius มักจะเก็บเนื้อเพลงไว้ในส่วนที่มี class 'Lyrics__Container'
      const match = html.match(/<div data-lyrics-container="true".*?>(.*?)<\/div>/g)
      if (match) {
        const text = match.join('\n')
          .replace(/<br.*?>/g, '\n') // เปลี่ยน <br> เป็นขึ้นบรรทัดใหม่
          .replace(/<.*?>/g, '') // ลบ Tag HTML อื่นๆ ออก
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
        
        if (text.length > 50) return cleanLyrics(text)
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching lyrics:', error)
    return null
  }
}

/**
 * ล้างข้อมูลขยะในเนื้อเพลง เช่น [Chorus], [Verse]
 */
function cleanLyrics(text: string) {
  return text
    .replace(/\[.*?\]/g, '') // ลบพวก [Verse 1], [Chorus]
    .replace(/\n\s*\n/g, '\n\n') // ลบบรรทัดว่างที่ซ้ำซ้อน
    .trim()
}
