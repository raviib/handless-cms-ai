import fs from 'fs';
import path from 'path';

const updateAllModelsFile = (pageName, under, category, isDelete = true) => {
    const rootDir = process.cwd();
    const allModelsPath = path.join(rootDir, 'src', 'app', 'utils', 'db', 'allModels.js');
    
    if (!fs.existsSync(allModelsPath)) {
        console.log('⚠️ allModels.js not found');
        return;
    }

    const includeCategory = category && category !== "none";
    // Wrap category in parentheses for Next.js route groups
    const modelImportPath = includeCategory
        ? `@/app/(backend)/models/${under}/(${category})/${pageName}/${pageName}.modal.js`
        : `@/app/(backend)/models/${under}/${pageName}/${pageName}.modal.js`;

    let content = fs.readFileSync(allModelsPath, 'utf8');
    const importLine = `import "${modelImportPath}";`;

    if (isDelete) {
        // Remove the import line
        content = content.replace(new RegExp(`^import "${modelImportPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}";?\n?`, 'gm'), '');
        console.log(`✅ Removed model import from allModels.js: ${modelImportPath}`);
    } else {
        // Add the import line if it doesn't exist
        if (!content.includes(importLine)) {
            // Find the last import line and add after it
            const lines = content.split('\n');
            let lastImportIndex = -1;
            
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().startsWith('import ') && lines[i].includes('.modal.js')) {
                    lastImportIndex = i;
                }
            }
            
            if (lastImportIndex !== -1) {
                lines.splice(lastImportIndex + 1, 0, importLine);
                content = lines.join('\n');
                console.log(`✅ Added model import to allModels.js: ${modelImportPath}`);
            }
        }
    }

    fs.writeFileSync(allModelsPath, content);
};

export const deleteModule = async (data) => {
    const { pageName, under, category = "none" } = data;

    if (!pageName || !under) {
        throw new Error('pageName and under are required parameters');
    }

    const rootDir = process.cwd();
    const includeCategory = category && category !== "none";
    const categoryFolder = includeCategory ? `(${category})` : null;
    const deletedPaths = [];

    try {
        // 1. Delete Model
        const modelPathParts = [rootDir, 'src', 'app', '(backend)', 'models', under];
        if (categoryFolder) modelPathParts.push(categoryFolder);
        modelPathParts.push(pageName);
        const modelDir = path.join(...modelPathParts);

        if (fs.existsSync(modelDir)) {
            fs.rmSync(modelDir, { recursive: true, force: true });
            deletedPaths.push(`Model: ${modelDir}`);
            console.log(`✅ Deleted Model at ${modelDir}`);
            
            // Update allModels.js to remove the import
            updateAllModelsFile(pageName, under, category, true);
        } else {
            console.log(`⚠️ Model directory not found at ${modelDir}`);
        }

        // 2. Delete API Routes (only generated files, preserve custom files)
        const apiPathParts = [rootDir, 'src', 'app', '(backend)', 'api', under];
        if (categoryFolder) apiPathParts.push(categoryFolder);
        apiPathParts.push(pageName);
        const apiDir = path.join(...apiPathParts);

        if (fs.existsSync(apiDir)) {
            // List of exact generated files to delete (not entire folders)
            const idParamName = `[${pageName.replace(/-/g, '_')}_id]`;
            const generatedFiles = [
                'route.js',
                `${idParamName}/route.js`,
                'excel/route.js',
                'selectbox/route.js',
                'set/isactive/route.js',
                'set/sort/route.js',
                'bulk-delete/route.js'
            ];

            let deletedCount = 0;
            generatedFiles.forEach(file => {
                const filePath = path.join(apiDir, file);
                if (fs.existsSync(filePath)) {
                    fs.rmSync(filePath, { force: true });
                    deletedPaths.push(`API: ${filePath}`);
                    deletedCount++;
                    console.log(`✅ Deleted ${file}`);
                }
            });

            // Clean up empty directories after file deletion
            const foldersToCheck = [
                `${idParamName}`,
                'excel',
                'selectbox',
                'set/isactive',
                'set/sort',
                'set',
                'bulk-delete'
            ];

            foldersToCheck.forEach(folder => {
                const folderPath = path.join(apiDir, folder);
                if (fs.existsSync(folderPath)) {
                    try {
                        const files = fs.readdirSync(folderPath);
                        if (files.length === 0) {
                            fs.rmdirSync(folderPath);
                            console.log(`✅ Removed empty folder: ${folder}`);
                        } else {
                            console.log(`ℹ️ Preserved folder with custom files: ${folder} (${files.join(', ')})`);
                        }
                    } catch (err) {
                        // Folder might not exist or already deleted
                    }
                }
            });

            // Check if main directory is empty after cleanup
            if (fs.existsSync(apiDir)) {
                const remainingFiles = fs.readdirSync(apiDir);
                if (remainingFiles.length === 0) {
                    fs.rmSync(apiDir, { recursive: true, force: true });
                    console.log(`✅ Deleted empty API directory at ${apiDir}`);
                } else {
                    console.log(`ℹ️ Preserved custom files in ${apiDir}: ${remainingFiles.join(', ')}`);
                }
            }

            if (deletedCount > 0) {
                deletedPaths.push(`API Routes: ${apiDir} (${deletedCount} generated files)`);
            }
        } else {
            console.log(`⚠️ API directory not found at ${apiDir}`);
        }

        // 3. Delete Images (Optional, but good to clean up)
        // const imagesDir = path.join(rootDir, 'public', 'images', pageName);
        // if (fs.existsSync(imagesDir)) {
        //     fs.rmSync(imagesDir, { recursive: true, force: true });
        //     deletedPaths.push(`Images: ${imagesDir}`);
        //     console.log(`✅ Deleted Images at ${imagesDir}`);
        // }

        console.log('\n🎉 Module deletion completed!');
        return { 
            success: true, 
            message: 'Module deleted successfully',
            deletedPaths 
        };
    } catch (error) {
        console.error('❌ Error deleting module:', error);
        return { 
            success: false, 
            message: error.message,
            deletedPaths 
        };
    }
};

export const addModelToAllModels = (pageName, under, category = "none") => {
    updateAllModelsFile(pageName, under, category, false);
};

// CLI usage (when run directly)
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    const params = {};

    args.forEach(arg => {
        const [key, value] = arg.split('=');
        if (key.startsWith('--')) {
            params[key.slice(2)] = value;
        }
    });

    const { pageName, under, category = "none" } = await params;

    if (!pageName || !under) {
        console.error('❌ Please provide --pageName and --under arguments');
        console.log('Usage: node src/app/utils/module-generator/delete-module.js --pageName=name --under=section [--category=cat]');
        process.exit(1);
    }

    deleteModule({ pageName, under, category })
        .then(result => {
            if (!result.success) {
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}

// node src/app/utils/module-generator/delete-module.js --pageName=tab-testing  --under=cms  --category=media
