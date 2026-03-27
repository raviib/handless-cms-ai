import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";
import { dbConnect } from "@/app/utils/db/connectDb";
import AiContentHistory from "@/app/(backend)/models/ai/ai-content-history.modal.js";

const MODEL = "Qwen/Qwen2.5-72B-Instruct";

function cleanSuggestions(text) {
    try {
        const stripped = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
        const start = stripped.indexOf("[");
        const end = stripped.lastIndexOf("]");
        if (start === -1 || end === -1) throw new Error("No JSON array found");
        return JSON.parse(stripped.slice(start, end + 1));
    } catch {
        return null;
    }
}

/**
 * POST /api/content/improve
 * Body: { text: string, fieldType: "text" | "rich-text-blocks" | "rich-text-markdown", locale?: string }
 * Returns: { success: true, suggestions: string[] }
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { text, fieldType = "text", locale = "en", prompt = "", fieldId = "" } = body;

        if (!text || typeof text !== "string" || !text.trim()) {
            return NextResponse.json(
                { success: false, message: "text is required" },
                { status: 400 }
            );
        }

        if (!process.env.HF_API_KEY) {
            return NextResponse.json(
                { success: false, message: "HF_API_KEY is not configured" },
                { status: 500 }
            );
        }

        const isHtml = fieldType === "rich-text-markdown";
        const isBlock = fieldType === "rich-text-blocks";

        const formatInstruction = isHtml
            ? "The content is HTML. Preserve all HTML tags and structure. Only improve the visible text content within the tags."
            : isBlock
            ? "The content is plain text (may contain line breaks). Preserve paragraph structure."
            : "The content is plain text. Keep it concise.";

        const localeInstruction = locale && locale !== "en"
            ? `IMPORTANT: The content is in locale "${locale}". Write all suggestions in the same language as the input.`
            : "";

        const promptInstruction = prompt?.trim()
            ? `USER INSTRUCTION: "${prompt.trim()}" — apply this to all 3 variations.`
            : "";

        const systemPrompt = `You are a professional content editor. Your job is to improve CMS field content by making it clearer, more engaging, and more professional.

${formatInstruction}
${localeInstruction}
${promptInstruction}

Rules:
- Generate exactly 3 improved versions of the given content
- Each version should be meaningfully different (vary tone, structure, or emphasis)
- Keep the same core meaning and intent
- Do NOT add new facts or information not present in the original
- Return ONLY a raw JSON array of 3 strings. No markdown. No explanation.`;

        const userPrompt = `Improve this content and return exactly 3 variations as a JSON array:

"${text.slice(0, 2000)}"

Return ONLY: ["variation1", "variation2", "variation3"]`;

        const hf = new HfInference(process.env.HF_API_KEY);

        const response = await hf.chatCompletion({
            model: MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            max_tokens: 1200,
            temperature: 0.7,
        });

        const rawText = response?.choices?.[0]?.message?.content || "";

        if (!rawText.trim()) {
            return NextResponse.json(
                { success: false, message: "Empty AI response" },
                { status: 500 }
            );
        }

        const suggestions = cleanSuggestions(rawText);

        if (!Array.isArray(suggestions) || suggestions.length === 0) {
            return NextResponse.json(
                { success: false, message: "Could not parse AI suggestions" },
                { status: 500 }
            );
        }

        const finalSuggestions = suggestions.slice(0, 3).map((s) => String(s));

        // Persist to DB (fire-and-forget, don't block response)
        if (fieldId) {
            dbConnect().then(() =>
                AiContentHistory.create({
                    fieldId,
                    fieldType,
                    locale,
                    prompt,
                    originalValue: text.slice(0, 5000),
                    suggestions: finalSuggestions,
                }).catch(() => {})
            ).catch(() => {});
        }

        return NextResponse.json({
            success: true,
            suggestions: finalSuggestions,
        });
    } catch (error) {
        console.error("[Content Improve] Error:", error.message);
        return NextResponse.json(
            { success: false, message: error.message || "AI generation failed" },
            { status: 500 }
        );
    }
}
