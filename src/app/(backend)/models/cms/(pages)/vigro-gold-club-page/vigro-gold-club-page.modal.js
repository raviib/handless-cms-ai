import { Schema, model, models } from "mongoose";

const vigro_gold_club_pageSchema = new Schema(
  {
        banner_section: {
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
            box: [{
                tagline: {
                    type: String,
                    required: true,
                },
                title: {
                    type: String,
                    required: true,
                },
            }],
            image: {
                type: [String],
                required: true,
            },
        },
        faq_section: {
            tagline: {
                type: String,
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            faq: [{
                content: {
                    type: String,
                    required: true,
                },
                question: {
                    type: String,
                    required: true,
                },
                image: {
                    type: String,
                },
            }],
        },
        usp: {
            tagline: {
                type: String,
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            list: [{
                title: {
                    type: String,
                    required: true,
                },
                content: {
                    type: String,
                },
                image: {
                    type: String,
                },
            }],
        },
        work_flow: {
            tagline: {
                type: String,
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            list: [{
                title: {
                    type: String,
                    required: true,
                },
                short_content: {
                    type: String,
                },
                image: {
                    type: String,
                },
                app_store: [{
                    image: {
                        type: String,
                    },
                    link: {
                        type: String,
                    },
                }],
            }],
        },
        who_can: [{
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
            list: [{
                title: {
                    type: String,
                    required: true,
                },
                image: {
                    type: String,
                },
            }],
        }],
        rewards: {
            tagline: {
                type: String,
            },
            title: {
                type: String,
            },
            list: [{
                title: {
                    type: String,
                },
                image: {
                    type: String,
                },
            }],
        },
        bottom: {
            title: {
                type: String,
            },
            buttonName: {
                type: String,
                required: true,
            },
            link: {
                type: String,
            },
        },
        video: {
            tagline: {
                type: String,
            },
            title: {
                type: String,
            },
            thumbnail_image: {
                type: String,
            },
            enumeration: {
                type: String,
            },
            video: {
                type: String,
            },
            link: {
                type: String,
            },
        },
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

const modelName = "vigro-gold-club-page";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("vigro-gold-club-page", vigro_gold_club_pageSchema);