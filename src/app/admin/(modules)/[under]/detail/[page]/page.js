import { getPageConfFields } from '@/app/(backend)/api/setting/pages-conf/action';
import Breadcrumb from '@/app/components/admin/breadcrumb';
import { AdminVerifyTokenMiddleWareForPage } from '@/app/utils/db/token_validation';
import { findFieldsByTypePromise } from '@/app/utils/usefullFunction/usedFunction';
import { unstable_noStore as noStore } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Admin_Services_Table from './Admin_Services_Table';


export async function generateMetadata({ params }) {
    const { page } = await params;
    const pageTitle = page ?? "Untitled Page"; // fallback if page missing

    // Convert kebab-case or snake_case to Title Case
    const formattedTitle = pageTitle
        .replace(/[-_]+/g, " ")              // replace - or _ with space
        .replace(/\b\w/g, char => char.toUpperCase()) // capitalize each word
        .trim();

    return {
        title: `${formattedTitle} | Admin Panel` || "Untitled Page",
    };
}
const Details_page_Table = async ({ params }) => {
    const cookieStore = await cookies();
    const myCookie = cookieStore.get('token');
    noStore()

    const awaitedParams = await params;
    const { page } = awaitedParams;
    const isHasError = await AdminVerifyTokenMiddleWareForPage(myCookie.value, page);
    if (isHasError?.is_error) {
        redirect('/admin/access-denied');
    }
    const { data: Access_Permissions } = isHasError;
    if (!Access_Permissions?.view) {
        redirect('/admin/access-denied');
    }

    const {
        name = "not found",
        under = '',
        category = "",
        get_url = "",
        sections: Page_Fields,
        ShowExcel,
        isDateFilters,
        searchInputPlaceholder
    } = await getPageConfFields(page);

    const updatedParams = {
        ...awaitedParams,
        folder: under
    }

    const category_list = category.split(",").filter((ele) => ele !== "none").map((name) => ({
        Name: name,
        link: ``
    }))

    const flow = [
        {
            Name: under,
            link: ``
        },
        ...category_list,
        {
            Name: name,
            link: ``
        },
    ]
    // Extract fields for table display and filters using helper function
    const All_Table_Extra_Field = await findFieldsByTypePromise(
        Page_Fields,
        ['text', 'textarea', 'email', 'url', 'number', 'boolean', 'date', 'relation', 'enumeration','media'],
        (field) => field.type !== 'component'
    );

    const DropDownFilters = await findFieldsByTypePromise(
        Page_Fields,
        ['relation', 'enumeration'],
        // (field) => field.showInTable
    );
    // Create default filter state
    const default_filters = DropDownFilters.reduce((acc, cur) => ({
        ...acc,
        [cur.field]: null
    }), {});

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
            <Admin_Services_Table
                Access_Permissions={serializedAccessPermissions}
                All_Table_Extra_Field={All_Table_Extra_Field}
                params={updatedParams}
                pageName={name}
                api_get={get_url}
                ShowExcel={ShowExcel}
                isDateFilters={isDateFilters}
                searchInputPlaceholder={searchInputPlaceholder ? searchInputPlaceholder : "search by name"}
                DropDownFilters={DropDownFilters}
                default_filters={default_filters}
            />
        </>
    )
}

export default Details_page_Table;

export const dynamic = 'force-dynamic'
export const revalidate = 0