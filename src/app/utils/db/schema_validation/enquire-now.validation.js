export const DbValidator = async (data) => {
    let statusCode = 403;

    // Required fields
    const requiredFields = [
        "name",
        "phone",
        "lead_type",
        "requirement_type",
        "product",
        "policy"
    ];

    // Only characters allowed
    const charOnlyFields = ["name", "city", "lead_type", "requirement_type"];

    const charRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    // Check required fields
    for (const field of requiredFields) {
        if (!data[field] || String(data[field]).trim() === "") {
            return {
                message: `${field.replace("_", " ")} is required`,
                is_error: true,
                statusCode
            };
        }
    }

    // Character-only validation
    for (const field of charOnlyFields) {
        if (data[field] && !charRegex.test(data[field])) {
            return {
                message: `${field.replace("_", " ")} must contain only letters`,
                is_error: true,
                statusCode
            };
        }
    }

    // Email validation
    if (data.email) {
        if (!emailRegex.test(data.email)) {
            return {
                message: "Invalid email address",
                is_error: true,
                statusCode
            };
        }
    }


    // Phone validation
    if (!phoneRegex.test(data.phone)) {
        return {
            message: "Invalid phone number",
            is_error: true,
            statusCode
        };
    }

    // Policy must be true
    if (data.policy !== true) {
        return {
            message: "You must accept the policy",
            is_error: true,
            statusCode
        };
    }

    return {
        message: "Validation successful",
        is_error: false,
        statusCode: 200
    };
};
