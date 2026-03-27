"use client"
import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    IconButton,
    Typography,
    Button,
    Stack,
    Paper,
    Chip,
    CircularProgress,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useGetApi } from '@/app/lib/apicallHooks';
import { useEffect, useState } from 'react';

/**
 * ExistingComponentFieldModal Component
 * Step 1: Select existing component
 * Step 2: Configure field settings (key and display name)
 */
export const ExistingComponentFieldModal = ({ open, onClose, onSave }) => {
    const { data: componentsData, isLoading, doFetch } = useGetApi(null);
    const [availableComponents, setAvailableComponents] = useState([]);
    const [step, setStep] = useState(1); // 1 = select component, 2 = configure field
    const [selectedComponent, setSelectedComponent] = useState(null);

    // Field configuration
    const [fieldKey, setFieldKey] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [componentType, setComponentType] = useState('single');
    const [fieldKeyError, setFieldKeyError] = useState('');

    useEffect(() => {
        if (open) {
            doFetch('/setting/page-component?limit=1000');
            setStep(1);
            setSelectedComponent(null);
            setFieldKey('');
            setDisplayName('');
            setComponentType('single');
            setFieldKeyError('');
        }
    }, [open]);

    useEffect(() => {
        if (componentsData?.data) {
            setAvailableComponents(componentsData.data);
        }
    }, [componentsData]);

    const handleComponentSelect = (component) => {
        setSelectedComponent(component);
        setFieldKey("");
        // Display name is the component name
        setDisplayName("");
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
        setSelectedComponent(null);
        setFieldKeyError('');
    };

    const validateFieldKey = (value) => {
        // Check for spaces
        if (/\s/.test(value)) {
            return 'Component key cannot contain spaces. Use underscores, hyphens, or dots.';
        }
        
        // Check for valid characters (alphanumeric, underscore, hyphen, dot)
        if (!/^[a-zA-Z0-9._-]+$/.test(value)) {
            return 'Component key can only contain letters, numbers, underscores, hyphens, and dots.';
        }
        
        // Check if it starts with a letter or number
        if (!/^[a-zA-Z0-9]/.test(value)) {
            return 'Component key must start with a letter or number.';
        }
        
        return '';
    };

    const handleFieldKeyChange = (e) => {
        const value = e.target.value;
        setFieldKey(value);
        
        if (value) {
            const error = validateFieldKey(value);
            setFieldKeyError(error);
        } else {
            setFieldKeyError('');
        }
    };

    const handleSave = () => {
        if (!fieldKey || !displayName) {
            alert('Please fill in all required fields');
            return;
        }

        // Validate field key before saving
        const keyError = validateFieldKey(fieldKey);
        if (keyError) {
            setFieldKeyError(keyError);
            return;
        }

        onSave({
            component: selectedComponent,
            fieldKey,
            displayName,
            componentType
        });

        // Reset
        setStep(1);
        setSelectedComponent(null);
        setFieldKey('');
        setDisplayName('');
        setComponentType('single');
        setFieldKeyError('');
    };

    const handleClose = () => {
        setStep(1);
        setSelectedComponent(null);
        setFieldKey('');
        setDisplayName('');
        setComponentType('single');
        setFieldKeyError('');
        onClose();
    };

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
                    {step === 1 ? 'Select Component' : 'Component Field Settings'}
                </Typography>
                <IconButton aria-label="close" onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3, minHeight: 400 }}>
                {step === 1 ? (
                    // Step 1: Select Component
                    <>
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                                <CircularProgress />
                            </Box>
                        ) : availableComponents.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography variant="body1" color="text.secondary">
                                    No components available yet.
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Create your first component to use it here.
                                </Typography>
                            </Box>
                        ) : (
                            <Box>
                                {Object.entries(componentsByCategory).map(([category, components]) => (
                                    <Box key={category} sx={{ mb: 3 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontWeight: 700,
                                                color: 'primary.main',
                                                textTransform: 'uppercase',
                                                display: 'block',
                                                mb: 1.5
                                            }}
                                        >
                                            {category}
                                        </Typography>
                                        <Stack spacing={1}>
                                            {components.map((component) => (
                                                <Paper
                                                    key={component._id}
                                                    component="button"
                                                    type="button"
                                                    onClick={() => handleComponentSelect(component)}
                                                    sx={{
                                                        p: 2,
                                                        cursor: 'pointer',
                                                        border: '1px solid #e0e0e0',
                                                        backgroundColor: '#fff',
                                                        textAlign: 'left',
                                                        width: '100%',
                                                        '&:hover': {
                                                            backgroundColor: '#f5f5f5',
                                                            borderColor: '#4945ff'
                                                        },
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                                                {component.name}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: '#666',
                                                                    fontFamily: 'monospace',
                                                                    fontSize: '11px',
                                                                    display: 'block'
                                                                }}
                                                            >
                                                                {component.componentKey}
                                                            </Typography>
                                                            {component.fields && (
                                                                <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 0.5 }}>
                                                                    {component.fields.length} field{component.fields.length !== 1 ? 's' : ''}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                        {component.isActive && (
                                                            <Chip
                                                                label="Active"
                                                                size="small"
                                                                color="success"
                                                                sx={{ height: 20, fontSize: '10px' }}
                                                            />
                                                        )}
                                                    </Box>
                                                </Paper>
                                            ))}
                                        </Stack>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </>
                ) : (
                    // Step 2: Configure Field Settings
                    <Box>
                        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                Selected Component
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {selectedComponent?.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666', fontFamily: 'monospace' }}>
                                {selectedComponent?.componentKey}
                            </Typography>
                        </Paper>

                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                            Component Field Settings
                        </Typography>

                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Component Key (Unique)"
                                value={fieldKey}
                                onChange={handleFieldKeyChange}
                                required
                                error={!!fieldKeyError}
                                helperText={fieldKeyError || "Unique identifier (no spaces, use underscores, hyphens, or dots)"}
                                placeholder="e.g. general.hero-section, aboutUsSection, blog_list"
                            />

                            <TextField
                                fullWidth
                                label="Display Name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                                placeholder="e.g. Hero Section"
                                helperText="Human-readable name for this component field"
                            />

                            <FormControl fullWidth>
                                <InputLabel>Structure Type</InputLabel>
                                <Select
                                    value={componentType}
                                    onChange={(e) => setComponentType(e.target.value)}
                                    label="Structure Type"
                                >
                                    <MenuItem value="single">Single - Use once</MenuItem>
                                    <MenuItem value="repeatable">Repeatable - Use multiple times</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                {step === 2 && (
                    <Button onClick={handleBack} sx={{ color: '#555', textTransform: 'none', mr: 'auto' }}>
                        Back
                    </Button>
                )}
                <Button onClick={handleClose} sx={{ color: '#555', textTransform: 'none' }}>
                    Cancel
                </Button>
                {step === 2 && (
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={!fieldKey || !displayName || !!fieldKeyError}
                        sx={{ textTransform: 'none' }}
                    >
                        Add Component
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};
