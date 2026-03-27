import React from 'react'
import Breadcrumb from '@/app/components/admin/breadcrumb';
import Page_client from '@/app/admin/admin_Page_Form.js';
import { getPageConfFields } from '@/app/(backend)/api/setting/pages-conf/action.js'
import { converIntoDefultFieldForForm } from '@/app/utils/usefullFunction/usedFunction';
import { getRequest } from "@/app/lib/apicall.js"
import { unstable_noStore as noStore } from 'next/cache'
import { cookies } from 'next/headers';
import { AdminVerifyTokenMiddleWareForPage } from '@/app/utils/db/token_validation';
import { redirect } from 'next/navigation';
const Common_defult_page_conf = async ({ params, searchParams }) => {
    noStore()
    const { page, slug } = await params;
    const cookieStore = await cookies();
    const myCookie = cookieStore.get('token');
    const isHasError = await AdminVerifyTokenMiddleWareForPage(myCookie.value, page);
    if (isHasError?.is_error) {
        redirect('/admin/access-denied');
    }
    const { data: Access_Permissions } = isHasError;
    if (!Access_Permissions?.edit) {
        redirect('/admin/access-denied');

    }

    const { name = "not found", pageName = "", category = "", sections: Page_Fields = [], put_url = "", get_url = "" } = await getPageConfFields(page);
    let { DEFAULT_OBJECT, objectField } = await converIntoDefultFieldForForm({ Page_Fields });

    let { data = {} } = await getRequest(`${get_url}/${slug}`)

    const breadcrumb_ = [
        {
            Name: "config",
            link: `/admin/config/detail/${page}`
        },
        {
            Name: "detail",
            link: `/admin/config/detail/${page}`
        },
        {
            Name: name,
            link: `/admin/config/detail/${page}`
        },
        {
            Name: "Edit",
            link: ``
        }
    ]
    const putUrl = `${put_url}/${slug}`
    const postURL = "";
    const isEdit = true;
    const redirectUrl = `/admin/config/detail/${page}`
    DEFAULT_OBJECT = {
        ...DEFAULT_OBJECT,
        ...data
    }
    return (
        <>
            <Breadcrumb styleClass="dark-bg" links={breadcrumb_} />
            <Page_client DEFAULT_OBJECT={DEFAULT_OBJECT} Page_Fields={Page_Fields} objectField={objectField} putUrl={putUrl} postURL={postURL} isEdit={isEdit} redirectUrl={redirectUrl} />
        </>
    )
}

export default Common_defult_page_conf

export const dynamic = 'force-dynamic'
export const revalidate = 0