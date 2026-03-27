import React from 'react'
import Breadcrumb from '@/app/components/admin/breadcrumb';
import Page_client from '@/app/admin/admin_Page_Form.js';
import { getPageConfFields } from '@/app/(backend)/api/setting/pages-conf/action.js'
import { converIntoDefultFieldForForm } from '@/app/utils/usefullFunction/usedFunction';
import { cookies } from 'next/headers';
import { AdminVerifyTokenMiddleWareForPage } from '@/app/utils/db/token_validation';
import { redirect } from 'next/navigation';


const Common_page_conf = async ({ params, searchParams }) => {

    const { pagename } = await params;
    const cookieStore = await cookies();
    const myCookie = cookieStore.get('token');
    const isHasError = await AdminVerifyTokenMiddleWareForPage(myCookie.value, pagename);
    if (isHasError?.is_error) {
        redirect('/admin/access-denied');
    }
    const { data: Access_Permissions } = isHasError;
    if (!Access_Permissions?.edit) {
        redirect('/admin/access-denied');

    }

    const { name = "not found", pageName = "", category = "", sections: Page_Fields = [] } = await getPageConfFields(pagename);
    let data = {}
    let { DEFAULT_OBJECT, objectField } = await converIntoDefultFieldForForm({ Page_Fields });
    const breadcrumb_ = [

        {
            Name: "setting",
            link: ``
        }, {
            Name: name,
            link: ``
        }
    ]
    DEFAULT_OBJECT = {
        ...DEFAULT_OBJECT,
        ...data
    }
    const putUrl = ``
    const postURL = "";
    const isEdit = true;
    const redirectUrl = ""
    return (
        <>
            <Breadcrumb styleClass="dark-bg" links={breadcrumb_} />
            <Page_client DEFAULT_OBJECT={DEFAULT_OBJECT} Page_Fields={Page_Fields} objectField={objectField} putUrl={putUrl} postURL={postURL} isEdit={isEdit} redirectUrl={redirectUrl} />
        </>
    )
}

export default Common_page_conf

export const dynamic = 'force-dynamic'
export const revalidate = 0