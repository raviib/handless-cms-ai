/**
 * Locale-aware template generator.
 * Fully self-contained — extracts populate chains, search fields,
 * dynamic zones, shared fields directly from sections data.
 * Used when locales.length > 1.
 */

// ─── Helpers (mirror templates-additional.js) ────────────────────────────────

const getModelPath = (pageName, category, under) => {
    const inc = category && category !== "none";
    return inc
        ? `@/app/(backend)/models/${under}/(${category})/${pageName}/${pageName}.modal.js`
        : `@/app/(backend)/models/${under}/${pageName}/${pageName}.modal.js`;
};

const extractPopulateFields = (sections) => {
    const result = [];
    const walk = (fields, prefix = '') => {
        fields.forEach(f => {
            const name = f.field?.value || f.field;
            const path = prefix ? `${prefix}.${name}` : name;
            if (f.type === 'component' && f.fields?.length) walk(f.fields, path);
            else if (f.connectwith) {
                const sel = [];
                if (f.getOptionLabel) sel.push(f.getOptionLabel);
                if (f.getOptionValue) sel.push(f.getOptionValue);
                if (!sel.length) sel.push('name', 'displayName', '_id');
                result.push({ path, select: sel.join(' ') });
            }
        });
    };
    sections.forEach(s => walk(s.fields || []));
    return result;
};

const extractSearchableFields = (sections) => {
    const result = [];
    const walk = (fields, prefix = '') => {
        fields.forEach(f => {
            const name = f.field?.value || f.field;
            const path = prefix ? `${prefix}.${name}` : name;
            if (f.type === 'component' && f.fields?.length && f.component_type !== 'repeatable') walk(f.fields, path);
            else if (['text', 'textarea', 'email', 'url'].includes(f.type)) result.push(path);
        });
    };
    sections.forEach(s => walk(s.fields || []));
    return result;
};

const extractDynamicZoneFields = (sections) => {
    const result = [];
    sections?.forEach(s => s.fields?.forEach(f => {
        if (f.type === 'dynamic-zone') result.push(f.field?.value || f.field);
    }));
    return result;
};

/** Fields that must stay in sync across all language versions */
const extractSharedFields = (sections) => {
    const shared = ['sort', 'isActive'];
    sections?.forEach(s => s.fields?.forEach(f => {
        const name = f.field?.value || f.field;
        if (f.unique === true || f.unique === 'true') shared.push(name);
    }));
    return [...new Set(shared)];
};

const buildPopulateChain = (sections) =>
    extractPopulateFields(sections)
        .map(f => `\n            .populate({ path: "${f.path}", select: "${f.select}" })`)
        .join('');

const buildSearchConditions = (sections) => {
    const fields = extractSearchableFields(sections);
    if (!fields.length) return `{ name: { $regex: input_data, $options: "i" } }`;
    return fields.map(f => `{ "${f}": { $regex: input_data, $options: "i" } }`).join(', ');
};

const buildSelectboxSearchConditions = (sections) => {
    const fields = ['name', 'displayName', ...extractSearchableFields(sections)];
    return [...new Set(fields)]
        .map(f => `{ ${f}: { $regex: search, $options: "i" } }`)
        .join(', ');
};

const buildSelectFields = (sections) => {
    const fields = ['_id', 'displayName', 'lang'];
    extractSearchableFields(sections).forEach(f => { if (!fields.includes(f)) fields.push(f); });
    return fields.join(' ');
};

const buildDynamicZoneCode = (fields, indent = '        ') =>
    fields.length ? `\n${indent}// Populate dynamic zone relations\n${indent}data = await Promise.all(\n${indent}    data.map(async (item) => {\n${fields.map(fn =>
        `${indent}        if (item.${fn} && Array.isArray(item.${fn})) item.${fn} = await populateDynamicZone(item.${fn}, mongoose);`
    ).join('\n')}\n${indent}        return item;\n${indent}    })\n${indent});` : '';

const buildDynamicZoneCodeSingle = (fields, indent = '        ') =>
    fields.length ? `\n${fields.map(fn =>
        `${indent}if (baseDoc.${fn} && Array.isArray(baseDoc.${fn})) baseDoc.${fn} = await populateDynamicZone(baseDoc.${fn}, mongoose);`
    ).join('\n')}` : '';

