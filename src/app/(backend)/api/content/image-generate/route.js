import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";
import { dbConnect } from "@/app/utils/db/connectDb";
import AiImageHistory from "@/app/(backend)/models/ai/ai-image-history.modal.js";
import fs from "fs";
import path from "path";

const MODEL = "black-forest-labs/FLUX.1-schnell";
const SAVE_DIR = "/file/ai-images";

/**
 * POST /api/content/image-generate
 * Body: { prompt: string, contextText?: string, fieldId?: string, count?: number }
 * Generates `count` (default 3) images, saves them to public/file/ai-images/,
 * persists paths to DB, returns { success, images: string[] }
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { prompt, contextText = "", fieldId = "", count = 3 } = body;

        if (!prompt || !prompt.trim()) {
            return NextResponse.json(
                { success: false, message: "prompt is required" },
                { status: 400 }
            );
        }

        if (!process.env.HF_API_KEY) {
            return NextResponse.json(
                { success: false, message: "HF_API_KEY is not configured" },
                { status: 500 }
            );
        }

        // Build final prompt — optionally enrich with context text
        const finalPrompt = contextText?.trim()
            ? `${prompt.trim()}. Context: ${contextText.slice(0, 300)}`
            : prompt.trim();

        const hf = new HfInference(process.env.HF_API_KEY);

        // Ensure save directory exists
        const absDir = path.join(process.cwd(), "public", SAVE_DIR);
        if (!fs.existsSync(absDir)) {
            fs.mkdirSync(absDir, { recursive: true });
        }

        // Generate `count` images in parallel
        const numImages = Math.min(Math.max(1, count), 3);
        const generateOne = async () => {
            const blob = await hf.textToImage({
                model: MODEL,
                inputs: finalPrompt,
                parameters: { width: 512, height: 512 },
            });
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.png`;
            const filePath = `${SAVE_DIR}/${fileName}`;
            fs.writeFileSync(path.join(process.cwd(), "public", filePath), buffer);
            return filePath;
        };

        const imagePaths = await Promise.all(
            Array.from({ length: numImages }, () => generateOne())
        );

        // Persist to DB
        if (fieldId) {
            await dbConnect();
            await AiImageHistory.create({
                fieldId,
                prompt: finalPrompt,
                generatedImages: imagePaths,
            }).catch(() => {});
        }

        return NextResponse.json({ success: true, images: imagePaths });
    } catch (error) {
        console.error("[Image Generate] Error:", error.message);
        return NextResponse.json(
            { success: false, message: error.message || "Image generation failed" },
            { status: 500 }
        );
    }
}
