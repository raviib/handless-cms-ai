import { Schema, model, models } from "mongoose";

const pagesConfSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            unique: true,
            trim: true,
            index: true
        },
        category: {
            type: String,
            default: "none",
            trim: true,
            index: true
        },
        sort: {
            type: Number,
            default: -1,
            index: true
        },
        showSEO: {
            type: Boolean,
            default: false
        },
        put_url: {
            type: String,
            trim: true
        },
        post_url: {
            type: String,
            trim: true
        },
        get_url: {
            type: String,
            trim: true
        },
        delete_image_url: {
            type: String,
            trim: true
        },
        pageName: {
            type: String,
            required: [true, "Page name is required"],
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
            validate: {
                validator: function (v) {
                    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
                },
                message: 'Page name must be lowercase with hyphens (e.g., my-page-name)'
            }
        },
        showInHeader: {
            type: Boolean,
            default: true,
            index: true
        },
        detailPage: {
            type: Boolean,
            default: false
        },
        under: {
            type: String,
            required: [true, "Under field is required"],
            trim: true,
            index: true,
        },
        searchInputPlaceholder: {
            type: String,
            default: "Search...",
            trim: true
        },
        ShowExcel: {
            type: Boolean,
            default: false
        },
        isDateFilters: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },
        entry_title: {
            type: String,
            trim: true
        },
        locales: {
            type: [String],
            default: ["en"]
        },
        sections: [
            {
                Heading: {
                    type: String,
                    default: "General Information",
                    trim: true
                },
                fields: {
                    type: Array,
                    default: []
                }
            }
        ],
        // Metadata
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
pagesConfSchema.index({ under: 1, category: 1, showInHeader: 1 });
pagesConfSchema.index({ pageName: 1, under: 1 });
pagesConfSchema.index({ isActive: 1, sort: -1 });

// Pre-save middleware to ensure pageName is lowercase and slugified
pagesConfSchema.pre('save', function (next) {
    if (this.pageName) {
        this.pageName = this.pageName.toLowerCase().replace(/\s+/g, '-');
    }
    next();
});

export default models["pages-confs"] || model("pages-confs", pagesConfSchema);