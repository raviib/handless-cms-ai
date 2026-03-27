import React from 'react'
import Breadcrumb from '@/app/components/admin/breadcrumb';
import Page_client from '@/app/admin/admin_Page_Form.js';
import { getPageConfFields } from '@/app/(backend)/api/setting/pages-conf/action.js'
import { converIntoDefultFieldForForm } from '@/app/utils/usefullFunction/usedFunction';
import { getRequest } from "@/app/lib/apicall.js"
import { unstable_noStore as noStore } from 'next/cache'
import LocaleFormWrapper from "@/app/components/admin/LocaleFormWrapper.jsx"
import { cookies } from 'next/headers';
import { AdminVerifyTokenMiddleWareForPage } from '@/app/utils/db/token_validation';
import { redirect } from 'next/navigation';
export async function generateMetadata({ params, searchParams }, parent) {
    const { pagename } = await params;
    const pageTitle = pagename ?? "Untitled Page"; // fallback if pagename missing

    // Convert kebab-case or snake_case to Title Case
    const formattedTitle = pageTitle
        .replace(/[-_]+/g, " ")              // replace - or _ with space
        .replace(/\b\w/g, char => char.toUpperCase()) // capitalize each word
        .trim();

    return {
        title: formattedTitle || "Untitled Page",
    };
}
const Common_defult_page_conf = async ({ params, searchParams }) => {
    const cookieStore = await cookies();
    const myCookie = cookieStore.get('token');
    noStore()
    const { pagename, } = await params;
    const isHasError = await AdminVerifyTokenMiddleWareForPage(myCookie.value, pagename);
    if (isHasError?.is_error) {
        redirect('/admin/access-denied');
        return
    }
    const { data: Access_Permissions } = isHasError;
    if (!Access_Permissions?.edit) {
        redirect('/admin/access-denied');
        return
    }
    const rawPageConf = await getPageConfFields(pagename);
    // Serialize to strip Mongoose ObjectIds and other non-plain values
    const { name = "not found", pageName = "", under = '', category = "", sections: Page_Fields = [], put_url = "", get_url = "", _id: ModalID = "", locales = ["en"], detailPage, ...restData } = JSON.parse(JSON.stringify(rawPageConf));
    let { DEFAULT_OBJECT, objectField } = await converIntoDefultFieldForForm({ Page_Fields });
    let { data = {} } = await getRequest(`${get_url}`);
    const plainData = data ? JSON.parse(JSON.stringify(data)) : {};

    const breadcrumb_ = [
        {
            Name: under,
            link: `/admin/${under}/${pagename}`
        },
        {
            Name: name,
            link: `/admin/${under}/${pagename}`
        }
    ]
    const putUrl = `${put_url}`
    const postURL = "";
    const isEdit = true;
    const redirectUrl = `/admin/${under}/${pagename}`
    DEFAULT_OBJECT = {
        ...DEFAULT_OBJECT,
        ...plainData
    }
    return (
        <>
            <Breadcrumb styleClass="dark-bg" links={breadcrumb_} />
            <LocaleFormWrapper
                locales={locales}
                redirectUrl={redirectUrl}
                ModalID={ModalID?.toString?.() ?? ModalID}
                Page_Fields={Page_Fields}
                createdAt={plainData?.createdAt}
                updatedAt={plainData?.updatedAt}
                detailPage={detailPage}
                getUrl={get_url}
                formProps={{ DEFAULT_OBJECT, Page_Fields, objectField, putUrl, postURL: "", isEdit: true, redirectUrl }}
                FormComponent={Page_client}
            />
        </>
    )
}

export default Common_defult_page_conf
export const revalidate = 0;
export const dynamic = 'force-dynamic'