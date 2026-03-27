"use client"
import React, { useCallback, useState, useEffect, useRef } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Checkbox,
    IconButton,
    Grid,
    Card,
    Box,
    Typography,
    Tooltip
} from '@mui/material';

// Icons
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SaveIcon from '@mui/icons-material/Save';

// DnD
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Image from 'next/image';

const ItemType = 'ITEM';

// --- Helper: Check if file is video ---
const isVideo = (url) => {
    if (url instanceof File) return url.type.startsWith("video/");
    if (typeof url !== "string") return false;
    return url.match(/\.(mp4|mov|webm|avi|flv|wmv|mkv|m4v|3gp|3g2|ogg|mpeg|mpg)$/i);
};

// --- Draggable Item Component ---
const SortableItem = ({ url, index, moveItem, selectedList, selectHandler }) => {
    const ref = useRef(null);
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        if (url instanceof File) {
            const blobUrl = URL.createObjectURL(url);
            setPreviewUrl(blobUrl);
            return () => URL.revokeObjectURL(blobUrl);
        } else if (typeof url === "string") {
            if (url.startsWith("blob:") || url.startsWith("data:") || url.startsWith("http")) {
                setPreviewUrl(url);
            } else {
                setPreviewUrl(`${process.env.NEXT_PUBLIC_SITE_IMAGE_URL}${url}`);
            }
        }
    }, [url]);

    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemType,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: ItemType,
        hover(item, monitor) {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;

            // Don't replace items with themselves
            if (dragIndex === hoverIndex) return;

            // Determine rectangle on screen
            const hoverBoundingRect = ref.current.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            // Only perform the move when the mouse has crossed half of the items height
            // (Standard react-dnd optimization to prevent flickering)
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

            moveItem(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    // Use callback ref to properly compose drag and drop refs for React 19
    const setDragRef = useCallback((node) => {
        ref.current = node;
        drag(drop(node));
    }, [drag, drop]);

    return (
        <Grid item xs={12} sm={6} md={4} ref={preview} sx={{ opacity: isDragging ? 0.5 : 1 }}>
            <Card sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1,
                position: 'relative',
                border: selectedList.includes(url) ? '2px solid rgba(0,0,0,0.7)' : '1px solid #ddd'
            }}>
                {/* Drag Handle */}
                <div ref={setDragRef} style={{ cursor: 'grab', marginRight: '8px', display: 'flex', alignItems: 'center' }}>
                    <DragIndicatorIcon color="action" />
                </div>

                {/* Checkbox */}
                <Checkbox
                    checked={selectedList.includes(url)}
                    onChange={(e) => selectHandler(e, url)}
                    color="primary"
                    sx={{ p: 0.5, mr: 1 }}
                />

                {/* Media Content */}
                <Box sx={{
                    width: 80,
                    height: 80,
                    position: 'relative',
                    flexShrink: 0,
                    bgcolor: '#000',
                    borderRadius: 1,
                    overflow: 'hidden'
                }}>
                    {isVideo(url) ? (
                        <video
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            src={previewUrl}
                            muted
                        />
                    ) : (
                        previewUrl && (
                            <Image
                                src={previewUrl}
                                alt="Item"
                                fill
                                sizes="80px"
                                style={{ objectFit: 'cover' }}
                                unoptimized
                            />
                        )
                    )}
                </Box>

                {/* File Name / Info (Optional) */}
                <Typography variant="caption" sx={{ ml: 2, wordBreak: 'break-all', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {url instanceof File ? url.name : (typeof url === 'string' ? url.split('/').pop() : '')}
                </Typography>
            </Card>
        </Grid>
    );
};


// --- Main Component ---
const MultiImageManager = ({ deleteHandler, Link, field }) => {
    const [open, setOpen] = useState(false);
    const [allLinks, setAllLinks] = useState([]);
    const [selectedList, setSelectedList] = useState([]);

    // Sync state when props change or modal opens
    useEffect(() => {
        if (Link) {
            setAllLinks(Link);
        }
    }, [Link, open]);

    const handleClose = () => {
        setOpen(false);
        setSelectedList([]); // Reset selection on close
    };

    const selectHandler = (e, link) => {
        if (e.target.checked) {
            setSelectedList((prev) => [...prev, link]);
        } else {
            setSelectedList((prev) => prev.filter((item) => item !== link));
        }
    };

    const handleDelete = () => {
        if (selectedList.length === 0) return;

        const newLinks = allLinks.filter((ele) => !selectedList.includes(ele));

        // Pass updated list to parent
        deleteHandler(newLinks, field, selectedList);

        // Update local state immediately for UI responsiveness
        setAllLinks(newLinks);
        setSelectedList([]);

        // Optional: Close modal or keep open
        // handleClose(); 
    };

    const handleSaveOrder = () => {
        // Pass the re-ordered list to parent
        // Passing 'true' as 4th arg based on your original logic for "save position"

        deleteHandler(allLinks, field, [], true);
        handleClose();
    };

    const moveItem = useCallback((dragIndex, hoverIndex) => {
        setAllLinks((prevLinks) => {
            const updatedLinks = [...prevLinks];
            const [movedItem] = updatedLinks.splice(dragIndex, 1);
            updatedLinks.splice(hoverIndex, 0, movedItem);
            return updatedLinks;
        });
    }, []);

    return (
        <>
            <Tooltip title="Manage Images">
                <IconButton
                    onClick={() => setOpen(true)}
                    color="primary"
                    aria-label="manage images"
                >
                    <AppRegistrationIcon />
                </IconButton>
            </Tooltip>

            <Dialog
                onClose={handleClose}
                open={open}
                maxWidth="md"
                fullWidth
                scroll="paper"
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Manage Media ({allLinks?.length})</Typography>
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{ minHeight: '300px', bgcolor: '#f5f5f5' }}>
                    {/* Note: If you have a DndProvider at the root of your App, 
                       you do not need another one here. 
                   */}
                    <DndProvider backend={HTML5Backend}>
                        <Grid container spacing={2}>
                            {allLinks && allLinks.length > 0 ? (
                                allLinks.map((url, index) => (
                                    <SortableItem
                                        key={`${url}-${index}`} // Composite key in case of dupes, though url should be unique
                                        url={url}
                                        index={index}
                                        moveItem={moveItem}
                                        selectedList={selectedList}
                                        selectHandler={selectHandler}
                                    />
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                                        <Typography color="textSecondary">No images found.</Typography>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </DndProvider>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={handleClose}
                        color="inherit"
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleDelete}
                        disabled={selectedList.length === 0}
                    >
                        Delete Selected ({selectedList.length})
                    </Button>

                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveOrder}
                    >
                        Save Order
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default MultiImageManager;