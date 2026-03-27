import TextEditor from "@/app/components/admin/TextEditor";
import { CreateLinkForPage, FileAction, FileActionMultiImage } from "@/app/components/admin/extra/Common";
import EnumerationInput from "@/app/components/admin/extra/EnumerationInput";
import JsonEditor from "@/app/components/admin/extra/JsonEditor";
import MultiSelectSort from "@/app/components/admin/extra/MultiSelectSort";
import SelectBox from "@/app/components/admin/extra/SelectBox";
import UidInput from "@/app/components/admin/extra/UidInput";
import { calculateAgeInDaysOfLeads } from '@/app/utils/usefullFunction/usedFunction';
import { Checkbox, Switch } from "@mui/material";

// Helper function to normalize accept_type for file inputs
const normalizeAcceptType = (accept_type) => {
    if (!accept_type) return undefined;

    // If it already contains wildcards or dots, use as-is
    if (accept_type.includes('*') || accept_type.includes('.')) {
        return accept_type;
    }

    // If it contains pipes, split and add dots
    if (accept_type.includes('|')) {
        return accept_type.split('|').map(ext => `.${ext.trim()}`).join(', ');
    }

    // If it's comma-separated, add dots
    if (accept_type.includes(',')) {
        return accept_type.split(',').map(ext => `.${ext.trim()}`).join(', ');
    }

    // Single extension without dot
    return `.${accept_type}`;
};

