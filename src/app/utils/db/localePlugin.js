import { Schema } from "mongoose";

/**
 * Mongoose plugin that adds multilingual support to any schema.
 * - Adds `lang` (default "en") and `rootId` (references the base English doc)
 * - Adds a unique compound index on { rootId, lang }
 * - On save, if lang === "en" and rootId is not set, sets rootId = _id
 */
export function localePlugin(schema) {
    schema.add({
        lang: {
            type: String,
            default: "en",
            trim: true,
            index: true,
        },
        rootId: {
            type: Schema.Types.ObjectId,
            ref: "self",
            index: true,
        },
    });

    // Unique: one document per language per root
    schema.index({ rootId: 1, lang: 1 }, { unique: true });

    // Auto-set rootId = _id for base English documents
    schema.pre("save", function (next) {
        if (this.isNew && this.lang === "en" && !this.rootId) {
            this.rootId = this._id;
        }
        next();
    });
}
