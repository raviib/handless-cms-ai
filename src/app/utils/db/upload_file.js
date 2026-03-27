
import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
const pump = promisify(pipeline);
const dirname = __dirname;
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
const uploadFile = async (file, path) => {
    try {
        // const mimeTypeRegex = /^image\/(jpeg|png|gif|webp|svg)$/i;
        // // checking file type validaion
        // if (!mimeTypeRegex.test(file.type)) {
        //     throw new ErrorHandler("only upload jpg,jpeg,png,gif,webp,svg file.", 400)
        // }
        // let fileSizeLimit = 1024 * 1024 * 3; // Default limit: 3 MB
        // // Set file size limit based on the field name
        // if (file.size >= fileSizeLimit) {
        //     throw new ErrorHandler("max file size is 3 MB.", 400)
        // }

        const file_name = file.name.split(" ").join("_");
        const filePath = `${path}/${new Date().getTime()}_${file_name}`;
        await pump(file.stream(), fs.createWriteStream(`./public${filePath}`));
        return filePath;

    } catch (error) {
        throw new ErrorHandler(error)
    }
};
const deleteImageByPath = async (filepath) => {
    try {

        // const absolutePath = path.resolve(filepath);
        // if (fs.existsSync(`./public${filepath}`)) {
        //     fs.unlink(`./public${filepath}`, (err) => {
        //         if (err) {
        //             console.error('Error deleting file:', err);
        //         }
        //     });
        // }
    } catch (error) {
        throw new ErrorHandler(error)
    }
};
const deleteImage = async (data, image_his = []) => {
    try {
        for (const field_name of image_his) {
            // Support both . and # as path delimiters for nested structures
            const parts = field_name.split(/[.#]/)
            let file_path;

            if (parts.length > 1) {
                let current = data;
                for (let i = 0; i < parts.length; i++) {
                    const p = parts[i];
                    if (current && current[p] !== undefined) {
                        current = current[p];
                    } else {
                        current = undefined;
                        break;
                    }
                }
                file_path = current;
            } else {
                file_path = data[field_name]
            }

            if (Array.isArray(file_path)) {
                for (const field_name of file_path) {
                    await deleteImageByPath(field_name)
                }
            } else {
                await deleteImageByPath(file_path)
            }
        }
    } catch (error) {
        throw new ErrorHandler(error)
    }
}
const deleteSelectedImages = async (image_list) => {
    try {

        for (const key in image_list) {
            if (Object.prototype.hasOwnProperty.call(image_list, key)) {
                const data = image_list[key];
                const { remove } = data;

                await deleteImageIfError(remove)
            }
        }
    } catch (error) {
        throw new ErrorHandler(error)
    }
}
const deleteImageIfError = async (image_his = []) => {
    try {
        for (const field_name of image_his) {
            await deleteImageByPath(field_name)
        }
    } catch (error) {
        throw new ErrorHandler(error)
    }
}
const getFileName = async ({ filesField, formData, objToPush, FILE_PATH, image_his = [], allUploadedImages = [] }) => {
    try {
        for (const imageFiled of filesField) {
            const file = formData.getAll(imageFiled)[0];
            if (file) {
                const fileName = await uploadFile(file, FILE_PATH)
                allUploadedImages.push(fileName)
                
                // Handle nested paths (e.g., "accreditations.information#0.image")
                const parts = imageFiled.split(/[.#]/);
                if (parts.length > 1) {
                    let current = objToPush;
                    for (let i = 0; i < parts.length - 1; i++) {
                        const part = parts[i];
                        const nextPart = parts[i + 1];
                        const isNextNumeric = !isNaN(nextPart) && !isNaN(parseFloat(nextPart));

                        if (!current[part] || typeof current[part] !== 'object') {
                            current[part] = isNextNumeric ? [] : {};
                        }
                        current = current[part];
                    }
                    current[parts[parts.length - 1]] = fileName;
                } else {
                    // Simple field
                    objToPush[imageFiled] = fileName;
                }
                
                image_his.push(imageFiled);
            }
        }
    } catch (error) {
        console.error("Error in getFileName:", error);
    }
}


export { uploadFile, deleteImageByPath, getFileName, deleteImage, deleteImageIfError, deleteSelectedImages }