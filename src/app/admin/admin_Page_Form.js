"use client";
import { LoadingButton } from '@/app/components/admin/common.jsx';
import { usePostApi, usePutApi } from '@/app/lib/apicallHooks';
import { checkFileType } from '@/app/utils/db/validations';
import { TostError } from '@/app/utils/tost/Tost';
import { convertToSEOUrl } from '@/app/utils/usefullFunction/usedFunction';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Page_client_section from "./admin_section_form";

const Page_client = ({ DEFAULT_OBJECT, Page_Fields, objectField, postURL, putUrl, isEdit, redirectUrl, isView = false, searchParams = {}, locale = "en", localeData = null, localeLoading = false, isFallback = false, onSeoChange = null, onRegisterApplyTranslation = null }) => {
    const router = useRouter();
    const { duplicate = null } = searchParams;
    const [formData, setFormData] = useState(DEFAULT_OBJECT);
    const [filesField, setFilesField] = useState([]);
    const { isLoading: LoadingPut, doPutRedirect } = usePutApi(putUrl)
    const { isLoading: LoadingPost, doPostWithFormdata } = usePostApi(postURL || putUrl?.replace(/\/[^/]+$/, ""))
    const [deleteSingleImageList, setDeleteSingleImageList] = useState([]);
    const [deleteMultyImages, setDeleteMultyImages] = useState({});
    const [fieldErrors, setFieldErrors] = useState({}); // Store field-level errors

    // Register translation bridge so LocaleFormWrapper can read/set formData
    useEffect(() => {
        if (onRegisterApplyTranslation) {
            onRegisterApplyTranslation({
                getFormData: () => formData,
                setFormData: (data) => setFormData(data),
            });
        }
    }, [onRegisterApplyTranslation, formData]);

    // When locale changes and new data arrives, merge it into formData
    useEffect(() => {
        if (localeData) {
            setFormData({ ...DEFAULT_OBJECT, ...localeData });
        } else {
            setFormData(DEFAULT_OBJECT);
        }
        setFilesField([]);
        setDeleteSingleImageList([]);
        setDeleteMultyImages({});
        setFieldErrors({});
    }, [locale, localeData]);

    // Sync SEO data to parent sidebar
    useEffect(() => {
        if (onSeoChange && formData?.seo !== undefined) {
            onSeoChange(formData.seo);
        }
    }, [formData?.seo]);

    const updateNestedFormData = (path, value) => {
        setFormData(prev => {
            const newData = { ...prev };
            const parts = path.split(/[.#]/);
            let current = newData;
            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (Array.isArray(current[part])) {
                    current[part] = [...current[part]];
                } else if (current[part] && typeof current[part] === 'object') {
                    current[part] = { ...current[part] };
                } else {
                    current[part] = isNaN(parts[i + 1]) ? {} : [];
                }
                current = current[part];
            }
            const lastKey = parts[parts.length - 1];
            current[lastKey] = value;
            return newData;
        });
    };

    const getNestedValue = (obj, path) => {
        const parts = path.split(/[.#]/);
        let current = obj;
        for (const part of parts) {
            if (current && typeof current === 'object') {
                current = current[part];
            } else {
                return undefined;
            }
        }
        return current;
    };

    const preprocessValue = (value) => {
        if (!value) return value;
        if (value instanceof File) return "";
        if (Array.isArray(value)) {
            return value.map(preprocessValue);
        }
        if (typeof value === 'object') {
            const newValue = { ...value };
            Object.keys(newValue).forEach(key => {
                // Strip __componentFields — used only for UI validation, never save to DB
                if (key === '__componentFields') {
                    delete newValue[key];
                    return;
                }
                if (newValue[key] && typeof newValue[key] === 'object' && newValue[key]._id && !(newValue[key] instanceof File)) {
                    newValue[key] = newValue[key]._id;
                } else {
                    newValue[key] = preprocessValue(newValue[key]);
                }
            });
            return newValue;
        }
        return value;
    };

    // Function to find and clear dependent fields
    const clearDependentFields = (changedFieldName, currentData = formData) => {
        const fieldsToUpdate = {};

        // Helper to find dependent fields in a section
        const findDependentFields = (fields, dataScope, pathPrefix = '') => {
            fields.forEach(field => {
                const fieldName = field.field?.value || field.field;
                const fullPath = pathPrefix ? `${pathPrefix}.${fieldName}` : fieldName;

                // Check if this field depends on the changed field
                if (field.dependency_field === changedFieldName) {
                    // Clear the field
                    if (field.type === 'relation' && field.isMultiple) {
                        fieldsToUpdate[fullPath] = [];
                    } else {
                        fieldsToUpdate[fullPath] = null;
                    }
                }

                // Recursively check component fields
                if (field.type === 'component') {
                    const componentData = dataScope[fieldName];

                    if (field.component_type === 'repeatable' && Array.isArray(componentData)) {
                        componentData.forEach((item, index) => {
                            findDependentFields(field.fields || [], item, `${fullPath}#${index}`);
                        });
                    } else if (field.component_type === 'single' && componentData) {
                        findDependentFields(field.fields || [], componentData, fullPath);
                    }
                }
            });
        };

        // Search through all sections
        Page_Fields.forEach(section => {
            findDependentFields(section.fields || [], currentData);
        });

        return fieldsToUpdate;
    };

    const onChangeFormDataHandler = (e, name, is_coustom = null, obj_type) => {
        if (is_coustom === "file") {
            setFormData((pre) => ({
                ...pre,
                [name]: e
            }))
        } else if (is_coustom === "component") {
            setFormData((pre) => ({
                ...pre,
                [name]: e
            }))
        } else if (is_coustom === "dynamic-zone") {
            setFormData((pre) => ({
                ...pre,
                [name]: e
            }))
        } else if (is_coustom === "relation") {
            // Clear dependent fields when relation changes
            const dependentFields = clearDependentFields(name);

            setFormData((pre) => ({
                ...pre,
                [name]: e,
                ...dependentFields // Clear all dependent fields
            }))
        } else if (is_coustom === "switchbox" || is_coustom === "checkbox") {
            setFormData((pre) => ({
                ...pre,
                [e.target.name]: e.target.checked
            }))
        } else if (is_coustom === "rich-text-markdown") {
            setFormData((pre) => ({
                ...pre,
                [name]: e
            }))
        } else if (e.target.name === "name") {
            setFormData((pre) => ({
                ...pre,
                [e.target.name]: e.target.value,
                slug: convertToSEOUrl(e.target.value)
            }))
        } else {
            setFormData((pre) => ({
                ...pre,
                [e.target.name]: e.target.value
            }))
        }
    }
    const handleFileChange = (e, name, limit = 3, accept_type) => {
        const { files = [] } = e?.target;
        let fileSize = limit * 1024 * 1024
        if (!files[0]) {
            return onChangeFormDataHandler("", name, "file");
        }
        if (!checkFileType(files[0].type, accept_type)) {
            onChangeFormDataHandler("", name, "file");
            return TostError(`${name} file only accepts ${accept_type.split("|").join(",")}`);
        }
        if (files[0].size > fileSize) {
            const parts = name.split(".");
            const field_name = parts[parts.length - 1];
            onChangeFormDataHandler("", name, "file");
            filesField.filter(ele => ele !== name);
            return TostError(`${field_name} size should be less or equal ${limit} MB`);
        }
        updateNestedFormData(name, files[0]);
        const myAllImages = [...deleteSingleImageList];
        if (myAllImages.includes(name)) {
            const newArr = myAllImages.filter(ele => ele !== name)
            setDeleteSingleImageList(newArr)
        }
        if (files[0]) {
            if (!filesField.includes(name)) {
                setFilesField((pre) => {
                    return [...pre, name]
                })
            }
        }
    };
    const submitHandler = () => {
        try {
    

            if (isView) {
                return;
            }

            // Validate form before submission - returns first error only
            const validationError = validateForm();
            if (validationError) {
                TostError(`${validationError.path}: ${validationError.message}`);
                return;
            }


            const componentFields = new Set();

            Page_Fields.forEach(section => {
                section.fields.forEach(f => {
                    if (f.type === "component") componentFields.add(f.field);
                });
            });

            const common_form = new FormData();

            const finalFilesField = [...filesField];

            // Helper function to recursively extract files from nested structures
            const extractFilesFromNested = (obj, basePath = "") => {
                if (!obj || typeof obj !== 'object') return;

                if (Array.isArray(obj)) {
                    obj.forEach((item, idx) => {
                        extractFilesFromNested(item, `${basePath}#${idx}`);
                    });
                } else {
                    Object.keys(obj).forEach(key => {
                        const value = obj[key];
                        const currentPath = basePath ? `${basePath}.${key}` : key;

                        if (value instanceof File) {
                            common_form.append(currentPath, value);
                            if (!finalFilesField.includes(currentPath)) {
                                finalFilesField.push(currentPath);
                            }
                        } else if (Array.isArray(value)) {
                            value.forEach((item, fIdx) => {
                                if (item instanceof File) {
                                    const filePath = `${currentPath}#${fIdx}`;
                                    common_form.append(filePath, item);
                                    if (!finalFilesField.includes(filePath)) {
                                        finalFilesField.push(filePath);
                                    }
                                } else if (item && typeof item === 'object') {
                                    extractFilesFromNested(item, `${currentPath}#${fIdx}`);
                                }
                            });
                        } else if (value && typeof value === 'object' && !(value instanceof File)) {
                            extractFilesFromNested(value, currentPath);
                        }
                    });
                }
            };

            for (const key in formData) {
                if (Object.hasOwnProperty.call(formData, key)) {
                    let value = formData[key];

                    // Skip locale-internal fields — API sets these server-side
                    if (["_id", "__v", "lang", "rootId", "createdAt", "updatedAt"].includes(key)) continue;

                    // Handle component fields
                    if (componentFields.has(key)) {
                        extractFilesFromNested(value, key);
                        const processedValue = preprocessValue(value);
                        common_form.append(key, JSON.stringify(processedValue));
                        continue;
                    }

                    if (value !== undefined && value !== null && value !== "" || typeof value === "boolean") {
                        if (objectField.includes(key) || Array.isArray(value)) {
                            common_form.append(key, JSON.stringify(preprocessValue(value)));
                        } else {
                            common_form.append(key, value);
                        }
                    } else if (value === "") {
                        common_form.append(key, "");
                    }
                }
            }
            common_form.append("filesField", JSON.stringify(finalFilesField));
            common_form.append("objectField", JSON.stringify(objectField));
            common_form.append("locale", locale);

            // For non-en translations, pass rootId from the base English doc
            if (locale !== "en") {
                const rootId = formData.rootId?._id ?? formData.rootId ?? formData._id;
                if (rootId) common_form.append("rootId", rootId);
            }

            // Final pass: Ensure all tracked file paths are appended to common_form if they contain a File object
            finalFilesField.forEach(path => {
                if (!common_form.has(path)) {
                    const value = getNestedValue(formData, path);
                    if (value instanceof File) {
                        common_form.append(path, value);
                    }
                }
            });

            if (isEdit) {
                common_form.append("deleteSingleImageList", JSON.stringify(deleteSingleImageList));
                common_form.append("deleteMultyImages", JSON.stringify(deleteMultyImages));
                // For non-en locales that don't have a translation yet, the PUT handler creates it
                doPutRedirect(common_form, true, redirectUrl)
            } else {
                if (duplicate && common_form.has("_id")) {
                    common_form.delete("_id");
                }
                doPostWithFormdata(common_form, redirectUrl)
            }
            router.refresh();
        } catch (error) {
            console.error("Submission error:", error);
            TostError("Failed to submit form");
        }
    }
    const handleFileChange_multy = (e, name, limit = 3, accept_type) => {
        const { files = [] } = e?.target;
        let fileSize = limit * 1024 * 1024;
        const numEntries = Object.keys(files).length;

        const parts = name.split(/[.#]/);
        let current = formData;
        for (const part of parts) {
            current = current?.[part];
        }
        const startIndex = Array.isArray(current) ? current.length : 0;

        const newFiles = Array.from(files);
        const existingFiles = Array.isArray(current) ? current : [];
        updateNestedFormData(name, [...existingFiles, ...newFiles]);

        for (let i = 0; i < numEntries; i++) {
            const index = startIndex + i;
            const compoundKey = `${name}#${index}`;

            if (!files[i]) {
                continue;
            }
            if (!checkFileType(files[i].type, accept_type)) {
                return TostError(`${name} file only accepts ${accept_type.split("|").join(",")}`);
            }
            if (files[i].size > fileSize) {
                const parts = name.split(".");
                const field_name = parts[parts.length - 1];
                return TostError(`${field_name} size should be less or equal ${limit} MB`);
            }

            onChangeFormDataHandler(files[i], compoundKey, "file");
            if (files[i]) {
                if (!filesField.includes(compoundKey)) {
                    setFilesField((pre) => {
                        return [...pre, compoundKey]
                    })
                }
            }
        }
    };
    const deleteSingleImage = (field) => {
        try {
            const parts = field.split(/[.#]/)

            if (parts.length > 1) {
                setFormData((pre) => {
                    const newData = { ...pre };
                    let current = newData;
                    for (let i = 0; i < parts.length - 1; i++) {
                        const part = parts[i];
                        if (Array.isArray(current[part])) {
                            current[part] = [...current[part]];
                        } else if (current[part] && typeof current[part] === 'object') {
                            current[part] = { ...current[part] };
                        } else if (current[part] === undefined || current[part] === null) {
                            return pre;
                        }
                        current = current[part];
                    }
                    current[parts[parts.length - 1]] = "";
                    return newData;
                })
            } else {
                onChangeFormDataHandler("", field, "file");
            }
            setDeleteSingleImageList((pre) => {
                return [...pre, field]
            })
        } catch (error) {
            console.error("Delete error:", error);
        }
    }

    const deleteMultImage = (Link, field, unset_field) => {
        const parts = field.split(/[.#]/)
        setFormData(pre => {
            const newData = { ...pre };
            let current = newData;
            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (Array.isArray(current[part])) {
                    current[part] = [...current[part]];
                } else if (current[part] && typeof current[part] === 'object') {
                    current[part] = { ...current[part] };
                }
                current = current[part];
            }
            current[parts[parts.length - 1]] = Link;
            return newData;
        });
        setDeleteMultyImages((pre) => {
            return {
                ...pre,
                [field]: { remove: unset_field, set: Link }
            }
        })
    }

    // Validation function - collects all errors for inline display
    const validateForm = () => {
        const allErrors = {};
        let firstError = null;

        const validateFields = (fields, data, path = '', sectionName = '') => {
            for (const field of fields) {
                const fieldName = field.field?.value || field.field;
                const fullPath = path ? `${path}.${fieldName}` : fieldName;
                const fieldValue = data[fieldName];
                const fieldLabel = field.Printvalue || fieldName;

                // Build readable path for error message
                let readablePath = sectionName ? `${sectionName}` : '';
                if (path) {
                    const pathParts = path.split(/[.#]/);
                    pathParts.forEach((part, idx) => {
                        if (!isNaN(part)) {
                            readablePath += ` > Entry ${parseInt(part) + 1}`;
                        } else if (part) {
                            const partField = fields.find(f => (f.field?.value || f.field) === part);
                            const partLabel = partField?.Printvalue || partField?.component_display_name || part;
                            readablePath += ` > ${partLabel}`;
                        }
                    });
                }
                readablePath += ` > ${fieldLabel}`;

                // Skip validation for component fields (validate their inner fields instead)
                if (field.type === 'component') {
                    if (field.component_type === 'repeatable') {
                        if (Array.isArray(fieldValue)) {
                            for (let index = 0; index < fieldValue.length; index++) {
                                validateFields(field.fields || [], fieldValue[index], `${fullPath}#${index}`, sectionName);
                            }
                        } else if (field.required === true || field.required === 'true') {
                            const errorMsg = 'At least one entry is required';
                            allErrors[fullPath] = errorMsg;
                            if (!firstError) {
                                firstError = { path: readablePath, message: errorMsg };
                            }
                        }
                    } else if (field.component_type === 'single') {
                        if (fieldValue && typeof fieldValue === 'object') {
                            validateFields(field.fields || [], fieldValue, fullPath, sectionName);
                        } else if (field.required === true || field.required === 'true') {
                            const errorMsg = 'This field is required';
                            allErrors[fullPath] = errorMsg;
                            if (!firstError) {
                                firstError = { path: readablePath, message: errorMsg };
                            }
                        }
                    }
                    continue;
                }

                // Skip validation for dynamic-zone fields (validate their component instances)
                if (field.type === 'dynamic-zone') {
                    if (Array.isArray(fieldValue)) {
                        // Check if required and empty
                        if ((field.required === true || field.required === 'true') && fieldValue.length === 0) {
                            const errorMsg = 'At least one component is required';
                            allErrors[fullPath] = errorMsg;
                            if (!firstError) {
                                firstError = { path: readablePath, message: errorMsg };
                            }
                        }
                        
                        // Validate each component instance
                        for (let index = 0; index < fieldValue.length; index++) {
                            const componentInstance = fieldValue[index];
                            const componentId = componentInstance.__componentId;
                            
                            // Check if component fields are available
                            if (componentInstance.__componentFields && Array.isArray(componentInstance.__componentFields)) {
                                validateFields(
                                    componentInstance.__componentFields, 
                                    componentInstance, 
                                    `${fullPath}#${index}`, 
                                    sectionName
                                );
                            } else {
                                // Log warning if component fields are missing
                                console.warn(`Dynamic zone validation: Component fields missing for ${componentInstance.__componentName || 'unknown'} at ${fullPath}#${index}`);
                            }
                        }
                    } else if (field.required === true || field.required === 'true') {
                        const errorMsg = 'At least one component is required';
                        allErrors[fullPath] = errorMsg;
                        if (!firstError) {
                            firstError = { path: readablePath, message: errorMsg };
                        }
                    }
                    continue;
                }

                // Check required fields
                const isRequired = field.required === true || field.required === 'true';
                if (isRequired) {
                    if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
                        const errorMsg = 'This field is required';
                        allErrors[fullPath] = errorMsg;
                        if (!firstError) {
                            firstError = { path: readablePath, message: errorMsg };
                        }
                        continue;
                    }

                    if (Array.isArray(fieldValue) && fieldValue.length === 0) {
                        const errorMsg = 'Select at least one option';
                        allErrors[fullPath] = errorMsg;
                        if (!firstError) {
                            firstError = { path: readablePath, message: errorMsg };
                        }
                        continue;
                    }
                }

                // Skip further validation if field is empty and not required
                if (!fieldValue || fieldValue === '') {
                    continue;
                }

                // Regex validation
                if (field.match_regex && typeof fieldValue === 'string') {
                    try {
                        const regex = new RegExp(field.match_regex);
                        if (!regex.test(fieldValue)) {
                            const errorMsg = 'Invalid format';
                            allErrors[fullPath] = errorMsg;
                            if (!firstError) {
                                firstError = { path: readablePath, message: errorMsg };
                            }
                        }
                    } catch (e) {
                        console.error('Invalid regex pattern:', field.match_regex);
                    }
                }

                // Email validation
                if (field.type === 'email' && typeof fieldValue === 'string') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(fieldValue)) {
                        const errorMsg = 'Must be a valid email address';
                        allErrors[fullPath] = errorMsg;
                        if (!firstError) {
                            firstError = { path: readablePath, message: errorMsg };
                        }
                    }
                }

                // URL validation
                if (field.type === 'url' && typeof fieldValue === 'string') {
                    try {
                        new URL(fieldValue);
                    } catch (e) {
                        const errorMsg = 'Must be a valid URL';
                        allErrors[fullPath] = errorMsg;
                        if (!firstError) {
                            firstError = { path: readablePath, message: errorMsg };
                        }
                    }
                }

                // Number validation
                if (field.type === 'number' && fieldValue !== '') {
                    const numValue = Number(fieldValue);

                    if (isNaN(numValue)) {
                        const errorMsg = 'Must be a valid number';
                        allErrors[fullPath] = errorMsg;
                        if (!firstError) {
                            firstError = { path: readablePath, message: errorMsg };
                        }
                        continue;
                    }

                    if (field.min_value !== undefined && field.min_value !== null && field.min_value !== '') {
                        const minValue = Number(field.min_value);
                        if (numValue < minValue) {
                            const errorMsg = `Must be at least ${minValue}`;
                            allErrors[fullPath] = errorMsg;
                            if (!firstError) {
                                firstError = { path: readablePath, message: errorMsg };
                            }
                        }
                    }

                    if (field.max_value !== undefined && field.max_value !== null && field.max_value !== '') {
                        const maxValue = Number(field.max_value);
                        if (numValue > maxValue) {
                            const errorMsg = `Must be at most ${maxValue}`;
                            allErrors[fullPath] = errorMsg;
                            if (!firstError) {
                                firstError = { path: readablePath, message: errorMsg };
                            }
                        }
                    }
                }

                // JSON validation
                if (field.type === 'json' && fieldValue) {
                    // Check if it's a string that needs parsing
                    if (typeof fieldValue === 'string') {
                        try {
                            JSON.parse(fieldValue);
                        } catch (e) {
                            const errorMsg = 'Must be valid JSON';
                            allErrors[fullPath] = errorMsg;
                            if (!firstError) {
                                firstError = { path: readablePath, message: errorMsg };
                            }
                        }
                    } else if (typeof fieldValue !== 'object' || fieldValue === null) {
                        // If it's not a string and not an object, it's invalid
                        const errorMsg = 'Must be a valid JSON object';
                        allErrors[fullPath] = errorMsg;
                        if (!firstError) {
                            firstError = { path: readablePath, message: errorMsg };
                        }
                    }
                }
            }
        };

        // Validate all sections
        for (const section of Page_Fields) {
            const sectionName = section.Heading || 'Form';
            validateFields(section.fields || [], formData, '', sectionName);
        }

        // Store all errors in state for inline display
        setFieldErrors(allErrors);

        return firstError;
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <div className='admin-form'>
                {
                    Page_Fields && Page_Fields.map((ele, index) => {
                        return (
                            <Page_client_section
                                key={ele.Heading}
                                ele={ele}
                                deleteMultImage={deleteMultImage}
                                deleteSingleImage={deleteSingleImage}
                                handleFileChange_multy={handleFileChange_multy}
                                handleFileChange={handleFileChange}
                                formData={formData}
                                isEdit={isEdit}
                                onChangeFormDataHandler={onChangeFormDataHandler}
                                index={index}
                                fieldErrors={fieldErrors}
                            />
                        )
                    })
                }
            </div>
            {!isView && <LoadingButton loading={LoadingPut || LoadingPost} submitHandler={submitHandler} />}
        </>
    )
}

export default Page_client