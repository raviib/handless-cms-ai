// Updated templates using new component-based field system
// Removes old types: tab, object, select-box, multi-select-box, file, checkbox, switchbox
// Uses new types: component, relation, media, boolean, enumeration

export const modelTemplateNew = (data) => {
  const { name, pageName, category, sections, showSEO, locales } = data;
  const hasLocale = locales && locales.length > 1;

  const generateSchemaFields = (sections) => {
    let schemaLines = [];

    const generateFieldDefinition = (field, indentation = "        ") => {
      const lines = [];
      const fieldName = field.field?.value || field.field;
      let required = field.required === "true" || field.required === true;
      
      // Handle connectwith - it can be a string or an object with pageName property
      const connectwith = field.connectwith;
      const hasConnect = connectwith && (typeof connectwith === "string" || (typeof connectwith === "object" && connectwith.pageName));
      const refModel = typeof connectwith === "string" ? connectwith : connectwith?.pageName;

      // Handle component type (replaces old tab/object)
      if (field.type === 'component') {
        if (field.component_type === 'repeatable') {
          // Repeatable component - array of objects
          lines.push(`${indentation}${fieldName}: [{`);
          if (field.fields && field.fields.length > 0) {
            field.fields.forEach(nestedField => {
              lines.push(...generateFieldDefinition(nestedField, indentation + "    "));
            });
          }
          lines.push(`${indentation}}],`);
        } else {
          // Single component - nested object
          lines.push(`${indentation}${fieldName}: {`);
          if (field.fields && field.fields.length > 0) {
            field.fields.forEach(nestedField => {
              lines.push(...generateFieldDefinition(nestedField, indentation + "    "));
            });
          }
          lines.push(`${indentation}},`);
        }
        return lines;
      }

      // Handle dynamic-zone type - array of mixed objects
      if (field.type === 'dynamic-zone') {
        lines.push(`${indentation}${fieldName}: [{`);
        lines.push(`${indentation}    type: Schema.Types.Mixed`);
        lines.push(`${indentation}}],`);
        return lines;
      }

      const getAdditionalOptions = (field, indent) => {
        const optLines = [];
        // When locale is enabled, unique fields get compound {field, lang} indexes instead
        if (!hasLocale && (field.unique === true || field.unique === "true")) optLines.push(`${indent}    unique: true,`);
        if (field.index === true || field.index === "true") optLines.push(`${indent}    index: true,`);
        if (field.sparse === true || field.sparse === "true") optLines.push(`${indent}    sparse: true,`);
        if (field.trim === true || field.trim === "true") optLines.push(`${indent}    trim: true,`);
        if (field.lowercase === true || field.lowercase === "true") optLines.push(`${indent}    lowercase: true,`);
        if (field.uppercase === true || field.uppercase === "true") optLines.push(`${indent}    uppercase: true,`);

        if (field.default_value !== undefined && field.default_value !== "" && field.default_value !== null) {
          let val = field.default_value;
          // Handle arrays (for enumeration multiple)
          if (Array.isArray(val)) {
            val = JSON.stringify(val);
          } else if (val === "true") {
            val = true;
          } else if (val === "false") {
            val = false;
          } else if (val !== null && !isNaN(val) && String(val).trim() !== "") {
            val = Number(val);
          } else {
            val = `"${val}"`;
          }
          optLines.push(`${indent}    default: ${val},`);
        }

        if (field.match_regex) {
          optLines.push(`${indent}    match: [/${field.match_regex}/, "Invalid format for ${fieldName}"],`);
        }
        return optLines;
      };

      // Handle relation type (replaces select-box/multi-select-box)
      // Check for both explicit relation type OR any field with connectwith
      if (hasConnect) {
        lines.push(`${indentation}${fieldName}: {`);
        if (field.isMultiple === true || field.isMultiple === "true") {
          lines.push(`${indentation}    type: [{ type: Schema.Types.ObjectId, ref: "${refModel}"${required ? ', required: true' : ''} }],`);
        } else {
          lines.push(`${indentation}    type: Schema.Types.ObjectId,`);
          lines.push(`${indentation}    ref: "${refModel}",`);
          if (required) lines.push(`${indentation}    required: true,`);
        }
        lines.push(...getAdditionalOptions(field, indentation));
        lines.push(`${indentation}},`);
        return lines;
      }

      // Determine mongoose type based on field type
      let type = "String";
      switch (field.type) {
        case 'number': 
          type = "Number"; 
          break;
        case 'boolean':
          type = "Boolean";
          break;
        case 'date': 
          type = "String"; 
          break;
        case 'media': 
          type = field.isMulti ? "[String]" : "String"; 
          break;
        case 'enumeration':
          type = field.enumeration_type === "multiple" ? "[String]" : "String";
          break;
        case 'json':
          type = "Schema.Types.Mixed";
          break;
        default: 
          type = "String";
      }

      lines.push(`${indentation}${fieldName}: {`);
      lines.push(`${indentation}    type: ${type},`);
      if (required) {
        lines.push(`${indentation}    required: true,`);
      }
      lines.push(...getAdditionalOptions(field, indentation));
      lines.push(`${indentation}},`);
      return lines;
    };

    // Process all fields
    sections.forEach(section => {
      section.fields.forEach(field => {
        schemaLines.push(...generateFieldDefinition(field));
      });
    });

    // Add default fields
    schemaLines.push(`        sort: {`);
    schemaLines.push(`            type: Number,`);
    schemaLines.push(`            default: -1`);
    schemaLines.push(`        },`);
    schemaLines.push(`        isActive: {`);
    schemaLines.push(`            type: Boolean,`);
    schemaLines.push(`            default: true`);
    schemaLines.push(`        }`);

    // Add SEO fields if showSEO is true
    if (showSEO) {
      schemaLines[schemaLines.length - 1] = schemaLines[schemaLines.length - 1].replace('}', '},');
      schemaLines.push(`        seo: {`);

      schemaLines.push(`            title: {`);
      schemaLines.push(`                type: String,`);
      schemaLines.push(`            },`);

      schemaLines.push(`            description: {`);
      schemaLines.push(`                type: String,`);
      schemaLines.push(`            },`);

      schemaLines.push(`            keywords: {`);
      schemaLines.push(`                type: String,`);
      schemaLines.push(`            },`);

      schemaLines.push(`            metaImage: {`);
      schemaLines.push(`                type: String,`);
      schemaLines.push(`            },`);

      schemaLines.push(`            openGraph: [{`);

      schemaLines.push(`                ogTitle: {`);
      schemaLines.push(`                    type: String,`);
      schemaLines.push(`                },`);

      schemaLines.push(`                ogDescription: {`);
      schemaLines.push(`                    type: String,`);
      schemaLines.push(`                },`);

      schemaLines.push(`                ogImage: {`);
      schemaLines.push(`                    type: String,`);
      schemaLines.push(`                },`);

      schemaLines.push(`                ogUrl: {`);
      schemaLines.push(`                    type: String,`);
      schemaLines.push(`                },`);

      schemaLines.push(`                ogType: {`);
      schemaLines.push(`                    type: String,`);
      schemaLines.push(`                },`);

      schemaLines.push(`            }],`);

      schemaLines.push(`            canonicalUrl: {`);
      schemaLines.push(`                type: String,`);
      schemaLines.push(`            },`);

      schemaLines.push(`            schemaMarkup: {`);
      schemaLines.push(`                type: Schema.Types.Mixed,`);
      schemaLines.push(`            },`);

      schemaLines.push(`        }`);

    }

    return schemaLines.join('\n');
  };

  const schemaFieldsString = generateSchemaFields(sections);

  // Collect unique fields to build locale-aware compound indexes
  const collectUniqueFields = (sections) => {
    const fields = [];
    const walk = (fieldList) => {
      fieldList.forEach(f => {
        if (f.unique === true || f.unique === 'true') {
          fields.push(f.field?.value || f.field);
        }
        if (f.fields?.length) walk(f.fields);
      });
    };
    sections.forEach(s => walk(s.fields || []));
    return fields;
  };

  const schemaVar = pageName.replace(/-/g, '_') + 'Schema';
  const localeImport = hasLocale ? `\nimport { localePlugin } from "@/app/utils/db/localePlugin";` : '';

  let localeBlock = '';
  if (hasLocale) {
    const uniqueFields = collectUniqueFields(sections);
    const compoundIndexes = uniqueFields
      .map(f => `${schemaVar}.index({ ${f}: 1, lang: 1 }, { unique: true });`)
      .join('\n');
    const dropIndexes = uniqueFields
      .map(f => `${schemaVar}Model.collection.dropIndex("${f}_1").catch(() => {});`)
      .join('\n');

    localeBlock = `
${schemaVar}.plugin(localePlugin);
${compoundIndexes ? '\n// Unique per language — same value allowed across translations\n' + compoundIndexes : ''}

const modelName = "${pageName}";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

const ${schemaVar}Model = models[modelName] || model("${pageName}", ${schemaVar});

export default ${schemaVar}Model;`;
  } else {
    localeBlock = `
const modelName = "${pageName}";
if (process.env.NODE_ENV !== 'production' && models[modelName]) {
  delete models[modelName];
}

export default models[modelName] || model("${pageName}", ${schemaVar});`;
  }

  return `import { Schema, model, models } from "mongoose";${localeImport}

const ${schemaVar} = new Schema(
  {
${schemaFieldsString}
  },
  {
    timestamps: true,
  }
);
${localeBlock}`;
};

