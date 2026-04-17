import { getLyrics } from 'genius-lyrics-api'

const GENIUS_ACCESS_TOKEN = process.env.GENIUS_ACCESS_TOKEN

export async function searchSongs(query: string) {
  if (!GENIUS_ACCESS_TOKEN) {
    console.error('GENIUS_ACCESS_TOKEN is missing')
    return []
  }

  // We use a more detailed search or just follow the song URL to get more info
  // Actually, the search API hit result is limited. 
  // To get YouTube links, we usually need the song ID and call /songs/:id
  const url = `https://api.genius.com/search?q=${encodeURIComponent(query)}&access_token=${GENIUS_ACCESS_TOKEN}`

  try {
    const response = await fetch(url)
    const data = await response.json()
    
    if (!data.response || !data.response.hits) return []

    // For each hit, we'll try to get more details if needed, 
    // but for now let's just return what we have.
    // Note: Genius search results sometimes don't include direct media links.
    return data.response.hits.map((hit: any) => ({
      id: hit.result.id,
      title: hit.result.title,
      artist: hit.result.primary_artist.name,
      url: hit.result.url,
      thumbnail: hit.result.song_art_image_thumbnail_url
    }))
  } catch (error) {
    console.error('Error searching Genius API:', error)
    return []
  }
}

export async function getSongDetails(songId: number) {
  const url = `https://api.genius.com/songs/${songId}?access_token=${GENIUS_ACCESS_TOKEN}`
  try {
    const response = await fetch(url)
    const data = await response.json()
    const song = data.response.song
    
    // Find YouTube URL in media array
    const youtubeMedia = song.media.find((m: any) => m.provider === 'youtube')
    
    return {
      youtubeUrl: youtubeMedia ? youtubeMedia.url : null,
      lyrics: null // We still use getLyrics for this
    }
  } catch (error) {
    console.error('Error fetching song details:', error)
    return null
  }
}

export async function fetchLyricsByUrl(url: string) {
  try {
    const lyrics = await getLyrics(url)
    return lyrics
  } catch (error) {
    console.error('Error fetching lyrics from URL:', error)
    return null
  }
}
