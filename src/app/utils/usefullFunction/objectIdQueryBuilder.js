import mongoose from "mongoose";

const isObjectId = (v) =>
  mongoose.Types.ObjectId.isValid(v) &&
  String(new mongoose.Types.ObjectId(v)) === v;

/**
 * Builds Mongo query ONLY for ObjectId fields
 * Accepts object of fields
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

    // ❌ Skip field if no valid ObjectIds
    if (!ids.length) continue;

    // ✅ Single ObjectId
    if (ids.length === 1) {
      andConditions.push({ [field]: ids[0] });
    } 
    // ✅ Multiple ObjectIds
    else {
      andConditions.push({ [field]: { $in: ids } });
    }
  }

  // ❌ No ObjectId filters at all
  if (!andConditions.length) return {};

  return { $and: andConditions };
};
