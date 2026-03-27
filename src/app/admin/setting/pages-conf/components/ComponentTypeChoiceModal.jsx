"use client"
import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';

/**
 * ComponentTypeChoiceModal Component
 * Asks user to choose between creating new component or using existing one
 */
export const ComponentTypeChoiceModal = ({ open, onClose, onCreateNew, onUseExisting }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
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
                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                    Choose Component Type
                </Typography>
                <IconButton aria-label="close" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4 }}>
                <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
                    Would you like to create a new component or use an existing one?
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                    {/* Create New Component */}
                    <Paper
                        component="button"
                        type="button"
                        onClick={onCreateNew}
                        sx={{
                            p: 3,
                            cursor: 'pointer',
                            border: '2px solid #e0e0e0',
                            backgroundColor: '#fff',
                            textAlign: 'left',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            '&:hover': {
                                backgroundColor: '#f5f5ff',
                                borderColor: '#4945ff',
                                transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                    >
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 2,
                                bgcolor: '#4945ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}
                        >
                            <AddIcon sx={{ fontSize: 32, color: '#fff' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Create New Component
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', fontSize: '13px' }}>
                                Define a new reusable component with custom fields
                            </Typography>
                        </Box>
                    </Paper>

                    {/* Use Existing Component */}
                    <Paper
                        component="button"
                        type="button"
                        onClick={onUseExisting}
                        sx={{
                            p: 3,
                            cursor: 'pointer',
                            border: '2px solid #e0e0e0',
                            backgroundColor: '#fff',
                            textAlign: 'left',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            '&:hover': {
                                backgroundColor: '#f5fff5',
                                borderColor: '#10b981',
                                transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                    >
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 2,
                                bgcolor: '#10b981',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}
                        >
                            <FolderIcon sx={{ fontSize: 32, color: '#fff' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Use Existing Component
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', fontSize: '13px' }}>
                                Select from previously created components
                            </Typography>
                        </Box>
                    </Paper>
                </Box>
            </DialogContent>
        </Dialog>
    );
};
