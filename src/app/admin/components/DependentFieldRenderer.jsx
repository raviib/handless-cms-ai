"use client";
import { useMemo } from 'react';
import { evaluateFieldDependency } from '@/app/admin/setting/pages-conf/utils/fieldDependencyUtils';

/**
 * DependentFieldRenderer Component
 * Wraps field rendering with dependency logic
 * Shows/hides or enables/disables fields based on dependencies
 * 
 * @param {object} field - The field configuration
 * @param {object} formData - Current form values
 * @param {function} children - Render function that receives dependency state
 */
export const DependentFieldRenderer = ({ field, formData, children }) => {
    // Evaluate field dependency
    const dependencyState = useMemo(() => {
        if (!field.dependency_field) {
            return { visible: true, enabled: true };
        }
        
        return evaluateFieldDependency(field, formData);
    }, [field, formData]);

    // If field is not visible, don't render it
    if (!dependencyState.visible) {
        return null;
    }

    // Pass dependency state to children
    return children(dependencyState);
};

/**
 * Hook to filter visible fields based on dependencies
 * 
 * @param {array} fields - Array of field configurations
 * @param {object} formData - Current form values
 * @returns {array} - Filtered array of visible fields with dependency states
 */
export const useVisibleFields = (fields, formData) => {
    return useMemo(() => {
        if (!fields || !Array.isArray(fields)) return [];
        
        return fields
            .map(field => {
                const dependencyState = field.dependency_field
                    ? evaluateFieldDependency(field, formData)
                    : { visible: true, enabled: true };
                
                return {
                    ...field,
                    _dependencyState: dependencyState
                };
            })
            .filter(field => field._dependencyState.visible);
    }, [fields, formData]);
};

/**
 * Check if a field should be disabled
 * 
 * @param {object} field - The field configuration
 * @param {object} formData - Current form values
 * @returns {boolean} - Whether the field should be disabled
 */
export const isFieldDisabled = (field, formData) => {
    if (!field.dependency_field) {
        return field.disable_in_edit || false;
    }
    
    const { enabled } = evaluateFieldDependency(field, formData);
    return !enabled || field.disable_in_edit;
};
