import { NextResponse } from "next/server";
import { ErrorHandler, errorHandler } from "@/app/utils/db/errorhandler";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "src/app/utils/db/internationalization.db.json");

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET - fetch all locales with optional search
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const input_data = searchParams.get("input_data") || "";
        const filterActive = searchParams.get("isActive");

        let data = readDB();

        if (input_data) {
            const regex = new RegExp(input_data, "i");
            data = data.filter((l) => regex.test(l.name) || regex.test(l.nativeName) || regex.test(l.code));
        }

        if (filterActive !== null && filterActive !== "") {
            const active = filterActive === "true";
            data = data.filter((l) => l.isActive === active);
        }

        return NextResponse.json({ success: true, message: "Fetched Successfully", data, totalDocs: data.length });
    } catch (error) {
        return errorHandler(error);
    }
}

// PUT - toggle isActive or set default
export async function PUT(request) {
    try {
        const body = await request.json();
        const { code, isActive, isDefault } = body;

        if (!code) throw new ErrorHandler("Language code is required", 400);

        const data = readDB();
        const index = data.findIndex((l) => l.code === code);

        if (index === -1) throw new ErrorHandler("Language not found", 404);

        // Cannot deactivate the default language
        if (data[index].isDefault && isActive === false) {
            throw new ErrorHandler("Cannot deactivate the default language", 400);
        }

        // Handle setting a new default
        if (isDefault === true) {
            data.forEach((l) => { l.isDefault = false; });
            data[index].isDefault = true;
            data[index].isActive = true; // default must always be active
        }

        if (typeof isActive === "boolean") {
            data[index].isActive = isActive;
        }

        writeDB(data);

        return NextResponse.json({ success: true, message: "Updated successfully", data: data[index] });
    } catch (error) {
        return errorHandler(error);
    }
}
