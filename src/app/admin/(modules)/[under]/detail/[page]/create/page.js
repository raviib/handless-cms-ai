import React from 'react'
import Breadcrumb from '@/app/components/admin/breadcrumb';
import Page_client from '@/app/admin/admin_Page_Form.js';
import { getPageConfFields } from '@/app/(backend)/api/setting/pages-conf/action.js'
import { converIntoDefultFieldForForm } from '@/app/utils/usefullFunction/usedFunction';
import { unstable_noStore as noStore } from 'next/cache'
import LocaleFormWrapper from "@/app/components/admin/LocaleFormWrapper.jsx"
import { cookies } from 'next/headers';
import { AdminVerifyTokenMiddleWareForPage } from '@/app/utils/db/token_validation';
import { redirect } from 'next/navigation';
import { getRequest } from "@/app/lib/apicall.js"
export async function generateMetadata({ params, searchParams }, parent) {
    const { page } = await params;
    const pageTitle = page ?? "Untitled Page"; // fallback if page missing

    // Convert kebab-case or snake_case to Title Case
    const formattedTitle = pageTitle
        .replace(/[-_]+/g, " ")              // replace - or _ with space
        .replace(/\b\w/g, char => char.toUpperCase()) // capitalize each word
        .trim();

    return {
        title: `Create ${formattedTitle} | Admin Panel` || "Untitled Page",
    };
}
const Common_defult_page_conf = async ({ params, searchParams }) => {

    const cookieStore = await cookies();
    const myCookie = cookieStore.get('token');
    noStore()
    const { page } = await params;
    const awaitedSearchParams = await searchParams;
    const { duplicate = null } = awaitedSearchParams;
    const isHasError = await AdminVerifyTokenMiddleWareForPage(myCookie.value, page);
    if (isHasError?.is_error) {
        redirect('/admin/access-denied');
        return
    }
    const { data: Access_Permissions } = isHasError;
    if (!Access_Permissions?.create) {
        redirect('/admin/access-denied');
        return
    }
    const { name = "not found", under = '', sections: Page_Fields = [], post_url = "", get_url = "", _id: ModalID = '', locales = ["en"], detailPage } = JSON.parse(JSON.stringify(await getPageConfFields(page)));
    let { data = {} } = duplicate ? await getRequest(`${get_url}/${duplicate}`) : {};
    const plainData = data ? JSON.parse(JSON.stringify(data)) : {};
    let { DEFAULT_OBJECT, objectField } = await converIntoDefultFieldForForm({ Page_Fields });

    // Merge AI-prefilled data if present
    const { ai_prefill = null } = awaitedSearchParams;
    let aiPrefillData = {};
    if (ai_prefill) {
        try { aiPrefillData = JSON.parse(decodeURIComponent(ai_prefill)); } catch { /* ignore */ }
    }
    const breadcrumb_ = [
        {
            Name: under,
            link: `/admin/${under}/detail/${page}`
        },
        {
            Name: name,
            link: `/admin/${under}/detail/${page}`
        },
        {
            Name: "create",
            link: ``
        }
    ]
    DEFAULT_OBJECT = {
        ...DEFAULT_OBJECT,
        ...plainData,
        ...aiPrefillData,
    }
    const redirectUrl = `/admin/${under}/detail/${page}`
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
                FormComponent={Page_client}
                formProps={{ searchParams: awaitedSearchParams, DEFAULT_OBJECT, Page_Fields, objectField, putUrl: "", postURL: post_url, isEdit: false, redirectUrl, moduleSlug: page }}
            />
        </>
    )
}

export default Common_defult_page_conf;
export const revalidate = 0;
export const dynamic = 'force-dynamic'