// Helper function to extract searchable fields
const extractSearchableFields = (sections) => {
  const searchableFields = [];
  
  const processFields = (fields, prefix = '') => {
    fields.forEach(field => {
      const fieldName = field.field?.value || field.field;
      const fullPath = prefix ? `${prefix}.${fieldName}` : fieldName;
      
      if (field.type === 'component') {
        // Recursively process component fields
        if (field.fields && field.fields.length > 0) {
          if (field.component_type === 'repeatable') {
            // For repeatable, we can't easily search nested arrays in MongoDB
            // Skip or handle differently
          } else {
            processFields(field.fields, fullPath);
          }
        }
      } else if (field.type === 'text' || field.type === 'textarea' || field.type === 'email' || field.type === 'url') {
        searchableFields.push(fullPath);
      }
    });
  };
  
  sections.forEach(section => {
    processFields(section.fields);
  });
  
  return searchableFields;
};

// Helper function to extract populate fields for relations (only first level)
const extractPopulateFields = (sections, onlyTableFields = false) => {
  const populateFields = [];
  
  if (!sections || !Array.isArray(sections)) {
    return populateFields;
  }
  
  sections.forEach(section => {
    if (section.fields && Array.isArray(section.fields)) {
      section.fields.forEach(field => {
        const fieldName = field.field?.value || field.field;
        
        // Only process first-level relation fields (not nested in components)
        if (field.type === 'relation' && field.connectwith) {
          // Only add if not filtering by table, or if it should show in table
          if (!onlyTableFields) {
            const selectFields = [];
            if (field.getOptionLabel) selectFields.push(field.getOptionLabel);
            if (field.getOptionValue) selectFields.push(field.getOptionValue);
            
            // Add default fields if none specified
            if (selectFields.length === 0) {
              selectFields.push('name', 'displayName', '_id');
            }
            
            populateFields.push({
              path: fieldName,
              select: selectFields.join(' ')
            });
          }
        }
      });
    }
  });
  
  return populateFields;
};

