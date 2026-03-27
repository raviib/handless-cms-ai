import { Schema, model, models } from "mongoose";

const csr_pageSchema = new Schema(
  {
        banner: {
            type: Schema.Types.ObjectId,
            ref: "banner",
            required: true,
        },
        csr_initiatives: {
            tagline: {
                type: String,
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            short_content: {
                type: String,
                required: true,
            },
            thumbnail_image: {
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
        },
        csr_philosophy: {
            tagline: {
                type: String,
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            short_content: {
                type: String,
                required: true,
            },
            csr_list: [{
                heading: {
                    type: String,
                    required: true,
                },
                short_content: {
                    type: String,
                    required: true,
                },
                icon: {
                    type: String,
                    required: true,
                },
                thumbnail_image: {
                    type: String,
                    required: true,
                },
            }],
        },
        sustainability_manufacturing: {
            tagline: {
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
            image: {
                type: String,
                required: true,
            },
            list: [{
                content: {
                    type: String,
                },
                image: {
                    type: String,
                },
                title: {
                    type: String,
                    required: true,
                },
            }],
        },
        csr_events: {
            tagline: {
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
        },
        information: [{
            tagline: {
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
            image: {
                type: String,
                required: true,
            },
            list: [{
                content: {
                    type: String,
                },
                image: {
                    type: String,
                },
            }],
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

const modelName = "csr-page";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("csr-page", csr_pageSchema);