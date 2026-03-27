import { NextResponse } from "next/server";
import pageConfSchema from "@/app/(backend)/models/setting/pages-conf/pages-conf.modal.js";
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { isExistThenAdd, isrequired } from "@/app/utils/db/validations.js";
import RBACSchema from "@/app/(backend)/models/administrator/RBAC/RBAC.modal.js";
import { generateModule } from "@/app/utils/module-generator/ModuleGenerator";

// Disable caching for this API route
export const revalidate = 0;
export const dynamic = 'force-dynamic';

// ------------------------------
// Helpers
// ------------------------------

const buildURL = ({ under, pageName }) => {
    // const categoryPart = category && category !== "none" ? `/${category}` : "";
    return `/${under}/${pageName}`;
};

const safeBoolean = (val) => (val === "true" ? true : val === "false" ? false : undefined);

// ------------------------------
// GET API
// ------------------------------
export async function GET(request) {
    try {
        const { searchParams } = request.nextUrl;

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 100;
        const search = searchParams.get("search") || "";
        const under = searchParams.get("under");
        const category = searchParams.get("category");
        const showInHeader = safeBoolean(searchParams.get("showInHeader"));

        const skip = (page - 1) * limit;
        const query = {};

        // ---- Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { pageName: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
            ];
        }

        // ---- Optional filters
        if (under) query.under = under;
        if (category) query.category = category;
        if (showInHeader !== undefined) query.showInHeader = showInHeader;

        const totalDocs = await pageConfSchema.countDocuments(query);

        const data = await pageConfSchema
            .find(query)
            .sort({ sort: 1, sort: 1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data,
            totalDocs,
            page,
            totalPages: Math.ceil(totalDocs / limit),
        });
    } catch (error) {
        return errorHandler(error);
    }
}

// ------------------------------
// POST API
// ------------------------------
export async function POST(request) {
    try {
        const formData = await request.formData();
        const objToPush = {};
        const unsetToPush = {};

        await isExistThenAdd({ objToPush, unsetToPush, formData, filesField: [], objectField: ["sections", "locales"] });

        const { name, pageName, under, } = objToPush;

        // ---- Required fields validation
        const required = isrequired({ name, pageName, under });
        if (required.is_error) {
            throw new ErrorHandler(required.message, required.statusCode);
        }

        // ---- Duplicate page check
        const exists = await pageConfSchema.findOne({ pageName });
        if (exists) throw new ErrorHandler(`Page "${pageName}" already exists`, 400);

        // ---- Build URLs
        const url = buildURL({ under, pageName });
        objToPush.get_url = url;
        objToPush.put_url = url;
        objToPush.post_url = url;
        objToPush.delete_image_url = url;

        // ---- Create Page Config
        const data = await pageConfSchema.create(objToPush);

        // ---- Module Generator (non-blocking)
        generateModule(objToPush).catch((e) =>
            console.error("Module Generation Error:", e)
        );

        // ---- RBAC Insert (non-blocking)
        const rbacPermission = {
            access_of: data._id,
            view: false,
            edit: false,
            delete: false,
            create: false,
        };

        RBACSchema.updateOne(
            { isDeleteAble: false },
            { $push: { permissions: rbacPermission } }
        ).catch((e) => console.error("RBAC error:", e));

        RBACSchema.updateOne(
            { isDeleteAble: true },
            {
                $push: {
                    permissions: {
                        ...rbacPermission,
                        view: true,
                        edit: true,
                        delete: true,
                        create: true,
                    },
                },
            }
        ).catch((e) => console.error("RBAC error:", e));

        return NextResponse.json(
            {
                success: true,
                message: "Page created successfully",
                data,
            },
            { status: 201 }
        );
    } catch (error) {
        return errorHandler(error);
    }
}
