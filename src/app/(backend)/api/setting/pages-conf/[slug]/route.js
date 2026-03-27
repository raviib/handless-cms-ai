import { NextResponse } from "next/server";
import pageConfSchema from "@/app/(backend)/models/setting/pages-conf/pages-conf.modal.js";
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { isExistThenAdd, isrequired } from "@/app/utils/db/validations.js";
import RBACSchema from "@/app/(backend)/models/administrator/RBAC/RBAC.modal.js";
import { generateModule } from "@/app/utils/module-generator/ModuleGenerator";
import { deleteModule, addModelToAllModels } from "@/app/utils/module-generator/delete-module.js";
import { unstable_noStore as noStore } from 'next/cache';

// Disable caching for this API route
export const revalidate = 0;
export const dynamic = 'force-dynamic';

const FILE_PATH = "";
const filesField = [];
const objectField = ["sections", "locales"];

export async function GET(request, { params }) {
    noStore();
    try {
        const { slug } = await params;

        if (!slug) {
            throw new ErrorHandler("Page ID is required", 400);
        }

        const section = await pageConfSchema.findById(slug);

        if (!section) {
            throw new ErrorHandler("Page configuration not found", 404);
        }

        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: section,
        });
    } catch (error) {
        return errorHandler(error);
    }
}

export async function PUT(request, { params }) {
    try {
        const { slug } = await params;

        if (!slug) {
            throw new ErrorHandler("Page ID is required", 400);
        }

        const formData = await request.formData();
        const objToPush = {};
        const unsetToPush = {};

        await isExistThenAdd({ objToPush, unsetToPush, formData, filesField, objectField });

        // locales is a plain string array — deepMerge doesn't handle it correctly,
        // so we parse and assign it directly after isExistThenAdd
        const rawLocales = formData.get("locales");
        if (rawLocales) {
            try {
                const parsed = JSON.parse(rawLocales);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    objToPush.locales = parsed;
                }
            } catch (_) {}
        }

        const { name, pageName } = objToPush;

        // Validate required fields
        let required_body = { name, pageName };
        const isError = isrequired(required_body);
        if (isError.is_error) {
            throw new ErrorHandler(isError.message, isError.statusCode);
        }

        // Check if page exists
        const existingPage = await pageConfSchema.findById(slug);
        if (!existingPage) {
            throw new ErrorHandler("Page configuration not found", 404);
        }

        // Check for duplicate pageName (excluding current page)
        if (pageName && pageName !== existingPage.pageName) {
            const duplicatePage = await pageConfSchema.findOne({
                pageName,
                _id: { $ne: slug }
            });
            if (duplicatePage) {
                throw new ErrorHandler(`Page with name "${pageName}" already exists`, 400);
            }
        }

        const data = await pageConfSchema.findByIdAndUpdate(
            slug,
            {
                $set: objToPush,
                $unset: unsetToPush
            },
            { new: true, runValidators: true }
        );

        // Handle module regeneration if requested
        const regenerateModule = formData.get("regenerateModule");
        const regenerateV1 = formData.get("regenerateV1") === "true";
        console.log(regenerateModule, "regenerateModule")
        if (regenerateModule === "true") {
            try {
                const isSingleType = data.detailPage === false || data.detailPage === "false";

                if (isSingleType) {
                    // For single type, only update the API route file
                    await generateModule(data.toObject(), { updateOnly: true, regenerateV1 });
                    addModelToAllModels(data.pageName, data.under, data.category);
                    console.log(`✅ Single-type API route updated for ${data.pageName}`);
                } else {
                    // For list type, delete and regenerate all files
                    await deleteModule({
                        pageName: existingPage.pageName,
                        under: existingPage.under,
                        category: existingPage.category
                    });

                    // Generate new module with updated configuration
                    await generateModule(data.toObject(), { regenerateV1 });

                    // Ensure the model is added to allModels.js
                    addModelToAllModels(data.pageName, data.under, data.category);

                    console.log(`✅ Module regenerated for ${data.pageName}`);
                }
            } catch (moduleError) {
                console.error('❌ Error regenerating module:', moduleError);
                // Don't fail the update if module regeneration fails
            }
        }

        return NextResponse.json({
            success: true,
            message: "Updated successfully",
            data: data
        }, {
            status: 200,
        });
    } catch (error) {
        return errorHandler(error);
    }
}

export async function DELETE(request, { params }) {
    try {
        const { slug } = await params;

        if (!slug) {
            throw new ErrorHandler("Page ID is required", 400);
        }

        // Get deleteType from query parameters
        const { searchParams } = new URL(request.url);
        const deleteType = searchParams.get('deleteType');

        const data = await pageConfSchema.findByIdAndDelete(slug);

        if (!data) {
            throw new ErrorHandler("Page configuration not found", 404);
        }

        // Only delete module files if deleteType is not 'db-only'
        if (deleteType !== 'db-only') {
            try {
                await deleteModule({
                    pageName: data.pageName,
                    under: data.under,
                    category: data.category
                });
                console.log(`✅ Module files deleted for ${data.pageName}`);
            } catch (moduleError) {
                console.error('❌ Error deleting module files:', moduleError);
                // Continue - page is deleted even if file cleanup fails
            }
        } else {
            console.log(`ℹ️ DB-only deletion for ${data.pageName} - module files preserved`);
        }

        // Remove from RBAC permissions
        try {
            await RBACSchema.updateMany({}, {
                $pull: {
                    permissions: {
                        access_of: data._id
                    }
                }
            });
        } catch (rbacError) {
            console.error('RBAC cleanup error:', rbacError);
            // Continue - page is deleted even if RBAC cleanup fails
        }

        return NextResponse.json({
            success: true,
            message: deleteType === 'db-only'
                ? "Database record deleted successfully (files preserved)"
                : "Deleted successfully",
            data: {
                name: data.name,
                pageName: data.pageName,
                deleteType: deleteType || 'full'
            }
        }, {
            status: 200,
        });
    } catch (error) {
        return errorHandler(error);
    }
}