export const returnFormFields = ({ formData, onChangeFormDataHandler, field_data, handleFileChange, handleFileChange_multy, deleteSingleImage, deleteMultImage, isEdit = false }) => {
    // Extract field name from object or use directly
    const fieldName = field_data.field?.value || field_data.field;

    let Component_Type = <></>;
    let fileSizeMessage = "";
    let Lable_Component = <></>;
    let isRequired = true;
    let disabled = false;
    if (!field_data.required || field_data.required === "" || field_data.required === "false") {
        isRequired = false
    }

    // Check if field should be disabled:
    // 1. Dependency behavior: Check _dependencyState.enabled (if dependency exists)
    // 2. Original behavior: disable_in_edit is true AND we're in edit mode
    if (field_data._dependencyState && field_data._dependencyState.enabled === false) {
        disabled = true;
    } else if (Boolean(field_data.disable_in_edit) && Boolean(isEdit)) {
        disabled = true;
    }

    const placeholder = field_data?.placeholder ?? `enter ${field_data?.Printvalue} `
    const formValue = formData[fieldName]
    switch (field_data.type) {
        case "date":
            const dateType = field_data.date_type || "date";
            Component_Type = <input disabled={disabled} required={isRequired} type={dateType} className="form-control" autoFocus name={fieldName} key={fieldName} onChange={onChangeFormDataHandler} value={formValue ?? ""} />
            break;
        case "boolean":
            const booleanType = field_data.boolean_type || "checkbox";
            if (booleanType === "switch") {
                Component_Type = <Switch disabled={disabled} required={isRequired} checked={formValue ?? false} name={fieldName} key={fieldName} onChange={(e) => onChangeFormDataHandler(e, "", "switchbox")} />
            } else {
                Component_Type = <Checkbox disabled={disabled} required={isRequired} checked={formValue ?? false} name={fieldName} key={fieldName} onChange={(e) => onChangeFormDataHandler(e, "", "checkbox")} />
            }
            break;
        case "enumeration":
            const enumerationType = field_data.enumeration_type || "single";
            const options = field_data.option_value ? field_data.option_value.split(",").map(v => v.trim()) : [];
            Component_Type = <EnumerationInput
                value={formValue}
                onChange={onChangeFormDataHandler}
                name={fieldName}
                options={options}
                placeholder={field_data?.placeholder || "Select..."}
                disabled={disabled}
                required={isRequired}
                isMultiple={enumerationType === "multiple"}
            />
            break;
        case "relation":
            if (field_data?.CreateUrl) {
                Lable_Component = <CreateLinkForPage pageLink={field_data?.CreateUrl} disabled={disabled} />
            }
            
            // Build URL with dependency filter if dependency_field exists
            let apiUrl = field_data.api_end_point;
            if (field_data.dependency_field) {
                const dependencyValue = formData[field_data.dependency_field];
                if (dependencyValue) {
                    // Extract the ID value (handle both object and string)
                    const filterValue = typeof dependencyValue === 'object' 
                        ? dependencyValue[field_data.getOptionValue || '_id']
                        : dependencyValue;
                    
                    if (filterValue) {
                        // Use dependency_field_target if specified, otherwise use dependency_field
                        // This allows filtering by a different field name in the target schema
                        const targetFieldName = field_data.dependency_field_target || field_data.dependency_field;
                        
                        // Add filter parameter to URL
                        const separator = apiUrl.includes('?') ? '&' : '?';
                        apiUrl = `${apiUrl}${separator}filters[${targetFieldName}][$eq]=${filterValue}`;
                    }
                }
            }
            
            if (field_data.isMultiple) {
                Component_Type = <MultiSelectSort
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={true}
                    placeholder={placeholder}
                    isSearchable={true}
                    onChange={onChangeFormDataHandler}
                    value={formData}
                    getOptionLabel={(option) => option[field_data?.getOptionLabel]}
                    getOptionValue={(option) => option[field_data?.getOptionValue]}
                    url={apiUrl}
                    name={fieldName}
                    disabled={disabled}
                    isDragDrop={true}
                />
            } else {
                Component_Type = <SelectBox
                    placeholder={placeholder}
                    isSearchable={true}
                    onChange={onChangeFormDataHandler}
                    value={formData}
                    getOptionLabel={(option) => option[field_data?.getOptionLabel]}
                    getOptionValue={(option) => option[field_data?.getOptionValue]}
                    url={apiUrl}
                    name={fieldName}
                    CreateUrl={field_data?.CreateUrl}
                    disabled={disabled}

                />
            }
            break;
        case "rich-text-markdown":
            Component_Type = <TextEditor setContent={onChangeFormDataHandler} content={formValue} key={fieldName} is_coustom={"rich-text-markdown"} fieldName={fieldName} />
            break;
        case "json":
            Component_Type = <JsonEditor
                value={formValue}
                onChange={onChangeFormDataHandler}
                name={fieldName}
                placeholder={placeholder}
                disabled={disabled}
            />
            break;
        case "media":
            if (field_data?.isMulti) {
                fileSizeMessage = field_data?.fileLimit ? `(file less than ${field_data?.fileLimit} MB)` : `(file less than 3 MB)`
                const acceptAttr = normalizeAcceptType(field_data.accept_type);
                Component_Type = <div className='d-flex g-5'>
                    <input disabled={disabled} required={isRequired && !(formValue && formValue.length > 0)} type="file" multiple className="form-control" autoFocus name={fieldName} key={fieldName} onChange={(e) => handleFileChange_multy(e, e.target.name, field_data.fileLimit, field_data.accept_type)} accept={acceptAttr} />
                    <FileActionMultiImage Link={formValue} field={fieldName} deleteHandler={deleteMultImage} />
                </div>
            } else {
                fileSizeMessage = field_data?.fileLimit ? `(file less than ${field_data?.fileLimit} MB)` : `(file less than 3 MB)`
                const acceptAttr = normalizeAcceptType(field_data.accept_type);
                Component_Type = <div className='d-flex g-5'>
                    <input disabled={disabled} required={isRequired && !formValue} type="file" className="form-control" autoFocus name={fieldName} key={fieldName} onChange={(e) => handleFileChange(e, e.target.name, field_data?.fileLimit ?? 3, field_data.accept_type)} accept={acceptAttr} />
                    <FileAction field={fieldName} Link={formValue} deleteHandler={deleteSingleImage} />
                </div>
            }
            break;
        case "uid":
            Component_Type = <UidInput
                value={formValue}
                onChange={onChangeFormDataHandler}
                name={fieldName}
                placeholder={field_data?.placeholder || "Enter UID..."}
                disabled={disabled}
                required={isRequired}
                attachedField={field_data.attached_field}
                formData={formData}
            />
            break;
        case "number":
            const numberProps = {
                disabled,
                required: isRequired,
                type: "number",
                className: "form-control",
                placeholder,
                name: fieldName,
                key: fieldName,
                onChange: onChangeFormDataHandler,
                value: formValue ?? ""
            };
            
            // Add min/max validation
            if (field_data.min_value !== undefined && field_data.min_value !== null && field_data.min_value !== '') {
                numberProps.min = Number(field_data.min_value);
            }
            if (field_data.max_value !== undefined && field_data.max_value !== null && field_data.max_value !== '') {
                numberProps.max = Number(field_data.max_value);
            }
            
            Component_Type = <input {...numberProps} />;
            break;
        case "lead_age":
            Component_Type = <input disabled={disabled} required={isRequired} type="text" className="form-control" autoFocus placeholder={placeholder} name={fieldName} key={fieldName} value={calculateAgeInDaysOfLeads(formValue) ?? ""} />
            break;
        case "text-editor":
            Component_Type = <TextEditor setContent={onChangeFormDataHandler} content={formValue} key={fieldName} is_coustom={"non-obj"} fieldName={fieldName} />
            break;
        case "rich-text-blocks":
            Component_Type = <textarea disabled={disabled} required={isRequired} className="form-control" autoFocus name={fieldName} onChange={onChangeFormDataHandler} key={fieldName} value={formValue ?? ""} placeholder={placeholder} />
            break;
        case "file":
            if (field_data?.isMulti) {
                fileSizeMessage = field_data?.fileLimit ? `(file less than  ${field_data?.fileLimit} MB)` : `(file less than 3 MB)`
                const acceptAttr = normalizeAcceptType(field_data.accept_type);
                Component_Type = <div className='d-flex g-5'>
                    <input disabled={disabled} required={isRequired && !(formValue && formValue.length > 0)} type="file" multiple className="form-control" autoFocus name={fieldName} key={fieldName} onChange={(e) => handleFileChange_multy(e, e.target.name, field_data.fileLimit, field_data.accept_type)} accept={acceptAttr} />
                    <FileActionMultiImage Link={formValue} field={fieldName} deleteHandler={deleteMultImage} />
                </div>
            } else {
                fileSizeMessage = field_data?.fileLimit ? `(file less than  ${field_data?.fileLimit} MB)` : `(file less than 3 MB)`
                const acceptAttr = normalizeAcceptType(field_data.accept_type);
                Component_Type = <div className='d-flex g-5'>
                    <input disabled={disabled} required={isRequired && !formValue} type="file" className="form-control" autoFocus name={fieldName} key={fieldName} onChange={(e) => handleFileChange(e, e.target.name, field_data?.fileLimit ?? 3, field_data.accept_type)} accept={acceptAttr} />
                    <FileAction field={fieldName} Link={formValue} deleteHandler={deleteSingleImage} />
                </div>
            }
            break;
        case "link_target":
            Component_Type = <select disabled={disabled} required={isRequired} className="form-control" name={fieldName} value={formValue ?? ""} onChange={onChangeFormDataHandler} >
                <option value="">Select Target To Open </option>
                <option value="_self">Same Window </option>
                <option value="_blank">New Window </option>
                <option value="_parent">Parent Frame </option>
                <option value="_top">Top-level Frame </option>
            </select>
            break;
        case "password":
        case "text":
        case "email":
        case "url":
            const inputProps = {
                disabled,
                required: isRequired,
                type: field_data.type,
                className: "form-control",
                placeholder,
                name: fieldName,
                key: fieldName,
                onChange: onChangeFormDataHandler,
                value: formValue ?? ""
            };
            
            // Add pattern validation if match_regex is specified
            if (field_data.match_regex) {
                inputProps.pattern = field_data.match_regex;
                inputProps.title = `Please match the required format`;
            }
            
            Component_Type = <input {...inputProps} />;
            break;
        default:
            Component_Type = <input disabled={disabled} required={isRequired} type={field_data.type} className="form-control" autoFocus placeholder={placeholder} name={fieldName} key={fieldName} onChange={onChangeFormDataHandler} value={formValue ?? ""} />
    }

    return { Component_Type, fileSizeMessage, Lable_Component }
}
