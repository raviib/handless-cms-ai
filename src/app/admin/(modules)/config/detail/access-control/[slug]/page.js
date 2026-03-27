import EditRbac from "./EditRbac"
import { cookies } from 'next/headers';
import { AdminVerifyTokenMiddleWareForPage } from '@/app/utils/db/token_validation';
import { redirect } from 'next/navigation';
const page = async ({ params, searchParams }) => {
    const { slug } = await params;
    const cookieStore = await cookies();
    const myCookie = cookieStore.get('token');
    const isHasError = await AdminVerifyTokenMiddleWareForPage(myCookie.value, 'access-control');
    if (isHasError?.is_error) {
        redirect('/admin/access-denied');
    }
    const { data: Access_Permissions } = isHasError;
    if (!Access_Permissions?.edit) {
        redirect('/admin/access-denied');
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
            <EditRbac Access_Permissions={serializedAccessPermissions} slug={slug} searchParams={searchParams} />
        </>
    )
}

export default page

export const dynamic = 'force-dynamic'
export const revalidate = 0