// ─── Model Template ───────────────────────────────────────────────────────────

/**
 * For locale modules, the model template is handled entirely by modelTemplateNew
 * in templates.js (which checks hasLocale). This export is kept for compatibility
 * but delegates to the same logic.
 */
export const localeModelTemplate = null; // Use modelTemplateNew(data) directly

// ─── List Route (GET + POST) ──────────────────────────────────────────────────

export const localeListRouteTemplate = (data) => {
    const { pageName, category, under, sections } = data;
    const M = pageName.replace(/-/g, '_') + 'Schema';
    const modelPath = getModelPath(pageName, category, under);
    const dzFields = extractDynamicZoneFields(sections);
    const hasDZ = dzFields.length > 0;
    const dzImports = hasDZ ? `\nimport { populateDynamicZone } from "@/app/utils/db/populateDynamicZone.js";\nimport mongoose from "mongoose";` : '';
    const populateChain = buildPopulateChain(sections);
    const searchConds = buildSearchConditions(sections);
    const dzCode = buildDynamicZoneCode(dzFields);

    return `import ${M} from "${modelPath}";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler, ErrorHandler } from "@/app/utils/db/errorhandler";
import { isExistThenAdd } from "@/app/utils/db/validations.js";
import { DbValidator } from "@/app/utils/db/schema_validation/${pageName}.validation.js";
import { deleteImageIfError, getFileName } from "@/app/utils/db/upload_file.js";
import { buildAdvancedQuery } from "@/app/utils/usefullFunction/advancedQueryBuilder.js";
import { getFieldSelector } from "@/app/utils/db/fieldSelector";
import { NextResponse } from "next/server";${dzImports}

export const revalidate = 0;
export const dynamic = 'force-dynamic';
const FILE_PATH = "/file/${pageName}";

export async function GET(request) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        const { mongoQuery, regularQuery } = buildAdvancedQuery(searchParams);
        const { page = 1, limit = 25, input_data } = regularQuery;

        let que = { $or: [{ lang: "en" }, { lang: { $exists: false } }], ...mongoQuery };
        if (input_data) {
            const sc = { $or: [${searchConds}] };
            que.$and ? que.$and.push(sc) : (que = { ...que, ...sc });
        }

        const fieldSelector = getFieldSelector(searchParams);
        const totalDocs = await ${M}.find({ ...que }).countDocuments();
        let data = await ${M}.find({ ...que })
            .select(fieldSelector)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ sort: 1 })${populateChain}${hasDZ ? '\n            .lean()' : ''};
${dzCode}
        return NextResponse.json({ success: true, message: "Fetched Successfully", data, totalDocs }, { status: 200 });
    } catch (error) {
        return errorHandler(error);
    }
}

export async function POST(request) {
    const allUploadedImages = [];
    try {
        await dbConnect();
        const formData = await request.formData();
        const filesField = JSON.parse(formData.get("filesField") || "[]");
        const objectField = JSON.parse(formData.get("objectField") || "[]");
        const objToPush = {};
        const unsetToPush = {};

        await getFileName({ filesField, formData, objToPush, FILE_PATH, allUploadedImages });
        await isExistThenAdd({ objToPush, unsetToPush, formData, filesField, objectField });

        const lang = formData.get("locale") || "en";
        const rootId = formData.get("rootId");
        if (lang !== "en") {
            if (!rootId) throw new ErrorHandler("rootId is required for non-English translations", 400);
            const baseDoc = await ${M}.findById(rootId);
            if (!baseDoc) throw new ErrorHandler("Base English document not found", 404);
            objToPush.lang = lang;
            objToPush.rootId = rootId;
        } else {
            objToPush.lang = "en";
        }

        const is_DbValidator = await DbValidator(objToPush);
        if (is_DbValidator.is_error) {
            await deleteImageIfError(allUploadedImages);
            throw new ErrorHandler(is_DbValidator.message, is_DbValidator.statusCode);
        }

        await ${M}.create({ ...objToPush });
        return NextResponse.json({ success: true, message: "Created Successfully" }, { status: 201 });
    } catch (error) {
        await deleteImageIfError(allUploadedImages);
        return errorHandler(error);
    }
}
`;
};

