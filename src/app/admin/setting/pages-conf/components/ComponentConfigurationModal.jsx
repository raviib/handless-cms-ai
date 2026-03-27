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
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ExtensionIcon from '@mui/icons-material/Extension';
import { useEffect, useState, useCallback } from 'react';
import { ComponentFieldsConfig } from './ComponentFieldsConfig';
import { FieldDependencyConfig } from './FieldDependencyConfig';

/**
 * ComponentConfigurationModal Component
 * Modal for configuring component fields (without nested field management)
 * Users create the component first, then add fields to it later via FieldTreeItem
 * 
 * @param {boolean} open - Whether the modal is open
 * @param {function} onClose - Callback when modal is closed
 * @param {object} initialData - Initial component data for editing (optional)
 * @param {function} onSave - Callback when component is saved
 * @param {array} existingFields - Array of existing fields (for validation)
 * @param {boolean} isEdit - Whether this is an edit operation
 * @param {array} currentComponentPath - Current component path for nested components
 */
export const ComponentConfigurationModal = ({
    open,
    onClose,
    initialData,
    onSave,
    existingFields = [],
    allSections = [],
    currentSectionIndex = 0,
    isEdit = false,
    currentComponentPath = []
}) => {
    const [componentConfig, setComponentConfig] = useState({});
    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    // Initialize component config when modal opens
    useEffect(() => {
        if (open) {
            if (initialData) {
                // Edit mode - load existing data and ensure sync
                const syncedData = {
                    ...initialData,
                    // Ensure field.label and field.value sync with component_key
                    field: {
                        label: initialData.component_key || initialData.field?.value || '',
                        value: initialData.component_key || initialData.field?.value || ''
                    },
                    // Ensure Printvalue syncs with component_key
                    Printvalue: initialData.component_key || initialData.Printvalue || ''
                };
                console.log('Loading component data with sync:', syncedData);
                setComponentConfig(syncedData);
            } else {
                // Create mode - initialize with defaults
                const defaultConfig = {
                    type: 'component',
                    field: { label: '', value: '' },
                    Printvalue: '',
                    colSpace: 'col-6',
                    required: true,
                    disable_in_edit: false,
                    showInTable: false,
                    sort: existingFields.length,
                    placeholder: '',
                    FieldPurpose: '',
                    // Component-specific defaults
                    component_key: '',
                    component_display_name: '',
                    component_icon: 'puzzle',
                    component_type: 'single',
                    component_creation_mode: true,
                    fields: [],
                    // Dependency settings
                    dependency_field: '',
                    dependency_field_target: '',
                    dependency_action: 'show'
                };
                setComponentConfig(defaultConfig);
            }
            setErrors({});
            setIsDirty(false);
        }
    }, [open, initialData, existingFields.length]);

    // Handle component config changes
    const handleComponentChange = useCallback((fieldName, value) => {
        console.log('Component config change:', { fieldName, value });
        setComponentConfig(prev => {
            const newConfig = {
                ...prev,
                [fieldName]: value
            };
            
            // Auto-sync Printvalue with component_key
            if (fieldName === 'component_key') {
                newConfig.Printvalue = value;
                console.log('Auto-synced Printvalue with component_key:', value);
            }
            
            // Auto-sync Printvalue with component_display_name
            if (fieldName === 'component_display_name') {
                newConfig.Printvalue = value;
                console.log('Auto-synced Printvalue with component_display_name:', value);
            }
            
            console.log('New component config:', newConfig);
            return newConfig;
        });
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

    // Validate component configuration
    const validateComponent = useCallback(() => {
        const newErrors = {};

        // Validate Component Key (Db Field) - This is the unique identifier
        if (!componentConfig.component_key) {
            newErrors.component_key = 'Component key is required';
        } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(componentConfig.component_key)) {
            newErrors.component_key = 'No spaces allowed. Use underscores or camelCase';
        } else {
            // Check for duplicates only at the SAME LEVEL (not globally)
            // Skip duplicate check if editing and the key hasn't changed
            const isKeyChanged = isEdit && initialData && 
                                (initialData.component_key !== componentConfig.component_key);
            
            if (!isEdit || isKeyChanged) {
                let fieldsToCheck = existingFields;
                
                // If we're at root level (no component path), check across ALL sections
                if (currentComponentPath.length === 0 && allSections.length > 0) {
                    console.log('Checking component key duplicates across all sections at root level');
                    
                    // Collect all root-level component keys from all sections
                    const allRootComponents = [];
                    allSections.forEach((section, sectionIndex) => {
                        if (section.fields && Array.isArray(section.fields)) {
                            section.fields.forEach(field => {
                                if (field.type === 'component') {
                                    // Skip the current component being edited in the current section
                                    if (isEdit && sectionIndex === currentSectionIndex && 
                                        initialData && 
                                        (field.component_key === initialData.component_key || 
                                         field.field?.value === initialData.component_key)) {
                                        return;
                                    }
                                    allRootComponents.push(field);
                                }
                            });
                        }
                    });
                    
                    fieldsToCheck = allRootComponents;
                    console.log('All root components across sections:', fieldsToCheck.map(f => f.component_key));
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
                // When editing, exclude the current component being edited
                const isDuplicate = fieldsToCheck.some(f => {
                    // Check both field.value and component_key for comprehensive validation
                    const matches = f.field?.value === componentConfig.component_key ||
                                   f.component_key === componentConfig.component_key;
                    
                    // If editing, exclude the current component from duplicate check
                    if (isEdit && initialData) {
                        const isSameComponent = f.field?.value === initialData.component_key ||
                                               f.component_key === initialData.component_key ||
                                               f.field?.value === initialData.field?.value;
                        return matches && !isSameComponent;
                    }
                    
                    return matches;
                });
                
                if (isDuplicate) {
                    // Find which section has the duplicate (if at root level)
                    if (currentComponentPath.length === 0 && allSections.length > 0) {
                        let duplicateSection = null;
                        allSections.forEach((section, index) => {
                            if (section.fields && section.fields.some(f => 
                                f.type === 'component' && 
                                (f.component_key === componentConfig.component_key || 
                                 f.field?.value === componentConfig.component_key))) {
                                if (index !== currentSectionIndex) {
                                    duplicateSection = section.Heading || `Section ${index + 1}`;
                                }
                            }
                        });
                        
                        if (duplicateSection) {
                            newErrors.component_key = `Component key already exists in "${duplicateSection}"`;
                        } else {
                            newErrors.component_key = 'Component key already exists at this level';
                        }
                    } else {
                        newErrors.component_key = 'Component key already exists at this level. Must be unique within the same parent.';
                    }
                }
            }
        }

        // Validate Display Name
        if (!componentConfig.component_display_name) {
            newErrors.component_display_name = 'Display name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [componentConfig, existingFields, isEdit, currentComponentPath, allSections, currentSectionIndex, initialData]);

    // Handle save component
    const handleSave = useCallback(() => {
        console.log('=== COMPONENT SAVE DEBUG ===');
        console.log('Component Config:', componentConfig);
        console.log('Initial Data:', initialData);
        console.log('Validation Errors:', errors);
        
        if (validateComponent()) {
            console.log('✓ Validation passed');
            
            // Combine component config with proper field structure
            const finalComponentConfig = {
                type: 'component',
                field: {
                    label: componentConfig.component_key, // Sync with component_key
                    value: componentConfig.component_key  // Sync with component_key
                },
                Printvalue: componentConfig.component_key, // Sync with component_key
                colSpace: componentConfig.colSpace || 'col-12',
                required: componentConfig.required || false,
                disable_in_edit: componentConfig.disable_in_edit || false,
                showInTable: componentConfig.showInTable !== false,
                sort: componentConfig.sort || existingFields.length,
                placeholder: componentConfig.placeholder || '',
                FieldPurpose: componentConfig.FieldPurpose || '',
                // Component-specific fields
                component_key: componentConfig.component_key,
                component_display_name: componentConfig.component_display_name,
                component_icon: componentConfig.component_icon || 'puzzle',
                component_type: componentConfig.component_type || 'single',
                component_creation_mode: componentConfig.component_creation_mode !== false,
                // Initialize fields array - preserve existing or create empty
                fields: initialData?.fields || []
            };
            
            console.log('Final Component Config:', finalComponentConfig);
            console.log('Current Component Path:', currentComponentPath);
            
            onSave(finalComponentConfig, currentComponentPath);
            setIsDirty(false);
        } else {
            console.log('✗ Validation failed');
            console.log('Errors:', errors);
        }
    }, [validateComponent, componentConfig, initialData, onSave, currentComponentPath, errors, existingFields.length]);

    // Handle close with unsaved changes warning
    const handleClose = useCallback(() => {
        if (isDirty) {
            const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
            if (!confirmClose) return;
        }
        onClose();
    }, [isDirty, onClose]);

    // Generate breadcrumb for nested components
    const breadcrumb = currentComponentPath.length > 0
        ? `Component > ${currentComponentPath.join(' > ')}`
        : null;

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
                    color: '#000',
                    maxHeight: '90vh'
                }
            }}
        >
            {/* Header */}
            <DialogTitle sx={{
                m: 0,
                p: 2,
                borderBottom: '1px solid #e0e0e0'
            }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <IconButton
                        onClick={handleClose}
                        sx={{ color: '#555' }}
                        aria-label="Go back"
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <ExtensionIcon sx={{ color: 'rgba(0,0,0,0.7)' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#000' }}>
                                {isEdit ? 'Edit' : 'Create'} Component
                            </Typography>
                        </Stack>
                        {breadcrumb && (
                            <Typography variant="caption" sx={{ color: '#666' }}>
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
                onChange={(e, newValue) => setActiveTab(newValue)}
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
                <Tab label="COMPONENT SETTINGS" value="basic" />
                <Tab label="DEPENDENCIES" value="dependencies" />
            </Tabs>

            {/* Content */}
            <DialogContent sx={{ p: 3, bgcolor: '#ffffff' }}>
                {activeTab === 'basic' && (
                    <ComponentFieldsConfig
                        fieldConfig={componentConfig}
                        onChange={handleComponentChange}
                        errors={errors}
                    />
                )}

                {activeTab === 'dependencies' && (
                    <FieldDependencyConfig
                        fieldConfig={componentConfig}
                        onChange={handleComponentChange}
                        existingFields={existingFields}
                        currentComponentPath={currentComponentPath}
                    />
                )}
            </DialogContent>

            {/* Actions */}
            <DialogActions sx={{
                p: 2,
                borderTop: '1px solid #e0e0e0',
                bgcolor: '#ffffff'
            }}>
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
                    startIcon={<AddCircleOutlineIcon />}
                    sx={{
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        textTransform: 'none',
                        '&:hover': {
                            bgcolor: '#1565c0'
                        }
                    }}
                >
                    {isEdit ? 'Update Component' : 'Create Component'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};