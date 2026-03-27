/**
 * Utility functions for populating relation fields inside dynamic zones
 * Since dynamic zones use Schema.Types.Mixed, Mongoose doesn't auto-populate
 * We need to manually populate relation fields based on component definitions
 */

import pageComponentSchema from "@/app/(backend)/models/setting/page-component/page-component.modal.js";

/**
 * Populate relation fields in a dynamic zone array
 * @param {Array} dynamicZoneData - Array of dynamic zone items
 * @param {Object} mongoose - Mongoose instance
 * @returns {Promise<Array>} - Populated dynamic zone data
 */
export async function populateDynamicZone(dynamicZoneData, mongoose) {
    if (!dynamicZoneData || !Array.isArray(dynamicZoneData) || dynamicZoneData.length === 0) {
        return dynamicZoneData;
    }

    // Get all unique component IDs from the dynamic zone
    const componentIds = [...new Set(
        dynamicZoneData
            .map(item => item.__componentId)
            .filter(id => id)
    )];

    if (componentIds.length === 0) {
        return dynamicZoneData;
    }

    // Fetch component definitions to know which fields are relations
    const components = await pageComponentSchema.find({
        _id: { $in: componentIds }
    }).lean();

    // Create a map of componentId -> component definition
    const componentMap = {};
    components.forEach(comp => {
        componentMap[comp._id.toString()] = comp;
    });

    // Process each dynamic zone item
    const populatedData = await Promise.all(
        dynamicZoneData.map(async (item) => {
            if (!item.__componentId) {
                return item;
            }

            const component = componentMap[item.__componentId.toString()];
            if (!component || !component.fields) {
                return item;
            }

            // Clone the item to avoid mutation
            const populatedItem = { ...item };

            // Find all relation fields in this component
            const relationFields = component.fields.filter(
                field => field.type === 'relation' && field.connectwith
            );

            // Populate each relation field
            for (const field of relationFields) {
                const fieldName = field.field?.value || field.field;
                const fieldValue = populatedItem[fieldName];

                if (!fieldValue) {
                    continue;
                }

                // Get the model name to populate
                const refModel = typeof field.connectwith === 'string' 
                    ? field.connectwith 
                    : field.connectwith?.pageName;

                if (!refModel) {
                    continue;
                }

                try {
                    const Model = mongoose.models[refModel];
                    if (!Model) {
                        console.warn(`Model ${refModel} not found for population`);
                        continue;
                    }

                    // Determine select fields
                    const selectFields = [];
                    if (field.getOptionLabel) selectFields.push(field.getOptionLabel);
                    if (field.getOptionValue) selectFields.push(field.getOptionValue);
                    if (selectFields.length === 0) {
                        selectFields.push('name', 'displayName', '_id');
                    }

                    // Handle multiple vs single relation
                    if (field.isMultiple && Array.isArray(fieldValue)) {
                        const ids = fieldValue.filter(id => id);
                        if (ids.length > 0) {
                            const populated = await Model.find({
                                _id: { $in: ids }
                            }).select(selectFields.join(' ')).lean();
                            populatedItem[fieldName] = populated;
                        }
                    } else if (fieldValue) {
                        const populated = await Model.findById(fieldValue)
                            .select(selectFields.join(' '))
                            .lean();
                        populatedItem[fieldName] = populated;
                    }
                } catch (error) {
                    console.error(`Error populating ${fieldName}:`, error.message);
                }
            }

            // Recursively handle nested components
            await populateNestedComponents(populatedItem, component.fields, mongoose);

            return populatedItem;
        })
    );

    return populatedData;
}

/**
 * Recursively populate relation fields in nested components
 * @param {Object} item - The item containing nested components
 * @param {Array} fields - Field definitions
 * @param {Object} mongoose - Mongoose instance
 */
async function populateNestedComponents(item, fields, mongoose) {
    if (!fields || !Array.isArray(fields)) {
        return;
    }

    for (const field of fields) {
        if (field.type !== 'component') {
            continue;
        }

        const fieldName = field.field?.value || field.field;
        const fieldValue = item[fieldName];

        if (!fieldValue) {
            continue;
        }

        // Handle repeatable components (arrays)
        if (field.component_type === 'repeatable' && Array.isArray(fieldValue)) {
            for (const nestedItem of fieldValue) {
                await populateRelationsInObject(nestedItem, field.fields, mongoose);
            }
        } 
        // Handle single components (objects)
        else if (field.component_type === 'single' && typeof fieldValue === 'object') {
            await populateRelationsInObject(fieldValue, field.fields, mongoose);
        }
    }
}

/**
 * Populate relation fields in a single object
 * @param {Object} obj - Object to populate
 * @param {Array} fields - Field definitions
 * @param {Object} mongoose - Mongoose instance
 */
async function populateRelationsInObject(obj, fields, mongoose) {
    if (!obj || !fields) {
        return;
    }

    const relationFields = fields.filter(
        field => field.type === 'relation' && field.connectwith
    );

    for (const field of relationFields) {
        const fieldName = field.field?.value || field.field;
        const fieldValue = obj[fieldName];

        if (!fieldValue) {
            continue;
        }

        const refModel = typeof field.connectwith === 'string' 
            ? field.connectwith 
            : field.connectwith?.pageName;

        if (!refModel) {
            continue;
        }

        try {
            const Model = mongoose.models[refModel];
            if (!Model) {
                continue;
            }

            const selectFields = [];
            if (field.getOptionLabel) selectFields.push(field.getOptionLabel);
            if (field.getOptionValue) selectFields.push(field.getOptionValue);
            if (selectFields.length === 0) {
                selectFields.push('name', 'displayName', '_id');
            }

            if (field.isMultiple && Array.isArray(fieldValue)) {
                const ids = fieldValue.filter(id => id);
                if (ids.length > 0) {
                    const populated = await Model.find({
                        _id: { $in: ids }
                    }).select(selectFields.join(' ')).lean();
                    obj[fieldName] = populated;
                }
            } else if (fieldValue) {
                const populated = await Model.findById(fieldValue)
                    .select(selectFields.join(' '))
                    .lean();
                obj[fieldName] = populated;
            }
        } catch (error) {
            console.error(`Error populating nested ${fieldName}:`, error.message);
        }
    }

    // Recursively handle nested components
    await populateNestedComponents(obj, fields, mongoose);
}

/**
 * Populate multiple dynamic zone fields in a document
 * @param {Object} document - The document containing dynamic zones
 * @param {Array} dynamicZoneFieldNames - Array of field names that are dynamic zones
 * @param {Object} mongoose - Mongoose instance
 * @returns {Promise<Object>} - Document with populated dynamic zones
 */
export async function populateMultipleDynamicZones(document, dynamicZoneFieldNames, mongoose) {
    if (!document || !dynamicZoneFieldNames || dynamicZoneFieldNames.length === 0) {
        return document;
    }

    const populatedDoc = { ...document };

    for (const fieldName of dynamicZoneFieldNames) {
        if (populatedDoc[fieldName]) {
            populatedDoc[fieldName] = await populateDynamicZone(
                populatedDoc[fieldName],
                mongoose
            );
        }
    }

    return populatedDoc;
}
