import { NextResponse } from "next/server";
import pageComponentSchema from "@/app/(backend)/models/setting/page-component/page-component.modal.js";
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { isExistThenAdd } from "@/app/utils/db/validations.js";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

// GET Single Component
export async function GET(request, { params }) {
    try {
        const paramsdata = await params;
        const { slug } = paramsdata;
        const data = await pageComponentSchema.findById(slug).lean();

        if (!data) {
            throw new ErrorHandler("Component not found", 404);
        }

        return NextResponse.json({
            success: true,
            message: "Component fetched successfully",
            data,
        });
    } catch (error) {
        return errorHandler(error);
    }
}

// PUT Update Component
export async function PUT(request, { params }) {
    try {
        const { slug } = await params;
        const formData = await request.formData();
        const objToPush = {};
        const unsetToPush = {};

        await isExistThenAdd({
            objToPush,
            unsetToPush,
            formData,
            filesField: [],
            objectField: ["fields"]
        });

        const { name, category } = objToPush;

        if (name || category) {
            // Generate new component key if name or category changed
            const slugify = (text) => {
                return text
                    .toString()
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w\-]+/g, '')
                    .replace(/\-\-+/g, '-');
            };

            // Get current document to check existing values
            const currentDoc = await pageComponentSchema.findById(slug);
            if (!currentDoc) {
                throw new ErrorHandler("Component not found", 404);
            }

            const newName = name || currentDoc.name;
            const newCategory = category !== undefined ? category : currentDoc.category;

            const categorySlug = newCategory ? slugify(newCategory) : 'general';
            const nameSlug = slugify(newName);
            const newComponentKey = `${categorySlug}.${nameSlug}`;

            // Check if new componentKey conflicts with another document
            if (newComponentKey !== currentDoc.componentKey) {
                const exists = await pageComponentSchema.findOne({
                    componentKey: newComponentKey,
                    _id: { $ne: slug }
                });
                if (exists) {
                    throw new ErrorHandler(
                        `Component "${newName}" in category "${newCategory || 'general'}" already exists. Component key: ${newComponentKey}`,
                        400
                    );
                }
                objToPush.componentKey = newComponentKey;
            }

            if (!objToPush.category && category === '') {
                objToPush.category = 'general';
            }
        }

        const data = await pageComponentSchema.findByIdAndUpdate(
            slug,
            { $set: objToPush, $unset: unsetToPush },
            { new: true, runValidators: true }
        );

        if (!data) {
            throw new ErrorHandler("Component not found", 404);
        }

        return NextResponse.json({
            success: true,
            message: "Component updated successfully",
            data,
        });
    } catch (error) {
        return errorHandler(error);
    }
}

// DELETE Component
export async function DELETE(request, { params }) {
    try {
        const { slug } = await params;

        const data = await pageComponentSchema.findByIdAndDelete(slug);

        if (!data) {
            throw new ErrorHandler("Component not found", 404);
        }

        return NextResponse.json({
            success: true,
            message: "Component deleted successfully",
        });
    } catch (error) {
        return errorHandler(error);
    }
}
