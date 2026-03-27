"use client"
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import EditNoteIcon from '@mui/icons-material/EditNote';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
    Chip,
    IconButton,
    TableCell,
    Tooltip,
    Typography
} from '@mui/material';
import { memo, useCallback } from 'react';
import { TABLE_DISPLAY_FIELDS } from "./FieldComponents";


/**
 * FieldTableRow Component
 * Memoized row component for better performance
 */
export const FieldTableRow = memo(({ ele, index, originalIndex, editHandler, deleteHandler, viewHandler, isDragging }) => {
    const handleEdit = useCallback(() => editHandler(ele, originalIndex), [editHandler, ele, originalIndex]);
    const handleDelete = useCallback(() => deleteHandler(originalIndex), [deleteHandler, originalIndex]);
    const handleView = useCallback(() => viewHandler(ele), [viewHandler, ele]);

    return (
        <>
            {/* <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{index + 1}</TableCell> */}

            {TABLE_DISPLAY_FIELDS.map((key) => {
                let content = "N/A";
                if (key === "fileLimit" || key === "accept_type") {
                    if (ele["type"] === "file" || ele["object_type"] === "file" || ele["tab_type"] === "file") content = ele[key];
                } else if (key === "isMulti") {
                    if (ele["type"] === "file" || ele["object_type"] === "file" || ele["tab_type"] === "file") content = String(ele[key] ?? false);
                } else if (key === "field") {
                    if (ele.type === 'object') {
                        content = `${ele?.[key]?.["value"]} (${ele?.obj_name})`;
                    } else if (ele.type === 'tab') {
                        content = `${ele?.[key]?.["value"]} (${ele?.tab_name})`;
                    } else {
                        content = ele?.[key]?.["value"] || "N/A";
                    }
                } else if (key === "type") {
                    if (ele.type === 'object') {
                        content = `${ele.type} (${ele.object_type})`;
                    } else if (ele.type === 'tab') {
                        content = `${ele.type} (${ele.tab_type})`;
                    } else {
                        content = ele[key]?.toString() || "N/A";
                    }
                } else if (key === "connectwith") {
                    content = ele?.[key]?.["pageName"] || "N/A";
                } else if (["required", "showInTable", "disable_in_edit", "unique", "index"].includes(key)) {
                    content = String(ele[key] ?? false);
                } else {
                    content = ele[key]?.toString() || "N/A";
                }
                return (
                    <TableCell key={key} sx={{ maxWidth: 120, overflow: 'hidden' }} align="center">
                        {content === "true" || content === "false" ? (
                            <Chip
                                label={content === "true" ? "Yes" : "No"}
                                size="small"
                                color={content === "true" ? "success" : "default"}
                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                            />
                        ) : (
                            <Tooltip title={content}>
                                <Typography
                                    variant="body2"
                                    noWrap
                                    sx={{
                                        fontSize: '1rem',
                                        color: '#334',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {content}
                                </Typography>
                            </Tooltip>
                        )}
                    </TableCell>
                );
            })}
            <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                <Tooltip title="View Details">
                    <IconButton size="small" onClick={handleView} sx={{ color: 'info.main', mr: 0.5 }}>
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Edit Field">
                    <IconButton size="small" onClick={handleEdit} sx={{ color: 'primary.main', mr: 0.5 }}>
                        <EditNoteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Delete Field">
                    <IconButton size="small" onClick={handleDelete} sx={{ color: 'error.main' }}>
                        <DeleteSweepIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </TableCell>
        </>
    );
});
FieldTableRow.displayName = 'FieldTableRow';
