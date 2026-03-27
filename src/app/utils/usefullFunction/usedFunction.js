

function formatDate(inputDate) {

  if (!inputDate) {
    return "N/A"
  }
  const date = new Date(inputDate);

  // Get month name and day
  const month = date.toLocaleString('en-US', { month: 'long' });
  const day = date.getDate();

  // Add appropriate suffix to the day
  let daySuffix = 'th';
  if (day === 1 || day === 21 || day === 31) {
    daySuffix = 'st';
  } else if (day === 2 || day === 22) {
    daySuffix = 'nd';
  } else if (day === 3 || day === 23) {
    daySuffix = 'rd';
  }

  // Format the output
  const formattedDate = `${month} ${day}${daySuffix}, ${date.getFullYear()}`;

  return formattedDate;
}
function convertToSEOUrl(text) {
  // Remove special characters and spaces
  const cleanedText = text.replace(/[^\w\s]/gi, '').trim();
  // Convert to lowercase
  const lowercaseText = cleanedText.toLowerCase();
  // Replace spaces with hyphens
  const seoUrl = lowercaseText.replace(/\s+/g, '-');
  return seoUrl;
}
const converIntoDefultFieldForForm = async ({ Page_Fields = [] }) => {
  return new Promise((resolve, reject) => {
    let DEFAULT_OBJECT = {}
    const objectField = [];

    // Helper function to get default value based on field type and name
    const getDefaultValueForField = (field) => {
      const fieldName = field.field?.value || field.field;

      // First check if field has a configured default_value
      if (field.default_value !== undefined && field.default_value !== null && field.default_value !== "") {
        // Parse boolean strings
        if (field.default_value === "true") return true;
        if (field.default_value === "false") return false;

        // Parse enumeration multiple (handle both array and comma-separated string)
        if (field.type === "enumeration" && field.enumeration_type === "multiple") {
          if (Array.isArray(field.default_value)) {
            return field.default_value;
          } else if (typeof field.default_value === 'string') {
            return field.default_value.split(',').map(v => v.trim()).filter(v => v);
          }
          return [];
        }

        // Parse numbers if field type suggests it
        if (field.type === "number" && !isNaN(field.default_value)) {
          return Number(field.default_value);
        }

        return field.default_value;
      }

      // Check for special field names
      if (fieldName === "isActive" || fieldName === "showInHomePage" || fieldName === "showInHeader") {
        return true;
      } else if (fieldName === "sort") {
        return -1;
      }

      // Then check field type
      if (field.type === "relation") {
        return field.isMultiple ? [] : null;
      } else if (field.type === "boolean") {
        return false;
      } else if (field.type === "enumeration" && field.enumeration_type === "multiple") {
        return [];
      } else if (field.type === "media" && field.isMulti) {
        return [];
      } else {
        return "";
      }
    };

    // Helper function to initialize component fields recursively
    const initializeComponentFields = (component) => {
      if (!component || !component.fields) return null;

      if (component.component_type === "repeatable") {
        // Repeatable component: initialize as empty array
        return [];
      } else {
        // Single component: initialize as object with nested fields
        const componentObj = {};
        component.fields.forEach((subField) => {
          const fieldName = subField.field?.value || subField.field;
          if (subField.type === "component") {
            // Nested component - recursively initialize
            componentObj[fieldName] = initializeComponentFields(subField);
          } else {
            // Regular field - apply default value logic
            componentObj[fieldName] = getDefaultValueForField(subField);
          }
        });
        return componentObj;
      }
    };

    Page_Fields.forEach((section) => {
      section.fields.forEach((field) => {
        const fieldName = field.field?.value || field.field;

        if (field.type === "component") {
          // Handle component type
          const componentValue = initializeComponentFields(field);
          DEFAULT_OBJECT[fieldName] = componentValue;
          objectField.push(fieldName);
        } else if (field.type === "relation") {
          // Handle relation fields
          if (field.isMultiple) {
            DEFAULT_OBJECT[fieldName] = getDefaultValueForField(field);
            objectField.push(fieldName);
          } else {
            DEFAULT_OBJECT[fieldName] = getDefaultValueForField(field);
            objectField.push(fieldName);
          }
        } else if (field.type === "boolean") {
          DEFAULT_OBJECT[fieldName] = getDefaultValueForField(field);
        } else if (field.type === "enumeration" && field.enumeration_type === "multiple") {
          DEFAULT_OBJECT[fieldName] = getDefaultValueForField(field);
          objectField.push(fieldName);
        } else if (field.type === "media" && field.isMulti) {
          DEFAULT_OBJECT[fieldName] = getDefaultValueForField(field);
        } else if (fieldName === "showInHomePage" || fieldName === "showInHeader" || fieldName === "isActive") {
          DEFAULT_OBJECT[fieldName] = getDefaultValueForField(field);
        } else if (fieldName === "sort") {
          DEFAULT_OBJECT[fieldName] = getDefaultValueForField(field);
        } else {
          DEFAULT_OBJECT[fieldName] = getDefaultValueForField(field);
        }
      });
    });

    if (DEFAULT_OBJECT && objectField) {
      resolve({ DEFAULT_OBJECT, objectField });
    } else {
      reject({ DEFAULT_OBJECT, objectField });
    }
  });
};
function calculateAgeInDaysOfLeads(DateString = "") {

  if (!DateString) {
    return ""
  }
  let createdDate = new Date(DateString);
  let currentDate = new Date();

  let timeDifference = currentDate.getTime() - createdDate.getTime();
  let daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  if (daysDifference === 0) {
    return "Today"
  }
  return `${daysDifference} days ago`;

  // Example usage
  // var dateString = "2024-03-02T07:33:29.894+00:00";
  // var ageInDays = calculateAgeInDays(dateString);
}

