"use client"
import {
    DEFULT_FIELD_For_Page,
    fileRequiredField,
    notRequiredField_FOR_PAGE,
    NumberRequiredField,
    objectRequiredField,
    option_valueRequiredFields,
    RequiredFields,
    selectedBoxRequiredField,
    tabRequiredFields
} from "@/app/utils/db/DB.js";
import { isValidVariableName } from '@/app/utils/db/validations';
import { TostError, TostSuccess } from '@/app/utils/tost/Tost';
import {
    Box,
    Chip,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { AdvancedSettingsTab } from './AdvancedSettingsTab';
import { BasicSettingsTab } from './BasicSettingsTab';
import { FieldConfigurationModal } from './FieldConfigurationModal';
import FieldListSidebar from './FieldListSidebar';
import { FieldTypeSelectionModal } from './FieldTypeSelectionModal';
import { SectionHeader } from './SectionHeader';

export const CreateSections = ({ position, sections, setSections, section_data, showUpArrow = false, onSectionDelete }) => {
    const router = useRouter();

    const [fields, setFields] = useState(section_data?.fields ?? [])
    const [ShowHeading, setShowHeading] = useState(false)
    const [Heading, setHeading] = useState(section_data?.Heading)
    const [isSelected, setIsSelected] = useState(false)
    const [filedDetails, setFiledDetails] = useState(DEFULT_FIELD_For_Page)
    const [showSaveButton, setShowSaveButton] = useState(false)
    const [activeObjectKey, setActiveObjectKey] = useState("");
    const [activeTabName, setActiveTabName] = useState("");
    const [currentComponentPath, setCurrentComponentPath] = useState([]);

    // Modal state management
    const [fieldTypeModalOpen, setFieldTypeModalOpen] = useState(false);
    const [fieldConfigModalOpen, setFieldConfigModalOpen] = useState(false);
    const [currentFieldType, setCurrentFieldType] = useState(null);
    const [currentField, setCurrentField] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);



    // Updated deleteField to handle nested fields with confirmation dialog
    const deleteField = useCallback((fieldId, componentPath = []) => {
        if (isSelected) {
            TostError("Add Selected one First then delete")
            return
        }

        // Find the field to check if it's a component with nested fields
        let fieldToDelete = null;
        if (componentPath.length === 0) {
            fieldToDelete = fields.find(f => f.field.value === fieldId);
        } else {
            // Navigate to nested component
            let currentLevel = fields;
            for (let i = 0; i < componentPath.length; i++) {
                const componentField = currentLevel.find(f =>
                    f.type === 'component' && f.field.value === componentPath[i]
                );
                if (componentField && componentField.fields) {
                    currentLevel = componentField.fields;
                }
            }
            fieldToDelete = currentLevel.find(f => f.field.value === fieldId);
        }

        // Show confirmation dialog
        let confirmMessage = `Are you sure you want to delete the field "${fieldToDelete?.Printvalue || fieldToDelete?.field?.label || fieldId}"?`;

        if (fieldToDelete?.type === 'component' && fieldToDelete.fields?.length > 0) {
            confirmMessage = `This component contains ${fieldToDelete.fields.length} nested field(s). Are you sure you want to delete it and all its nested fields?`;
        }

        const confirmDelete = window.confirm(confirmMessage);
        if (!confirmDelete) return;

        setFields(prevFields => {
            if (componentPath.length === 0) {
                // Delete from root level
                return prevFields.filter(f => f.field.value !== fieldId);
            }

            // Delete from nested component
            const newFields = structuredClone(prevFields);
            let currentLevel = newFields;

            for (let i = 0; i < componentPath.length; i++) {
                const componentField = currentLevel.find(f =>
                    f.type === 'component' && f.field.value === componentPath[i]
                );

                if (!componentField) return prevFields;

                if (i === componentPath.length - 1) {
                    // Remove field from this component
                    componentField.fields = componentField.fields.filter(f => f.field.value !== fieldId);
                } else {
                    currentLevel = componentField.fields;
                }
            }

            return newFields;
        });

        setShowSaveButton(true);
        TostSuccess("Field deleted successfully");
    }, [isSelected, fields]);

    // Legacy deleteHandler for backward compatibility
    const deleteHandler = useCallback((index) => {
        if (isSelected) {
            TostError("Add Selected one First the delete")
            return
        }
        setFields(prevFields => {
            const reset = [...prevFields]
            reset.splice(index, 1)
            return reset
        })
        setShowSaveButton(true)
    }, [isSelected])

    const enterComponent = useCallback((componentFieldName) => {
        setCurrentComponentPath(prev => [...prev, componentFieldName]);
    }, []);

    const exitComponent = useCallback(() => {
        setCurrentComponentPath(prev => prev.slice(0, -1));
    }, []);

    const addFieldToComponent = useCallback((componentPath, fieldConfig) => {
        if (componentPath.length === 0) {
            // Add to root level
            setFields(prevFields => {
                const sort_fields = [...prevFields, fieldConfig];
                sort_fields.sort((a, b) => a.sort - b.sort);
                return sort_fields;
            });
            return;
        }

        // Navigate to the nested component and add field
        setFields(prevFields => {
            const newFields = structuredClone(prevFields);

            console.log('=== ADD FIELD TO COMPONENT DEBUG ===');
            console.log('Component Path:', componentPath);
            console.log('Field Config:', fieldConfig);
            console.log('Current Fields:', newFields);

            // Navigate through the component tree
            let currentLevel = newFields;
            for (let i = 0; i < componentPath.length; i++) {
                const componentName = componentPath[i];
                console.log(`\nLooking for component: "${componentName}" at level ${i}`);
                console.log('Available fields at this level:', currentLevel.map(f => ({
                    type: f.type,
                    Printvalue: f.Printvalue,
                    'field.value': f.field?.value,
                    'field.label': f.field?.label,
                    component_key: f.component_key
                })));

                const componentField = currentLevel.find(f => {
                    if (f.type !== 'component') return false;

                    // Check multiple possible identifiers
                    const fieldValue = f.field?.value;
                    const fieldLabel = f.field?.label;
                    const componentKey = f.component_key;

                    const matches = fieldValue === componentName ||
                        fieldLabel === componentName ||
                        componentKey === componentName;

                    console.log(`  Checking field "${f.Printvalue}":`, {
                        fieldValue,
                        fieldLabel,
                        componentKey,
                        componentName,
                        matches
                    });

                    return matches;
                });

                if (!componentField) {
                    console.error('❌ Component not found!');
                    TostError(`Component '${componentName}' not found. Please save the section first.`);
                    return prevFields; // Return unchanged fields instead of throwing
                }

                console.log('✓ Found component:', componentField);

                // Initialize fields array if it doesn't exist
                if (!componentField.fields) {
                    componentField.fields = [];
                    console.log('Initialized empty fields array');
                }

                // If this is the last component in the path, add the field here
                if (i === componentPath.length - 1) {
                    componentField.fields.push(fieldConfig);
                    componentField.fields.sort((a, b) => a.sort - b.sort);
                    console.log('✓ Field added successfully to component');
                    console.log('Component now has', componentField.fields.length, 'fields');
                } else {
                    // Continue navigating deeper
                    currentLevel = componentField.fields;
                }
            }

            return newFields;
        });
    }, []);

    // Modal management functions
    const openFieldTypeModal = useCallback(() => {
        setFieldTypeModalOpen(true);
    }, []);

    const closeFieldTypeModal = useCallback(() => {
        setFieldTypeModalOpen(false);
    }, []);

    const openFieldConfigModal = useCallback((fieldType, field = null) => {
        setCurrentFieldType(fieldType);
        setCurrentField(field);
        setIsEditMode(!!field);
        setFieldConfigModalOpen(true);
        setFieldTypeModalOpen(false);
    }, []);

    const closeFieldConfigModal = useCallback(() => {
        setFieldConfigModalOpen(false);
        setCurrentFieldType(null);
        setCurrentField(null);
        setIsEditMode(false);
        // Don't clear currentComponentPath here - it should persist until user clicks a different component
    }, []);

    // New addField function to use new data structure
    const addField = useCallback((fieldConfig, componentPath = []) => {
        console.log('=== ADD FIELD ===');
        console.log('Field Config:', fieldConfig);
        console.log('Component Path:', componentPath);
        console.log('Current fields before add:', fields);

        if (componentPath.length === 0) {
            // Add to root level
            setFields(prevFields => {
                const newFields = [...prevFields, fieldConfig];
                newFields.sort((a, b) => a.sort - b.sort);
                console.log('Added to root, new fields:', newFields);
                return newFields;
            });
        } else {
            // Add to nested component using addFieldToComponent
            console.log('Adding to nested component');
            addFieldToComponent(componentPath, fieldConfig);
        }
        setShowSaveButton(true);
        TostSuccess("Field added successfully");
    }, [addFieldToComponent, fields]);

    // New updateField function to handle nested fields in components
    const updateField = useCallback((fieldId, updatedConfig, componentPath = []) => {
        console.log('=== UPDATE FIELD ===');
        console.log('Field ID:', fieldId);
        console.log('Updated Config:', updatedConfig);
        console.log('Component Path:', componentPath);

        setFields(prevFields => {
            if (componentPath.length === 0) {
                // Update at root level
                console.log('Updating at root level');
                const updated = prevFields.map(f => {
                    const matches = f.field.value === fieldId ||
                        (f.type === 'component' && f.component_key === fieldId);
                    if (matches) {
                        console.log('Found field to update:', f);
                        console.log('Replacing with:', updatedConfig);
                    }
                    return matches ? updatedConfig : f;
                }).sort((a, b) => a.sort - b.sort);
                console.log('Updated fields:', updated);
                return updated;
            }

            // Update in nested component
            console.log('Updating in nested component');
            const newFields = structuredClone(prevFields);
            let currentLevel = newFields;

            for (let i = 0; i < componentPath.length; i++) {
                const componentName = componentPath[i];
                console.log(`Looking for component: ${componentName} at level ${i}`);

                const componentField = currentLevel.find(f =>
                    f.type === 'component' &&
                    (f.field.value === componentName || f.component_key === componentName)
                );

                if (!componentField) {
                    console.error('Component not found:', componentName);
                    return prevFields;
                }

                console.log('Found component:', componentField);

                if (i === componentPath.length - 1) {
                    // Update field in this component
                    console.log('Updating field in this component');
                    console.log('Fields before update:', componentField.fields);

                    componentField.fields = componentField.fields.map(f => {
                        const matches = f.field.value === fieldId ||
                            (f.type === 'component' && f.component_key === fieldId);
                        if (matches) {
                            console.log('Found field to update:', f);
                            console.log('Replacing with:', updatedConfig);
                        }
                        return matches ? updatedConfig : f;
                    }).sort((a, b) => a.sort - b.sort);

                    console.log('Fields after update:', componentField.fields);
                } else {
                    currentLevel = componentField.fields;
                }
            }

            console.log('Final updated fields:', newFields);
            return newFields;
        });

        setShowSaveButton(true);
        TostSuccess("Field updated successfully");
    }, []);

    // New reorderFields function to handle nested fields
    const reorderFields = useCallback((fromIndex, toIndex, componentPath = []) => {
        setFields(prevFields => {
            if (componentPath.length === 0) {
                // Reorder at root level
                const newFields = [...prevFields];

                // Validate indices
                if (fromIndex < 0 || fromIndex >= newFields.length ||
                    toIndex < 0 || toIndex >= newFields.length) {
                    console.error('Invalid reorder indices:', { fromIndex, toIndex, length: newFields.length });
                    return prevFields;
                }

                const [movedField] = newFields.splice(fromIndex, 1);

                // Check if movedField exists
                if (!movedField) {
                    console.error('Failed to extract field at index:', fromIndex);
                    return prevFields;
                }

                newFields.splice(toIndex, 0, movedField);

                // Update sort values safely
                newFields.forEach((field, idx) => {
                    if (field) {
                        field.sort = idx;
                    }
                });

                return newFields;
            }

            // Reorder in nested component
            const newFields = structuredClone(prevFields);
            let currentLevel = newFields;

            for (let i = 0; i < componentPath.length; i++) {
                const componentField = currentLevel.find(f =>
                    f.type === 'component' && f.field.value === componentPath[i]
                );

                if (!componentField || !componentField.fields) {
                    console.error('Component not found in path:', componentPath[i]);
                    return prevFields;
                }

                if (i === componentPath.length - 1) {
                    // Validate indices for nested fields
                    if (fromIndex < 0 || fromIndex >= componentField.fields.length ||
                        toIndex < 0 || toIndex >= componentField.fields.length) {
                        console.error('Invalid nested reorder indices:', {
                            fromIndex,
                            toIndex,
                            length: componentField.fields.length
                        });
                        return prevFields;
                    }

                    // Reorder fields in this component
                    const [movedField] = componentField.fields.splice(fromIndex, 1);

                    // Check if movedField exists
                    if (!movedField) {
                        console.error('Failed to extract nested field at index:', fromIndex);
                        return prevFields;
                    }

                    componentField.fields.splice(toIndex, 0, movedField);

                    // Update sort values safely
                    componentField.fields.forEach((field, idx) => {
                        if (field) {
                            field.sort = idx;
                        }
                    });
                } else {
                    currentLevel = componentField.fields;
                }
            }

            return newFields;
        });

        setShowSaveButton(true);
    }, []);

    // Handler for field type selection from modal
    const handleFieldTypeSelect = useCallback((fieldType) => {
        openFieldConfigModal(fieldType);
    }, [openFieldConfigModal]);

    // Handler for saving field configuration
    const handleSaveFieldConfig = useCallback((fieldConfig, componentPath = []) => {
        console.log('=== SAVE FIELD CONFIG ===');
        console.log('Field Config:', fieldConfig);
        console.log('Component Path from modal:', componentPath);
        console.log('Current Component Path from state:', currentComponentPath);
        console.log('Is Edit Mode:', isEditMode);
        console.log('Current Field:', currentField);

        // Use currentComponentPath from state if available, otherwise use the passed one
        const pathToUse = currentComponentPath.length > 0 ? currentComponentPath : componentPath;

        console.log('Using path:', pathToUse);

        if (isEditMode && currentField) {
            // Determine the field identifier - for components use component_key, for others use field.value
            const fieldId = currentField.type === 'component'
                ? (currentField.component_key || currentField.field.value)
                : currentField.field.value;

            console.log('Updating field with ID:', fieldId);

            // Update existing field
            updateField(fieldId, fieldConfig, pathToUse);
        } else {
            // Add new field
            addField(fieldConfig, pathToUse);
        }
        closeFieldConfigModal();
    }, [isEditMode, currentField, updateField, addField, closeFieldConfigModal, currentComponentPath]);

    // Handler for "Add another field" button in config modal
    const handleAddAnotherField = useCallback(() => {
        console.log('=== ADD ANOTHER FIELD CLICKED ===');
        console.log('Current component path:', currentComponentPath);
        closeFieldConfigModal();
        openFieldTypeModal();
    }, [closeFieldConfigModal, openFieldTypeModal, currentComponentPath]);

    // Handler for editing field from sidebar
    const handleEditFieldFromSidebar = useCallback((field, componentPath = []) => {
        console.log('=== EDITING FIELD FROM SIDEBAR ===');
        console.log('Field:', field);
        console.log('Component Path:', componentPath);

        // Set the current component path so new fields are added to the correct location
        setCurrentComponentPath(componentPath);

        // Find the field type object
        const fieldTypeObj = {
            id: field.type,
            label: field.type.charAt(0).toUpperCase() + field.type.slice(1)
        };
        openFieldConfigModal(fieldTypeObj, field);
    }, [openFieldConfigModal]);

    // Handler for deleting field from sidebar
    const handleDeleteFieldFromSidebar = useCallback((fieldId, componentPath = []) => {
        deleteField(fieldId, componentPath);
    }, [deleteField]);

    const editHandler = useCallback((data, index) => {
        if (isSelected) {
            TostError("Add Selected one First")
            return
        }
        setIsSelected(true)
        setFiledDetails(data)
        deleteHandler(index)
        setShowSaveButton(true)
    }, [isSelected, deleteHandler])
    const addToList = useCallback(() => {
        try {
            const selectObjField = {};

            // Check for duplicate fields (only at root level now, components handle their own scope)
            const isDuplicate = fields.some(f => {
                if (f.field?.value !== filedDetails.field?.value) return false;
                // Only check root level fields (not tab or object types)
                return f.type !== "tab" && f.type !== "object";
            });

            if (isDuplicate) {
                throw new Error(`Field '${filedDetails.field?.value}' already exists`);
            }

            switch (filedDetails.type) {
                case "file":
                    for (const iterator of fileRequiredField) {
                        const val = filedDetails[iterator];
                        if (val === "false" || val === false) {
                            selectObjField[iterator] = false;
                        } else if (val === "true" || val === true) {
                            selectObjField[iterator] = true;
                        } else {
                            selectObjField[iterator] = val ?? "";
                        }

                        if (notRequiredField_FOR_PAGE.includes(iterator)) continue;
                        if (!selectObjField[iterator] && selectObjField[iterator] !== false) {
                            throw new Error(`${iterator} is required`);
                        }
                    }
                    break;
                case "number":
                    for (const iterator of NumberRequiredField) {
                        const val = filedDetails[iterator];
                        if (val === "false" || val === false) {
                            selectObjField[iterator] = false;
                        } else if (val === "true" || val === true) {
                            selectObjField[iterator] = true;
                        } else {
                            selectObjField[iterator] = val ?? "";
                        }

                        if (notRequiredField_FOR_PAGE.includes(iterator)) continue;
                        if (!selectObjField[iterator] && selectObjField[iterator] !== false) {
                            throw new Error(`${iterator} is required`);
                        }
                    }
                    break;
                default:
                    for (const iterator of RequiredFields) {
                        const val = filedDetails[iterator];
                        let finalVal = val;
                        if (val === "false" || val === false) finalVal = false;
                        else if (val === "true" || val === true) finalVal = true;
                        else finalVal = val ?? "";
                        selectObjField[iterator] = finalVal;
                        if (notRequiredField_FOR_PAGE.includes(iterator)) continue;
                        if (!finalVal && finalVal !== false) {
                            throw new Error(`${iterator} is required`);
                        }
                    }
            }

            setFields(prevFields => {
                const sort_fields = [...prevFields, selectObjField];
                sort_fields.sort((a, b) => a.sort - b.sort);
                return sort_fields;
            });
            setFiledDetails((pre) => ({ ...pre, ...DEFULT_FIELD_For_Page }));
            setIsSelected(false);
            setShowSaveButton(true);
        } catch (error) {
            TostError(error.message);
        }
    }, [fields, filedDetails, activeTabName, activeObjectKey]);

    // Note: Not using useCallback here because this handler updates state frequently
    // and needs to always have the latest closure. Memoization would cause stale state issues.
    const onChnageHandler = (e, fieldName, type) => {
        // Handle both standard events and direct value passing (from HandleCreatableSelect)
        if (e && e.target) {
            // Standard event object
            setFiledDetails((pre) => ({
                ...pre,
                [e.target.name]: e.target.value,
            }));
        } else {
            // Direct value passing (e is the value, fieldName is the name)
            setFiledDetails((pre) => ({
                ...pre,
                [fieldName]: e,
            }));
        }
    };


    const SaveThisSectionHandler = useCallback(() => {
        if (isSelected) {
            TostError("Add Selected one First")
            return
        }
        // Use structuredClone for better performance than JSON.parse/stringify
        const copyArray = structuredClone(sections);
        copyArray[position]["fields"] = structuredClone(fields)
        copyArray[position]["Heading"] = Heading;
        setShowSaveButton(false)

        setSections(copyArray)
    }, [isSelected, sections, position, fields, Heading, setSections])

    const editSectionHeading = useCallback(() => {
        setShowHeading(false);
        if (section_data?.Heading.toLowerCase() != Heading.toLowerCase()) {
            setShowSaveButton(true);
        }
    }, [section_data?.Heading, Heading])

    const deleteSection = useCallback(() => {
        let value = prompt(`Enter Section Name "${Heading}" To Delete`);
        if (value === null) {
            return;
        }
        if (value === "") {
            TostError("Please Enter Name");
            return;
        }
        if (value.toLowerCase() === Heading.toLowerCase()) {
            // Use structuredClone for better performance
            const copyArray = structuredClone(sections);
            copyArray.splice(position, 1);
            setSections(copyArray);
            TostSuccess("Deleted Successfully");
            // Notify parent component to reset active section
            if (onSectionDelete) {
                onSectionDelete(position);
            }
            // Navigate to Quick Navigation tab
            router.push('?tab=Quick%20Navigation');
        } else {
            TostError("Name should be correct");
        }
    }, [Heading, sections, position, setSections, onSectionDelete, router])

    // Memoize style objects to prevent recreation on every render
    const paperSx = useMemo(() => ({
        p: { xs: 1, sm: 2, md: 3 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: { xs: 2, md: 4 },
        bgcolor: '#fcfcfc',
        mb: 4,
        width: '100%',
        maxWidth: '100%',
        overflow: 'visible',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
            borderColor: 'primary.light',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }
    }), []);

    const formBoxSx = useMemo(() => ({
        bgcolor: '#fff',
        p: { xs: 1.5, sm: 2, md: 3 },
        borderRadius: { xs: 2, md: 3 },
        border: '1px solid #edf2f7',
        mb: 4,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
    }), []);


    return (
        <Paper
            elevation={0}
            sx={paperSx}
            key={filedDetails.type}
            id={`${Heading}`}
        >
            {/* Header Toolbar */}
            <SectionHeader
                ShowHeading={ShowHeading}
                Heading={Heading}
                setHeading={setHeading}
                setShowHeading={setShowHeading}
                editSectionHeading={editSectionHeading}
                showSaveButton={showSaveButton}
                SaveThisSectionHandler={SaveThisSectionHandler}
                deleteSection={deleteSection}
                showUpArrow={showUpArrow}
            />

            {/* Context Awareness Bar */}
            {(activeTabName || activeObjectKey || currentComponentPath.length > 0) && (
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        mb: 2,
                        p: 1.5,
                        bgcolor: 'rgba(25, 118, 210, 0.04)',
                        borderRadius: 2,
                        border: '1px dashed',
                        borderColor: 'primary.light'
                    }}
                >
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', mr: 1, alignSelf: 'center' }}>
                        ACTIVE CONTEXT:
                    </Typography>
                    {activeTabName && (
                        <Chip
                            label={`Tab: ${activeTabName}`}
                            onDelete={() => setActiveTabName("")}
                            color="secondary"
                            size="small"
                            sx={{ fontWeight: 600 }}
                        />
                    )}
                    {activeObjectKey && (
                        <Chip
                            label={`Object: ${activeObjectKey}`}
                            onDelete={() => setActiveObjectKey("")}
                            color="info"
                            size="small"
                            sx={{ fontWeight: 600 }}
                        />
                    )}
                    {currentComponentPath.length > 0 && (
                        <Chip
                            label={`Component: ${currentComponentPath.join(' > ')}`}
                            onDelete={() => setCurrentComponentPath([])}
                            color="primary"
                            size="small"
                            sx={{ fontWeight: 600 }}
                        />
                    )}
                </Stack>
            )}

            {/* Main Content Area with Sidebar Layout */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
                {/* Left Sidebar - Field List */}
                <FieldListSidebar
                    fields={fields}
                    onFieldClick={(field) => console.log('Field clicked:', field)}
                    onFieldEdit={handleEditFieldFromSidebar}
                    onFieldDelete={handleDeleteFieldFromSidebar}
                    onFieldReorder={reorderFields}
                    onAddField={openFieldTypeModal}
                    onAddFieldToComponent={(componentField, fullComponentPath) => {
                        console.log('=== ADD FIELD TO COMPONENT CLICKED ===');
                        console.log('Component Field:', componentField);
                        console.log('Full Component Path:', fullComponentPath);
                        console.log('Current fields array:', fields);

                        // Use the full component path if provided, otherwise build it
                        if (fullComponentPath && fullComponentPath.length > 0) {
                            console.log('Using provided full path:', fullComponentPath);
                            setCurrentComponentPath(fullComponentPath);
                            openFieldTypeModal();
                            return;
                        }

                        // Fallback: use component_key or field.value as the identifier
                        const componentId = componentField.component_key || componentField.field?.value;
                        console.log('Component ID:', componentId);

                        if (!componentId) {
                            TostError('Component identifier not found. Please save the section first.');
                            return;
                        }

                        // Verify the component exists in fields
                        const componentExists = fields.some(f =>
                            f.type === 'component' &&
                            (f.component_key === componentId || f.field?.value === componentId)
                        );

                        console.log('Component exists in fields:', componentExists);

                        if (!componentExists) {
                            TostError('Component not found in fields. Please save the section first.');
                            return;
                        }

                        setCurrentComponentPath([componentId]);
                        console.log('Set current component path to:', [componentId]);
                        openFieldTypeModal();
                    }}
                />

                {/* Right Content Area - Legacy Form (kept for backward compatibility) */}
                {/* <Box sx={{ flex: 1 }}>
                  
                    <Box sx={formBoxSx}>
                        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, mb: 2, display: 'block' }}>
                            CONFIGURE FIELD (Legacy)
                        </Typography>

                        <FieldFormInputs
                            filedDetails={filedDetails}
                            onChnageHandler={onChnageHandler}
                            colSpace={colSpace}
                            activeTabName={activeTabName}
                            activeObjectKey={activeObjectKey}
                        />

                        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3, pt: 3, borderTop: '1px solid #f7f9fc' }}>
                            <Button
                                variant="outlined"
                                onClick={() => setFiledDetails(DEFULT_FIELD_For_Page)}
                                sx={{ textTransform: 'none', px: 3 }}
                            >
                                Reset Form
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={isSelected ? <EditNoteIcon /> : <AddCircleOutlineIcon />}
                                onClick={() => addToList()}
                                sx={{
                                    px: 4,
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                                    '&:hover': {
                                        boxShadow: '0 6px 20px rgba(0,118,255,0.23)'
                                    }
                                }}
                            >
                                {isSelected ? "Update Field" : "Add to Preview List"}
                            </Button>
                        </Stack>
                    </Box>

         
                    <Box sx={{ width: '100%' }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <EditNoteIcon color="primary" />
                            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.dark' }}>
                                Fields Preview List
                            </Typography>
                            <Box sx={{ flexGrow: 1 }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                {fields.length} {fields.length === 1 ? 'Field' : 'Fields'} Added
                            </Typography>
                        </Stack>

                        <FieldsTable
                            fields={fields}
                            editHandler={editHandler}
                            deleteHandler={deleteHandler}
                            setFields={setFields}
                            setShowSaveButton={setShowSaveButton}
                        />
                    </Box>
                </Box> */}
            </Box>

            {/* Field Type Selection Modal */}
            <FieldTypeSelectionModal
                open={fieldTypeModalOpen}
                onClose={closeFieldTypeModal}
                onSelectType={handleFieldTypeSelect}
            />

            {/* Field Configuration Modal */}
            <FieldConfigurationModal
                open={fieldConfigModalOpen}
                onClose={closeFieldConfigModal}
                fieldType={currentFieldType}
                initialData={currentField}
                onSave={handleSaveFieldConfig}
                onAddAnother={handleAddAnotherField}
                existingFields={(() => {
                    // Navigate to the correct level based on currentComponentPath
                    if (currentComponentPath.length === 0) {
                        return fields; // Root level
                    }
                    
                    // Navigate through the component tree
                    let currentLevel = fields;
                    for (const componentName of currentComponentPath) {
                        const component = currentLevel.find(f => 
                            f.type === 'component' && 
                            (f.field?.value === componentName || f.component_key === componentName)
                        );
                        if (component && component.fields) {
                            currentLevel = component.fields;
                        } else {
                            return []; // Component not found
                        }
                    }
                    return currentLevel;
                })()}
                allSections={sections}
                currentSectionIndex={position}
                isEdit={isEditMode}
                BasicSettingsTab={BasicSettingsTab}
                AdvancedSettingsTab={AdvancedSettingsTab}
                currentComponentPath={currentComponentPath}
            />
        </Paper>
    );
};







export const TABLE_DISPLAY_FIELDS = [
    'field',
    'Printvalue',
    'type',
    'colSpace',
    'required',
    'showInTable',
];




