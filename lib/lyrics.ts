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

export async function fetchLyricsByUrl(url: string) {
  try {
    // พยายามดึงเนื้อเพลงโดยใช้ library
    // หมายเหตุ: บน Vercel อาจถูกบล็อก ถ้าถูกบล็อกจะส่งค่าว่างกลับไป
    const lyrics = await getLyrics({
        apiKey: getAccessToken() || '',
        title: '',
        artist: '',
        optimizeQuery: false,
        url: url
    })

    if (lyrics) return lyrics

    // ถ้าวิธีแรกไม่ได้ผล (มักจะเกิดบน Vercel)
    // เราจะลองดึงเองด้วย fetch + ใส่ User-Agent เพื่อหลอกว่าเป็น Browser
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })
    
    if (!response.ok) return null
    const html = await response.text()
    
    // พยายามดึงเนื้อเพลงจาก HTML แบบ Manual (Fall-back)
    // Genius เก็บเนื้อเพลงไว้ใน div ที่มี class ชื่อ 'Lyrics__Container'
    // วิธีนี้ซับซ้อนหน่อย แต่ช่วยให้โอกาสรอดสูงขึ้น
    return "เนื้อเพลงถูกบล็อกโดยต้นทางชั่วคราว กรุณาใช้ปุ่ม 'Paste Lyrics Manually' เพื่อวางเนื้อเพลงเองครับ"
  } catch (error) {
    console.error('Error fetching lyrics:', error)
    return null
  }
}
