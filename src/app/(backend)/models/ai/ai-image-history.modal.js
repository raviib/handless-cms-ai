import { Schema, model, models } from "mongoose";

/**
 * AI Image History
 * Stores each image generation run for a media field.
 * generatedImages[] = array of saved public paths from that run.
 */
const aiImageHistorySchema = new Schema(
    {
        fieldId: { type: String, required: true, index: true },
        prompt: { type: String, default: "" },
        // paths saved to /public/file/ai-images/
        generatedImages: { type: [String], required: true },
        // which one the user selected (optional)
        selectedImage: { type: String, default: "" },
    },
    { timestamps: true }
);

aiImageHistorySchema.index({ fieldId: 1, createdAt: -1 });

const modelName = "ai-image-history";
if (process.env.NODE_ENV !== "production" && models[modelName]) {
    delete models[modelName];
}

export default models[modelName] || model(modelName, aiImageHistorySchema);
