/**
 * Field Selector Utility
 * Handles select and except query parameters for MongoDB queries
 * 
 * @param {URLSearchParams} searchParams - The URL search parameters
 * @returns {Object} - MongoDB select object or empty string
 * 
 * Usage:
 * - ?select=name,email,phone  -> Returns only these fields
 * - ?except=password,__v      -> Returns all fields except these
 * - If both provided, 'select' takes priority
 * - If neither provided, returns all fields
 */
export function getFieldSelector(searchParams) {
    const selectParam = searchParams.get('select');
    const exceptParam = searchParams.get('except');
    
    // If select parameter is provided, return only those fields
    if (selectParam) {
        const fields = selectParam.split(',').map(f => f.trim()).filter(Boolean);
        if (fields.length > 0) {
            // Convert array to MongoDB select object: { field1: 1, field2: 1 }
            return fields.reduce((acc, field) => {
                acc[field] = 1;
                return acc;
            }, {});
        }
    }
    
    // If except parameter is provided, exclude those fields
    if (exceptParam) {
        const fields = exceptParam.split(',').map(f => f.trim()).filter(Boolean);
        if (fields.length > 0) {
            // Convert array to MongoDB exclude object: { field1: 0, field2: 0 }
            return fields.reduce((acc, field) => {
                acc[field] = 0;
                return acc;
            }, {});
        }
    }
    
    // Return empty string to select all fields
    return '';
}

/**
 * Apply field selector to a Mongoose query
 * 
 * @param {Query} query - Mongoose query object
 * @param {URLSearchParams} searchParams - The URL search parameters
 * @returns {Query} - Modified query with field selection applied
 * 
 * Usage:
 * const query = Model.find({});
 * applyFieldSelector(query, request.nextUrl.searchParams);
 */
export function applyFieldSelector(query, searchParams) {
    const selector = getFieldSelector(searchParams);
    if (selector && Object.keys(selector).length > 0) {
        return query.select(selector);
    }
    return query;
}
