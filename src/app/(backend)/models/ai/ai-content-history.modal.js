import { Schema, model, models } from "mongoose";

/**
 * AI Content History
 *
 * fieldId format examples:
 *   "about-us-page.visionMission.title"
 *   "about-us-page.visionMission.tab.0.title"
 *   "<objectId>.en.about-us-page.visionMission.title"
 *
 * Each document = one generation run for a specific fieldId.
 * suggestions[] stores the 2-3 AI-generated strings from that run.
 */
const aiContentHistorySchema = new Schema(
    {
        fieldId: {
            type: String,
            required: true,
            index: true,
        },
        fieldType: {
            type: String,
            enum: ["text", "rich-text-blocks", "rich-text-markdown"],
            default: "text",
        },
        locale: {
            type: String,
            default: "en",
        },
        prompt: {
            type: String,
            default: "",
        },
        originalValue: {
            type: String,
            default: "",
        },
        suggestions: {
            type: [String],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for fast lookup by fieldId + locale
aiContentHistorySchema.index({ fieldId: 1, locale: 1, createdAt: -1 });

const modelName = "ai-content-history";
if (process.env.NODE_ENV !== "production" && models[modelName]) {
    delete models[modelName];
}

export default models[modelName] || model(modelName, aiContentHistorySchema);
