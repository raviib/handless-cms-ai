import { Schema, model, models } from "mongoose";

const contact_us_pageSchema = new Schema(
  {
        banner: {
            type: Schema.Types.ObjectId,
            ref: "banner",
            required: true,
        },
        quick_contact: {
            tagline: {
                type: String,
                required: true,
            },
            heading: {
                type: String,
                required: true,
            },
            list: [{
                title: {
                    type: String,
                    required: true,
                },
                image: {
                    type: String,
                },
                email: {
                    type: String,
                },
                number: {
                    type: String,
                    required: true,
                },
            }],
        },
        enquire_now: {
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
            },
        },
        get_in_touch: {
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
                image: {
                    type: String,
                },
                content: {
                    type: String,
                    required: true,
                },
            }],
            short_content: {
                type: String,
            },
            follow_us: [{
                image: {
                    type: String,
                    required: true,
                },
                link: {
                    type: String,
                },
            }],
            find_a_dealer: {
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
                buttonName: {
                    type: String,
                    required: true,
                },
                link: {
                    type: String,
                    required: true,
                },
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
        }
  },
  {
    timestamps: true,
  }
);

const modelName = "contact-us-page";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("contact-us-page", contact_us_pageSchema);