import React from 'react'

import Page_client from '@/app/admin/admin_Page_Form.js';
import { Page_Fields } from "../DB"
import { converIntoDefultFieldForForm } from '@/app/utils/usefullFunction/usedFunction';
export const DetailPagaeEdit = async ({ data, params, redirectUrl, isEdit = true, postURL = "", putUrl = "" }) => {

    let { DEFAULT_OBJECT, objectField } = await converIntoDefultFieldForForm({ Page_Fields });
    DEFAULT_OBJECT = {
        ...DEFAULT_OBJECT,
        ...data
    }
    return (
        <>
            <Page_client DEFAULT_OBJECT={DEFAULT_OBJECT} Page_Fields={Page_Fields} objectField={objectField} putUrl={putUrl} postURL={postURL} isEdit={isEdit} redirectUrl={redirectUrl} />
        </>
    )
}

