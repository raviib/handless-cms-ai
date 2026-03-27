
import Maintenance from "@/app/components/front-end/Maintenance.jsx"
const page = () => {
    return (
        <>
            <Maintenance />
        </>
    )
}

export default page

export const dynamic = 'force-dynamic'
export const revalidate = 0