
"use client"
import DeleteIcon from '@mui/icons-material/Delete';
import SendAndArchiveIcon from '@mui/icons-material/SendAndArchive';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import {
    Box,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { memo } from 'react';


/**
 * SectionHeader Component
 * Displays section heading with edit/delete controls
 */
export const SectionHeader = memo(({
    ShowHeading,
    Heading,
    setHeading,
    setShowHeading,
    editSectionHeading,
    showSaveButton,
    SaveThisSectionHandler,
    deleteSection,
    showUpArrow = false,
}) => {
    return (
        <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3, pb: 2, borderBottom: '2px solid', borderColor: 'primary.light' }}
        >
            <Box sx={{ flexGrow: 1 }}>
                {ShowHeading ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                            size="small"
                            placeholder="Enter Section Name"
                            value={Heading}
                            onChange={(e) => setHeading(e.target.value)}
                            sx={{ minWidth: 300 }}
                        />
                        <IconButton onClick={() => editSectionHeading()} color="success">
                            <TaskAltIcon />
                        </IconButton>
                    </Stack>
                ) : (
                    <Typography
                        variant="h5"
                        onDoubleClick={() => setShowHeading(true)}
                        sx={{ fontWeight: 800, color: 'primary.dark', cursor: 'pointer' }}
                    >
                        {Heading.toUpperCase()}
                    </Typography>
                )}
            </Box>

            <Stack direction="row" spacing={1}>

                {showSaveButton && (
                    <Tooltip title="Save Section Changes">
                        <IconButton
                            onClick={() => SaveThisSectionHandler()}
                            sx={{ bgcolor: 'warning.light', color: 'warning.contrastText', '&:hover': { bgcolor: 'warning.main' } }}
                        >
                            <SendAndArchiveIcon />
                        </IconButton>
                    </Tooltip>
                )}
                <Tooltip title="Delete Section">
                    <IconButton
                        onClick={() => deleteSection()}
                        sx={{ bgcolor: 'error.light', color: 'error.contrastText', '&:hover': { bgcolor: 'error.main' } }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>

            </Stack>
        </Stack>
    );
});


SectionHeader.displayName = 'SectionHeader';