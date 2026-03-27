import { Schema, model, models } from "mongoose";

const categorySchema = new Schema(
  {
        banner: {
            type: Schema.Types.ObjectId,
            ref: "banner",
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
        about: {
            title: {
                type: String,
                required: true,
            },
            image: {
                type: String,
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
            tab: [{
                count: {
                    type: String,
                    required: true,
                },
                heading: {
                    type: String,
                    required: true,
                },
            }],
            heading: {
                type: String,
            },
        },
        our_range: {
            tag: {
                type: String,
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            content: {
                type: String,
            },
            tab: [{
                title: {
                    type: String,
                    required: true,
                },
                sub_title: {
                    type: String,
                    required: true,
                },
                image: {
                    type: String,
                    required: true,
                },
                buttonName: {
                    type: String,
                    required: true,
                    default: "Enquire Now",
                },
                link: {
                    type: String,
                },
            }],
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

const modelName = "category";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("category", categorySchema);