import { Schema, model, models } from "mongoose";

// Helper function to generate component key
const generateComponentKey = (category, name) => {
    const slugify = (text) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
    };
    
    const categorySlug = category ? slugify(category) : 'general';
    const nameSlug = slugify(name);
    
    return `${categorySlug}.${nameSlug}`;
};

const pageComponentSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Component name is required"],
            trim: true,
            index: true
        },
        componentKey: {
            type: String,
            required: [true, "Component key is required"],
            unique: true,
            trim: true
        },
        category: {
            type: String,
            trim: true,
            index: true,
            default: 'general'
        },
        sort: {
            type: Number,
            default: -1,
            index: true
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },
        fields: {
            type: Array,
            default: []
        },
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

pageComponentSchema.index({ componentKey: 1 });
pageComponentSchema.index({ category: 1, name: 1 });
pageComponentSchema.index({ isActive: 1, sort: -1 });

// Pre-save middleware to generate componentKey
pageComponentSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('name') || this.isModified('category')) {
        this.componentKey = generateComponentKey(this.category, this.name);
    }
    next();
});

// Pre-update middleware to generate componentKey
pageComponentSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update.$set && (update.$set.name || update.$set.category)) {
        const name = update.$set.name || this.getQuery().name;
        const category = update.$set.category || this.getQuery().category || 'general';
        update.$set.componentKey = generateComponentKey(category, name);
    }
    next();
});

export default models["page-components"] || model("page-components", pageComponentSchema);
