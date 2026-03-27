import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import jwt from 'jsonwebtoken'
import userSchema from "@/app/(backend)/models/administrator/User";
const AdminVerifyToken = async (req) => {
    try {

        let token;
        if (req.headers.get("x-admin-token")) {
            token = req.headers.get("x-admin-token") ?? null;
        } else {
            const { value = null } = req.cookies.get('token');
            token = value
        }

        if (!token) {
            throw new ErrorHandler(`Token Not Provide`, 401);
        }
        const { id }  = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET_KEY);
        if (!id) {
            throw new ErrorHandler(`unverify token`, 401);
        }
        return id
    } catch (error) {
        throw new ErrorHandler(error, 401);
    }
};
const AdminVerifyTokenMiddleWare = async (req) => {
    let message = ""
    let is_error = false;
    let statusCode = 403;
    try {
        const isTokenExist = req.cookies.has("token");
        if (!isTokenExist) {
            return {
                message: 'Token Not Provide',
                statusCode: 401,
                is_error: true,
            }

        }
        const { value: _ctsid_token = null } = req.cookies.get("token") ?? {};
        const { id = null } = await jwt.verify(_ctsid_token, process.env.NEXT_PUBLIC_JWT_SECRET_KEY);
        if (!id) {
            return {
                message: 'unverify token',
                statusCode: 401,
                is_error: true,
            }
        }
        return {
            message,
            is_error,
            statusCode,
            _id: id
        }
    } catch (error) {
        return {
            message: error.message,
            is_error: true,
            statusCode: 403,
        }
    };
};

const AdminVerifyTokenMiddleWareForPage = async (token, pageName = "") => {

    try {
        if (!token) {
            return {
                message: 'Token Not Provide',
                statusCode: 401,
                is_error: true,
            }

        }
        const { id = null } = await jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET_KEY);
        if (!id) {
            return {
                message: 'unverify token',
                statusCode: 401,
                is_error: true,
            }
        }
        if (!pageName) {
            return {
                message: 'page Name is required',
                statusCode: 401,
                is_error: true,
            }
        }

        let user = await userSchema.findById(id).populate({
            path: 'role',
            populate: {
                path: 'permissions.access_of',
                select: "name pageName _id"
            }
        })
        user = user.toObject()
        let permissions = user.role.permissions.map(ele => {
            const { access_of, ...restData } = ele
            return ({
                ...restData,
                ...ele.access_of
            })
        })
        const permissions_data = permissions.find((list) => list.pageName === pageName) || null;
        if (!permissions_data) {
            return {
                message: 'Not Found',
                statusCode: 404,
                is_error: true,
            }
        }
        return {
            message: 'Check Data',
            statusCode: 200,
            is_error: false,
            data: permissions_data
        }
    } catch (error) {
        return {
            message: error.message,
            is_error: true,
            statusCode: 403,
        }
    };
};

const customerVerifyTokenMiddleware = async (req) => {
    let message = ""
    let is_error = false;
    let statusCode = 403;
    try {

        // const isTokenExist = req.cookies.has("_ctsid");
        const isTokenExist = req.headers.has("_ctsid_token");
        if (!isTokenExist) {
            return {
                message: 'Token Not Provide',
                statusCode: 401,
                is_error: true,
            }

        }
        // const { value: _ctsid_token = null } = req.cookies.get("_ctsid") ?? {};
        const _ctsid_token = req.headers.get("_ctsid_token") ?? null;

        const { id = null } = await jwt.verify(_ctsid_token, process.env.NEXT_PUBLIC_CUSTOMER_JWT_SECRET_KEY);

        if (!id) {
            return {
                message: 'unverify token',
                statusCode: 401,
                is_error: true,
            }
        }
        return {
            message,
            is_error,
            statusCode,
            _id: id
        }
    } catch (error) {
        return {
            message: 'unverify token call',
            is_error: true,
            statusCode: 403,
        }
    };

}


export { AdminVerifyTokenMiddleWare, AdminVerifyToken, customerVerifyTokenMiddleware, AdminVerifyTokenMiddleWareForPage }