// Helper function to extract dynamic zone field names
const extractDynamicZoneFields = (sections) => {
  const dynamicZoneFields = [];
  
  if (!sections || !Array.isArray(sections)) {
    return dynamicZoneFields;
  }
  
  sections.forEach(section => {
    if (section.fields && Array.isArray(section.fields)) {
      section.fields.forEach(field => {
        if (field.type === 'dynamic-zone') {
          const fieldName = field.field?.value || field.field;
          dynamicZoneFields.push(fieldName);
        }
      });
    }
  });
  
  return dynamicZoneFields;
};

export const apiRouteTemplateNew = (data) => {
  const { pageName, category, under, sections, locales } = data;
  const hasLocale = locales && locales.length > 1;
  const modelName = pageName.replace(/-/g, '_') + 'Schema';

  const includeCategory = category && category !== "none";
  const modelPath = includeCategory
    ? `@/app/(backend)/models/${under}/(${category})/${pageName}/${pageName}.modal.js`
    : `@/app/(backend)/models/${under}/${pageName}/${pageName}.modal.js`;

  const searchableFields = extractSearchableFields(sections);
  const searchConditions = searchableFields.map(field =>
    `                {\n                   "${field}": { $regex: input_data, $options: "i" },\n                }`
  ).join(',\n');

  const populateFieldsForList = extractPopulateFields(sections);
  let populateChainForList = '';
  if (populateFieldsForList.length > 0) {
    populateChainForList = populateFieldsForList.map(field =>
      `\n            .populate({ path: "${field.path}", select: "${field.select}" })`
    ).join('');
  }

  const dynamicZoneFields = extractDynamicZoneFields(sections);
  const hasDynamicZones = dynamicZoneFields.length > 0;

  let dynamicZonePopulationCode = '';
  if (hasDynamicZones) {
    dynamicZonePopulationCode = `
        // Populate dynamic zone relations
        data = await Promise.all(
            data.map(async (item) => {
${dynamicZoneFields.map(fieldName =>
`                if (item.${fieldName} && Array.isArray(item.${fieldName})) {
                    item.${fieldName} = await populateDynamicZone(item.${fieldName}, mongoose);
                }`
).join('\n')}
                return item;
            })
        );`;
  }

  // Locale-aware GET: filter to base (en) docs only in list view
  const listQuery = hasLocale
    ? `let que = { $or: [{ lang: "en" }, { lang: { $exists: false } }], ...mongoQuery };`
    : `let que = { ...mongoQuery };`;

  // Locale-aware POST: set lang/rootId
  const postLocaleBlock = hasLocale ? `
        // Handle locale
        const lang = formData.get("locale") || "en";
        const rootId = formData.get("rootId");
        if (lang !== "en") {
            if (!rootId) throw new ErrorHandler("rootId is required for non-English translations", 400);
            const baseDoc = await ${modelName}.findById(rootId);
            if (!baseDoc) throw new ErrorHandler("Base English document not found", 404);
            objToPush.lang = lang;
            objToPush.rootId = rootId;
        } else {
            objToPush.lang = "en";
        }
` : '';

  return `import ${modelName} from "${modelPath}";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler, ErrorHandler } from "@/app/utils/db/errorhandler";
import { isExistThenAdd, isrequired } from "@/app/utils/db/validations.js";
import { DbValidator } from "@/app/utils/db/schema_validation/${pageName}.validation.js";
import { deleteImageIfError, getFileName } from "@/app/utils/db/upload_file.js";
import { buildAdvancedQuery } from "@/app/utils/usefullFunction/advancedQueryBuilder.js";
import { getFieldSelector } from "@/app/utils/db/fieldSelector";
import { NextResponse } from "next/server";${hasDynamicZones ? `
import { populateDynamicZone } from "@/app/utils/db/populateDynamicZone.js";
import mongoose from "mongoose";` : ''}


export const revalidate = 0;
export const dynamic = 'force-dynamic';

const FILE_PATH = "/file/${pageName}";

export async function GET(request) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;

        const { mongoQuery, regularQuery } = buildAdvancedQuery(searchParams);

        const {
            page = 1,
            limit = 25,
            input_data,
        } = regularQuery;

        ${listQuery}

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

        const fieldSelector = getFieldSelector(searchParams);

        const totalDocs = await ${modelName}.find({ ...que }).countDocuments();
        let data = await ${modelName}.find({ ...que })
            .select(fieldSelector)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ sort: 1 })${populateChainForList}${hasDynamicZones ? '\n            .lean()' : ''};
${dynamicZonePopulationCode}

        return NextResponse.json({
            success: true,
            message: "Fetched Successfully",
            data: data,
            totalDocs: totalDocs
        }, {
            status: 200
        });
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
${postLocaleBlock}
        const is_DbValidator = await DbValidator(objToPush);
        if (is_DbValidator.is_error) {
            await deleteImageIfError(allUploadedImages);
            throw new ErrorHandler(is_DbValidator.message, is_DbValidator.statusCode);
        }

        await ${modelName}.create({ ...objToPush });

        return NextResponse.json({
            success: true,
            message: "Created Successfully",
        }, {
            status: 201,
        });
    } catch (error) {
        await deleteImageIfError(allUploadedImages);
        return errorHandler(error);
    }
}
`;
};

