import { Schema, model, models } from "mongoose";
import { localePlugin } from "@/app/utils/db/localePlugin";

const common_pageSchema = new Schema(
  {
        banner: {
            type: Schema.Types.ObjectId,
            ref: "banner",
            required: true,
        },
        displayName: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        section: [{
            type: Schema.Types.Mixed
        }],
        sort: {
            type: Number,
            default: -1
        },
        isActive: {
            type: Boolean,
            default: true
        },
        seo: {
            title: {
                type: String,
            },
            description: {
                type: String,
            },
            keywords: {
                type: String,
            },
            metaImage: {
                type: String,
            },
            openGraph: [{
                ogTitle: {
                    type: String,
                },
                ogDescription: {
                    type: String,
                },
                ogImage: {
                    type: String,
                },
                ogUrl: {
                    type: String,
                },
                ogType: {
                    type: String,
                },
            }],
            canonicalUrl: {
                type: String,
            },
            schemaMarkup: {
                type: Schema.Types.Mixed,
            },
        }
  },
  {
    timestamps: true,
  }
);

common_pageSchema.plugin(localePlugin);

// Unique per language — same value allowed across translations
common_pageSchema.index({ slug: 1, lang: 1 }, { unique: true });

const modelName = "common-page";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

const common_pageSchemaModel = models[modelName] || model("common-page", common_pageSchema);

export default common_pageSchemaModel;