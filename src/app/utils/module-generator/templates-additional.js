// Additional API route templates for module generator

// Helper function to extract populate fields for relations
// Detects relations by connectwith (same logic as model template)
const extractPopulateFields = (sections) => {
    const populateFields = [];

    const processFields = (fields, prefix = '') => {
        fields.forEach(field => {
            const fieldName = field.field?.value || field.field;
            const fullPath = prefix ? `${prefix}.${fieldName}` : fieldName;

            if (field.type === 'component') {
                if (field.fields && field.fields.length > 0) {
                    processFields(field.fields, fullPath);
                }
            } else if (field.connectwith) {
                // Any field with connectwith is a relation (matches model template logic)
                const selectFields = [];
                if (field.getOptionLabel) selectFields.push(field.getOptionLabel);
                if (field.getOptionValue) selectFields.push(field.getOptionValue);
                if (selectFields.length === 0) selectFields.push('name', 'displayName', '_id');

                populateFields.push({
                    path: fullPath,
                    select: selectFields.join(' ')
                });
            }
        });
    };

    sections.forEach(section => {
        processFields(section.fields);
    });

    return populateFields;
};

// Helper function to extract searchable fields
const extractSearchableFields = (sections) => {
    const searchableFields = [];

    const processFields = (fields, prefix = '') => {
        fields.forEach(field => {
            const fieldName = field.field?.value || field.field;
            const fullPath = prefix ? `${prefix}.${fieldName}` : fieldName;

            if (field.type === 'component') {
                if (field.fields && field.fields.length > 0 && field.component_type !== 'repeatable') {
                    processFields(field.fields, fullPath);
                }
            } else if (['text', 'textarea', 'email', 'url'].includes(field.type)) {
                searchableFields.push(fullPath);
            }
        });
    };

    sections.forEach(section => {
        processFields(section.fields);
    });

    return searchableFields;
};

// Helper function to extract dynamic zone field names
const extractDynamicZoneFields = (sections) => {
    const dynamicZoneFields = [];
    if (!sections || !Array.isArray(sections)) return dynamicZoneFields;

    sections.forEach(section => {
        if (section.fields && Array.isArray(section.fields)) {
            section.fields.forEach(field => {
                if (field.type === 'dynamic-zone') {
                    dynamicZoneFields.push(field.field?.value || field.field);
                }
            });
        }
    });

    return dynamicZoneFields;
};

export const apiIdRouteTemplate = (data) => {
    const { pageName, category, under, sections } = data;
    const modelName = pageName.replace(/-/g, '_') + 'Schema';
    const includeCategory = category && category !== "none";
    const modelPath = includeCategory
        ? `@/app/(backend)/models/${under}/(${category})/${pageName}/${pageName}.modal.js`
        : `@/app/(backend)/models/${under}/${pageName}/${pageName}.modal.js`;
    const paramName = `${pageName.replace(/-/g, '_')}_id`;

    const populateFields = extractPopulateFields(sections);
    let populateChain = '';
    if (populateFields.length > 0) {
        populateChain = populateFields.map(field =>
            `\n            .populate({ path: "${field.path}", select: "${field.select}" })`
        ).join('');
    }

    const dynamicZoneFields = extractDynamicZoneFields(sections);
    const hasDynamicZones = dynamicZoneFields.length > 0;

    let dynamicZonePopulationCode = '';
    if (hasDynamicZones) {
        dynamicZonePopulationCode = `\n        // Populate dynamic zone relations\n` +
            dynamicZoneFields.map(fieldName =>
`        if (data.${fieldName} && Array.isArray(data.${fieldName})) {
            data.${fieldName} = await populateDynamicZone(data.${fieldName}, mongoose);
        }`
            ).join('\n');
    }

    return `import ${modelName} from "${modelPath}";
import { dbConnect } from "@/app/utils/db/connectDb";
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import { DbValidator } from "@/app/utils/db/schema_validation/${pageName}.validation.js";
import { deleteImage, deleteImageIfError, deleteSelectedImages, getFileName } from "@/app/utils/db/upload_file.js";
import { isExistThenAdd, isrequired } from "@/app/utils/db/validations.js";
import { NextResponse } from "next/server";${hasDynamicZones ? `
import { populateDynamicZone } from "@/app/utils/db/populateDynamicZone.js";
import mongoose from "mongoose";` : ''}


export const revalidate = 0;
export const dynamic = 'force-dynamic';

const FILE_PATH = "/file/${pageName}";

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { ${paramName} } = await params;
        let data = await ${modelName}.findById(${paramName})${populateChain}${hasDynamicZones ? '\n            .lean()' : ''};

        if (!data) {
            throw new ErrorHandler("Data not found", 404);
        }
${dynamicZonePopulationCode}

        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: data
        });
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

        const data = await ${modelName}.findByIdAndUpdate(
            ${paramName},
            { $set: objToPush, $unset: unsetToPush },
            { new: true }
        );

        if (!data) {
            await deleteImageIfError(allUploadedImages);
            throw new ErrorHandler("Data not found", 404);
        }

        await deleteSelectedImages(deleteMultyImages);
        await deleteImage(deleteSingleImageList);

        return NextResponse.json({
            success: true,
            message: "Updated Successfully",
            data: data
        });
    } catch (error) {
        await deleteImageIfError(allUploadedImages);
        return errorHandler(error);
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { ${paramName} } = await params;
        const data = await ${modelName}.findByIdAndDelete(${paramName});

        if (!data) {
            throw new ErrorHandler("Data not found", 404);
        }

        return NextResponse.json({
            success: true,
            message: "Deleted Successfully"
        });
    } catch (error) {
        return errorHandler(error);
    }
}
`;
};

