import { isStringifiedArray } from "@/app/utils/usefullFunction/usedFunction";

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
function validatePhone_no(Phone_no) {
    return typeof Phone_no === "number"
}

function validateUrl(url) {
    const urlRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:-(?!-)[a-z0-9]+)*\/?$/i;
    return urlRegex.test(url)
}
function validatePageSlug(url) {
    const pattern = /^(?!-)[a-zA-Z-]+$/;
    return pattern.test(url);
}
function Url_Validation_falield(url) {
    if (!url) {
        return "URL cannot be empty";
    }
    if (url.length > 255) {
        return "URL length exceeds the maximum allowed (255 characters)";
    }

    if (url.match(/[^a-z0-9-]/i)) {
        return "URL cannot contain special characters except hyphen (-)"
    }
    if (url.match(/--/)) {
        return "URL cannot contain consecutive hyphens (--)"
    }
    return "URL format is invalid";
}

function slug_validation(url) {
    const pattern = /^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/;
    return pattern.test(url)
}

const isrequired = (data) => {

    let message = ""
    let is_error = false;
    let statusCode = 403;
    for (let fields in data) {
        if (!data[fields]) {
            message = `${fields} is required`;
            is_error = true;
            break;
        }
        if (fields === "email") {
            if (!validateEmail(data[fields])) {
                message = `email is invalid `;
                is_error = true;
                break;
            }
        }
        if (fields === "url") {
            if (!validateUrl(data[fields])) {
                message = Url_Validation_falield(data[fields]);;
                is_error = true;
                break;
            }
        }
        if (fields === "Page_refrance") {
            if (!slug_validation(data[fields])) {
                message = `Invalid ${fields}`
                is_error = true;
                break;
            }
        }
    }


    return {
        message,
        is_error,
        statusCode
    }

};
const validFields = async (data) => {
    let message = ""
    let is_error = false;
    let statusCode = 403;
    for (let fields in data) {
        if (fields === "email") {
            if (!validateEmail(data[fields])) {
                message = `email is invalid `;
                is_error = true;
                break;
            }
        }
        if (fields === "url") {
            if (!validateUrl(data[fields])) {
                message = Url_Validation_falield(data[fields]);;
                is_error = true;
                break;
            }
        }
        if (fields === "phone_no") {
            if (!validatePhone_no(data[fields])) {
                message = `phone_no is not a valid data type`;
                is_error = true;
                break;
            }
        }
    }


    return {
        message,
        is_error,
        statusCode
    }

};
const cleanEmptyStrings = (obj) => {
    if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
            if (item && typeof item === 'object') {
                cleanEmptyStrings(item);
            }
            else if (item === "") obj[index] = null;
        });
    } else if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
            if (obj[key] && typeof obj[key] === 'object') {
                cleanEmptyStrings(obj[key]);
            }
            else if (obj[key] === "") obj[key] = null;
        });
    }
};

const deepMerge = (target, source) => {
    // If source is not an object or is null, return target (or source if target is also null)
    if (!source || typeof source !== 'object') return source !== undefined ? source : target;
    if (!target || typeof target !== 'object') return source;

    if (Array.isArray(target) && Array.isArray(source)) {
        const maxLength = Math.max(target.length, source.length);
        const mergedArray = [];
        for (let i = 0; i < maxLength; i++) {
            const tVal = target[i];
            const sVal = source[i];

            // Logic for merging array elements:
            if (sVal === undefined || sVal === null || sVal === "" || (typeof sVal === 'object' && Object.keys(sVal).length === 0)) {
                mergedArray[i] = tVal;
            } else if (tVal === undefined || tVal === null || tVal === "" || (typeof tVal === 'object' && Object.keys(tVal).length === 0)) {
                mergedArray[i] = sVal;
            } else if (typeof tVal === 'object' && typeof sVal === 'object') {
                mergedArray[i] = deepMerge(tVal, sVal);
            } else {
                mergedArray[i] = sVal; // Default to source
            }
        }
        return mergedArray;
    }

    Object.keys(source).forEach(key => {
        const sVal = source[key];
        const tVal = target[key];

        if (sVal && typeof sVal === 'object' && tVal && typeof tVal === 'object') {
            target[key] = deepMerge(tVal, sVal);
        } else if (sVal !== undefined && sVal !== null && sVal !== "" && !(typeof sVal === 'object' && Object.keys(sVal).length === 0)) {
            target[key] = sVal;
        }
    });

    return target;
};

