"use client"
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    IconButton,
    Stack,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState, useCallback } from 'react';
import { ComponentConfigurationModal } from './ComponentConfigurationModal';
import { DynamicZoneConfigurationModal } from './DynamicZoneConfigurationModal';
import { ComponentTypeChoiceModal } from './ComponentTypeChoiceModal';
import { ExistingComponentFieldModal } from './ExistingComponentFieldModal';
import { FieldDependencyConfig } from './FieldDependencyConfig';

/**
 * FieldConfigurationModal Component
 * Modal for configuring field settings with BASIC and ADVANCED tabs
 * 
 * @param {boolean} open - Whether the modal is open
 * @param {function} onClose - Callback when modal is closed
 * @param {object} fieldType - The selected field type object {id, label, icon, description}
 * @param {object} initialData - Initial field data for editing (optional)
 * @param {function} onSave - Callback when field is saved
 * @param {function} onAddAnother - Callback when "Add another field" is clicked
 * @param {array} existingFields - Array of existing fields (for validation)
 * @param {boolean} isEdit - Whether this is an edit operation
 * @param {component} BasicSettingsTab - Component for basic settings
 * @param {component} AdvancedSettingsTab - Component for advanced settings
 * @param {array} currentComponentPath - Current component path for nested fields
 */
/**
 * AiConfigTab — per-field AI configuration
 * Stored directly on the field definition object.
 */
const AiConfigTab = ({ fieldConfig, onChange }) => (
    <Grid container spacing={3}>
        <Grid item xs={12}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                    p: 1.5,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                    border: '1px solid #ddd6fe',
                }}
            >
                <AutoFixHighIcon sx={{ color: '#7c3aed', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ color: '#5b21b6', fontWeight: 600 }}>
                    AI Content Assist
                </Typography>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                When enabled, the AI wand icon appears on this field so editors can generate or improve content inline.
                The helper prompt gives the AI extra context specific to this field.
            </Typography>

            <FormControlLabel
                sx={{ mb: 3 }}
                control={
                    <Switch
                        checked={!!fieldConfig.aiEnabled}
                        onChange={(e) => onChange('aiEnabled', e.target.checked)}
                        sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#7c3aed' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#7c3aed' },
                        }}
                    />
                }
                label="Enable AI for this field"
            />

            <TextField
                fullWidth
                multiline
                minRows={4}
                label="AI Helper Prompt"
                placeholder='e.g. "Write a short, punchy product tagline. Max 10 words. Focus on quality and durability."'
                value={fieldConfig.aiPrompt || ''}
                onChange={(e) => onChange('aiPrompt', e.target.value)}
                helperText="Optional. Injected as extra context when AI generates content for this specific field."
                sx={{
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7c3aed' },
                    '& label.Mui-focused': { color: '#7c3aed' },
                }}
            />
        </Grid>
    </Grid>
);

