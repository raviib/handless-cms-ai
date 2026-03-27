'use client';
import React from 'react';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const FileTypeIcon = ({ fileUrl, className = 'table-edit-icon iconButton' }) => {
    if (!fileUrl) return null;

    // Get file extension from URL
    const getFileExtension = (url) => {
        if (typeof url !== 'string') return '';
        const parts = url.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : '';
    };

    // Get MIME type from URL or file extension
    const getFileType = (url) => {
        const extension = getFileExtension(url);
        
        // Image types
        const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'];
        if (imageTypes.includes(extension)) return 'image';
        
        // Video types
        const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', '3gp'];
        if (videoTypes.includes(extension)) return 'video';
        
        // Audio types
        const audioTypes = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'];
        if (audioTypes.includes(extension)) return 'audio';
        
        // PDF
        if (extension === 'pdf') return 'pdf';
        
        // Document types
        const docTypes = ['doc', 'docx', 'txt', 'rtf', 'odt'];
        if (docTypes.includes(extension)) return 'document';
        
        // Default
        return 'file';
    };

    const fileType = getFileType(fileUrl);

    const renderIcon = () => {
        switch (fileType) {
            case 'image':
                return <ImageSearchIcon className={className} />;
            case 'video':
                return <VideoLibraryIcon className={className} />;
            case 'audio':
                return <AudioFileIcon className={className} />;
            case 'pdf':
                return <PictureAsPdfIcon className={className} />;
            case 'document':
                return <DescriptionIcon className={className} />;
            default:
                return <InsertDriveFileIcon className={className} />;
        }
    };

    return renderIcon();
};

export default FileTypeIcon;