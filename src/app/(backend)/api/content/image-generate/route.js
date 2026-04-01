import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";
import { dbConnect } from "@/app/utils/db/connectDb";
import AiImageHistory from "@/app/(backend)/models/ai/ai-image-history.modal.js";
import AiBrandSetting from "@/app/(backend)/models/ai/ai-brand-setting.modal.js";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const MODEL = "black-forest-labs/FLUX.1-dev";
const SAVE_DIR = "/file/ai-images";
const DEFAULT_LOGO = path.join(process.cwd(), "public", "images", "admin", "logo.webp");

// ── Brand settings ────────────────────────────────────────────────────────────
async function loadBrandSetting() {
    try {
        await dbConnect();
        const doc = await AiBrandSetting.findOne({ slug: "default" }).lean();
        return doc || {};
    } catch {
        return {};
    }
}

// ── Post-process: blur logo corner, overlay real logo ─────────────────────────
async function cleanAndOverlay(imageBuffer, logoPublicPath) {
    const { width, height } = await sharp(imageBuffer).metadata();

    const zoneW = Math.round(width  * 0.30);
    const zoneH = Math.round(height * 0.22);
    const zoneLeft = width  - zoneW;
    const zoneTop  = height - zoneH;

    const blurredCorner = await sharp(imageBuffer)
        .extract({ left: zoneLeft, top: zoneTop, width: zoneW, height: zoneH })
        .blur(18)
        .png()
        .toBuffer();

    let result = await sharp(imageBuffer)
        .composite([{ input: blurredCorner, left: zoneLeft, top: zoneTop, blend: "over" }])
        .png()
        .toBuffer();

    let logoAbsPath = DEFAULT_LOGO;
    if (logoPublicPath?.trim()) {
        const candidate = path.join(process.cwd(), "public", logoPublicPath.replace(/^\//, ""));
        if (fs.existsSync(candidate)) logoAbsPath = candidate;
    }
    if (!fs.existsSync(logoAbsPath)) return result;

    const logoMaxWidth = Math.round(width * 0.18);
    const padding      = Math.round(width * 0.025);
    const logoBuffer   = await sharp(logoAbsPath).resize({ width: logoMaxWidth, withoutEnlargement: true }).png().toBuffer();
    const logoMeta     = await sharp(logoBuffer).metadata();

    return sharp(result)
        .composite([{ input: logoBuffer, left: width - logoMeta.width - padding, top: height - logoMeta.height - padding, blend: "over" }])
        .png()
        .toBuffer();
}

// ── Suppress rules ────────────────────────────────────────────────────────────
const ALL_SUPPRESS_RULES = [
    { key: "no text",       negative: "text, words, writing, caption, subtitle",                        positive: "clean image with no text overlays" },
    { key: "no logo",       negative: "logo, logotype, brand mark, emblem, badge, seal, icon overlay",  positive: "no logos or brand marks anywhere in the image" },
    { key: "no watermark",  negative: "watermark, stamp, copyright mark",                               positive: "no watermarks" },
    { key: "no brand name", negative: "brand name, company name, product name, trademark, registered mark", positive: "no company or brand names rendered in the image" },
    { key: "no letters",    negative: "letters, characters, glyphs, alphabet, numerals, digits",        positive: "no letters or characters" },
    { key: "no typography", negative: "typography, font, typeface, headline, title text, label",        positive: "no typography" },
];

function buildFinalPrompt(userPrompt, contextText, brand) {
    const parts = [userPrompt.trim()];
    if (contextText?.trim())   parts.push(`Context: ${contextText.slice(0, 300)}`);
    if (brand.industry)        parts.push(`Industry: ${brand.industry}`);
    if (brand.brandStyle)      parts.push(`Visual style: ${brand.brandStyle}`);
    if (brand.primaryColor)    parts.push(`Primary brand color: ${brand.primaryColor}`);
    if (brand.secondaryColor)  parts.push(`Accent color: ${brand.secondaryColor}`);
    if (brand.targetAudience)  parts.push(`Target audience: ${brand.targetAudience}`);
    if (brand.promptGuidance)  parts.push(brand.promptGuidance.trim());

    const activeKeys  = new Set(Array.isArray(brand.suppressRules) ? brand.suppressRules : []);
    const activeRules = ALL_SUPPRESS_RULES.filter((r) => activeKeys.has(r.key));
    if (activeRules.length > 0) parts.push(activeRules.map((r) => r.positive).join(", "));

    const negTokens = [
        ...activeRules.flatMap((r) => r.negative.split(",")),
        brand.negativePrompt || "",
    ].map((s) => s.trim()).filter(Boolean);

    return { positive: parts.join(". "), negative: [...new Set(negTokens)].join(", ") };
}

/**
 * POST /api/content/image-generate
 * Body: { prompt, contextText?, fieldId?, count?, width?, height? }
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { prompt, contextText = "", fieldId = "", count = 3, width = 1024, height = 1024 } = body;

        if (!prompt?.trim()) {
            return NextResponse.json({ success: false, message: "prompt is required" }, { status: 400 });
        }
        if (!process.env.HF_API_KEY) {
            return NextResponse.json({ success: false, message: "HF_API_KEY is not configured" }, { status: 500 });
        }

        // Clamp dimensions: multiples of 64, within 256–2048 (FLUX requirement)
        const clamp = (v) => Math.min(2048, Math.max(256, Math.round((Number(v) || 1024) / 64) * 64));
        const imgW = clamp(width);
        const imgH = clamp(height);

        const brand = await loadBrandSetting();
        const { positive: finalPrompt, negative: negativePrompt } = buildFinalPrompt(prompt, contextText, brand);

        const hf = new HfInference(process.env.HF_API_KEY);

        const absDir = path.join(process.cwd(), "public", SAVE_DIR);
        if (!fs.existsSync(absDir)) fs.mkdirSync(absDir, { recursive: true });

        const numImages = Math.min(Math.max(1, count), 3);

        const generateOne = async () => {
            const blob = await hf.textToImage({
                model: MODEL,
                inputs: finalPrompt,
                parameters: {
                    width: imgW,
                    height: imgH,
                    negative_prompt: negativePrompt,
                    num_inference_steps: 28,
                    guidance_scale: 3.5,
                },
            });

            const arrayBuffer = await blob.arrayBuffer();
            let buffer = Buffer.from(arrayBuffer);

            // Blur AI-hallucinated logo corner, overlay real brand logo
            buffer = await cleanAndOverlay(buffer, brand.logoPath);

            const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.png`;
            const filePath = `${SAVE_DIR}/${fileName}`;
            fs.writeFileSync(path.join(process.cwd(), "public", filePath), buffer);
            return filePath;
        };

        const imagePaths = await Promise.all(
            Array.from({ length: numImages }, () => generateOne())
        );

        if (fieldId) {
            await AiImageHistory.create({
                fieldId,
                prompt: finalPrompt,
                generatedImages: imagePaths,
            }).catch(() => {});
        }

        return NextResponse.json({
            success: true,
            images: imagePaths,
            logoPath: brand.logoPath || null,
            size: { width: imgW, height: imgH },
        });
    } catch (error) {
        console.error("[Image Generate] Error:", error.message);
        return NextResponse.json(
            { success: false, message: error.message || "Image generation failed" },
            { status: 500 }
        );
    }
}
