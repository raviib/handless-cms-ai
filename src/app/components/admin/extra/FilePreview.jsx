'use client';
import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { useState } from 'react';
import AudioPlayer from './AudioPlayer.jsx';
import FileTypeIcon from './FileTypeIcon.jsx';
import Fancybox from "@/app/components/admin/Fancybox.tsx";
import Image from 'next/image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import AttachFileIcon from '@mui/icons-material/AttachFile';
const getFileExtension = (url) => {
    if (typeof url !== 'string') return '';
    const parts = url.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
};
const getFileType = (url) => {
    const extension = getFileExtension(url);

    // Audio types
    const audioTypes = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'];
    if (audioTypes.includes(extension)) return 'audio';

    // Video types
    const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', '3gp'];
    if (videoTypes.includes(extension)) return 'video';

    // Image types
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'];
    if (imageTypes.includes(extension)) return 'image';

    // PDF
    if (extension === 'pdf') return 'pdf';

    return 'other';
};
const FilePreview = ({ fileUrl, className = 'table-edit-icon iconButton', children }) => {
    const [open, setOpen] = useState(false);

    if (!fileUrl) return null;


    const fileType = getFileType(fileUrl);

    const handleClick = () => {
        if (fileType === 'audio') {
            setOpen(true);
        }
        // For other file types, let the parent handle (Fancybox, etc.)
    };

    const handleClose = () => {
        setOpen(false);
    };

    const getFullUrl = (url) => {
        if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('http')) {
            return url;
        }
        return `${process.env.NEXT_PUBLIC_SITE_IMAGE_URL}${url}`;
    };

    // For audio files, handle click ourselves
    if (fileType === 'audio') {
        return (
            <>
                <div onClick={handleClick} style={{ cursor: 'pointer' }}>
                    <FileTypeIcon fileUrl={fileUrl} className={className} />
                </div>

                <Dialog
                    open={open}
                    onClose={handleClose}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Audio Player
                        <IconButton onClick={handleClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <AudioPlayer audioUrl={getFullUrl(fileUrl)} />
                    </DialogContent>
                </Dialog>
            </>
        );
    }



    // For other file types (images, PDFs, etc.), return the children (which will be handled by Fancybox)
    return children || <FileTypeIcon fileUrl={fileUrl} className={className} />;
};
export const FilePreviewTable = ({ row, cellKey, value }) => {
    const files = Array.isArray(value) ? value : [value];

    const getFileExtension = (file) =>
        file.split(".").pop()?.toLowerCase();

    const docExtensions = ["doc", "docx"];

    const visibleFiles = files.filter(Boolean);
    const firstFile = visibleFiles[0];
    const remaining = visibleFiles.length - 1;

    const isPreviewable = (ext) =>
        !docExtensions.includes(ext)
    return (
        <td key={cellKey}>
            <Fancybox>
                <div style={{ display: "flex", gap: 6 }}>


                    {/* 👇 Visible UI (only first) */}
                    {firstFile && (() => {
                        const ext = getFileExtension(firstFile);
                        const Type = getFileType(firstFile);
                        const fileUrl = `${process.env.NEXT_PUBLIC_SITE_IMAGE_URL}${firstFile}`;
                        return (
                            <a
                                key={`${row._id}-${firstFile}`}
                                {...(isPreviewable(ext)
                                    ? { "data-fancybox": cellKey }
                                    : { download: true })}
                                href={fileUrl}
                                style={{
                                    position: "relative",
                                    width: 50,
                                    height: 50,
                                    borderRadius: "50%",
                                    overflow: "hidden",
                                    display: "inline-block",
                                    cursor: "pointer",
                                }}
                            >
                                {/* 🖼 Image */}
                                {Type === 'image' ? (
                                    <Image
                                        src={fileUrl}
                                        alt="file"
                                        width={50}
                                        height={50}
                                        style={{ objectFit: "cover" }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            // background: "#f3f4f6",
                                            fontSize: 18,
                                        }}
                                    >
                                        {Type === 'pdf' && (
                                            <PictureAsPdfIcon style={{ color: "#e53935", fontSize: 24 }} />
                                        )}

                                        {Type === 'doc' && (
                                            <DescriptionIcon style={{ color: "#1e88e5", fontSize: 24 }} />
                                        )}

                                        {Type === 'audio' && (
                                            <AudioFileIcon style={{ color: "#8e24aa", fontSize: 24 }} />
                                        )}

                                        {Type === 'video' && (
                                            <VideoFileIcon style={{ color: "#43a047", fontSize: 24 }} />
                                        )}

                                        {Type === 'other' && (
                                            <AttachFileIcon style={{ color: "#6b7280", fontSize: 24 }} />
                                        )}
                                    </div>
                                )}

                                {/* 🔢 Overlay Count */}
                                {remaining > 0 && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            background: "rgba(0,0,0,0.6)",
                                            color: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 14,
                                            fontWeight: 600,
                                        }}
                                    >
                                        +{remaining}
                                    </div>
                                )}
                            </a>
                        );
                    })()}
                    {/* 👇 Hidden all files for Fancybox */}
                    {visibleFiles.length > 1 && visibleFiles.map((file, index) => {
                        if (index === 0) return null;

                        const fileUrl = `${process.env.NEXT_PUBLIC_SITE_IMAGE_URL}${file}`;
                        const ext = getFileExtension(file);
                        if (!isPreviewable(ext)) {
                            return (
                                <a
                                    key={`hidden-${row._id}-${file}`}
                                    href={fileUrl}
                                    download
                                    style={{ display: "none" }}
                                />
                            );
                        }

                        return (
                            <a
                                key={`hidden-${row._id}-${file}`}
                                data-fancybox={cellKey}
                                href={fileUrl}
                                style={{ display: "none" }} // 👈 hidden but registered
                            />
                        );
                    })}
                </div>
            </Fancybox>
        </td>
    );
};


export default FilePreview;