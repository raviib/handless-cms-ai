import { useMemo } from 'react';
import { 
    evaluateFieldDependency, 
    evaluateAllFieldDependencies,
    getVisibleFields,
    isFieldDisabled 
} from '../utils/fieldDependencyUtils';

/**
 * Custom hook to manage field dependencies in forms
 * 
 * @param {array} fields - Array of field configurations with dependency settings
 * @param {object} formValues - Current form values (key-value pairs)
 * @returns {object} - Helper functions and computed values
 * 
 * @example
 * const { visibleFields, isVisible, isDisabled } = useFieldDependencies(fields, formValues);
 * 
 * // Render only visible fields
 * {visibleFields.map(field => (
 *   <TextField
 *     key={field.field.value}
 *     disabled={isDisabled(field)}
 *     ...
 *   />
 * ))}
 */
export const useFieldDependencies = (fields = [], formValues = {}) => {
    // Memoize evaluated fields to prevent unnecessary recalculations
    const evaluatedFields = useMemo(() => {
        return evaluateAllFieldDependencies(fields, formValues);
    }, [fields, formValues]);

    // Get only visible fields
    const visibleFields = useMemo(() => {
        return evaluatedFields.filter(field => field._dependencyState.visible);
    }, [evaluatedFields]);

    // Helper function to check if a specific field is visible
    const isVisible = (field) => {
        if (!field) return true;
        const { visible } = evaluateFieldDependency(field, formValues);
        return visible;
    };

    // Helper function to check if a specific field is disabled
    const isDisabled = (field) => {
        if (!field) return false;
        return isFieldDisabled(field, formValues);
    };

    // Helper function to get dependency state for a field
    const getDependencyState = (field) => {
        if (!field) return { visible: true, enabled: true };
        return evaluateFieldDependency(field, formValues);
    };

    // Get fields grouped by visibility
    const fieldsByVisibility = useMemo(() => {
        return {
            visible: evaluatedFields.filter(f => f._dependencyState.visible),
            hidden: evaluatedFields.filter(f => !f._dependencyState.visible)
        };
    }, [evaluatedFields]);

    // Get fields grouped by enabled state
    const fieldsByEnabledState = useMemo(() => {
        return {
            enabled: evaluatedFields.filter(f => f._dependencyState.enabled),
            disabled: evaluatedFields.filter(f => !f._dependencyState.enabled)
        };
    }, [evaluatedFields]);

    return {
        // Computed arrays
        evaluatedFields,      // All fields with dependency state
        visibleFields,        // Only visible fields
        fieldsByVisibility,   // Fields grouped by visibility
        fieldsByEnabledState, // Fields grouped by enabled state
        
        // Helper functions
        isVisible,            // Check if a field is visible
        isDisabled,           // Check if a field is disabled
        getDependencyState    // Get full dependency state for a field
    };
};

/**
 * Hook to manage nested component field dependencies
 * Handles dependencies within nested component structures
 * 
 * @param {array} sections - Array of sections with nested fields
 * @param {object} formValues - Current form values
 * @returns {object} - Helper functions for nested dependencies
 */
export const useNestedFieldDependencies = (sections = [], formValues = {}) => {
    // Recursively evaluate dependencies for nested fields
    const evaluateNestedFields = (fields, parentPath = []) => {
        return fields.map(field => {
            const fieldPath = [...parentPath, field.field?.value].filter(Boolean);
            
            // Evaluate dependency for this field
            const dependencyState = evaluateFieldDependency(field, formValues);
            
            // If this is a component with nested fields, evaluate them too
            if (field.type === 'component' && field.fields && field.fields.length > 0) {
                return {
                    ...field,
                    _dependencyState: dependencyState,
                    _fieldPath: fieldPath,
                    fields: evaluateNestedFields(field.fields, fieldPath)
                };
            }
            
            return {
                ...field,
                _dependencyState: dependencyState,
                _fieldPath: fieldPath
            };
        });
    };

    // Evaluate all sections with nested dependencies
    const evaluatedSections = useMemo(() => {
        return sections.map(section => ({
            ...section,
            fields: evaluateNestedFields(section.fields || [])
        }));
    }, [sections, formValues]);

    // Get all visible fields (flattened)
    const getAllVisibleFields = () => {
        const flattenFields = (fields) => {
            return fields.reduce((acc, field) => {
                if (field._dependencyState.visible) {
                    acc.push(field);
                    if (field.type === 'component' && field.fields) {
                        acc.push(...flattenFields(field.fields));
                    }
                }
                return acc;
            }, []);
        };

        return evaluatedSections.reduce((acc, section) => {
            acc.push(...flattenFields(section.fields || []));
            return acc;
        }, []);
    };

    return {
        evaluatedSections,
        getAllVisibleFields,
        isVisible: (field) => {
            if (!field) return true;
            const { visible } = evaluateFieldDependency(field, formValues);
            return visible;
        },
        isDisabled: (field) => {
            if (!field) return false;
            return isFieldDisabled(field, formValues);
        }
    };
};
