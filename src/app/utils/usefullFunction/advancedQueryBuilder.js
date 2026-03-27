import mongoose from "mongoose";

const isObjectId = (v) =>
  mongoose.Types.ObjectId.isValid(v) &&
  String(new mongoose.Types.ObjectId(v)) === v;

/**
 * Builds advanced MongoDB query with support for various operators
 * Supports Strapi-like filter syntax
 * 
 * Filter format: filters[field][operator]=value
 * Example: filters[name][$eq]=John&filters[age][$gt]=25
 * 
 * Supported operators:
 * - $eq: Equal
 * - $ne: Not equal
 * - $gt: Greater than
 * - $gte: Greater than or equal
 * - $lt: Less than
 * - $lte: Less than or equal
 * - $in: In array
 * - $nin: Not in array
 * - $contains: Contains (case-insensitive regex)
 * - $notContains: Does not contain
 * - $startsWith: Starts with
 * - $endsWith: Ends with
 * - $null: Is null
 * - $notNull: Is not null
 */
export const buildAdvancedQuery = (searchParams) => {
  const query = {};
  const filters = {};

  // Parse search params
  for (const [key, value] of searchParams.entries()) {
    // Check if it's a filter parameter: filters[field][operator]
    const filterMatch = key.match(/^filters\[([^\]]+)\]\[([^\]]+)\]$/);
    
    if (filterMatch) {
      const [, field, operator] = filterMatch;
      if (!filters[field]) filters[field] = {};
      filters[field][operator] = value;
    } else {
      // Regular query parameter
      query[key] = value;
    }
  }

  // Build MongoDB query from filters
  const mongoQuery = {};
  const andConditions = [];

  for (const [field, operators] of Object.entries(filters)) {
    for (const [operator, rawValue] of Object.entries(operators)) {
      const condition = buildCondition(field, operator, rawValue);
      if (condition) {
        andConditions.push(condition);
      }
    }
  }

  if (andConditions.length > 0) {
    mongoQuery.$and = andConditions;
  }

  return { mongoQuery, regularQuery: query };
};

function buildCondition(field, operator, rawValue) {
  // Handle null checks
  if (operator === '$null') {
    return { [field]: rawValue === 'true' ? null : { $ne: null } };
  }
  
  if (operator === '$notNull') {
    return { [field]: rawValue === 'true' ? { $ne: null } : null };
  }

  // Handle empty value
  if (rawValue === '' || rawValue === null || rawValue === undefined) {
    return null;
  }

  switch (operator) {
    case '$eq':
      return buildEqualCondition(field, rawValue);
    
    case '$ne':
      return { [field]: { $ne: parseValue(rawValue) } };
    
    case '$gt':
      return { [field]: { $gt: parseValue(rawValue) } };
    
    case '$gte':
      return { [field]: { $gte: parseValue(rawValue) } };
    
    case '$lt':
      return { [field]: { $lt: parseValue(rawValue) } };
    
    case '$lte':
      return { [field]: { $lte: parseValue(rawValue) } };
    
    case '$in':
      return buildInCondition(field, rawValue);
    
    case '$nin':
      const values = rawValue.split(',').map(v => parseValue(v.trim()));
      return { [field]: { $nin: values } };
    
    case '$contains':
      return { [field]: { $regex: escapeRegex(rawValue), $options: 'i' } };
    
    case '$notContains':
      return { [field]: { $not: { $regex: escapeRegex(rawValue), $options: 'i' } } };
    
    case '$startsWith':
      return { [field]: { $regex: `^${escapeRegex(rawValue)}`, $options: 'i' } };
    
    case '$endsWith':
      return { [field]: { $regex: `${escapeRegex(rawValue)}$`, $options: 'i' } };
    
    default:
      // If no operator specified, treat as $eq
      return buildEqualCondition(field, rawValue);
  }
}

function buildEqualCondition(field, rawValue) {
  const value = parseValue(rawValue);
  
  // Handle ObjectId
  if (isObjectId(value)) {
    return { [field]: new mongoose.Types.ObjectId(value) };
  }
  
  return { [field]: value };
}

function buildInCondition(field, rawValue) {
  const values = rawValue.split(',').map(v => v.trim());
  const parsedValues = [];
  
  for (const v of values) {
    const parsed = parseValue(v);
    if (isObjectId(parsed)) {
      parsedValues.push(new mongoose.Types.ObjectId(parsed));
    } else {
      parsedValues.push(parsed);
    }
  }
  
  return { [field]: { $in: parsedValues } };
}

function parseValue(value) {
  // Try to parse as number
  if (!isNaN(value) && value.trim() !== '') {
    return Number(value);
  }
  
  // Parse boolean
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  // Return as string
  return value;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Legacy function for backward compatibility
 * Builds query for ObjectId fields with comma-separated values
 */
export const buildObjectIdQuery = (fieldsObj = {}) => {
  const andConditions = [];

  for (const [field, rawValue] of Object.entries(fieldsObj)) {
    if (!rawValue) continue;

    const values = rawValue.includes(",")
      ? rawValue.split(",").map(v => v.trim())
      : [rawValue];

    const ids = [];

    for (const v of values) {
      if (isObjectId(v)) {
        ids.push(new mongoose.Types.ObjectId(v));
      }
    }

    // Skip field if no valid ObjectIds
    if (!ids.length) continue;

    // Single ObjectId
    if (ids.length === 1) {
      andConditions.push({ [field]: ids[0] });
    } 
    // Multiple ObjectIds
    else {
      andConditions.push({ [field]: { $in: ids } });
    }
  }

  // No ObjectId filters at all
  if (!andConditions.length) return {};

  return { $and: andConditions };
};
