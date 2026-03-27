/**
 * Field Validation Utility
 * Provides validation rules and functions for field configuration
 */

/**
 * Validation rule: Field name must be alphanumeric with underscores, no spaces
 * Must start with a letter or underscore
 */
export const FIELD_NAME_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Validation rule: Enumeration options must be comma-separated, no empty values
 */
export const ENUMERATION_OPTIONS_PATTERN = /^[^,]+(,[^,]+)*$/;

/**
 * Validation rule: File limit range for media fields (0.1-100 MB)
 */
export const FILE_LIMIT_MIN = 0.1;
export const FILE_LIMIT_MAX = 100;

/**
 * Debounce utility for validation
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay = 300) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

/**
 * Validate field name
 * @param {string} fieldName - Field name to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateFieldName = (fieldName) => {
    if (!fieldName || fieldName.trim() === '') {
        return 'Field name is required';
    }
    
    if (!FIELD_NAME_PATTERN.test(fieldName)) {
        return 'No spaces allowed. Use underscores or camelCase';
    }
    
    return null;
};

/**
 * Check for duplicate field names
 * @param {string} fieldName - Field name to check
 * @param {Array} existingFields - Array of existing field configurations
 * @param {string} currentFieldId - ID of current field being edited (to exclude from check)
 * @returns {string|null} Error message or null if valid
 */