// ─── [id] Route (GET + PUT + DELETE) ─────────────────────────────────────────

export const localeIdRouteTemplate = (data) => {
    const { pageName, category, under, sections } = data;
    const M = pageName.replace(/-/g, '_') + 'Schema';
    const modelPath = getModelPath(pageName, category, under);
    const paramName = `${pageName.replace(/-/g, '_')}_id`;
    const dzFields = extractDynamicZoneFields(sections);
    const hasDZ = dzFields.length > 0;
    const dzImports = hasDZ ? `\nimport { populateDynamicZone } from "@/app/utils/db/populateDynamicZone.js";\nimport mongoose from "mongoose";` : '';
    const populateChain = buildPopulateChain(sections);
    const sharedFields = JSON.stringify(extractSharedFields(sections));
    const dzCode = buildDynamicZoneCodeSingle(dzFields);

    return `import ${M} from "${modelPath}";
import { dbConnect } from "@/app/utils/db/connectDb";
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { DbValidator } from "@/app/utils/db/schema_validation/${pageName}.validation.js";
import { deleteImage, deleteImageIfError, deleteSelectedImages, getFileName } from "@/app/utils/db/upload_file.js";
import { isExistThenAdd } from "@/app/utils/db/validations.js";
import { syncLocaleFields } from "@/app/utils/db/syncLocaleFields.js";
import { NextResponse } from "next/server";${dzImports}

export const revalidate = 0;
export const dynamic = 'force-dynamic';
const FILE_PATH = "/file/${pageName}";
const SHARED_FIELDS = ${sharedFields};

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { ${paramName} } = await params;
        const lang = request.nextUrl.searchParams.get("lang") || "en";

        let baseDoc = await ${M}.findById(${paramName})${populateChain}${hasDZ ? '\n            .lean()' : ''};
        if (!baseDoc) throw new ErrorHandler("Data not found", 404);

        if (!baseDoc.lang) {
            await ${M}.findByIdAndUpdate(baseDoc._id, { $set: { lang: "en", rootId: baseDoc._id } });
            baseDoc.lang = "en";
            baseDoc.rootId = baseDoc._id;
        }
${dzCode}
        if (lang === "en") return NextResponse.json({ success: true, message: "Fetched Successfully", data: baseDoc });

        const rootId = baseDoc.rootId ?? baseDoc._id;
        let translation = await ${M}.findOne({ rootId, lang })${populateChain}${hasDZ ? '\n            .lean()' : ''};
        return NextResponse.json({ success: true, message: "Fetched Successfully", data: translation ?? baseDoc, isFallback: !translation });
    } catch (error) {
        return errorHandler(error);
    }
}

export async function PUT(request, { params }) {
    const allUploadedImages = [];
    try {
        await dbConnect();
        const { ${paramName} } = await params;
        const formData = await request.formData();
        const filesField = JSON.parse(formData.get("filesField") || "[]");
        const objectField = JSON.parse(formData.get("objectField") || "[]");
        const deleteMultyImages = JSON.parse(formData.get("deleteMultyImages") || "[]");
        const deleteSingleImageList = JSON.parse(formData.get("deleteSingleImageList") || "[]");
        const objToPush = {};
        const unsetToPush = {};

        await getFileName({ filesField, formData, objToPush, FILE_PATH, allUploadedImages });
        await isExistThenAdd({ objToPush, unsetToPush, formData, filesField, objectField });

        const is_DbValidator = await DbValidator(objToPush);
        if (is_DbValidator.is_error) {
            await deleteImageIfError(allUploadedImages);
            throw new ErrorHandler(is_DbValidator.message, is_DbValidator.statusCode);
        }

        const lang = formData.get("locale") || "en";
        let targetId = ${paramName};

        if (lang !== "en") {
            let baseDoc = await ${M}.findById(${paramName});
            if (!baseDoc) throw new ErrorHandler("Base document not found", 404);
            if (!baseDoc.lang) {
                await ${M}.findByIdAndUpdate(baseDoc._id, { $set: { lang: "en", rootId: baseDoc._id } });
                baseDoc.lang = "en";
                baseDoc.rootId = baseDoc._id;
            }
            const rootId = baseDoc.rootId ?? baseDoc._id;
            const translation = await ${M}.findOne({ rootId, lang });
            if (translation) {
                targetId = translation._id;
            } else {
                await ${M}.create({ ...objToPush, lang, rootId });
                return NextResponse.json({ success: true, message: "Translation Created Successfully" });
            }
        }

        const data = await ${M}.findByIdAndUpdate(targetId, { $set: objToPush, $unset: unsetToPush }, { new: true });
        if (!data) { await deleteImageIfError(allUploadedImages); throw new ErrorHandler("Data not found", 404); }

        await syncLocaleFields(${M}, targetId, objToPush, SHARED_FIELDS);
        await deleteSelectedImages(deleteMultyImages);
        await deleteImage(deleteSingleImageList);

        return NextResponse.json({ success: true, message: "Updated Successfully", data });
    } catch (error) {
        await deleteImageIfError(allUploadedImages);
        return errorHandler(error);
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { ${paramName} } = await params;
        const data = await ${M}.findByIdAndDelete(${paramName});
        if (!data) throw new ErrorHandler("Data not found", 404);
        return NextResponse.json({ success: true, message: "Deleted Successfully" });
    } catch (error) {
        return errorHandler(error);
    }
}
`;
};

