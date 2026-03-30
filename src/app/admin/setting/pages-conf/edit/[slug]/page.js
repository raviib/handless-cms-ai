import React from 'react'
import PagesConfEditSection from "@/app/admin/setting/pages-conf/edit/[slug]/confpage.js"
import { getPageConfFieldsUndoMode } from '@/app/(backend)/api/setting/pages-conf/action.js'
import { transformPageConfOutout } from '@/app/utils/usefullFunction/usedFunction';
const page = async ({ params, searchParams }) => {
    const awaitedParams = await params;
    const { slug } = awaitedParams;
    const { name = "not found", showSEO = false, sort = -1, pageName = "", category = "", showInHeader, sections: Page_Fields = [], under = "", detailPage = false, get_url = "", post_url = "", put_url = "", isDateFilters = false, searchInputPlaceholder = '', ShowExcel = false, entry_title = '', locales = ["en"], aiContentEnabled = false, aiPrompt = "" } = await getPageConfFieldsUndoMode(slug);

    const sectionDefultData = await transformPageConfOutout({ Data: Page_Fields })
    const obj = {
        name,
        sort,
        pageName,
        category,
        showInHeader,
        under,
        detailPage,
        get_url,
        post_url,
        put_url,
        showSEO,
        isDateFilters,
        searchInputPlaceholder,
        ShowExcel,
        entry_title,
        locales,
        aiContentEnabled,
        aiPrompt,
    }
    return (
        <PagesConfEditSection params={awaitedParams} searchParams={searchParams} ConfPageData={obj} sectionData={sectionDefultData} />
    )
}

export default page

export const dynamic = 'force-dynamic'