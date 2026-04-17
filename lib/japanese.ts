import Kuroshiro from "kuroshiro"
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji"
import path from "path"

let kuroshiro: any = null

async function initKuroshiro() {
  if (kuroshiro) return kuroshiro
  kuroshiro = new Kuroshiro()
  await kuroshiro.init(new KuromojiAnalyzer())
  return kuroshiro
}

export async function convertToFurigana(text: string) {
  const ks = await initKuroshiro()
  return await ks.convert(text, { to: "hiragana", mode: "furigana" })
}

export async function tokenize(text: string) {
  const ks = await initKuroshiro()
  const analyzerInstance = new KuromojiAnalyzer()
  await analyzerInstance.init()
  const tokens = await (analyzerInstance as any)._analyzer.tokenize(text)
  return tokens
}

export interface WordToken {
  surface_form: string
  reading?: string
  base_form?: string
  pos: string
}

let analyzerInstance: any = null

async function getAnalyzer() {
  if (analyzerInstance) return analyzerInstance
  
  // ใช้ path.join เพื่อให้ Vercel หาไฟล์พจนานุกรมเจอแน่นอน
  const dictPath = path.join(process.cwd(), "node_modules", "kuromoji", "dict")
  
  const analyzer = new KuromojiAnalyzer({
    dictPath: dictPath
  })
  
  try {
    await analyzer.init()
    analyzerInstance = (analyzer as any)._analyzer
    return analyzerInstance
  } catch (error) {
    console.error("Failed to initialize Kuromoji analyzer:", error)
    // Fallback: ลองไม่ใส่ path (ใช้ default)
    const fallbackAnalyzer = new KuromojiAnalyzer()
    await fallbackAnalyzer.init()
    analyzerInstance = (fallbackAnalyzer as any)._analyzer
    return analyzerInstance
  }
}

function katakanaToHiragana(src: string) {
  return src.replace(/[\u30a1-\u30f6]/g, (match) => {
    const chr = match.charCodeAt(0) - 0x60
    return String.fromCharCode(chr)
  })
}

export async function getWords(text: string): Promise<WordToken[]> {
  if (!text) return []

  try {
    const analyzer = await getAnalyzer()
    // ล้างข้อความเบื้องต้น (เอาบรรทัดว่างออก, ตัดช่องว่างหัวท้าย)
    const cleanedText = text.trim()
    const tokens = await analyzer.tokenize(cleanedText)
    
    return tokens.map((token: any) => ({
      surface_form: token.surface_form,
      reading: token.reading ? katakanaToHiragana(token.reading) : undefined,
      base_form: token.basic_form,
      pos: token.pos
    }))
  } catch (error) {
    console.error("Tokenization error detail:", error)
    // ถ้าพลาดจริงๆ ให้แยกด้วยช่องว่างเป็นอย่างน้อย (ดีกว่าก้อนเดียว)
    return text.split(/\s+/).map(word => ({
      surface_form: word,
      pos: "unknown"
    }))
  }
}