// ─── Bulk Delete ──────────────────────────────────────────────────────────────

export const localeBulkDeleteTemplate = (data) => {
    const { pageName, category, under } = data;
    const M = pageName.replace(/-/g, '_') + 'Schema';
    const modelPath = getModelPath(pageName, category, under);
    return `import ${M} from "${modelPath}";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function DELETE(request) {
    try {
        await dbConnect();
        const { ids } = await request.json();
        if (!ids || !Array.isArray(ids) || ids.length === 0)
            return NextResponse.json({ success: false, message: "No IDs provided" }, { status: 400 });

        const baseDocs = await ${M}.find({ _id: { $in: ids } }).select("_id rootId").lean();
        const rootIds = baseDocs.map(d => d.rootId ?? d._id);
        const result = await ${M}.deleteMany({ $or: [{ _id: { $in: ids } }, { rootId: { $in: rootIds } }] });

        return NextResponse.json({ success: true, message: \`Deleted \${result.deletedCount} items (including translations)\`, deletedCount: result.deletedCount }, { status: 200 });
    } catch (error) {
        return errorHandler(error);
    }
}
`;
};

// ─── Excel ────────────────────────────────────────────────────────────────────

export const localeExcelTemplate = (data) => {
    const { pageName, category, under, sections } = data;
    const M = pageName.replace(/-/g, '_') + 'Schema';
    const modelPath = getModelPath(pageName, category, under);
    const populateChain = buildPopulateChain(sections);
    const searchConds = buildSearchConditions(sections);

    return `import ${M} from "${modelPath}";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";
import { buildAdvancedQuery } from "@/app/utils/usefullFunction/advancedQueryBuilder.js";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const { mongoQuery, regularQuery } = buildAdvancedQuery(searchParams);
        const { input_data } = regularQuery;

        let que = { $or: [{ lang: "en" }, { lang: { $exists: false } }], ...mongoQuery };
        if (input_data) {
            const sc = { $or: [${searchConds}] };
            que.$and ? que.$and.push(sc) : (que = { ...que, ...sc });
        }

        await dbConnect();
        let data = await ${M}.find(que)
            .select("-_id -updatedAt -__v -lang -rootId")
            .sort({ sort: 1 })${populateChain}
            .lean();

        let KeyArray = [];
        data = data.map((ele, i) => { if (i === 0) KeyArray = Object.keys(ele); return { ...ele }; });

        return NextResponse.json({ success: true, message: "Fetched Successfully", excelData: data, KeyArray, fileName: "${pageName}-list" });
    } catch (error) {
        return errorHandler(error);
    }
}
`;
};

// ─── Selectbox ────────────────────────────────────────────────────────────────

