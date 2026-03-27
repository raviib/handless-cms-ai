import "@/app/styles/common.scss"
import Link from "next/link"
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
export const CommonEditButton = ({ urllink, target = '_self' }) => {
    return (
        <Link href={urllink} className='edit-icon' target={target} >
            <BorderColorOutlinedIcon />
        </Link>
    )
}