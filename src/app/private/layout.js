import { Toaster } from "react-hot-toast";
export default function LoginLayout({ children }) {
    return (
        <>
            <Toaster />
            {children}
        </>
    );
}

export const dynamic = 'force-dynamic'
export const revalidate = 0