export const localeSelectboxTemplate = (data) => {
    const { pageName, category, under, sections } = data;
    const M = pageName.replace(/-/g, '_') + 'Schema';
    const modelPath = getModelPath(pageName, category, under);
    const selectFields = buildSelectFields(sections);
    const searchConds = buildSelectboxSearchConditions(sections);

    return `import ${M} from "${modelPath}";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { buildAdvancedQuery } from "@/app/utils/usefullFunction/advancedQueryBuilder.js";
import { NextResponse } from "next/server";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        const { mongoQuery } = buildAdvancedQuery(searchParams);
        const lang = searchParams.get("lang") || "en";
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 50;
        const search = searchParams.get("search") || "";

        const query = {  $or: [{ lang }, { lang: { $exists: false } }], ...mongoQuery };
        if (search) query.$or = [${searchConds}];

        const totalCount = await ${M}.countDocuments(query);
        const data = await ${M}.find(query)
            .select("${selectFields}")
            .sort({ sort: -1, name: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return NextResponse.json({ success: true, message: "Fetched Successfully", data, pagination: { page, limit, totalCount, totalPages: Math.ceil(totalCount / limit), hasMore: page * limit < totalCount } });
    } catch (error) {
        return errorHandler(error);
    }
}
`;
};

// ─── Set / isActive ───────────────────────────────────────────────────────────

export const localeSetIsActiveTemplate = (data) => {
    const { pageName, category, under } = data;
    const M = pageName.replace(/-/g, '_') + 'Schema';
    const modelPath = getModelPath(pageName, category, under);
    return `import ${M} from "${modelPath}";
import { dbConnect } from "@/app/utils/db/connectDb";
import { NextResponse } from "next/server";
import { errorHandler } from "@/app/utils/db/errorhandler";
import mongoose from "mongoose";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function PUT(req) {
    try {
        await dbConnect();
        const { object_ids, isActive } = await req.json();
        const ids = (Array.isArray(object_ids) ? object_ids : [object_ids]).map(id => new mongoose.Types.ObjectId(id));
        const baseDocs = await ${M}.find({ _id: { $in: ids } }).select("_id rootId").lean();
        const rootIds = baseDocs.map(d => d.rootId ?? d._id);
        const result = await ${M}.updateMany(
            { $or: [{ _id: { $in: ids } }, { rootId: { $in: rootIds } }] },
            { $set: { isActive } }
        );
        return NextResponse.json({ success: true, message: isActive ? "Activated successfully" : "Deactivated successfully", updatedCount: result.modifiedCount });
    } catch (error) {
        return errorHandler(error);
    }
}
`;
};

// ─── Set / Sort ───────────────────────────────────────────────────────────────

export const localeSetSortTemplate = (data) => {
    const { pageName, category, under } = data;
    const M = pageName.replace(/-/g, '_') + 'Schema';
    const modelPath = getModelPath(pageName, category, under);
    return `import ${M} from "${modelPath}";
import { dbConnect } from "@/app/utils/db/connectDb";
import { NextResponse } from "next/server";
import { errorHandler } from "@/app/utils/db/errorhandler";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function PUT(req) {
    try {
        await dbConnect();
        const { updates, sortData } = await req.json();
        const dataToUpdate = updates || sortData;
        if (!dataToUpdate || !Array.isArray(dataToUpdate))
            return NextResponse.json({ success: false, message: "Invalid data format." }, { status: 400 });

        await Promise.all(dataToUpdate.map(async (item) => {
            const id = item._id || item.id;
            const baseDoc = await ${M}.findById(id).select("_id rootId").lean();
            if (!baseDoc) return;
            const rootId = baseDoc.rootId ?? baseDoc._id;
            return ${M}.updateMany({ $or: [{ _id: id }, { rootId }] }, { $set: { sort: item.sort } });
        }));

        return NextResponse.json({ success: true, message: "Sort order updated (all translations synced)" });
    } catch (error) {
        return errorHandler(error);
    }
}
`;
};

// ─── Single-Type Route (GET + PUT) ───────────────────────────────────────────