export const apiExcelRouteTemplate = (data) => {
    const { pageName, category, under, sections } = data;
    const modelName = pageName.replace(/-/g, '_') + 'Schema';
    const includeCategory = category && category !== "none";
    const modelPath = includeCategory
        ? `@/app/(backend)/models/${under}/(${category})/${pageName}/${pageName}.modal.js`
        : `@/app/(backend)/models/${under}/${pageName}/${pageName}.modal.js`;

    const searchableFields = extractSearchableFields(sections);
    const searchConditions = searchableFields.map(field =>
        `        {\n          "${field}": { $regex: input_data, $options: "i" },\n        }`
    ).join(',\n');

    const populateFields = extractPopulateFields(sections);
    let populateChain = '';
    if (populateFields.length > 0) {
        populateChain = populateFields.map(field =>
            `\n      .populate({ path: "${field.path}", select: "${field.select}" })`
        ).join('');
    }

    return `import ${modelName} from "${modelPath}";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";
import { buildAdvancedQuery } from "@/app/utils/usefullFunction/advancedQueryBuilder.js"

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const { mongoQuery, regularQuery } = buildAdvancedQuery(searchParams);
    const { input_data } = regularQuery;

    let que = { ...mongoQuery };

    if (input_data) {
      const searchCondition = {
        $or: [
${searchConditions || '          { displayName: { $regex: input_data, $options: "i" } }'}
        ]
      };
      if (que.$and) {
        que.$and.push(searchCondition);
      } else {
        que = { ...que, ...searchCondition };
      }
    }

    await dbConnect();
    let data = await ${modelName}.find({ ...que })
      .select("-_id -updatedAt -__v")
      .sort({ sort: 1 })${populateChain}
      .lean();

    let KeyArray = [];
    data = data.map((ele, index) => {
      if (index === 0) KeyArray = Object.keys(ele);
      return { ...ele };
    });

    return NextResponse.json({
      success: true,
      message: "Fetched Successfully",
      excelData: data,
      KeyArray: KeyArray,
      fileName: \`${pageName}-list\`
    });
  } catch (error) {
    return errorHandler(error);
  }
}
`;
};

export const apiSelectboxRouteTemplate = (data) => {
    const { pageName, category, under, sections } = data;
    const modelName = pageName.replace(/-/g, '_') + 'Schema';
    const includeCategory = category && category !== "none";
    const modelPath = includeCategory
        ? `@/app/(backend)/models/${under}/(${category})/${pageName}/${pageName}.modal.js`
        : `@/app/(backend)/models/${under}/${pageName}/${pageName}.modal.js`;

    const textFields = [];
    if (sections && sections.length > 0) {
        sections.forEach(section => {
            if (section.fields && Array.isArray(section.fields)) {
                section.fields.forEach(field => {
                    const fieldName = field.field?.value || field.field;
                    if (field.type === 'text' && fieldName) textFields.push(fieldName);
                });
            }
        });
    }

    const selectFields = ['_id'];
    if (!textFields.includes('displayName')) selectFields.push('displayName');
    selectFields.push(...textFields);
    const uniqueFields = [...new Set(selectFields)];
    const selectString = uniqueFields.join(' ');

    const searchFields = ['name', 'displayName', ...textFields].filter((v, i, a) => a.indexOf(v) === i);
    const searchConditions = searchFields.map(field =>
        `                { ${field}: { $regex: search, $options: 'i' } }`
    ).join(',\n');

    return `import ${modelName} from "${modelPath}";
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

        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;
        const search = searchParams.get('search') || '';

        const query = {  ...mongoQuery };

        if (search) {
            query.$or = [
${searchConditions}
            ];
        }

        const totalCount = await ${modelName}.countDocuments(query);
        const data = await ${modelName}.find(query)
          .select("${selectString}")
          .sort({ sort: -1, name: 1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: data,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasMore: page * limit < totalCount
            }
        });
    } catch (error) {
        return errorHandler(error);
    }
}
`;
};

