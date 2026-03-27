
import Breadcrumb from '@/app/components/admin/breadcrumb';
// import { Page_Fields } from './DB';
import Admin_Services_Table from './Admin_Services_Table';
import { getPageConfFields } from '@/app/(backend)/api/setting/pages-conf/action';
import { cookies } from 'next/headers';
import { AdminVerifyTokenMiddleWareForPage } from '@/app/utils/db/token_validation';
import { redirect } from 'next/navigation';
const Details_page_Table = async ({ params, searchParams }) => {
    const awaitedParams = await params;
    const updatedParams = {
        ...awaitedParams,
        folder: "config",
        page: "access-control"
    }
    const { page } = updatedParams;

    const cookieStore = await cookies();
    const myCookie = cookieStore.get('token');
    const isHasError = await AdminVerifyTokenMiddleWareForPage(myCookie.value, page);
    if (isHasError?.is_error) {
        redirect('/admin/access-denied');
    }
    const { data: Access_Permissions } = isHasError;
    if (!Access_Permissions?.view) {
        redirect('/admin/access-denied');
    }
    const { name = "not found", pageName = "", category = "", get_url = "", post_url = "", put_url = "", sections: Page_Fields } = await getPageConfFields(page);

    const category_list = category.split(",").filter((ele) => ele !== "none").map((name) => ({
        Name: name,
        link: ``
    }))

    const flow = [
        {
            Name: "config",
            link: ``
        },
        {
            Name: "detail",
            link: `/admin/config/detail/${page}`
        },
        ...category_list,
        {
            Name: name,
            link: ``
        },
    ]

    let All_Table_Extra_Field;
    if (Page_Fields[0]) {
        All_Table_Extra_Field = await Page_Fields[0]?.fields.filter(ele => ele.showInTable)
    }


    // Serialize Access_Permissions to remove MongoDB ObjectId and other non-serializable objects
    const serializedAccessPermissions = {
        create: Access_Permissions.create,
        delete: Access_Permissions.delete,
        edit: Access_Permissions.edit,
        view: Access_Permissions.view,
        _id: Access_Permissions._id?.toString(),
        name: Access_Permissions.name,
        pageName: Access_Permissions.pageName
    };

    return (
        <>
            <Breadcrumb styleClass="dark-bg" links={flow} />
            <Admin_Services_Table Access_Permissions={serializedAccessPermissions} All_Table_Extra_Field={All_Table_Extra_Field} params={updatedParams} pageName={name} api_get={get_url} />
        </>
    )
}

export default Details_page_Table

export const dynamic = 'force-dynamic'
export const revalidate = 0