import { NextResponse } from "next/server";

const errorHandler = (err) => {
    const res = {
        statusCode: err?.statusCode ?? 500,
        message: err?.message || "Internal Server Error",
        stack: err?.stack || "Not Found",
    };

    if (err.name === "MongooseError") {
        res.message = "Network Issue";
    }

    if (err?.code === 11000) {
        res.statusCode = 400;
        res.message = `${Object.keys(err.keyValue)[0]} is Duplicate`;
    }

    if (err?.code === "ECONNREFUSED") {
        res.statusCode = 400;
        res.message = "Network Failed";
    }

    if (err.name === "ValidationError") {
        for (const field in err.errors) {
            res.message = err.errors[field].message;
            break;
        }
    }

    if (err.name === "TokenExpiredError") {
        res.statusCode = 401;
        res.message = "Token has expired";
    }

    if (err.name === "JsonWebTokenError") {
        res.statusCode = 401;
        res.message = "Invalid token";
    }

    return NextResponse.json(
        {
            success: false,
            message: res.message,
            ...(process.env.NODE_ENV === "development" && { stack: res.stack }),
            data: null
        },
        { status: res.statusCode }
    );
};

class ErrorHandler extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export { errorHandler, ErrorHandler };