export const validateDuplicateFieldName = (fieldName, existingFields = [], currentFieldId = null) => {
    const isDuplicate = existingFields.some(field => {
        const fieldValue = field.field?.value || field.field?.label;
        return fieldValue === fieldName && field.field?.value !== currentFieldId;
    });
    
    if (isDuplicate) {
        return 'Field name already exists. Please use a unique name';
    }
    
    return null;
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldLabel - Label for error message
 * @returns {string|null} Error message or null if valid
 */
export const validateRequired = (value, fieldLabel = 'This field') => {
    if (value === null || value === undefined || value === '') {
        return `${fieldLabel} is required`;
    }
    return null;
};

/**
 * Validate regex pattern
 * @param {string} pattern - Regex pattern to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateRegexPattern = (pattern) => {
    if (!pattern || pattern.trim() === '') {
        return null; // Empty is valid (optional field)
    }
    
    try {
        new RegExp(pattern);
        return null;
    } catch (e) {
        return 'Invalid regex pattern. Please enter a valid regular expression';
    }
};

/**
 * Validate number range (min < max)
 * @param {number|string} minValue - Minimum value
 * @param {number|string} maxValue - Maximum value
 * @returns {object} Object with minError and maxError properties
 */
export const validateNumberRange = (minValue, maxValue) => {
    const errors = { minError: null, maxError: null };
    
    // If both are empty, no validation needed
    if ((minValue === '' || minValue === null || minValue === undefined) &&
        (maxValue === '' || maxValue === null || maxValue === undefined)) {
        return errors;
    }
    
    const min = parseFloat(minValue);
    const max = parseFloat(maxValue);
    
    // Check if values are valid numbers
    if (minValue !== '' && minValue !== null && minValue !== undefined && isNaN(min)) {
        errors.minError = 'Min value must be a valid number';
    }
    
    if (maxValue !== '' && maxValue !== null && maxValue !== undefined && isNaN(max)) {
        errors.maxError = 'Max value must be a valid number';
    }
    
    // If both are valid numbers, check if min < max
    if (!isNaN(min) && !isNaN(max) && min >= max) {
        errors.maxError = 'Max value must be greater than min value';
    }
    
    return errors;
};

/**
 * Validate enumeration options
 * @param {string} options - Comma-separated options
 * @returns {string|null} Error message or null if valid
 */
export const validateEnumerationOptions = (options) => {
    if (!options || options.trim() === '') {
        return 'At least one option is required';
    }
    
    // Split by comma and trim each option
    const optionArray = options.split(',').map(opt => opt.trim());
    
    // Check for empty options
    const hasEmptyOptions = optionArray.some(opt => opt === '');
    if (hasEmptyOptions) {
        return 'Empty options are not allowed. Remove extra commas';
    }
    
    // Check if at least one option exists
    if (optionArray.length === 0) {
        return 'At least one option is required';
    }
    
    return null;
};

/**
 * Validate relation field required fields
 * @param {object} fieldConfig - Field configuration object
 * @returns {object} Object with error properties for each field
 */
export const validateRelationFields = (fieldConfig) => {
    const errors = {};
    
    if (!fieldConfig.connectwith) {
        errors.connectwith = 'Please select a relation';
    }
    
    if (!fieldConfig.api_end_point || fieldConfig.api_end_point.trim() === '') {
        errors.api_end_point = 'API endpoint is required';
    } else {
        // Validate API endpoint format (should start with / or http)
        const apiEndpoint = fieldConfig.api_end_point.trim();
        if (!apiEndpoint.startsWith('/') && !apiEndpoint.startsWith('http://') && !apiEndpoint.startsWith('https://')) {
            errors.api_end_point = 'API endpoint must start with / or http(s)://';
        }
    }
    
    if (!fieldConfig.CreateUrl || fieldConfig.CreateUrl.trim() === '') {
        errors.CreateUrl = 'Create URL is required';
    }
    
    if (!fieldConfig.getOptionLabel || fieldConfig.getOptionLabel.trim() === '') {
        errors.getOptionLabel = 'Option label field is required';
    }
    
    if (!fieldConfig.getOptionValue || fieldConfig.getOptionValue.trim() === '') {
        errors.getOptionValue = 'Option value field is required';
    }
    
    return errors;
};

/**
 * Validate media field file limit
 * @param {number|string} fileLimit - File limit in MB
 * @returns {string|null} Error message or null if valid
 */
export const validateMediaFileLimit = (fileLimit) => {
    if (fileLimit === '' || fileLimit === null || fileLimit === undefined) {
        return null; // Optional field
    }
    
    const limit = parseFloat(fileLimit);
    
    if (isNaN(limit)) {
        return 'File limit must be a valid number';
    }
    
    if (limit < FILE_LIMIT_MIN || limit > FILE_LIMIT_MAX) {
        return `File limit must be between ${FILE_LIMIT_MIN} and ${FILE_LIMIT_MAX} MB`;
    }
    
    return null;
};

/**
 * Validate component field required fields
 * @param {object} fieldConfig - Field configuration object
 * @returns {object} Object with error properties for each field
 */
export const validateComponentFields = (fieldConfig) => {
    const errors = {};
    
    // Validate component_key (Db Field - database field name)
    if (!fieldConfig.component_key || fieldConfig.component_key.trim() === '') {
        errors.component_key = 'Component key (Db Field) is required';
    } else if (!FIELD_NAME_PATTERN.test(fieldConfig.component_key)) {
        errors.component_key = 'No spaces allowed. Use underscores or camelCase';
    }
    
    // Validate component_display_name (What is this component called?)
    if (!fieldConfig.component_display_name || fieldConfig.component_display_name.trim() === '') {
        errors.component_display_name = 'Component display name is required';
    }
    
    // Validate category
    if (!fieldConfig.component_category || fieldConfig.component_category.trim() === '') {
        errors.component_category = 'Category is required';
    }
    
    // Validate icon (optional - can have a default)
    // Icon validation removed as it can have a default value
    
    return errors;
};

/**
 * Process enumeration options
 * Trims, deduplicates, and removes empty options
 * @param {string} options - Comma-separated options
 * @returns {string} Processed options string
 */
export const processEnumerationOptions = (options) => {
    if (!options || options.trim() === '') {
        return '';
    }
    
    // Split by comma, trim each option, and remove empty values
    const optionArray = options
        .split(',')
        .map(opt => opt.trim())
        .filter(opt => opt !== '');
    
    // Deduplicate options while preserving order
    const uniqueOptions = [...new Set(optionArray)];
    
    // Join back with comma
    return uniqueOptions.join(',');
};

/**
 * Main validation function for field configuration
 * @param {object} fieldConfig - Field configuration object
 * @param {Array} existingFields - Array of existing field configurations
 * @param {boolean} isEdit - Whether this is an edit operation
 * @returns {object} Object with error messages for each field
 */
export const validateFieldConfiguration = (fieldConfig, existingFields = [], isEdit = false) => {
    const errors = {};
    
    // Basic field validations
    const fieldNameError = validateFieldName(fieldConfig.field?.value);
    if (fieldNameError) {
        errors.field = fieldNameError;
    } else {
        // Check for duplicates only if field name is valid
        const duplicateError = validateDuplicateFieldName(
            fieldConfig.field?.value,
            existingFields,
            isEdit ? fieldConfig.field?.value : null
        );
        if (duplicateError) {
            errors.field = duplicateError;
        }
    }
    
    // Print value validation
    const printValueError = validateRequired(fieldConfig.Printvalue, 'Print value');
    if (printValueError) {
        errors.Printvalue = printValueError;
    }
    
    // Regex pattern validation (if provided)
    if (fieldConfig.match_regex) {
        const regexError = validateRegexPattern(fieldConfig.match_regex);
        if (regexError) {
            errors.match_regex = regexError;
        }
    }
    
    // Type-specific validations
    switch (fieldConfig.type) {
        case 'number':
            const numberRangeErrors = validateNumberRange(
                fieldConfig.min_value,
                fieldConfig.max_value
            );
            if (numberRangeErrors.minError) {
                errors.min_value = numberRangeErrors.minError;
            }
            if (numberRangeErrors.maxError) {
                errors.max_value = numberRangeErrors.maxError;
            }
            break;
            
        case 'enumeration':
            const enumError = validateEnumerationOptions(fieldConfig.option_value);
            if (enumError) {
                errors.option_value = enumError;
            }
            break;
            
        case 'relation':
            const relationErrors = validateRelationFields(fieldConfig);
            Object.assign(errors, relationErrors);
            break;
            
        case 'media':
            const fileLimitError = validateMediaFileLimit(fieldConfig.fileLimit);
            if (fileLimitError) {
                errors.fileLimit = fileLimitError;
            }
            
            // Validate accept type regex if provided
            if (fieldConfig.accept_type) {
                const acceptTypeError = validateRegexPattern(fieldConfig.accept_type);
                if (acceptTypeError) {
                    errors.accept_type = acceptTypeError;
                }
            }
            break;
            
        case 'component':
            const componentErrors = validateComponentFields(fieldConfig);
            Object.assign(errors, componentErrors);
            break;
    }
    
    return errors;
};

/**
 * Create a debounced validation function
 * @param {Function} validationFunc - Validation function to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {Function} Debounced validation function
 */
export const createDebouncedValidator = (validationFunc, delay = 300) => {
    return debounce(validationFunc, delay);
};
