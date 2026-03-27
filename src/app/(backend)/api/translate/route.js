import { NextResponse } from "next/server";
import { translateText } from "@/app/utils/translate/huggingface";

/**
 * POST /api/translate
 * Body: { texts: string[], targetLang: string }
 * Returns: { translated: string[] }
 */
export async function POST(request) {
  try {
    const { texts, targetLang } = await request.json();

    if (!Array.isArray(texts) || !targetLang) {
      return NextResponse.json({ success: false, message: "texts[] and targetLang are required" }, { status: 400 });
    }

    const translated = await Promise.all(
      texts.map((t) => (t ? translateText(t, targetLang) : Promise.resolve(t)))
    );

    return NextResponse.json({ success: true, translated });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
