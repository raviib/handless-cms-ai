"use server";
import {
    getAdminHeader
} from "@/app/(backend)/api/setting/pages-conf/header_action.js";


async function fetchData(url, token) {
    try {
        const { value = null } = token;
        let myHeaders = new Headers();
        myHeaders.append("x-admin-token", value);
        let requestOptions = {
            method: "GET",
            headers: myHeaders,
            cache: "no-store",
        };
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            return null
        }
        return await response.json();
    } catch (error) {
        return null;
    }
}
export const returnAdminHeader = async (myCookie) => {
    const data = await fetchData(`${process.env.NEXT_PUBLIC_BACKEND_URL}/administrator/user/acceess-controle`, myCookie)
    const { data: user_access_route = [], dev_mode = false } = data ?? {};

    if (!data.success) {
        return []
    }

    const headerData = await getAdminHeader(user_access_route);
    let menudata = [
        {
            id: 1,
            name: "dashboard",
            url: '/dashboard'
        }
    ];

    let idCounter = 2;
    for (const [key, value] of Object.entries(headerData)) {
        if (value && value.length > 0) {
            menudata.push({
                id: idCounter++,
                name: key,
                submenu: value
            });
        }
    }

    if (dev_mode) {
        menudata.push({
            id: idCounter++,
            name: "Setting",
            submenu: [
                {
                    id: 1,
                    name: 'create pages',
                    url: '/setting/pages-conf'
                },
                {
                    id: 2,
                    name: 'create component',
                    url: '/setting/page-component'
                },
                {
                    id: 3,
                    name: 'Internationalization',
                    url: '/setting/internationalization'
                }
            ]
        },)
    }

    return menudata
}