/**
 * syncLocaleFields
 *
 * After saving a document, propagates specified shared fields (e.g. slug, name)
 * to ALL sibling translations that share the same rootId.
 *
 * @param {Model}  Model       - Mongoose model
 * @param {string} savedDocId  - _id of the document just saved
 * @param {object} objToPush   - the fields that were saved
 * @param {string[]} sharedFields - field names that must stay in sync across all langs
 */
export async function syncLocaleFields(Model, savedDocId, objToPush, sharedFields = []) {
    // Build the subset of fields that need syncing
    const toSync = {};
    for (const field of sharedFields) {
        if (objToPush[field] !== undefined) {
            toSync[field] = objToPush[field];
        }
    }

    if (Object.keys(toSync).length === 0) return; // nothing to sync

    // Find the saved doc to get its rootId
    const savedDoc = await Model.findById(savedDocId).select("rootId lang").lean();
    if (!savedDoc) return;

    const rootId = savedDoc.rootId ?? savedDocId;

    // Update all siblings (different lang, same rootId) with the shared fields
    await Model.updateMany(
        {
            rootId,
            _id: { $ne: savedDocId } // skip the doc we just saved
        },
        { $set: toSync }
    );
}
