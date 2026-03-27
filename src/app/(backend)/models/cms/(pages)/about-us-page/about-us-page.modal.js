import { Schema, model, models } from "mongoose";
import { localePlugin } from "@/app/utils/db/localePlugin";

const about_us_pageSchema = new Schema(
  {
        banner: {
            type: Schema.Types.ObjectId,
            ref: "banner",
            required: true,
        },
        visionMission: {
            title: {
                type: String,
                required: true,
            },
            sub_title: {
                type: String,
                required: true,
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
                thumbnail_image: {
                    type: String,
                    required: true,
                },
                image: {
                    type: String,
                    required: true,
                },
            }],
        },
        about_virgo_group: {
            title: {
                type: String,
                required: true,
            },
            heading: {
                type: String,
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
            image: {
                type: String,
                required: true,
            },
            number_section: {
                count: {
                    type: Number,
                    required: true,
                },
                title: {
                    type: String,
                    required: true,
                },
            },
            video: {
                type: String,
                required: true,
            },
            buttonName: {
                type: String,
                required: true,
            },
        },
        virgo_story: {
            title: {
                type: String,
                required: true,
            },
            heading: {
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
            video: {
                type: String,
                required: true,
            },
        },
        numbers_speak: {
            title: {
                type: String,
                required: true,
            },
            heading: {
                type: String,
                required: true,
            },
            number_section: [{
                title: {
                    type: String,
                    required: true,
                },
                short_content: {
                    type: String,
                    required: true,
                },
            }],
        },
        arrow_section: [{
            title: {
                type: String,
                required: true,
            },
            heading: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            thumbnail_image: {
                type: String,
                required: true,
            },
            link: {
                type: String,
                required: true,
            },
        }],
        virgo_promise: {
            title: {
                type: String,
                required: true,
            },
            heading: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            short_content: {
                type: String,
                required: true,
            },
            image: {
                type: String,
                required: true,
            },
            button: [{
                business_name: {
                    type: String,
                    required: true,
                },
                link: {
                    type: String,
                    required: true,
                },
            }],
        },
        feature: [{
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
            link: {
                type: String,
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

about_us_pageSchema.plugin(localePlugin);


const modelName = "about-us-page";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

const about_us_pageSchemaModel = models[modelName] || model("about-us-page", about_us_pageSchema);

export default about_us_pageSchemaModel;