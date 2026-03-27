import { Schema, model, models } from "mongoose";
import { localePlugin } from "@/app/utils/db/localePlugin";

const bannerSchema = new Schema(
  {
        displayName: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            required: true,
        },
        video: {
            type: String,
        },
        image: {
            type: String,
        },
        content: {
            type: String,
        },
        show_video: {
            type: Boolean,
            required: true,
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

bannerSchema.plugin(localePlugin);


const modelName = "banner";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

const bannerSchemaModel = models[modelName] || model("banner", bannerSchema);

export default bannerSchemaModel;