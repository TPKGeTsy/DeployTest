import Kuroshiro from "kuroshiro"
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji"

let kuroshiro: Kuroshiro | null = null

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
  // Since kuroshiro doesn't expose a direct tokenization API easily that returns objects with parts of speech,
  // we might use the underlying analyzer or just use kuroshiro's conversion if it's enough.
  // For vocabulary learning, we want to split by words.
  
  // Actually, Kuroshiro's analyzer can be used directly if we want more control.
  const analyzer = new KuromojiAnalyzer()
  // analyzer.init() is called by kuroshiro.init() but we can use it.
  
  // Let's use a simpler approach for now:
  // Convert to furigana and then we can parse the HTML or use a different library if we need tokens.
  
  // Wait, let's just use the analyzer directly to get tokens.
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
  const analyzer = new KuromojiAnalyzer({
    dictPath: "node_modules/kuromoji/dict"
  })
  await analyzer.init()
  analyzerInstance = (analyzer as any)._analyzer
  return analyzerInstance
}

// ฟังก์ชันช่วยแปลง Katakana เป็น Hiragana
function katakanaToHiragana(src: string) {
  return src.replace(/[\u30a1-\u30f6]/g, (match) => {
    const chr = match.charCodeAt(0) - 0x60
    return String.fromCharCode(chr)
  })
}

export async function getWords(text: string): Promise<WordToken[]> {
  try {
    const analyzer = await getAnalyzer()
    const tokens = await analyzer.tokenize(text)
    
    return tokens.map((token: any) => ({
      surface_form: token.surface_form,
      // แปลงคำอ่านจาก Katakana (ค่าเริ่มต้นของ Kuromoji) ให้เป็น Hiragana
      reading: token.reading ? katakanaToHiragana(token.reading) : undefined,
      base_form: token.basic_form,
      pos: token.pos
    }))
  } catch (error) {
    console.error("Tokenization error:", error)
    return [{ surface_form: text, pos: "error" }]
  }
}
