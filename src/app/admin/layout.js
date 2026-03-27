import { Toaster } from "react-hot-toast";
import "@/app/styles/admin/admin_common.scss";
import AdminHeader from "@/app/components/admin/AdminHeader";
import AuthSetup from "./Redux_defult_setup"
import SideHeaderLayout from "../components/admin/header/SideHeaderLayout";
import { returnAdminHeader } from "@/app/(backend)/api/setting/pages-conf/allHeader.js"
import { cookies } from "next/headers";
export default async function Admin({ children }) {
    const cookieStore = await cookies();
    const myCookie = cookieStore.get('token');
    const menudata = await returnAdminHeader(myCookie)
    return (
        <SideHeaderLayout menudata={menudata}>
            <AuthSetup />
            <Toaster />
            <AdminHeader menudata={menudata} useInSearch={true} />
            <div className="page-content-wrapper">
                {children}
            </div>
        </SideHeaderLayout>
    );
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
