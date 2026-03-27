/**
 * Field Dependency Utilities
 * Helper functions to evaluate and apply field dependencies in UI forms
 */

/**
 * Check if a field should be visible/enabled based on its dependency configuration
 * 
 * @param {object} field - The field configuration with dependency settings
 * @param {object} formValues - Current form values (key-value pairs)
 * @returns {object} - { visible: boolean, enabled: boolean }
 */
export const evaluateFieldDependency = (field, formValues) => {
    // Default state - field is visible and enabled
    let visible = true;
    let enabled = true;

    // If no dependency is configured, return defaults
    if (!field.dependency_field) {
        return { visible, enabled };
    }

    // Get the value of the dependency field from form values
    const dependencyFieldValue = formValues[field.dependency_field];
    
    // Check if the dependency field has data (not empty)
    const hasData = checkFieldHasData(dependencyFieldValue);

    // Apply the dependency action based on whether field has data
    switch (field.dependency_action) {
        case 'show':
            // Show field when dependency has data, hide when empty
            visible = hasData;
            break;
        
        case 'hide':
            // Hide field when dependency has data, show when empty
            visible = !hasData;
            break;
        
        case 'enable':
            // Enable field when dependency has data, disable when empty
            enabled = hasData;
            break;
        
        case 'disable':
            // Disable field when dependency has data, enable when empty
            enabled = !hasData;
            break;
        
        default:
            // Unknown action, use defaults
            break;
    }

    return { visible, enabled };
};

/**
 * Check if a field has data (not empty)
 * Handles different value types (boolean, string, number, array, object)
 * 
 * @param {any} value - The value to check
 * @returns {boolean} - Whether the field has data
 */
const checkFieldHasData = (value) => {
    // Null or undefined = no data
    if (value === null || value === undefined) {
        return false;
    }

    // Empty string = no data
    if (typeof value === 'string' && value.trim() === '') {
        return false;
    }

    // Boolean false is still considered as "has data" (user made a choice)
    if (typeof value === 'boolean') {
        return true;
    }

    // Number 0 is still considered as "has data"
    if (typeof value === 'number') {
        return true;
    }

    // Empty array = no data
    if (Array.isArray(value) && value.length === 0) {
        return false;
    }

    // Empty object = no data
    if (typeof value === 'object' && Object.keys(value).length === 0) {
        return false;
    }

    // All other cases = has data
    return true;
};

/**
 * Get all fields with their dependency states evaluated
 * Useful for rendering entire forms with dependencies
 * 
 * @param {array} fields - Array of field configurations
 * @param {object} formValues - Current form values
 * @returns {array} - Array of fields with added dependency state
 */
export const evaluateAllFieldDependencies = (fields, formValues) => {
    return fields.map(field => {
        const dependencyState = evaluateFieldDependency(field, formValues);
        return {
            ...field,
            _dependencyState: dependencyState
        };
    });
};

/**
 * Get fields that should be rendered (visible fields only)
 * 
 * @param {array} fields - Array of field configurations
 * @param {object} formValues - Current form values
 * @returns {array} - Filtered array of visible fields
 */
export const getVisibleFields = (fields, formValues) => {
    return evaluateAllFieldDependencies(fields, formValues)
        .filter(field => field._dependencyState.visible);
};

/**
 * Check if a field should be disabled
 * 
 * @param {object} field - The field configuration
 * @param {object} formValues - Current form values
 * @returns {boolean} - Whether the field should be disabled
 */
export const isFieldDisabled = (field, formValues) => {
    const { enabled } = evaluateFieldDependency(field, formValues);
    return !enabled || field.disable_in_edit;
};

/**
 * Validate that dependency configurations are valid
 * Used during field configuration to prevent circular dependencies
 * 
 * @param {array} fields - Array of all fields
 * @param {object} newField - The new field being added/edited
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateDependencyConfiguration = (fields, newField) => {
    // If no dependency, it's valid
    if (!newField.dependency_field) {
        return { valid: true, error: null };
    }

    // Check if dependency field exists
    const dependencyField = fields.find(f => f.field?.value === newField.dependency_field);
    if (!dependencyField) {
        return { 
            valid: false, 
            error: 'Dependency field not found' 
        };
    }

    // Check for circular dependencies
    const hasCircularDependency = checkCircularDependency(
        fields,
        newField.field?.value,
        newField.dependency_field,
        new Set()
    );

    if (hasCircularDependency) {
        return {
            valid: false,
            error: 'Circular dependency detected. Field A cannot depend on Field B if Field B depends on Field A.'
        };
    }

    return { valid: true, error: null };
};

/**
 * Recursively check for circular dependencies
 * 
 * @param {array} fields - All fields
 * @param {string} currentFieldValue - Current field being checked
 * @param {string} targetFieldValue - Target dependency field
 * @param {Set} visited - Set of visited fields (to detect cycles)
 * @returns {boolean} - Whether a circular dependency exists
 */
const checkCircularDependency = (fields, currentFieldValue, targetFieldValue, visited) => {
    // If we've already visited this field, we have a cycle
    if (visited.has(targetFieldValue)) {
        return true;
    }

    // Find the target field
    const targetField = fields.find(f => f.field?.value === targetFieldValue);
    
    // If target field doesn't exist or has no dependency, no cycle
    if (!targetField || !targetField.dependency_field) {
        return false;
    }

    // If target field depends on current field, we have a cycle
    if (targetField.dependency_field === currentFieldValue) {
        return true;
    }

    // Add current target to visited set and check its dependency
    visited.add(targetFieldValue);
    return checkCircularDependency(
        fields,
        currentFieldValue,
        targetField.dependency_field,
        visited
    );
};

/**
 * Get dependency chain for a field (for debugging/visualization)
 * 
 * @param {array} fields - All fields
 * @param {string} fieldValue - Field to get chain for
 * @returns {array} - Array of field values in dependency chain
 */
export const getDependencyChain = (fields, fieldValue) => {
    const chain = [fieldValue];
    let currentField = fields.find(f => f.field?.value === fieldValue);

    while (currentField && currentField.dependency_field) {
        chain.push(currentField.dependency_field);
        currentField = fields.find(f => f.field?.value === currentField.dependency_field);
        
        // Prevent infinite loops
        if (chain.length > fields.length) {
            break;
        }
    }

    return chain;
};