export const apiSetIsActiveRouteTemplate = (data) => {
    const { pageName, category, under } = data;
    const modelName = pageName.replace(/-/g, '_') + 'Schema';
    const includeCategory = category && category !== "none";
    const modelPath = includeCategory
        ? `@/app/(backend)/models/${under}/(${category})/${pageName}/${pageName}.modal.js`
        : `@/app/(backend)/models/${under}/${pageName}/${pageName}.modal.js`;

    return `import ${modelName} from "${modelPath}";
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
        const ids = Array.isArray(object_ids) ? object_ids : [object_ids];

        const result = await ${modelName}.updateMany(
            { _id: { $in: ids.map(id => new mongoose.Types.ObjectId(id)) } },
            { $set: { isActive } }
        );

        return NextResponse.json({
            success: true,
            message: isActive ? "Activated successfully" : "Deactivated successfully",
            updatedCount: result.modifiedCount
        });
    } catch (error) {
        return errorHandler(error);
    }
}
`;
};

export const apiSetSortRouteTemplate = (data) => {
    const { pageName, category, under } = data;
    const modelName = pageName.replace(/-/g, '_') + 'Schema';
    const includeCategory = category && category !== "none";
    const modelPath = includeCategory
        ? `@/app/(backend)/models/${under}/(${category})/${pageName}/${pageName}.modal.js`
        : `@/app/(backend)/models/${under}/${pageName}/${pageName}.modal.js`;

    return `import ${modelName} from "${modelPath}";
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

        if (!dataToUpdate || !Array.isArray(dataToUpdate)) {
            return NextResponse.json({
                success: false,
                message: "Invalid data format. Expected array of updates.",
            }, { status: 400 });
        }

        await Promise.all(
            dataToUpdate.map(item =>
                ${modelName}.findByIdAndUpdate(item._id || item.id, { sort: item.sort })
            )
        );

        return NextResponse.json({
            success: true,
            message: "Sort order updated successfully",
        });
    } catch (error) {
        return errorHandler(error);
    }
}
`;
};

// V1 API GET Template (for single type endpoints)
export const apiV1GetRouteTemplate = (data) => {
    const { pageName, category, under, sections } = data;
    const modelName = pageName.replace(/-/g, '_') + 'Schema';
    const includeCategory = category && category !== "none";

    const populateFields = extractPopulateFields(sections);
    let populateChain = '';
    if (populateFields.length > 0) {
        populateChain = populateFields.map(field =>
            `\n            .populate({ path: "${field.path}", match: { isActive: true } })`
        ).join('');
    }

    const dynamicZoneFields = extractDynamicZoneFields(sections);
    const hasDynamicZones = dynamicZoneFields.length > 0;

    const dynamicZoneImports = hasDynamicZones
        ? `import { populateDynamicZone } from "@/app/utils/db/populateDynamicZone.js";\nimport mongoose from "mongoose";\n`
        : '';

    const dynamicZoneCode = hasDynamicZones
        ? `\n\n        // Populate dynamic zone relations\n` +
          dynamicZoneFields.map(fieldName =>
`        if (data.${fieldName} && Array.isArray(data.${fieldName})) {
            data.${fieldName} = await populateDynamicZone(data.${fieldName}, mongoose);
        }`
          ).join('\n')
        : '';

    const leanChain = hasDynamicZones ? '\n            .lean()' : '';

    return `import ${modelName} from "@/app/(backend)/models/${under}${includeCategory ? '/(' + category + ')' : ''}/${pageName}/${pageName}.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
${dynamicZoneImports}import { NextResponse } from "next/server";
import { getFieldSelector } from "@/app/utils/db/fieldSelector";
export const revalidate = 60;

export async function GET(request) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        const lang = searchParams.get("lang") || "en";
        const fieldSelector = getFieldSelector(searchParams);

        // Fetch the base English document
        let data = await ${modelName}
            .findOne({ $or: [{ lang: "en" }, { lang: { $exists: false } }] })
            .select(fieldSelector)${populateChain}${leanChain};

        if (!data) {
            return NextResponse.json({ success: true, message: "Fetched Successfully", data: {} }, { status: 200 });
        }

        // If a non-English locale is requested, try to find the translation
        if (lang !== "en") {
            const rootId = data.rootId ?? data._id;
            const translation = await ${modelName}
                .findOne({ rootId, lang })
                .select(fieldSelector)${populateChain}${leanChain};

            if (translation) {
                data = translation;
            }
            // else fall through and return the English base as fallback
        }
${dynamicZoneCode}
        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: data
        }, {
            status: 200
        });
    } catch (error) {
        return errorHandler(error);
    }
}
`;
};

