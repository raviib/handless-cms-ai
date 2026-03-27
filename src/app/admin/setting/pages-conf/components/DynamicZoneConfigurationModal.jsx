"use client"
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Typography,
    Checkbox,
    FormControlLabel,
    Chip,
    Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState, useCallback } from 'react';
import { useGetApi } from '@/app/lib/apicallHooks';
import { TostError } from '@/app/utils/tost/Tost';

/**
 * DynamicZoneConfigurationModal Component
 * Modal for configuring dynamic zone field with component selection
 */
export const DynamicZoneConfigurationModal = ({
    open,
    onClose,
    initialData,
    onSave,
    existingFields = [],
    isEdit = false
}) => {
    const [fieldName, setFieldName] = useState('');
    const [fieldLabel, setFieldLabel] = useState('');
    const [selectedComponents, setSelectedComponents] = useState([]);
    const [errors, setErrors] = useState({});

    // Fetch available page components using doFetch
    const { data: componentsData, isLoading, doFetch } = useGetApi(null);
    const availableComponents = componentsData?.data || [];

    // Initialize field config when modal opens
    useEffect(() => {
        if (open) {
            // Fetch components when modal opens
            doFetch('/setting/page-component?limit=1000');

            if (initialData) {
                // Edit mode
                setFieldName(initialData.field?.value || '');
                setFieldLabel(initialData.Printvalue || '');
                setSelectedComponents(initialData.allowed_components || []);
            } else {
                // Create mode
                setFieldName('');
                setFieldLabel('');
                setSelectedComponents([]);
            }
            setErrors({});
        }
    }, [open, initialData]);

    const handleComponentToggle = useCallback((componentId) => {
        setSelectedComponents(prev => {
            if (prev.includes(componentId)) {
                return prev.filter(id => id !== componentId);
            } else {
                return [...prev, componentId];
            }
        });
    }, []);

    const validateConfig = useCallback(() => {
        const newErrors = {};

        // Validate field name
        if (!fieldName) {
            newErrors.fieldName = 'Field name is required';
        } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(fieldName)) {
            newErrors.fieldName = 'No spaces allowed. Use underscores or camelCase';
        } else {
            // Check for duplicates
            const isDuplicate = existingFields.some(f => {
                if (isEdit && initialData && f.field?.value === initialData.field?.value) {
                    return false;
                }
                return f.field?.value === fieldName;
            });
            if (isDuplicate) {
                newErrors.fieldName = 'Field name already exists';
            }
        }

        // Validate field label
        if (!fieldLabel) {
            newErrors.fieldLabel = 'Field label is required';
        }

        // Validate component selection
        if (selectedComponents.length === 0) {
            newErrors.components = 'Please select at least one component';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [fieldName, fieldLabel, selectedComponents, existingFields, isEdit, initialData]);

    const handleSave = useCallback(() => {
        if (!validateConfig()) {
            return;
        }

        const fieldConfig = {
            field: {
                label: fieldName,
                value: fieldName
            },
            Printvalue: fieldLabel,
            type: 'dynamic-zone',
            colSpace: 'col-12',
            required: false,
            disable_in_edit: false,
            showInTable: false,
            sort: existingFields.length,
            placeholder: '',
            FieldPurpose: '',
            allowed_components: selectedComponents,
            // Advanced settings
            unique: false,
            index: false,
            sparse: false,
            default_value: '',
            trim: false,
            lowercase: false,
            uppercase: false
        };

        onSave(fieldConfig);
    }, [validateConfig, fieldName, fieldLabel, selectedComponents, existingFields.length, onSave]);

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    // Group components by category
    const componentsByCategory = availableComponents.reduce((acc, component) => {
        const category = component.category || 'general';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(component);
        return acc;
    }, {});

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    bgcolor: '#ffffff',
                    color: '#000000',
                    maxHeight: '90vh'
                }
            }}
        >
            {/* Header */}
            <DialogTitle
                sx={{
                    m: 0,
                    p: 2,
                    borderBottom: '1px solid #e0e0e0'
                }}
            >
                <Stack direction="row" alignItems="center" spacing={2}>
                    <IconButton
                        onClick={handleClose}
                        sx={{ color: '#555' }}
                        aria-label="Go back"
                    >
                        <ArrowBackIcon />
                    </IconButton>

                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, color: '#000' }}
                        >
                            {isEdit ? 'Edit' : 'Add new'} Dynamic zone field
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                            Dynamically pick component when editing content
                        </Typography>
                    </Box>

                    <IconButton
                        onClick={handleClose}
                        sx={{ color: '#555' }}
                        aria-label="Close"
                    >
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            {/* Content */}
            <DialogContent sx={{ p: 3, bgcolor: '#ffffff' }}>
                <Stack spacing={3}>
                    {/* Field Name */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Name *
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            value={fieldName}
                            onChange={(e) => setFieldName(e.target.value)}
                            placeholder="e.g. dynamic_sections, dynamicContent"
                            error={!!errors.fieldName}
                            helperText={errors.fieldName || 'Database field name (no spaces)'}
                        />
                    </Box>

                    {/* Field Label */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Label *
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            value={fieldLabel}
                            onChange={(e) => setFieldLabel(e.target.value)}
                            placeholder="e.g. Dynamic Sections, Content Blocks"
                            error={!!errors.fieldLabel}
                            helperText={errors.fieldLabel || 'Display label for this field'}
                        />
                    </Box>

                    {/* Component Selection */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Select the components *
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', mb: 2, display: 'block' }}>
                            Choose which components can be used in this dynamic zone
                        </Typography>

                        {errors.components && (
                            <Typography variant="caption" sx={{ color: 'error.main', mb: 1, display: 'block' }}>
                                {errors.components}
                            </Typography>
                        )}

                        {isLoading ? (
                            <Typography variant="body2" sx={{ color: '#666', py: 2 }}>
                                Loading components...
                            </Typography>
                        ) : availableComponents.length === 0 ? (
                            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    No components available. Please create components first.
                                </Typography>
                            </Paper>
                        ) : (
                            <Paper
                                variant="outlined"
                                sx={{
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    p: 2
                                }}
                            >
                                {Object.entries(componentsByCategory).map(([category, components]) => (
                                    <Box key={category} sx={{ mb: 2 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontWeight: 700,
                                                color: 'primary.main',
                                                textTransform: 'uppercase',
                                                display: 'block',
                                                mb: 1
                                            }}
                                        >
                                            {category}
                                        </Typography>
                                        <Stack spacing={1}>
                                            {components.map((component) => (
                                                <FormControlLabel
                                                    key={component._id}
                                                    control={
                                                        <Checkbox
                                                            checked={selectedComponents.includes(component._id)}
                                                            onChange={() => handleComponentToggle(component._id)}
                                                            size="small"
                                                        />
                                                    }
                                                    label={
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {component.name}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: '#666',
                                                                    fontFamily: 'monospace',
                                                                    fontSize: '11px'
                                                                }}
                                                            >
                                                                {component.componentKey}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            ))}
                                        </Stack>
                                    </Box>
                                ))}
                            </Paper>
                        )}

                        {/* Selected Components Summary */}
                        {selectedComponents.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                                    Selected ({selectedComponents.length}):
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {selectedComponents.map((componentId) => {
                                        const component = availableComponents.find(c => c._id === componentId);
                                        return (
                                            <Chip
                                                key={componentId}
                                                label={component?.name || componentId}
                                                size="small"
                                                onDelete={() => handleComponentToggle(componentId)}
                                                color="primary"
                                                variant="outlined"
                                            />
                                        );
                                    })}
                                </Stack>
                            </Box>
                        )}
                    </Box>
                </Stack>
            </DialogContent>

            {/* Actions */}
            <DialogActions
                sx={{
                    p: 2,
                    borderTop: '1px solid #e0e0e0',
                    bgcolor: '#ffffff'
                }}
            >
                <Button
                    onClick={handleClose}
                    sx={{
                        color: '#555',
                        textTransform: 'none',
                        '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.05)'
                        }
                    }}
                >
                    Cancel
                </Button>

                <Box sx={{ flex: 1 }} />

                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                        bgcolor: '#000',
                        color: '#fff',
                        textTransform: 'none',
                        '&:hover': {
                            bgcolor: '#333'
                        }
                    }}
                >
                    Finish
                </Button>
            </DialogActions>
        </Dialog>
    );
};
