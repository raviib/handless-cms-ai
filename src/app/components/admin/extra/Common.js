'use client';
import FilePreview from "@/app/components/admin/extra/FilePreview.jsx";
import FileTypeIcon from "@/app/components/admin/extra/FileTypeIcon.jsx";
import ImageDeleteUi from "@/app/components/admin/extra/ImageDeleteUi.js";
import MultyImageDeleteComp from "@/app/components/admin/extra/MultyImageDeleteComp.js";
import Fancybox from '@/app/components/admin/Fancybox.tsx';
import ToolTip from "@/app/components/admin/ToolTip.jsx";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
    IconButton, ListItemIcon,
    ListItemText, Menu,
    MenuItem, TablePagination
} from "@mui/material";
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { useEffect, useState } from 'react';

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";

const getImageUrl = (ele) => {
    if (!ele) return "";
    if (typeof ele === "string") {
        if (ele.startsWith("blob:") || ele.startsWith("data:") || ele.startsWith("http")) {
            return ele;
        }
        return `${process.env.NEXT_PUBLIC_SITE_IMAGE_URL}${ele}`;
    }
    return "";
};

const FilePreviewLink = ({ Link, children, ...props }) => {
    const [url, setUrl] = useState("");

   useEffect(() => {
        if (!Link) {
            setUrl("");
            return;
        }

        if (typeof Link === "string") {
            if (Link.startsWith("blob:") || Link.startsWith("data:") || Link.startsWith("http")) {
                setUrl(Link);
            } else {
                setUrl(`${process.env.NEXT_PUBLIC_SITE_IMAGE_URL}${Link}`);
            }
        } else if (typeof window !== "undefined" && (Link instanceof File || Link instanceof Blob)) {
            const blobUrl = URL.createObjectURL(Link);
            setUrl(blobUrl);
            return () => URL.revokeObjectURL(blobUrl);
        }
    }, [Link]);

    if (!url) return null;

    return (
        <a {...props} href={url}>
            {children}
        </a>
    );
};

const TableAction = ({
    isEdit = false,
    isCreate = false,
    isView = false,
    isDelete = false,
    deleteHandler,
    editLink,
    viewLink,
    editLinkQurey = "",
    _id
}) => {

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            {/* 3-dot button */}
            <IconButton onClick={handleClick}>
                <MoreVertIcon />
            </IconButton>

            {/* Dropdown Menu */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >

                {/* VIEW */}
                {isView && (
                    <MenuItem onClick={handleClose}>
                        <Link href={`${viewLink}/${_id}${editLinkQurey}`} className="flex items-center w-full">
                            <ListItemIcon>
                                <VisibilityIcon fontSize="small" />
                            </ListItemIcon>
                            {/* <ListItemText primary="View" /> */}
                        </Link>
                    </MenuItem>
                )}

                {/* EDIT */}
                {isEdit && (
                    <MenuItem onClick={handleClose}>
                        <Link href={`${editLink}/${_id}${editLinkQurey}`} className="flex items-center w-full">
                            <ListItemIcon>
                                <EditIcon fontSize="small" />
                            </ListItemIcon>
                            {/* <ListItemText primary="Edit" /> */}
                        </Link>
                    </MenuItem>
                )}

                {/* DUPLICATE */}
                {isCreate && (
                    <MenuItem onClick={handleClose}>
                        <Link
                            target="_blank"
                            href={`${editLink}/create?duplicate=${_id}`}
                            className="flex items-center w-full"
                        >
                            <ListItemIcon>
                                <ContentCopyIcon fontSize="small" />
                            </ListItemIcon>
                            {/* <ListItemText primary="Duplicate" /> */}
                        </Link>
                    </MenuItem>
                )}

                {/* DELETE */}
                {isDelete && (
                    <MenuItem
                        onClick={() => {
                            handleClose();
                            deleteHandler(_id);
                        }}
                        sx={{ color: "red" }}
                    >
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" sx={{ color: "red" }} />
                        </ListItemIcon>
                        {/* <ListItemText primary="Delete" /> */}
                    </MenuItem>
                )}
            </Menu>
        </>
    );
};

const FileAction = ({ Link = "", field, deleteHandler }) => {

    return (
        <>
            {Link ? <>
                <div className='icon-div'>
                    <FilePreview fileUrl={Link} className='table-edit-icon iconButton'>
                        <Fancybox>
                            <FilePreviewLink data-fancybox="gallery" Link={Link}>
                                <FileTypeIcon fileUrl={Link} className='table-edit-icon iconButton' />
                            </FilePreviewLink>
                        </Fancybox>
                    </FilePreview>

                    <ImageDeleteUi deleteHandler={deleteHandler} field={field} Link={Link} />
                </div >

            </> : <></>

            }
        </>

    )
}
const FileActionMultiImage = ({ Link = "", field, deleteHandler }) => {

    return (
        <>
            {Link && (Array.isArray(Link)) && (Link.length > 0) ? <>
                <div className='icon-div'>
                    <FilePreview fileUrl={Link[0]} className='table-edit-icon iconButton'>
                        <Fancybox>
                            <FilePreviewLink data-fancybox="gallery" Link={Link[0]} key={"adoisajdoiasjd"}>
                                <FileTypeIcon fileUrl={Link[0]} className='table-edit-icon iconButton' />
                            </FilePreviewLink>
                            {
                                Link.map((ele, index) => {
                                    if (index === 0) {
                                        return
                                    }
                                    return <FilePreviewLink data-fancybox="gallery" Link={ele} key={index} />
                                })
                            }
                        </Fancybox>
                    </FilePreview>
                    <MultyImageDeleteComp deleteHandler={deleteHandler} Link={Link} field={field} />
                </div >

            </> : <></>

            }
        </>

    )
}
const Table_Pagination = ({
    totalDocs,
    pagination,
    handleChangePage,
    rowsPerPage,
    handleChangeRowsPerPage
}) => {
    return (

        <div
            className="admin-pagination">
            <TablePagination
                component="div"
                className="text-white"
                rowsPerPageOptions={[5, 10, 25, 100]}
                count={totalDocs ?? 0}
                page={pagination}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </div>
    );
};

const CreateLinkForPage = ({ pageLink, doFetch = () => { }, disabled = false }) => {
    const pathname = usePathname()
    return <>

        <div className='ActionIcons'>
            <ToolTip message="Add New" flow="left">
                <Link href={{
                    pathname: `/admin${pageLink}`, query: { goback: `${pathname.split("/").join("-")}` }
                }}
                    aria-label="Add New" target='_blank'>
                    <AddCircleIcon className='add-icon' />
                </Link>
            </ToolTip>
            {/* <div onClick={() => doFetch()}>
                <ReplayCircleFilledRoundedIcon className='refresh-icon' />
            </div> */}
        </div>
    </>
}


export { CreateLinkForPage, FileAction, FileActionMultiImage, Table_Pagination, TableAction };

