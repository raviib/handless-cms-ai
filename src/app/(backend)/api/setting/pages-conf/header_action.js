import pageConfSchema from "@/app/(backend)/models/setting/pages-conf/pages-conf.modal.js";
import { dbConnect } from "@/app/utils/db/connectDb";

// Disable caching for this module
export const revalidate = 0;

export async function getAdminHeader(token) {

    try {
        await dbConnect();
        const section = await pageConfSchema.find({
            _id: { $in: token },
            showInHeader: true,
        }).select("-_id -createdAt -__v -updatedAt -fields -showInHeader");

        const groupedData = {};

        section.forEach((ele, index) => {
            const under = ele.under || 'other'; // Default to 'other' if under is missing
            if (!groupedData[under]) {
                groupedData[under] = new Map();
            }

            const seprate_data = groupedData[under];
            const category_ = seprate_data.get(ele.category) || [];

            seprate_data.set(ele.category, [...category_, {
                id: index + 1,
                name: ele.name,
                url: ele.detailPage ? `/${ele.under}/detail/${ele.pageName}` : `/${ele.under}/${ele.pageName}`
            }]);
        });

        const finalResult = {};

        for (const underKey in groupedData) {
            let mySectionHeader = [];
            let key_id = 0;
            const seprate_data = groupedData[underKey];

            for (const [key, value] of seprate_data.entries()) {
                if (key === "none") {
                    mySectionHeader = [...mySectionHeader, ...value];
                    key_id += value.length;
                    continue;
                }
                ++key_id;
                mySectionHeader = [...mySectionHeader, {
                    id: key_id,
                    name: key,
                    submenu: value
                }];
            }
            finalResult[underKey] = mySectionHeader;
        }

        return finalResult;
    } catch (error) {
        console.error("Error in getAdminHeader:", error);
        return {};
    }
}