export const localeSingleTypeRouteTemplate = (data) => {
    const { pageName, category, under, sections } = data;
    const M = pageName.replace(/-/g, '_') + 'Schema';
    const modelPath = getModelPath(pageName, category, under);
    const populateChain = buildPopulateChain(sections);

    return `import ${M} from "${modelPath}";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler, ErrorHandler } from "@/app/utils/db/errorhandler";
import { isExistThenAdd } from "@/app/utils/db/validations.js";
import { DbValidator } from "@/app/utils/db/schema_validation/${pageName}.validation.js";
import { deleteImageIfError, getFileName } from "@/app/utils/db/upload_file.js";
import { getFieldSelector } from "@/app/utils/db/fieldSelector";
import { NextResponse } from "next/server";

export const revalidate = 0;
export const dynamic = 'force-dynamic';
const FILE_PATH = "/file/${pageName}";

async function getBaseDoc(fieldSelector) {
    let base = await ${M}
        .findOne({ $or: [{ lang: "en" }, { lang: { $exists: false } }] })
        .select(fieldSelector)${populateChain};
    if (!base) return null;
    if (!base.lang) {
        await ${M}.findByIdAndUpdate(base._id, { $set: { lang: "en", rootId: base._id } });
        base.lang = "en";
        base.rootId = base._id;
    }
    return base;
}

export async function GET(request) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        const lang = searchParams.get("lang") || "en";
        const fieldSelector = getFieldSelector(searchParams);
        const base = await getBaseDoc(fieldSelector);
        if (!base) return NextResponse.json({ success: true, message: "Fetched Successfully", data: {} }, { status: 200 });
        if (lang === "en") return NextResponse.json({ success: true, message: "Fetched Successfully", data: base }, { status: 200 });
        const rootId = base.rootId ?? base._id;
        const translation = await ${M}.findOne({ rootId, lang }).select(fieldSelector)${populateChain};
        return NextResponse.json({ success: true, message: "Fetched Successfully", data: translation ?? base, isFallback: !translation }, { status: 200 });
    } catch (error) {
        return errorHandler(error);
    }
}

export async function PUT(request) {
    const allUploadedImages = [];
    try {
        await dbConnect();
        const formData = await request.formData();
        const filesField = JSON.parse(formData.get("filesField") || "[]");
        const objectField = JSON.parse(formData.get("objectField") || "[]");
        const lang = formData.get("locale") || "en";
        const objToPush = {};
        const unsetToPush = {};

        await getFileName({ filesField, formData, objToPush, FILE_PATH, allUploadedImages });
        await isExistThenAdd({ objToPush, unsetToPush, formData, filesField, objectField });

        const is_DbValidator = await DbValidator(objToPush);
        if (is_DbValidator.is_error) {
            await deleteImageIfError(allUploadedImages);
            throw new ErrorHandler(is_DbValidator.message, is_DbValidator.statusCode);
        }

        const baseRecord = await getBaseDoc(null);

        if (lang === "en") {
            if (baseRecord) {
                await ${M}.findByIdAndUpdate(
                    baseRecord._id,
                    { $set: { ...objToPush, lang: "en", rootId: baseRecord._id }, ...(Object.keys(unsetToPush).length > 0 ? { $unset: unsetToPush } : {}) },
                    { new: true, runValidators: true }
                );
                return NextResponse.json({ success: true, message: "Updated Successfully" }, { status: 200 });
            } else {
                await ${M}.create({ ...objToPush, lang: "en" });
                return NextResponse.json({ success: true, message: "Created Successfully" }, { status: 201 });
            }
        }

        if (!baseRecord) throw new ErrorHandler("Save the English version first before adding translations.", 400);
        const rootId = baseRecord.rootId ?? baseRecord._id;
        const translation = await ${M}.findOne({ rootId, lang });
        if (translation) {
            await ${M}.findByIdAndUpdate(
                translation._id,
                { $set: objToPush, ...(Object.keys(unsetToPush).length > 0 ? { $unset: unsetToPush } : {}) },
                { new: true }
            );
            return NextResponse.json({ success: true, message: "Translation Updated Successfully" }, { status: 200 });
        } else {
            await ${M}.create({ ...objToPush, lang, rootId });
            return NextResponse.json({ success: true, message: "Translation Created Successfully" }, { status: 201 });
        }
    } catch (error) {
        await deleteImageIfError(allUploadedImages);
        return errorHandler(error);
    }
}
`;
};