export const apiSingleTypeRouteTemplateNew = (data) => {
  const { pageName, category, under, sections } = data;
  const modelName = pageName.replace(/-/g, '_') + 'Schema';

  // Build the model path
  const includeCategory = category && category !== "none";
  const modelPath = includeCategory
    ? `@/app/(backend)/models/${under}/(${category})/${pageName}/${pageName}.modal.js`
    : `@/app/(backend)/models/${under}/${pageName}/${pageName}.modal.js`;

  // Extract populate fields
  const populateFields = extractPopulateFields(sections, false);
  
  let populateChain = '';
  if (populateFields.length > 0) {
    populateChain = populateFields.map(field =>
      `\n            .populate({ path: "${field.path}", select: "${field.select}" })`
    ).join('');
  }

  return `import ${modelName} from "${modelPath}";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler, ErrorHandler } from "@/app/utils/db/errorhandler";
import { isExistThenAdd, isrequired } from "@/app/utils/db/validations.js";
import { DbValidator } from "@/app/utils/db/schema_validation/${pageName}.validation.js";
import { deleteImageIfError, getFileName } from "@/app/utils/db/upload_file.js";
import { getFieldSelector } from "@/app/utils/db/fieldSelector";
import { NextResponse } from "next/server";


export const revalidate = 0;
export const dynamic = 'force-dynamic';

const FILE_PATH = "/file/${pageName}";

export async function GET(request) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        
        // Get field selector from query params
        const fieldSelector = getFieldSelector(searchParams);

        let data = await ${modelName}.findOne()
            .select(fieldSelector)${populateChain}; // Populate all reference fields

        if (!data) {
            data = {};
        }

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


export async function PUT(request) {
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

        // Add validation based on DB schema
        const is_DbValidator = await DbValidator(objToPush);
        if (is_DbValidator.is_error) {
            await deleteImageIfError(allUploadedImages);
            throw new ErrorHandler(is_DbValidator.message, is_DbValidator.statusCode);
        }

        // Find the first record or create if doesn't exist
        let record = await ${modelName}.findOne();

        if (record) {
            await ${modelName}.findByIdAndUpdate(
                record._id,
                { ...objToPush, ...(Object.keys(unsetToPush).length > 0 ? { $unset: unsetToPush } : {}) },
                { new: true, runValidators: true }
            );

            return NextResponse.json({
                success: true,
                message: "Updated Successfully",
            }, {
                status: 200,
            });
        } else {
            // Create new record if none exists
            await ${modelName}.create({ ...objToPush });
            return NextResponse.json({
                success: true,
                message: "Update Successfully",
            }, {
                status: 201,
            });
        }
    } catch (error) {
        await deleteImageIfError(allUploadedImages);
        return errorHandler(error);
    }
}
`;
};

// Bulk delete route template
export const apiBulkDeleteRouteTemplate = (data) => {
  const { pageName, category, under } = data;
  const modelName = pageName.replace(/-/g, '_') + 'Schema';

  // Build the model path based on whether category exists
  const includeCategory = category && category !== "none";
  const modelPath = includeCategory
    ? `@/app/(backend)/models/${under}/(${category})/${pageName}/${pageName}.modal.js`
    : `@/app/(backend)/models/${under}/${pageName}/${pageName}.modal.js`;

  return `import ${modelName} from "${modelPath}";
import { dbConnect } from "@/app/utils/db/connectDb";
import { errorHandler } from "@/app/utils/db/errorhandler";
import { NextResponse } from "next/server";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function DELETE(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({
                success: false,
                message: "No IDs provided for deletion"
            }, {
                status: 400
            });
        }

        // Delete multiple documents
        const result = await ${modelName}.deleteMany({
            _id: { $in: ids }
        });

        return NextResponse.json({
            success: true,
            message: \`Successfully deleted \${result.deletedCount} items\`,
            deletedCount: result.deletedCount
        }, {
            status: 200
        });
    } catch (error) {
        return errorHandler(error);
    }
}
`;
};