const isExistThenAdd = async ({ objToPush = {}, unsetToPush = {}, formData = {}, filesField = [], objectField = [] }) => {
    for (const [key, value] of formData.entries()) {

        // skip all files fields
        if (filesField.includes(key)) {
            // Only process if we actually have a value (file path) for this key
            if (objToPush[key] === undefined) {
                delete objToPush[key];
                continue;
            }

            // Support both . and # as path delimiters for multi-level nesting (e.g. tab#0#image)
            const parts = key.split(/[.#]/);
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
                current[parts[parts.length - 1]] = objToPush[key];
                delete objToPush[key];
            }
            continue;
        }

        if (key === "filesField" || key === "objectField" || key === "deleteMultyImages" || key === "deleteSingleImageList") {
            continue;
        }

        // if filed is non-primitive data types then we need to convert this into parse object
        if (objectField.includes(key)) {
            const parsedValue = JSON.parse(value);
            objToPush[key] = deepMerge(parsedValue, objToPush[key]);
            continue;
        }

        if (["seo.og_image", "seo.twitter_og_image"].includes(key)) {
            continue;
        }

        // field is empty then unset in db
        if (!value || value === "null") {
            unsetToPush[key] = ""
            continue;
        }
        // for normal type push into object
        if (value === "false") {
            objToPush[key] = false;
            continue;
        }
        if (value === "true") {
            objToPush[key] = true;
            continue;
        }

        if (isStringifiedArray(value)) {
            const parsedValue = JSON.parse(value);
            objToPush[key] = deepMerge(parsedValue, objToPush[key]);
            continue;
        }
        if (value.startsWith("/image")) {
            continue;
        }
        objToPush[key] = value;
    }

    // Final pass to resolve internal path conflicts in objToPush (e.g. 'a' and 'a.b')
    // We move any dotted/hashed keys into their parent objects if those parents also exist as root keys
    const rootKeys = Object.keys(objToPush);
    for (const key of rootKeys) {
        if (key.includes('.') || key.includes('#')) {
            const parts = key.split(/[.#]/);
            let current = objToPush;
            let currentPath = "";

            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                currentPath = currentPath ? `${currentPath}.${part}` : part;

                const nextPart = parts[i + 1];
                const isNextNumeric = !isNaN(nextPart) && !isNaN(parseFloat(nextPart));

                if (!current[part] || typeof current[part] !== 'object') {
                    current[part] = isNextNumeric ? [] : {};
                }
                current = current[part];
            }

            const lastPart = parts[parts.length - 1];
            // Merge or assign the value
            if (current[lastPart] && typeof current[lastPart] === 'object' && typeof objToPush[key] === 'object') {
                if (Array.isArray(current[lastPart]) && Array.isArray(objToPush[key])) {
                    // Specific case for arrays: we might want to merge indices, but for now simple overwrite is safer than conflict
                    current[lastPart] = objToPush[key];
                } else {
                    Object.assign(current[lastPart], objToPush[key]);
                }
            } else {
                current[lastPart] = objToPush[key];
            }
            delete objToPush[key];
        }
    }

    // Final pass to resolve conflicts between $set and $unset
    const updatedSetKeys = Object.keys(objToPush);
    const unsetKeys = Object.keys(unsetToPush);
    for (const setKey of updatedSetKeys) {
        for (const unsetKey of unsetKeys) {
            if (unsetKey.startsWith(`${setKey}.`) || unsetKey.startsWith(`${setKey}#`) ||
                setKey.startsWith(`${unsetKey}.`) || setKey.startsWith(`${unsetKey}#`) ||
                setKey === unsetKey) {
                delete unsetToPush[unsetKey];
            }
        }
    }

    // Final pass to clean up empty strings that cause Mongoose CastErrors for ObjectIds
    cleanEmptyStrings(objToPush);
};
function checkFileType(mimeType, accept_type) {
    if (!accept_type) return true; // If no restriction, allow all
    
    // Map of common extensions to MIME types
    const mimeTypeMap = {
        // Images
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',
        'bmp': 'image/bmp',
        'ico': 'image/x-icon',
        
        // Documents
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'txt': 'text/plain',
        'csv': 'text/csv',
        
        // Archives
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed',
        
        // Audio
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'ogg': 'audio/ogg',
        
        // Video
        'mp4': 'video/mp4',
        'avi': 'video/x-msvideo',
        'mov': 'video/quicktime',
        'wmv': 'video/x-ms-wmv',
        'webm': 'video/webm'
    };
    
    // If accept_type contains wildcards (like image/*), check directly
    if (accept_type.includes('*')) {
        const pattern = new RegExp(accept_type.replace('*', '.*'), 'i');
        return pattern.test(mimeType);
    }
    
    // Extract extensions from accept_type (handle formats like ".pdf,.doc" or "pdf|doc" or "pdf,doc")
    const extensions = accept_type
        .replace(/\./g, '') // Remove dots
        .split(/[|,]/) // Split by pipe or comma
        .map(ext => ext.trim().toLowerCase());
    
    // Check if the MIME type matches any of the allowed extensions
    for (const ext of extensions) {
        const allowedMimeType = mimeTypeMap[ext];
        if (allowedMimeType && mimeType.toLowerCase() === allowedMimeType.toLowerCase()) {
            return true;
        }
    }
    
    return false;
}

function isValidVariableName(variableName) {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variableName);
}
function isFutureDate(dateString) {
    const today = new Date();
    const inputDate = new Date(dateString);

    // Set the time to the beginning of the day to avoid issues with time comparison
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate >= today;
}
export { isFutureDate, validateEmail, validatePhone_no, isrequired, isExistThenAdd, validFields, checkFileType, isValidVariableName, validatePageSlug, validateUrl, Url_Validation_falield };