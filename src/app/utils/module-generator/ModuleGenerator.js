import fs from 'fs';
import path from 'path';
import { modelTemplateNew, apiRouteTemplateNew, apiSingleTypeRouteTemplateNew, apiBulkDeleteRouteTemplate } from './templates.js';
import { apiIdRouteTemplate, apiExcelRouteTemplate, apiSelectboxRouteTemplate, apiSetIsActiveRouteTemplate, apiSetSortRouteTemplate, apiV1GetRouteTemplate, apiV1MultiTypeGetRouteTemplate } from './templates-additional.js';
import {
    localeListRouteTemplate, localeIdRouteTemplate, localeBulkDeleteTemplate,
    localeExcelTemplate, localeSelectboxTemplate, localeSetIsActiveTemplate,
    localeSetSortTemplate, localeSingleTypeRouteTemplate
} from './locale-templates.js';
import { updateModelIndex } from './model-indexer.js';
import { addModelToAllModels } from './delete-module.js';

export const generateModule = async (data, options = {}) => {
    const rootDir = process.cwd();
    const { pageName, category = "none", under = "none", detailPage = true } = data;
    const { updateOnly = false, regenerateV1 = false } = options;
    const hasLocale = data.locales && data.locales.length > 1;

    try {
       const publicDir = path.join(rootDir, 'public');
        // Check if file folder exists in public, if not create it
        const imagesDir = path.join(publicDir, 'file');
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }
        
        // Create folder with pageName inside public/file
        const pageFileDir = path.join(imagesDir, pageName);
        if (!fs.existsSync(pageFileDir)) {
            fs.mkdirSync(pageFileDir, { recursive: true });
            console.log(`✅ Created file directory at ${pageFileDir}`);
        }
        
        // Create dummy.txt file inside the pageName folder
        const dummyFilePath = path.join(pageFileDir, 'dummy.txt');
        if (!fs.existsSync(dummyFilePath)) {
            fs.writeFileSync(dummyFilePath, 'dummy file');
            console.log(`✅ Created dummy.txt file at ${dummyFilePath}`);
        }

        // Determine if we should include category in the path
        const includeCategory = category && category !== "none";
        // Wrap category in parentheses for Next.js route groups
        const categoryFolder = includeCategory ? `(${category})` : null;

        // 1. Generate Model (skip if updateOnly and it's a single type)
        const modelPathParts = [rootDir, 'src', 'app', '(backend)', 'models', under];
        if (categoryFolder) modelPathParts.push(categoryFolder);
        modelPathParts.push(pageName);

        const modelDir = path.join(...modelPathParts);
        const isSingleType = detailPage === false || detailPage === "false";
        
        if (!updateOnly || isSingleType) {
            if (!fs.existsSync(modelDir)) fs.mkdirSync(modelDir, { recursive: true });
            // Pass locales so modelTemplateNew can add localePlugin when needed
            fs.writeFileSync(path.join(modelDir, `${pageName}.modal.js`), modelTemplateNew(data));
            console.log(`✅ Created Model at ${modelDir}`);
        }
        // 2. Generate API Routes
        const apiPathParts = [rootDir, 'src', 'app', '(backend)', 'api', under];
        if (categoryFolder) apiPathParts.push(categoryFolder);
        apiPathParts.push(pageName);

        const apiDir = path.join(...apiPathParts);
        if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });

        // Check if this is a single-type (detailPage is false)
        if (isSingleType) {
            const singleTypeContent = hasLocale
                ? localeSingleTypeRouteTemplate(data)
                : apiSingleTypeRouteTemplateNew(data);
            fs.writeFileSync(path.join(apiDir, 'route.js'), singleTypeContent);
            console.log(`✅ ${updateOnly ? 'Updated' : 'Created'} Single-Type API Route at ${apiDir}/route.js`);
        } else {
            // Main route.js
            const listRouteContent = hasLocale
                ? localeListRouteTemplate(data)
                : apiRouteTemplateNew(data);
            fs.writeFileSync(path.join(apiDir, 'route.js'), listRouteContent);
            console.log(`✅ Created API Route at ${apiDir}/route.js`);

            // [id] route
            const idParamName = `[${pageName.replace(/-/g, '_')}_id]`;
            const idDir = path.join(apiDir, idParamName);
            if (!fs.existsSync(idDir)) fs.mkdirSync(idDir, { recursive: true });
            const idRouteContent = hasLocale
                ? localeIdRouteTemplate(data)
                : apiIdRouteTemplate(data);
            fs.writeFileSync(path.join(idDir, 'route.js'), idRouteContent);
            console.log(`✅ Created [ID] Route at ${idDir}/route.js`);

            // excel route
            const excelDir = path.join(apiDir, 'excel');
            if (!fs.existsSync(excelDir)) fs.mkdirSync(excelDir, { recursive: true });
            const excelContent = hasLocale
                ? localeExcelTemplate(data)
                : apiExcelRouteTemplate(data);
            fs.writeFileSync(path.join(excelDir, 'route.js'), excelContent);
            console.log(`✅ Created Excel Route at ${excelDir}/route.js`);

            // selectbox route
            const selectboxDir = path.join(apiDir, 'selectbox');
            if (!fs.existsSync(selectboxDir)) fs.mkdirSync(selectboxDir, { recursive: true });
            const selectboxContent = hasLocale
                ? localeSelectboxTemplate(data)
                : apiSelectboxRouteTemplate(data);
            fs.writeFileSync(path.join(selectboxDir, 'route.js'), selectboxContent);
            console.log(`✅ Created Selectbox Route at ${selectboxDir}/route.js`);

            // set/isactive route
            const setIsActiveDir = path.join(apiDir, 'set', 'isactive');
            if (!fs.existsSync(setIsActiveDir)) fs.mkdirSync(setIsActiveDir, { recursive: true });
            const isActiveContent = hasLocale
                ? localeSetIsActiveTemplate(data)
                : apiSetIsActiveRouteTemplate(data);
            fs.writeFileSync(path.join(setIsActiveDir, 'route.js'), isActiveContent);
            console.log(`✅ Created Set/IsActive Route at ${setIsActiveDir}/route.js`);

            // set/sort route
            const setSortDir = path.join(apiDir, 'set', 'sort');
            if (!fs.existsSync(setSortDir)) fs.mkdirSync(setSortDir, { recursive: true });
            const sortContent = hasLocale
                ? localeSetSortTemplate(data)
                : apiSetSortRouteTemplate(data);
            fs.writeFileSync(path.join(setSortDir, 'route.js'), sortContent);
            console.log(`✅ Created Set/Sort Route at ${setSortDir}/route.js`);

            // bulk-delete route
            const bulkDeleteDir = path.join(apiDir, 'bulk-delete');
            if (!fs.existsSync(bulkDeleteDir)) fs.mkdirSync(bulkDeleteDir, { recursive: true });
            const bulkDeleteContent = hasLocale
                ? localeBulkDeleteTemplate(data)
                : apiBulkDeleteRouteTemplate(data);
            fs.writeFileSync(path.join(bulkDeleteDir, 'route.js'), bulkDeleteContent);
            console.log(`✅ Created Bulk Delete Route at ${bulkDeleteDir}/route.js`);
        }

        // Create V1 API GET endpoint (for all module types) - only if file doesn't exist
        const v1ApiPathParts = [rootDir, 'src', 'app', '(backend)', 'v1', 'api', under];
        if (categoryFolder) v1ApiPathParts.push(categoryFolder);
        v1ApiPathParts.push(pageName);

        const v1ApiDir = path.join(...v1ApiPathParts);
        const v1ApiRouteFilePath = path.join(v1ApiDir, 'route.js');
        
        if (!fs.existsSync(v1ApiRouteFilePath) || regenerateV1) {
            if (!fs.existsSync(v1ApiDir)) fs.mkdirSync(v1ApiDir, { recursive: true });
            
            if (isSingleType) {
                // Single Type: Read-only GET endpoint
                fs.writeFileSync(v1ApiRouteFilePath, apiV1GetRouteTemplate(data));
                console.log(`✅ Created V1 API Single-Type GET Route at ${v1ApiDir}/route.js`);
            } else {
                // Multi Type: List GET endpoint with pagination and search
                fs.writeFileSync(v1ApiRouteFilePath, apiV1MultiTypeGetRouteTemplate(data));
                console.log(`✅ Created V1 API Multi-Type GET Route at ${v1ApiDir}/route.js`);
            }
        } else {
            console.log(`⏭️ V1 API route.js already exists at ${v1ApiDir}/route.js - skipping creation`);
        }

        // 3. Create Validation File
        const validationDir = path.join(rootDir, 'src', 'app', 'utils', 'db', 'schema_validation');
        if (!fs.existsSync(validationDir)) {
            fs.mkdirSync(validationDir, { recursive: true });
        }
        
        const validationFileName = `${pageName}.validation.js`;
        const validationFilePath = path.join(validationDir, validationFileName);
        
        // Only create validation file if it doesn't exist
        if (!fs.existsSync(validationFilePath)) {
            const validationTemplate = `export const DbValidator = async (data) => {
    let message = ""
    let is_error = false;
    let statusCode = 403;
    // for (let fields in data) {

    // }


    return {
        message,
        is_error,
        statusCode
    }

};`;
            fs.writeFileSync(validationFilePath, validationTemplate);
            console.log(`✅ Created Validation File at ${validationFilePath}`);
        }

        // 4. Update Model Index (skip if updateOnly for single type)
        if (!updateOnly || isSingleType) {
            updateModelIndex();
        }

        // 5. Add model to allModels.js (skip if updateOnly for single type)
        if (!updateOnly || isSingleType) {
            addModelToAllModels(pageName, under, category);
        }


        console.log('\n🎉 Module generation completed successfully!');
        console.log(`📦 Generated module: ${pageName}`);
        console.log(`📁 Location: ${under}${includeCategory ? '/' + category : ''}/${pageName}`);
        console.log(`📋 Type: ${isSingleType ? 'Single Type (No Detail Page)' : 'List Type (With Detail Pages)'}`);
        if (updateOnly && isSingleType) {
            console.log(`🔄 Update Mode: Only API route was updated`);
        }

        return { success: true, message: 'Module generated successfully' };
    } catch (error) {
        console.error('❌ Error generating module:', error);
        return { success: false, message: error.message };
    }
};
