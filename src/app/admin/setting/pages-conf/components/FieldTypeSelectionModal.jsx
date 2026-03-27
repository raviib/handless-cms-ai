"use client"
import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

// Field types constant with all field types including dynamic-zone
const FIELD_TYPES = {
    default: [
        { id: 'text', label: 'Text', icon: 'Aa', description: 'Small or long text like title or description' },
        { id: 'rich-text-blocks', label: 'Rich text (Blocks)', icon: '📝', description: 'Big text value with text editor' },
        { id: 'number', label: 'Number', icon: '123', description: 'Numbers (integer, float, decimal)' },
        { id: 'date', label: 'Date', icon: '📅', description: 'A date picker with hours, minutes and seconds' },
        { id: 'boolean', label: 'Boolean', icon: '✓', description: 'Yes or no, 1 or 0, true or false' },
        { id: 'email', label: 'Email', icon: '✉', description: 'Email field with validators format' },
        { id: 'password', label: 'Password', icon: '🔒', description: 'Password field with encryption' },
        { id: 'enumeration', label: 'Enumeration', icon: '📋', description: 'List of values, then pick one' },
        { id: 'media', label: 'Media', icon: '🖼', description: 'Files like images, videos, etc' },
        { id: 'relation', label: 'Relation', icon: '🔗', description: 'Refers to a collection type' },
        { id: 'uid', label: 'UID', icon: '🆔', description: 'Unique identifier' },
        { id: 'rich-text-markdown', label: 'Rich text (Markdown)', icon: '📝', description: 'The classic rich text editor' },
        { id: 'json', label: 'JSON', icon: '{}', description: 'Data in JSON format' },
        { id: 'component', label: 'Component', icon: '🧩', description: 'Group of fields that you can repeat or reuse' },
        { id: 'dynamic-zone', label: 'Dynamic zone', icon: '∞', description: 'Dynamically pick component when editing content' }
    ],
    custom: []
};

/**
 * FieldTypeSelectionModal Component
 * Displays categorized field types for user selection
 */
export const FieldTypeSelectionModal = ({ open, onClose, onSelectType, hideDynamicZone = false }) => {
    const [activeTab, setActiveTab] = useState('default');

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleFieldTypeClick = (fieldType) => {
        onSelectType(fieldType);
    };

    // Filter out dynamic-zone if hideDynamicZone is true
    const getFilteredFieldTypes = (types) => {
        if (hideDynamicZone) {
            return types.filter(type => type.id !== 'dynamic-zone');
        }
        return types;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    bgcolor: '#ffffff',
                    color: '#000000'
                }
            }}
        >
            <DialogTitle
                sx={{
                    m: 0,
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #e0e0e0'
                }}
            >
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ fontWeight: 600, color: '#000000' }}
                >
                    Select a field type
                </Typography>

                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ color: '#000000' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                    borderBottom: '1px solid #e0e0e0',
                    px: 2,
                    '& .MuiTab-root': {
                        color: '#555',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        fontSize: '1rem',
                        '&.Mui-selected': {
                            color: '#000'
                        }
                    },
                    '& .MuiTabs-indicator': {
                        backgroundColor: '#000'
                    }
                }}
            >
                <Tab label="DEFAULT" value="default" />
                <Tab label="CUSTOM" value="custom" />
            </Tabs>

            <DialogContent sx={{ p: 3 }}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: 2
                    }}
                >
                    {getFilteredFieldTypes(FIELD_TYPES[activeTab]).map((fieldType) => (
                        <Box
                            key={fieldType.id}
                            onClick={() => handleFieldTypeClick(fieldType)}
                            sx={{
                                bgcolor: '#ffffff',
                                border: '1px solid #e0e0e0',
                                borderRadius: 2,
                                p: 2,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    borderColor: '#000',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            <Typography sx={{ fontSize: '32px', mb: 1 }}>
                                {fieldType.icon}
                            </Typography>

                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 600,
                                    color: '#000',
                                    mb: 0.5
                                }}
                            >
                                {fieldType.label}
                            </Typography>

                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: '12px',
                                    color: '#555'
                                }}
                            >
                                {fieldType.description}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {activeTab === 'custom' && FIELD_TYPES.custom.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" sx={{ color: '#555' }}>
                            No custom field types available
                        </Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>

    );
};
