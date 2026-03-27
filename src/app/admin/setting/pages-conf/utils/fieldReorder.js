/**
 * Utility functions for field reordering with drag and drop
 */

/**
 * Reorders fields array by moving an item from one index to another
 * and updates sort values for all affected fields
 * 
 * @param {Array} fields - The current fields array
 * @param {number} fromIndex - The index of the field being dragged
 * @param {number} toIndex - The index where the field is being dropped
 * @returns {Array} - New fields array with updated order and sort values
 */
export const reorderFields = (fields, fromIndex, toIndex) => {
  // Validate inputs
  if (!Array.isArray(fields)) {
    throw new Error('fields must be an array');
  }
  
  if (fromIndex < 0 || fromIndex >= fields.length) {
    throw new Error('fromIndex is out of bounds');
  }
  
  if (toIndex < 0 || toIndex >= fields.length) {
    throw new Error('toIndex is out of bounds');
  }
  
  if (fromIndex === toIndex) {
    return fields; // No change needed
  }
  
  // Create a shallow copy of the fields array
  const newFields = [...fields];
  
  // Remove the field from its original position
  const [movedField] = newFields.splice(fromIndex, 1);
  
  // Insert the field at its new position
  newFields.splice(toIndex, 0, movedField);
  
  // Update sort values for all fields based on their new positions
  const updatedFields = newFields.map((field, index) => ({
    ...field,
    sort: index
  }));
  
  return updatedFields;
};

/**
 * Reorders nested fields within a component
 * 
 * @param {Array} fields - The root fields array
 * @param {Array} componentPath - Path to the component (e.g., ['address', 'location'])
 * @param {number} fromIndex - The index of the nested field being dragged
 * @param {number} toIndex - The index where the nested field is being dropped
 * @returns {Array} - New fields array with updated nested field order
 */
export const reorderNestedFields = (fields, componentPath, fromIndex, toIndex) => {
  if (!Array.isArray(componentPath) || componentPath.length === 0) {
    // If no component path, reorder at root level
    return reorderFields(fields, fromIndex, toIndex);
  }
  
  // Deep clone the fields array to avoid mutations
  const newFields = structuredClone(fields);
  
  // Navigate to the target component
  let currentLevel = newFields;
  for (let i = 0; i < componentPath.length; i++) {
    const componentName = componentPath[i];
    const componentField = currentLevel.find(f => 
      f.type === 'component' && f.field.value === componentName
    );
    
    if (!componentField) {
      throw new Error(`Component '${componentName}' not found in path`);
    }
    
    if (!componentField.fields) {
      componentField.fields = [];
    }
    
    // If this is the last component in the path, reorder its fields
    if (i === componentPath.length - 1) {
      componentField.fields = reorderFields(componentField.fields, fromIndex, toIndex);
    } else {
      // Continue navigating deeper
      currentLevel = componentField.fields;
    }
  }
  
  return newFields;
};

/**
 * Gets the display position for a field considering its nesting level
 * Used for visual feedback during drag operations
 * 
 * @param {Object} field - The field object
 * @param {number} level - The nesting level (0 for root)
 * @returns {Object} - Object with visual properties for the field
 */
export const getFieldDisplayProps = (field, level = 0) => {
  return {
    paddingLeft: level * 24, // 24px per level
    hasChildren: field.type === 'component' && field.fields && field.fields.length > 0,
    childCount: field.fields?.length || 0,
    isComponent: field.type === 'component'
  };
};

/**
 * Validates if a field can be reordered to a specific position
 * 
 * @param {Array} fields - The fields array
 * @param {number} fromIndex - Source index
 * @param {number} toIndex - Target index
 * @returns {boolean} - Whether the reorder is valid
 */
export const canReorderField = (fields, fromIndex, toIndex) => {
  if (!Array.isArray(fields)) return false;
  if (fromIndex < 0 || fromIndex >= fields.length) return false;
  if (toIndex < 0 || toIndex >= fields.length) return false;
  if (fromIndex === toIndex) return false;
  
  return true;
};
