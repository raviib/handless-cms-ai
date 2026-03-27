import pageConfSchema from "@/app/(backend)/models/setting/pages-conf/pages-conf.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { SEO_SECTION } from "@/app/utils/db/DefaultSeo"

// Disable caching completely
export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function getAllFormFieldcall(pageName) {
    try {
        await dbConnect()
        const allField = await pageConfSchema.findOne({
            pageName: pageName
        }).select({
            _id: 0,
            createdAt: 0,
            __v: 0,
            updatedAt: 0,
            'fields._id': 0
        });
        if (!allField) {
            return {}
        }
        return allField.toObject();
    } catch (error) {
        return {}
    }
}

export async function getPageConfFieldscall(pageName) {
    try {
        await dbConnect()
        const allField = await pageConfSchema.findOne({
            pageName: pageName
        })

        if (!allField) {
            return {}
        }
        const data = allField.toObject();
        if (data.showSEO) {
            data["sections"].push(SEO_SECTION)
        }
        return data
    } catch (error) {
        return {}
    }
}

export async function getPageConfFieldsUndoModecall(_id) {
    try {
        await dbConnect()
        const allField = await pageConfSchema.findById(_id)
        if (!allField) {
            return {}
        }
        return allField.toObject();
    } catch (error) {
        return {}
    }
}

// Export functions directly without caching
export const getAllFormField = getAllFormFieldcall;
export const getPageConfFields = getPageConfFieldscall;
export const getPageConfFieldsUndoMode = getPageConfFieldsUndoModecall;
