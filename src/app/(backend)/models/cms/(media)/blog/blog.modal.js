import { Schema, model, models } from "mongoose";

const blogSchema = new Schema(
  {
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
            unique: true,
            trim: true,
            lowercase: true,
        },
        thumbnail_image: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        tag: {
            type: [{ type: Schema.Types.ObjectId, ref: "blog-tag", required: true }],
        },
        short_content: {
            type: String,
            required: true,
        },
        content: [{
            displayName: {
                type: String,
                required: true,
            },
            show_image: {
                type: String,
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
            image: {
                type: [String],
                required: true,
            },
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

const modelName = "blog";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("blog", blogSchema);