export const FieldConfigurationModal = ({
    open,
    onClose,
    fieldType,
    initialData,
    onSave,
    onAddAnother,
    existingFields = [],
    allSections = [],
    currentSectionIndex = 0,
    isEdit = false,
    BasicSettingsTab,
    AdvancedSettingsTab,
    currentComponentPath = []
}) => {
    const [activeTab, setActiveTab] = useState('basic');
    const [fieldConfig, setFieldConfig] = useState({});
    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const [showComponentModal, setShowComponentModal] = useState(false);
    const [showDynamicZoneModal, setShowDynamicZoneModal] = useState(false);
    const [showComponentTypeChoice, setShowComponentTypeChoice] = useState(false);
    const [showExistingComponentModal, setShowExistingComponentModal] = useState(false);

    // Initialize field config when modal opens or initialData changes
    useEffect(() => {
        if (open && fieldType) {
            // If it's a component type, show choice modal first
            if (fieldType.id === 'component' && !initialData) {
                setShowComponentTypeChoice(true);
                return;
            }

            // If it's a dynamic-zone type, show dynamic zone modal instead
            if (fieldType.id === 'dynamic-zone') {
                setShowDynamicZoneModal(true);
                return;
            }

            if (initialData) {
                // Edit mode - load existing data
                setFieldConfig(initialData);
            } else {
                // Create mode - initialize with defaults
                const defaultConfig = {
                    field: null,
                    Printvalue: '',
                    type: fieldType.id,
                    colSpace: 'col-6',
                    required: true,
                    disable_in_edit: false,
                    showInTable: false,
                    sort: existingFields.length,
                    placeholder: '',
                    FieldPurpose: '',
                    // Advanced settings
                    unique: false,
                    index: false,
                    sparse: false,
                    default_value: '',
                    match_regex: '',
                    trim: false,
                    lowercase: false,
                    uppercase: false,
                    // Dependency settings
                    dependency_field: '',
                    dependency_field_target: '',
                    dependency_action: 'show',
                    // AI config
                    aiEnabled: false,
                    aiPrompt: '',
                };
                setFieldConfig(defaultConfig);
            }
            setErrors({});
            setIsDirty(false);
        }
    }, [open, fieldType, initialData, existingFields.length]);

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Handle field config changes
    const handleFieldChange = useCallback((fieldName, value) => {
        setFieldConfig(prev => ({
            ...prev,
            [fieldName]: value
        }));
        setIsDirty(true);

        // Clear error for this field when user makes changes
        if (errors[fieldName]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    }, [errors]);

    // Validate field configuration
    const validateConfig = useCallback(() => {
        const newErrors = {};

        // Validate Db Field (database field name)
        if (!fieldConfig.field?.value) {
            newErrors.field = 'Db Field is required';
        } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(fieldConfig.field.value)) {
            newErrors.field = 'No spaces allowed. Use underscores or camelCase';
        } else {
            // Check for duplicates only at the SAME LEVEL (not globally)
            // Skip duplicate check if editing and the key hasn't changed
            const isKeyChanged = isEdit && initialData &&
                (initialData.field?.value !== fieldConfig.field.value);

            if (!isEdit || isKeyChanged) {
                let fieldsToCheck = existingFields;

                // If we're at root level (no component path), check across ALL sections
                if (currentComponentPath.length === 0 && allSections.length > 0) {
                    console.log('Checking duplicates across all sections at root level');

                    // Collect all root-level field names from all sections
                    const allRootFields = [];
                    allSections.forEach((section, sectionIndex) => {
                        if (section.fields && Array.isArray(section.fields)) {
                            section.fields.forEach(field => {
                                // Skip the current field being edited in the current section
                                if (isEdit && sectionIndex === currentSectionIndex &&
                                    initialData && field.field?.value === initialData.field?.value) {
                                    return;
                                }
                                allRootFields.push(field);
                            });
                        }
                    });

                    fieldsToCheck = allRootFields;
                    console.log('All root fields across sections:', fieldsToCheck.map(f => f.field?.value));
                } else if (currentComponentPath.length > 0) {
                    // If we're adding to a nested component, navigate to that level
                    console.log('Checking duplicates in nested component path:', currentComponentPath);

                    // Navigate through the component tree to find the correct level
                    let currentLevel = existingFields;
                    for (let i = 0; i < currentComponentPath.length; i++) {
                        const componentName = currentComponentPath[i];
                        const componentField = currentLevel.find(f =>
                            f.type === 'component' &&
                            (f.field?.value === componentName || f.component_key === componentName)
                        );

                        if (componentField && componentField.fields) {
                            currentLevel = componentField.fields;
                        } else {
                            // If we can't find the component, check at root level
                            currentLevel = existingFields;
                            break;
                        }
                    }

                    fieldsToCheck = currentLevel;
                    console.log('Fields to check at this level:', fieldsToCheck);
                }

                // Check for duplicates only at this level
                // When editing, exclude the current field being edited
                const isDuplicate = fieldsToCheck.some(f => {
                    // For components, check both field.value and component_key
                    // For regular fields, check field.value
                    const fieldValue = fieldConfig.field.value;
                    const matches = f.field?.value === fieldValue ||
                        (f.type === 'component' && f.component_key === fieldValue);

                    // If editing, exclude the current field from duplicate check
                    if (isEdit && initialData) {
                        const isSameField = f.field?.value === initialData.field?.value ||
                            (f.type === 'component' && f.component_key === initialData.field?.value);
                        return matches && !isSameField;
                    }

                    return matches;
                });

                if (isDuplicate) {
                    // Find which section has the duplicate (if at root level)
                    if (currentComponentPath.length === 0 && allSections.length > 0) {
                        let duplicateSection = null;
                        allSections.forEach((section, index) => {
                            if (section.fields && section.fields.some(f => f.field?.value === fieldConfig.field.value)) {
                                if (index !== currentSectionIndex) {
                                    duplicateSection = section.Heading || `Section ${index + 1}`;
                                }
                            }
                        });
                        console.log(duplicateSection, "duplicateSection")
                        console.log(fieldConfig, "fieldConfig.field")
                        if (duplicateSection) {
                            newErrors.field = `Field name already exists in "${duplicateSection}"`;
                        } else {
                            newErrors.field = 'Field name already exists at this level';
                        }
                    } else {
                        newErrors.field = 'Field name already exists at this level';
                    }
                }
            }
        }

        // Validate Print Value
        if (!fieldConfig.Printvalue) {
            newErrors.Printvalue = 'Print value is required';
        }

        // Type-specific validation
        if (fieldConfig.type === 'relation') {
            if (!fieldConfig.connectwith) {
                newErrors.connectwith = 'Please select a relation';
            }
            if (!fieldConfig.api_end_point) {
                newErrors.api_end_point = 'API endpoint is required';
            }
            if (!fieldConfig.CreateUrl) {
                newErrors.CreateUrl = 'Create URL is required';
            }
            if (!fieldConfig.getOptionLabel) {
                newErrors.getOptionLabel = 'Option label is required';
            }
            if (!fieldConfig.getOptionValue) {
                newErrors.getOptionValue = 'Option value is required';
            }
        }

        if (fieldConfig.type === 'enumeration') {
            if (!fieldConfig.option_value) {
                newErrors.option_value = 'At least one option is required';
            }
        }

        if (fieldConfig.type === 'media') {
            if (fieldConfig.fileLimit) {
                const limit = parseFloat(fieldConfig.fileLimit);
                if (isNaN(limit) || limit < 0.1 || limit > 100) {
                    newErrors.fileLimit = 'File limit must be between 0.1 and 100 MB';
                }
            }
        }

        if (fieldConfig.type === 'component') {
            if (!fieldConfig.component_key) {
                newErrors.component_key = 'Component key is required';
            } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(fieldConfig.component_key)) {
                newErrors.component_key = 'No spaces allowed. Use underscores or camelCase';
            }
            if (!fieldConfig.component_display_name) {
                newErrors.component_display_name = 'Component display name is required';
            }
            // Note: component_category was removed - component_key is the unique identifier
        }

        if (fieldConfig.type === 'number') {
            if (fieldConfig.min_value && fieldConfig.max_value) {
                const min = parseFloat(fieldConfig.min_value);
                const max = parseFloat(fieldConfig.max_value);
                if (!isNaN(min) && !isNaN(max) && min >= max) {
                    newErrors.max_value = 'Max value must be greater than min value';
                }
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [fieldConfig, existingFields, isEdit]);

    // Handle save
    const handleSave = useCallback(() => {
        if (validateConfig()) {
            onSave(fieldConfig, currentComponentPath);
            setIsDirty(false);
        }
    }, [validateConfig, onSave, fieldConfig, currentComponentPath]);

    // Handle add another field
    const handleAddAnother = useCallback(() => {
        if (validateConfig()) {
            onSave(fieldConfig, currentComponentPath);
            setIsDirty(false);
            onAddAnother();
        }
    }, [validateConfig, onSave, fieldConfig, currentComponentPath, onAddAnother]);

    // Handle close with unsaved changes warning
    const handleClose = useCallback(() => {
        if (isDirty) {
            const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
            if (!confirmClose) return;
        }
        onClose();
    }, [isDirty, onClose]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!open) return;

            // Escape to close
            if (e.key === 'Escape') {
                handleClose();
            }

            // Ctrl+Enter to save
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSave();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, handleClose, handleSave]);

    if (!fieldType) return null;

    // Generate breadcrumb for nested components
    const breadcrumb = currentComponentPath.length > 0
        ? `Component > ${currentComponentPath.join(' > ')}`
        : null;

    return (
        <>
            {/* Component Type Choice Modal */}
            <ComponentTypeChoiceModal
                open={showComponentTypeChoice}
                onClose={() => {
                    setShowComponentTypeChoice(false);
                    onClose();
                }}
                onCreateNew={() => {
                    setShowComponentTypeChoice(false);
                    setShowComponentModal(true);
                }}
                onUseExisting={() => {
                    setShowComponentTypeChoice(false);
                    setShowExistingComponentModal(true);
                }}
            />

            {/* Existing Component Field Modal */}
            <ExistingComponentFieldModal
                open={showExistingComponentModal}
                onClose={() => {
                    setShowExistingComponentModal(false);
                    onClose();
                }}
                onSave={({ component, fieldKey, displayName, componentType }) => {
                    // Create component field configuration from existing component
                    const componentFieldConfig = {
                        type: 'component',
                        field: {
                            value: fieldKey,
                            label: displayName
                        },
                        Printvalue: fieldKey,
                        component_display_name: displayName,
                        component_type: componentType,
                        component_key: fieldKey,
                        component_id: component._id,
                        fields: component.fields || [],
                        sort: existingFields.length,
                        component_icon: "puzzle",
                        required: false,
                        colSpace: 'col-12',
                        disable_in_edit: false,
                        showInTable: false,
                        placeholder: '',
                        FieldPurpose: ''
                    };

                    onSave(componentFieldConfig, currentComponentPath);
                    setShowExistingComponentModal(false);
                }}
            />

            {/* Component Configuration Modal */}
            <ComponentConfigurationModal
                open={showComponentModal}
                onClose={() => {
                    setShowComponentModal(false);
                    onClose();
                }}
                initialData={fieldType?.id === 'component' ? initialData : null}
                onSave={(componentConfig) => {
                    onSave(componentConfig, currentComponentPath);
                    setShowComponentModal(false);
                }}
                existingFields={existingFields}
                allSections={allSections}
                currentSectionIndex={currentSectionIndex}
                isEdit={isEdit}
                currentComponentPath={currentComponentPath}
            />

            {/* Dynamic Zone Configuration Modal */}
            <DynamicZoneConfigurationModal
                open={showDynamicZoneModal}
                onClose={() => {
                    setShowDynamicZoneModal(false);
                    onClose();
                }}
                initialData={fieldType?.id === 'dynamic-zone' ? initialData : null}
                onSave={(dynamicZoneConfig) => {
                    onSave(dynamicZoneConfig, currentComponentPath);
                    setShowDynamicZoneModal(false);
                }}
                existingFields={existingFields}
                isEdit={isEdit}
            />

            {/* Regular Field Configuration Modal */}
            <Dialog
                open={open && !showComponentModal && !showDynamicZoneModal && !showComponentTypeChoice && !showExistingComponentModal}
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
                                {isEdit ? 'Edit' : 'Add new'} {fieldType.label} field
                            </Typography>

                            {breadcrumb && (
                                <Typography
                                    variant="caption"
                                    sx={{ color: '#666' }}
                                >
                                    {breadcrumb}
                                </Typography>
                            )}
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

                {/* Tabs */}
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
                    <Tab label="BASIC SETTINGS" value="basic" />
                    <Tab label="ADVANCED SETTINGS" value="advanced" />
                    <Tab label="DEPENDENCIES" value="dependencies" />
                    <Tab label="AI CONFIG" value="ai" />
                </Tabs>

                {/* Content */}
                <DialogContent
                    sx={{
                        p: 3,
                        bgcolor: '#ffffff'
                    }}
                >
                    {activeTab === 'basic' && BasicSettingsTab && (
                        <BasicSettingsTab
                            fieldConfig={fieldConfig}
                            fieldType={fieldType}
                            errors={errors}
                            onChange={handleFieldChange}
                            existingFields={existingFields}
                            currentComponentPath={currentComponentPath}
                        />
                    )}

                    {activeTab === 'advanced' && AdvancedSettingsTab && (
                        <AdvancedSettingsTab
                            fieldConfig={fieldConfig}
                            fieldType={fieldType}
                            errors={errors}
                            onChange={handleFieldChange}
                        />
                    )}

                    {activeTab === 'dependencies' && (
                        <FieldDependencyConfig
                            fieldConfig={fieldConfig}
                            onChange={handleFieldChange}
                            existingFields={existingFields}
                            currentComponentPath={currentComponentPath}
                        />
                    )}

                    {activeTab === 'ai' && (
                        <AiConfigTab
                            fieldConfig={fieldConfig}
                            onChange={handleFieldChange}
                        />
                    )}
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
                        onClick={handleAddAnother}
                        variant="outlined"
                        sx={{
                            color: '#000',
                            borderColor: '#000',
                            textTransform: 'none',
                            '&:hover': {
                                borderColor: '#333',
                                bgcolor: 'rgba(0,0,0,0.05)'
                            }
                        }}
                    >
                        Add another field
                    </Button>

                    <Button
                        onClick={handleSave}
                        variant="contained"
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
        </>
    );
};
