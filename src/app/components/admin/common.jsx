import { Button } from "@mui/material"
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Link from "next/link";
const AdminCommonHeading = ({ Heading, showOpenBut, isopen, setIsOpen = () => { } }) => {
    return (
        <>
            <div className="page-section" onClick={setIsOpen}>
                <div className="Backend-heading" >
                    <p>{Heading}</p>
                </div>
                {
                    showOpenBut && (
                        <div className="showSection">

                            <Link href={`#${Heading}`}>
                                {
                                    isopen ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />
                                }
                            </Link>

                        </div>
                    )
                }
            </div>
        </>
    )
}


const LoadingButton = ({ loading, submitHandler, btnName = 'Save' }) => {
    return (
        <>
            <div className='save-field-button' >
                {loading ? <Button variant="contained" sx={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.6)" } }} disabled>loading...</Button> : <Button variant="contained" onClick={() => submitHandler()} sx={{ backgroundColor: "rgba(0, 0, 0, 0.7)", "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.6)" } }}>{btnName}</Button>}
            </div>
        </>
    )
}
export { AdminCommonHeading, LoadingButton }