// V1 API Multi-Type GET Template (for listing endpoints)
export const apiV1MultiTypeGetRouteTemplate = (data) => {
    const { pageName, category, under, sections } = data;
    const modelName = pageName.replace(/-/g, '_') + 'Schema';
    const includeCategory = category && category !== "none";

    const searchableFields = extractSearchableFields(sections);
    const searchConditions = searchableFields.map(field =>
        `                {\n                   "${field}": { $regex: input_data, $options: "i" },\n                }`
    ).join(',\n');

    // Populate ALL relation fields in v1 API
    const populateFieldsForList = extractPopulateFields(sections);
    let populateChainForList = '';
    if (populateFieldsForList.length > 0) {
        populateChainForList = populateFieldsForList.map(field =>
            `\n            .populate({ path: "${field.path}", match: { isActive: true } })`
        ).join('');
    }

    const dynamicZoneFields = extractDynamicZoneFields(sections);
    const hasDynamicZones = dynamicZoneFields.length > 0;

    const dynamicZoneImports = hasDynamicZones
        ? `import { populateDynamicZone } from "@/app/utils/db/populateDynamicZone.js";\nimport mongoose from "mongoose";\n`
        : '';

    const dynamicZoneCode = hasDynamicZones
        ? `\n\n        // Populate dynamic zone relations\n        for (const item of data) {\n` +
          dynamicZoneFields.map(fieldName =>
`            if (item.${fieldName} && Array.isArray(item.${fieldName})) {
                item.${fieldName} = await populateDynamicZone(item.${fieldName}, mongoose);
            }`
          ).join('\n') + '\n        }'
        : '';

    const leanChain = hasDynamicZones ? '\n            .lean()' : '';

    return `import ${modelName} from "@/app/(backend)/models/${under}${includeCategory ? '/(' + category + ')' : ''}/${pageName}/${pageName}.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { buildAdvancedQuery } from "@/app/utils/usefullFunction/advancedQueryBuilder.js";
${dynamicZoneImports}import { NextResponse } from "next/server";
import { getFieldSelector } from "@/app/utils/db/fieldSelector";
export const revalidate = 60;

export async function GET(request) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        const fieldSelector = getFieldSelector(searchParams);
        const lang = searchParams.get("lang") || "en";
        const { mongoQuery, regularQuery } = buildAdvancedQuery(searchParams);

        const {
            page = 1,
            limit = 25,
            input_data,
        } = regularQuery;

        // Filter by lang: match exact lang OR fall back to English docs that have no translation
        let que = {
            isActive: true,
            $or: [{ lang }, { lang: { $exists: false } }],
            ...mongoQuery,
        };

        // If requesting a non-English lang, prefer translated docs but exclude
        // English-only docs that already have a translation in the requested lang
        if (lang !== "en") {
            const translatedRootIds = await ${modelName}
                .find({ lang, isActive: true })
                .distinct("rootId");
            que = {
                isActive: true,
                $or: [
                    { lang },
                    { $and: [{ $or: [{ lang: "en" }, { lang: { $exists: false } }] }, { _id: { $nin: translatedRootIds } }] },
                ],
                ...mongoQuery,
            };
        }

        if (input_data) {
            const searchCondition = {
                $or: [
${searchConditions || '                    { name: { $regex: input_data, $options: "i" } }'}
                ]
            };
            if (que.$and) {
                que.$and.push(searchCondition);
            } else {
                que = { ...que, ...searchCondition };
            }
        }

        const totalDocs = await ${modelName}.find({ ...que }).countDocuments();
        const totalPages = Math.ceil(totalDocs / limit);
        const data = await ${modelName}.find({ ...que }).select(fieldSelector)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ sort: 1 })${populateChainForList}${leanChain};${dynamicZoneCode}

        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: data,
            pagination: {
                totalDocs,
                totalPages,
                currentPage: page,
                limit,
            },
        }, {
            status: 200
        });
    } catch (error) {
        return errorHandler(error);
    }
}
`;
};
