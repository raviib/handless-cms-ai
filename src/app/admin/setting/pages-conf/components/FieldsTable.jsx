"use client"
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import { memo, useCallback, useState } from 'react';
import { FieldDetailsDialog } from './FieldDetailsDialog';
import { FieldTableRow } from './FieldTableRow';
import { TABLE_DISPLAY_FIELDS } from './FieldComponents';


/**
 * FieldsTable Component
 * Displays table of all configured fields
 */
export const FieldsTable = memo(({ fields, editHandler, deleteHandler, setFields, setShowSaveButton }) => {
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [viewField, setViewField] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleView = useCallback((field) => {
        setViewField(field);
    }, []);

    const handleCloseView = useCallback(() => {
        setViewField(null);
    }, []);

    const handleDragStart = useCallback((index, e) => {
        e.stopPropagation();
        
        setIsDragging(true);
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
    }, []);

    const handleDragOver = useCallback((index, e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        
        if (draggedIndex !== null && draggedIndex !== index) {
            setDragOverIndex(index);
        }
    }, [draggedIndex]);

    const handleDragLeave = useCallback((e) => {
        e.stopPropagation();
        setDragOverIndex(null);
    }, []);

    const handleDrop = useCallback((dropIndex, e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Prevent invalid drops
        if (draggedIndex === null || draggedIndex === dropIndex || draggedIndex >= fields.length) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            setIsDragging(false);
            return;
        }

        // Create new array and perform reorder
        const newFields = [...fields];
        const originalLength = newFields.length;
        
        // Remove the dragged item
        const [draggedField] = newFields.splice(draggedIndex, 1);
        
        if (!draggedField) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            setIsDragging(false);
            return;
        }
        
        // Insert at new position
        newFields.splice(dropIndex, 0, draggedField);
        
        // Verify we didn't lose or gain items
        if (newFields.length !== originalLength) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            setIsDragging(false);
            return;
        }

        // Update sort values
        newFields.forEach((field, idx) => {
            field.sort = idx;
        });

        // Update parent state
        setFields(newFields);
        setShowSaveButton(true);

        // Clear drag state
        setDraggedIndex(null);
        setDragOverIndex(null);
        setIsDragging(false);
    }, [draggedIndex, fields, setFields, setShowSaveButton]);

    const handleDragEnd = useCallback(() => {
        setDraggedIndex(null);
        setDragOverIndex(null);
        setIsDragging(false);
    }, []);

    if (!fields || fields.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f9f9f9', borderRadius: 2, border: '1px dashed #ddd' }}>
                <Typography variant="body2" color="text.secondary">
                    No fields added to this section yet.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            <Box sx={{ mb: 1, p: 1, bgcolor: '#f0f4f8', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    💡 Tip: Drag and drop rows to reorder fields
                </Typography>
            </Box>
            <TableContainer
                sx={{
                    width: '100%',
                    overflowX: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    border: '1px solid #eee',
                    '&::-webkit-scrollbar': { height: 8 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: '#94a3b8', borderRadius: 10 },
                    '&::-webkit-scrollbar-track': { bgcolor: '#f1f5f9' }
                }}
            >
                <Table size="small" sx={{ borderCollapse: 'collapse', tableLayout: 'auto' }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#334155' }}>
                            <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, border: 'none', minWidth: 50, width: 50, cursor: 'grab' }}>
                                ⋮⋮
                            </TableCell>
                            {/* <TableCell sx={{ color: '#fff', fontWeight: 700, border: 'none', minWidth: 50, width: 50 }}>ID</TableCell> */}
                            {TABLE_DISPLAY_FIELDS.map((fieldKey) => (
                                <TableCell
                                    key={fieldKey}
                                    sx={{
                                        color: '#fff',
                                        fontWeight: 700,
                                        border: 'none',
                                        whiteSpace: 'nowrap',
                                        width: 120,
                                    }}
                                    align='center'
                                >
                                    {fieldKey.toUpperCase()}
                                </TableCell>
                            ))}
                            <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, border: 'none', width: 100 }}>ACTIONS</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fields.map((ele, index) => {
                            return (
                                <TableRow
                                    key={`field-${index}-${ele.field?.value || 'unknown'}`}
                                    draggable={true}
                                    onDragStart={(e) => handleDragStart(index, e)}
                                    onDragOver={(e) => handleDragOver(index, e)}
                                    onDragEnter={(e) => e.preventDefault()}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(index, e)}
                                    onDragEnd={handleDragEnd}
                                    sx={{
                                        cursor: draggedIndex === index ? 'grabbing' : 'grab',
                                        opacity: draggedIndex === index ? 0.5 : 1,
                                        bgcolor: dragOverIndex === index && draggedIndex !== index ? 'rgba(99, 102, 241, 0.1)' : 'inherit',
                                        borderLeft: draggedIndex === index ? '3px solid #6366f1' : '3px solid transparent',
                                        transition: 'all 0.2s ease',
                                        '&:hover': { 
                                            bgcolor: draggedIndex === null ? 'rgba(0,0,0,0.02)' : 'inherit'
                                        },
                                        transform: draggedIndex === index ? 'scale(1.02)' : 'scale(1)',
                                    }}
                                >
                                    <TableCell sx={{ border: 'none', minWidth: 50, width: 50, textAlign: 'center', color: '#94a3b8' }}>
                                        ⋮⋮
                                    </TableCell>
                                    <FieldTableRow
                                        ele={ele}
                                        index={index + 1}
                                        originalIndex={index}
                                        editHandler={editHandler}
                                        deleteHandler={deleteHandler}
                                        viewHandler={handleView}
                                        isDragging={draggedIndex === index}
                                    />
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <FieldDetailsDialog
                open={Boolean(viewField)}
                onClose={handleCloseView}
                field={viewField}
            />
        </Box >
    );
});
FieldsTable.displayName = 'FieldsTable';