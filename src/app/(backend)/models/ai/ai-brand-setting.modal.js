import { Schema, model, models } from "mongoose";

/**
 * Singleton document — only one record ever exists (upserted by slug "default").
 * Stores brand identity used to guide AI image generation prompts.
 */
const aiBrandSettingSchema = new Schema(
    {
        slug: { type: String, default: "default", unique: true },

        // ── Company identity ──────────────────────────────────────────────
        companyName: { type: String, default: "" },
        companyDomain: { type: String, default: "" },   // e.g. https://www.virgo.com
        industry: { type: String, default: "" },         // e.g. "laminates & surface materials"
        tagline: { type: String, default: "" },          // e.g. "Crafting Beautiful Spaces"

        // ── Visual brand identity ─────────────────────────────────────────
        primaryColor: { type: String, default: "" },     // hex e.g. "#0077B6"
        secondaryColor: { type: String, default: "" },
        brandStyle: { type: String, default: "" },       // e.g. "modern, minimal, premium"

        // ── Logo ──────────────────────────────────────────────────────────
        // Public path to logo file (e.g. /file/footer/logo-dark.webp)
        // The image-generate route will overlay this onto generated images.
        logoPath: { type: String, default: "" },

        // ── Typography ────────────────────────────────────────────────────
        primaryFont: { type: String, default: "" },      // e.g. "Montserrat"
        secondaryFont: { type: String, default: "" },

        // ── AI prompt guidance ────────────────────────────────────────────
        // Extra instructions injected into every image generation prompt
        promptGuidance: { type: String, default: "" },
        // Subjects/themes to AVOID in generated images
        negativePrompt: { type: String, default: "" },
        // Target audience description
        targetAudience: { type: String, default: "" },
        // Typical image use-cases (comma-separated) e.g. "blog banner, product hero, social post"
        imageUseCases: { type: String, default: "" },
        // Which text/logo suppression rules to apply (array of strings)
        // Options: "no text","no logo","no watermark","no brand name","no letters","no typography"
        // Leave empty to apply none (e.g. if brand style needs text overlays)
        suppressRules: { type: [String], default: ["no text", "no logo", "no watermark", "no brand name", "no letters", "no typography"] },
    },
    { timestamps: true }
);

const modelName = "ai-brand-setting";
if (process.env.NODE_ENV !== "production" && models[modelName]) {
    delete models[modelName];
}

export default models[modelName] || model(modelName, aiBrandSettingSchema);
