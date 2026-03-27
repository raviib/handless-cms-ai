import { Schema, model, models } from "mongoose";

const home_pageSchema = new Schema(
  {
        banner: {
            type: [{ type: Schema.Types.ObjectId, ref: "banner", required: true }],
        },
        about_virgo_group: {
            tagline: {
                type: String,
                required: true,
            },
            short_content: {
                type: String,
                required: true,
            },
            button_list: [{
                buttonName: {
                    type: String,
                    required: true,
                },
                link: {
                    type: String,
                    required: true,
                },
                video: {
                    type: String,
                },
            }],
            number: {
                type: Number,
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            List: [{
                title: {
                    type: String,
                    required: true,
                },
                short_content: {
                    type: String,
                    required: true,
                },
                sub_title: {
                    type: String,
                    required: true,
                },
            }],
        },
        products: [{
            title: {
                type: String,
            },
            content: {
                type: String,
            },
            image: {
                type: String,
                required: true,
            },
            buttonName: {
                type: String,
                default: "Read More",
            },
            catalogue: {
                type: String,
                default: "Download Catalogue",
            },
            link: {
                type: String,
            },
            links: {
                type: String,
            },
            icon: {
                type: String,
            },
        }],
        insights_and_inspiration: {
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
            },
            buttonName: {
                type: String,
                required: true,
            },
            link: {
                type: String,
                required: true,
            },
        },
        sections: [{
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

const modelName = "home-page";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("home-page", home_pageSchema);