const transformPageConfInput = async ({ Data = [] }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const ReturnObj = [];

      for await (const variable of Data) {
        const Heading = variable.Heading;
        const fields = []

        for await (const field_data of variable.fields) {
          // Simply transform field.value to field string
          fields.push({
            ...field_data,
            field: field_data.field.value,
            ...(field_data.connectwith && {
              connectwith: field_data.connectwith.pageName
            })
          });
        }

        ReturnObj.push({
          Heading,
          fields
        })
      }

      resolve(ReturnObj);
    } catch (error) {
      reject(error);
    }
  })
}
const transformPageConfOutout = async ({ Data = [] }) => {
  return Data.map(entry => ({
    Heading: entry.Heading,
    fields: entry.fields.map(field => {
      return {
        ...field,
        field: {
          value: field.field,
          label: field.field
        },
        ...(field.connectwith && {
          connectwith: {
            name: field.connectwith,
            pageName: field.connectwith
          }
        })
      };
    }).flat()
  }));

}
const isStringifiedArray = (input) => {
  try {
    const parsed = JSON.parse(input);  // Try to parse the input
    return Array.isArray(parsed);      // Check if the parsed value is an array
  } catch (e) {
    return false;                      // If parsing fails, return false
  }
}
/**
 * Find fields by type - only checks first-level fields in sections
 * Skips component fields and their nested fields
 * @param {Array} schema - Array of sections with fields
 * @param {Array} types - Array of field types to find
 * @param {Function} filterFn - Optional filter function for additional filtering
 * @returns {Promise<Array>} - Promise resolving to array of matching fields
 */
function findFieldsByTypePromise(schema, types, filterFn = null) {
  return new Promise((resolve, reject) => {
    try {
      const result = [];

      // Check if schema is an array of sections
      if (Array.isArray(schema)) {
        schema.forEach(section => {
          // Check if section has fields array
          if (section.fields && Array.isArray(section.fields)) {
            // Only process first-level fields
            section.fields.forEach(field => {
              // Skip component type fields entirely
              if (field.type === 'component') {
                return;
              }
              
              // Check if field type matches
              if (field.type && types.includes(field.type)) {
                // Apply custom filter if provided
                if (filterFn && !filterFn(field)) {
                  return;
                }
                result.push(field);
              }
            });
          }
        });
      }

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}


export {
  convertToSEOUrl,
  converIntoDefultFieldForForm,
  findFieldsByTypePromise,
  transformPageConfInput,
  transformPageConfOutout,
  calculateAgeInDaysOfLeads,
  formatDate,
  isStringifiedArray,
};