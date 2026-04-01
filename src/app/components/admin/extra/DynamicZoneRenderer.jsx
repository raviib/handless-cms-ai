"use client";
import FieldPurpose from "@/app/components/admin/extra/FieldPurpose";
import ImproveContentButton from "@/app/components/admin/extra/ImproveContentButton";
import AiImageSuggestButton from "@/app/components/admin/extra/AiImageSuggestButton";
import AiMultiImageSuggestButton from "@/app/components/admin/extra/AiMultiImageSuggestButton";
import { returnFormFields } from "@/app/utils/db/create_fields_fun";
import { evaluateFieldDependency } from "@/app/admin/setting/pages-conf/utils/fieldDependencyUtils";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DifferenceIcon from '@mui/icons-material/Difference';
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
    Box,
    Button,
    Collapse,
    IconButton,
    Paper,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Chip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from "@mui/material";
import { useState, useMemo, useEffect } from "react";
import { useGetApi } from "@/app/lib/apicallHooks";

/**
 * DynamicZoneRenderer Component
 * Renders a dynamic zone field that allows users to add multiple component instances
 */
export const DynamicZoneRenderer = ({
    field,
    formData,
    onChange,
    handleFileChange,
    handleFileChange_multy,
    deleteSingleImage,
    deleteMultImage,
    isEdit,
    parentPath = "",
    fieldErrors = {},
    locale = "en",
    moduleSlug = "",
    recordId = "",
}) => {
    const fieldKey = field.field?.value || field.field;
    const items = Array.isArray(formData[fieldKey]) ? formData[fieldKey] : [];
    const [expanded, setExpanded] = useState({});
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [showComponentModal, setShowComponentModal] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);

    // Fetch component details
    const { data: componentsData, isLoading, doFetch } = useGetApi(null);
    const [availableComponents, setAvailableComponents] = useState([]);

    useEffect(() => {
        if (field.allowed_components && field.allowed_components.length > 0) {
            // Fetch components by IDs
            const ids = field.allowed_components.join(',');
            doFetch(`/setting/page-component?ids=${ids}&limit=1000`);
        }
    }, [field.allowed_components]);

    useEffect(() => {
        if (componentsData?.data) {
            setAvailableComponents(componentsData.data);
            
            // Add __componentFields to existing items that don't have them (for edit mode)
            if (items.length > 0) {
                let needsUpdate = false;
                const updatedItems = items.map(item => {
                    if (!item.__componentFields && item.__componentId) {
                        const component = componentsData.data.find(c => c._id === item.__componentId);
                        if (component && component.fields) {
                            needsUpdate = true;
                            return {
                                ...item,
                                __componentFields: component.fields
                            };
                        }
                    }
                    return item;
                });
                
                if (needsUpdate) {
                    onChange(updatedItems, fieldKey, "dynamic-zone");
                }
            }
        }
    }, [componentsData]);

    const toggleExpand = (index) => {
        setExpanded(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleAddComponent = (component) => {
        // Helper function to get default value based on field type
        const getDefaultValueForField = (field) => {
            const fieldName = field.field?.value || field.field;

            if (field.default_value !== undefined && field.default_value !== null && field.default_value !== "") {
                if (field.default_value === "true") return true;
                if (field.default_value === "false") return false;

                if (field.type === "enumeration" && field.enumeration_type === "multiple") {
                    if (Array.isArray(field.default_value)) {
                        return field.default_value;
                    } else if (typeof field.default_value === 'string') {
                        return field.default_value.split(',').map(v => v.trim()).filter(v => v);
                    }
                    return [];
                }

                if (field.type === "number" && !isNaN(field.default_value)) {
                    return Number(field.default_value);
                }

                return field.default_value;
            }

            if (fieldName === "isActive" || fieldName === "showInHomePage" || fieldName === "showInHeader") {
                return true;
            } else if (fieldName === "sort") {
                return -1;
            }

            if (field.type === "relation") {
                return field.isMultiple ? [] : null;
            } else if (field.type === "boolean") {
                return false;
            } else if (field.type === "enumeration" && field.enumeration_type === "multiple") {
                return [];
            } else if (field.type === "media" && field.isMulti) {
                return [];
            } else if (field.type === "component") {
                if (field.component_type === "repeatable") {
                    return [];
                } else {
                    const componentObj = {};
                    field.fields?.forEach((subField) => {
                        const key = subField.field?.value || subField.field;
                        componentObj[key] = getDefaultValueForField(subField);
                    });
                    return componentObj;
                }
            } else {
                return "";
            }
        };

        // Initialize component data
        const newItem = {
            __component: component.componentKey,
            __componentId: component._id,
            __componentName: component.name,
            __componentCategory: component.category || 'general',
            __componentFields: component.fields || [] // Store field definitions for validation
        };

        component.fields?.forEach(f => {
            const key = f.field?.value || f.field;
            newItem[key] = getDefaultValueForField(f);
        });
        
        const newItems = [...items, newItem];
        onChange(newItems, fieldKey, "dynamic-zone");
        setExpanded(prev => ({ ...prev, [items.length]: true }));
        setShowComponentModal(false);
    };

    const handleRemoveEntry = (index, e) => {
        if (e) e.stopPropagation();
        
        const confirmed = window.confirm('Are you sure you want to delete this component? This action cannot be undone.');
        
        if (confirmed) {
            const newItems = items.filter((_, i) => i !== index);
            onChange(newItems, fieldKey, "dynamic-zone");
        }
        handleCloseMenu();
    };
    
    const handleDuplicateEntry = (index, e) => {
        if (e) e.stopPropagation();
        
        const itemToDuplicate = JSON.parse(JSON.stringify(items[index]));
        
        const newItems = [
            ...items.slice(0, index + 1),
            itemToDuplicate,
            ...items.slice(index + 1)
        ];
        
        onChange(newItems, fieldKey, "dynamic-zone");
        setExpanded(prev => ({ ...prev, [index + 1]: true }));
        handleCloseMenu();
    };

    const handleOpenMenu = (event, index) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedIndex(index);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setSelectedIndex(null);
    };

    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (index, e) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDrop = (dropIndex, e) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const newItems = [...items];
        const draggedItem = newItems[draggedIndex];
        newItems.splice(draggedIndex, 1);
        newItems.splice(dropIndex, 0, draggedItem);

        onChange(newItems, fieldKey, "dynamic-zone");
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleFieldChange = (val, name, customType, index) => {
        const newItems = [...items];
        const currentItem = { ...newItems[index] };

        let finalValue = val;
        let targetName = name;

        if (customType === "file") {
            finalValue = val;
        } else if (customType === "switchbox" || customType === "checkbox") {
            if (val && val.target) {
                targetName = val.target.name || name;
                finalValue = val.target.checked;
            }
        } else if (["relation", "text-editor", "component"].includes(customType)) {
            finalValue = val;
        } else {
            if (val && val.target) {
                targetName = val.target.name || name;
                finalValue = val.target.value;
            }
        }

        const key = targetName || name;
        currentItem[key] = finalValue;
        
        // Get component definition for this item
        const component = availableComponents.find(c => c._id === currentItem.__componentId);
        
        // Clear dependent fields if this is a relation field change
        if (customType === "relation" && component?.fields) {
            component.fields.forEach(subField => {
                const subFieldKey = subField.field?.value || subField.field;
                if (subField.dependency_field === key) {
                    if (subField.type === 'relation' && subField.isMultiple) {
                        currentItem[subFieldKey] = [];
                    } else {
                        currentItem[subFieldKey] = null;
                    }
                }
            });
        }
        
        newItems[index] = currentItem;
        onChange(newItems, fieldKey, "dynamic-zone");
    };

    // Check if field is required
    const isRequired = field.required === true || field.required === 'true';
    
    // Get field-level error (for required validation)
    const fieldError = fieldErrors[fieldKey];

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
        <Box sx={{ mb: 2, mt: 2, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden', backgroundColor: '#fff' }}>
            <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="subtitle1" sx={{ color: '#333', fontWeight: 600 }}>
                        {field.Printvalue || fieldKey}
                        {isRequired && <span style={{ color: '#d32f2f', marginLeft: '4px' }}>*</span>}
                        <span style={{ opacity: 0.6, fontSize: '0.9em', marginLeft: '8px' }}>({items.length})</span>
                    </Typography>
                    {fieldError && (
                        <Typography variant="caption" sx={{ color: '#d32f2f', display: 'block', mt: 0.5 }}>
                            {fieldError}
                        </Typography>
                    )}
                </Box>
            </Box>

            <Box sx={{ p: 2 }}>
                {items.length === 0 && (
                    <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', mb: 2 }}>
                        No components added yet.
                    </Typography>
                )}

                {items.map((item, index) => {
                    const isExpanded = !!expanded[index];
                    const component = availableComponents.find(c => c._id === item.__componentId);
                    
                    if (!component) {
                        return (
                            <Paper key={index} sx={{ mb: 2, p: 2, backgroundColor: '#fff3cd', border: '1px solid #ffc107' }}>
                                <Typography variant="body2" sx={{ color: '#856404' }}>
                                    Component not found: {item.__componentName || 'Unknown'}
                                </Typography>
                            </Paper>
                        );
                    }

                    const titleField = component.fields?.find(f => {
                        const key = f.field?.value || f.field;
                        return key && (key.toLowerCase().includes('title') || key.toLowerCase().includes('name'));
                    }) || component.fields?.[0];

                    let itemTitle = component.name;
                    if (titleField) {
                        const titleKey = titleField.field?.value || titleField.field;
                        const rawValue = item[titleKey];
                        if (rawValue && typeof rawValue === 'string' && rawValue.trim()) {
                            itemTitle = `${component.name} - ${rawValue}`;
                        }
                    }

                    return (
                        <Paper
                            key={index}
                            sx={{
                                mb: 2,
                                backgroundColor: dragOverIndex === index ? '#e3f2fd' : '#fff',
                                border: dragOverIndex === index ? '2px dashed #2196f3' : '1px solid #eee',
                                opacity: draggedIndex === index ? 0.5 : 1,
                                transition: 'all 0.2s ease'
                            }}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(index, e)}
                            onDrop={(e) => handleDrop(index, e)}
                        >
                            <Box
                                onClick={() => toggleExpand(index)}
                                sx={{
                                    p: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'grab',
                                    '&:active': { cursor: 'grabbing' },
                                    '&:hover': { backgroundColor: '#f0f0f0' }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <IconButton size="small" sx={{ color: '#999' }}>
                                        <DragIndicatorIcon />
                                    </IconButton>
                                    <IconButton size="small" sx={{ color: '#666' }}>
                                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </IconButton>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#444', fontWeight: 500 }}>
                                            {itemTitle}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#999', fontFamily: 'monospace', fontSize: '11px' }}>
                                            {component.componentKey}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <IconButton 
                                        size="small" 
                                        onClick={(e) => handleOpenMenu(e, index)}
                                        title="More actions"
                                        sx={{ color: '#666' }}
                                    >
                                        <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>

                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                <Box sx={{ p: 2, borderTop: '1px solid #eee' }} className="admin-form">
                                    <div className="row">
                                        {component.fields?.filter(subField => {
                                            if (!subField.dependency_field) return true;
                                            const dependencyState = evaluateFieldDependency(subField, item);
                                            return dependencyState.visible;
                                        }).map((subField, subIdx) => {
                                            const subFieldKey = subField.field?.value || subField.field;

                                            if (subField.type === "component") {
                                                // Import NestedComponentRenderer dynamically to avoid circular dependency
                                                const { NestedComponentRenderer } = require("@/app/components/admin/extra/RepeatableTabs");
                                                return (
                                                    <div key={subIdx} className="col-12">
                                                        <NestedComponentRenderer
                                                            field={subField}
                                                            formData={item}
                                                            onChange={(val, name, type) => handleFieldChange(val, name, "component", index)}
                                                            handleFileChange={handleFileChange}
                                                            handleFileChange_multy={handleFileChange_multy}
                                                            deleteSingleImage={deleteSingleImage}
                                                            deleteMultImage={deleteMultImage}
                                                            isEdit={isEdit}
                                                            parentPath={`${parentPath ? parentPath + '.' : ''}${fieldKey}#${index}`}
                                                            fieldErrors={fieldErrors}
                                                            locale={locale}
                                                            moduleSlug={moduleSlug}
                                                            recordId={recordId}
                                                        />
                                                    </div>
                                                );
                                            }

                                            const dependencyState = subField.dependency_field
                                                ? evaluateFieldDependency(subField, item)
                                                : { visible: true, enabled: true };
                                            const fieldWithDependency = {
                                                ...subField,
                                                field: subFieldKey,
                                                _dependencyState: dependencyState
                                            };

                                            const { Component_Type, fileSizeMessage, Lable_Component } = returnFormFields({
                                                formData: item,
                                                onChangeFormDataHandler: (val, name, customType) =>
                                                    handleFieldChange(val, name || subFieldKey, customType, index),
                                                field_data: fieldWithDependency,
                                                handleFileChange: (e, name, limit, accept) => {
                                                    const files = e?.target?.files;
                                                    if (files && files[0]) {
                                                        handleFieldChange(files[0], subFieldKey, "file", index);
                                                        handleFileChange(e, `${parentPath ? parentPath + '.' : ''}${fieldKey}#${index}.${subFieldKey}`, limit, accept);
                                                    } else {
                                                        handleFieldChange("", subFieldKey, "file", index);
                                                    }
                                                },
                                                handleFileChange_multy: (e, name, limit, accept) => {
                                                    const files = e?.target?.files;
                                                    if (files && files.length > 0) {
                                                        const fileArray = Array.from(files);
                                                        const existingFiles = Array.isArray(item[subFieldKey]) ? item[subFieldKey] : [];
                                                        handleFieldChange([...existingFiles, ...fileArray], subFieldKey, "file", index);
                                                        handleFileChange_multy(e, `${parentPath ? parentPath + '.' : ''}${fieldKey}#${index}.${subFieldKey}`, limit, accept);
                                                    } else {
                                                        handleFieldChange([], subFieldKey, "file", index);
                                                    }
                                                },
                                                deleteSingleImage: (link, fieldName) => {
                                                    if (typeof link === 'string' && link.startsWith('/')) {
                                                        deleteSingleImage(link, `${parentPath ? parentPath + '.' : ''}${fieldKey}#${index}#${subFieldKey}`);
                                                    }
                                                    handleFieldChange("", subFieldKey, "file", index);
                                                },
                                                deleteMultImage: (link, fieldName, unset_field) => {
                                                    deleteMultImage(link, `${parentPath ? parentPath + '.' : ''}${fieldKey}#${index}#${subFieldKey}`, unset_field);
                                                    handleFieldChange(link, subFieldKey, "file", index);
                                                },
                                                isEdit
                                            });

                                            const isRequired = subField.required === true || subField.required === "true";
                                            const fieldPath = `${parentPath ? parentPath + '.' : ''}${fieldKey}#${index}.${subFieldKey}`;
                                            const fieldError = fieldErrors[fieldPath];

                                            return (
                                                <div className={subField.colSpace || 'col-12'} key={subIdx}>
                                                    <div className='flex with-tooltip'>
                                                        <label className={`form-label ${isRequired ? "starlabel" : ""}`}>
                                                            {`${subField.Printvalue} ${fileSizeMessage}`}
                                                        </label>
                                                        <FieldPurpose Purpose={subField?.FieldPurpose} />
                                                        {Lable_Component}
                                                        {["text", "rich-text-blocks", "rich-text-markdown"].includes(subField.type)  && (
                                                            <ImproveContentButton
                                                                value={item[subFieldKey]}
                                                                fieldType={subField.type}
                                                                locale={locale}
                                                                fieldId={[recordId, locale !== "en" ? locale : "", moduleSlug, fieldKey, index, subFieldKey].filter(v => v !== "" && v !== null && v !== undefined).join(".")}
                                                                moduleAiPrompt={subField.aiPrompt || ""}
                                                                onApply={(newValue) => {
                                                                    if (subField.type === "rich-text-markdown") {
                                                                        handleFieldChange(newValue, subFieldKey, "text-editor", index);
                                                                    } else {
                                                                        handleFieldChange({ target: { name: subFieldKey, value: newValue } }, subFieldKey, null, index);
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                        {subField.type === "media" && !subField.isMulti && (
                                                            <AiImageSuggestButton
                                                                fieldId={[recordId, locale !== "en" ? locale : "", moduleSlug, fieldKey, index, subFieldKey].filter(v => v !== "" && v !== null && v !== undefined).join(".")}
                                                                contextText={Object.values(item).filter(v => typeof v === "string" && v.trim()).slice(0, 3).join(" ").slice(0, 400)}
                                                                onApply={(imagePath) => handleFieldChange({ target: { name: subFieldKey, value: imagePath } }, subFieldKey, null, index)}
                                                            />
                                                        )}
                                                        {subField.type === "media" && subField.isMulti && (
                                                            <AiMultiImageSuggestButton
                                                                fieldId={[recordId, locale !== "en" ? locale : "", moduleSlug, fieldKey, index, subFieldKey].filter(v => v !== "" && v !== null && v !== undefined).join(".")}
                                                                contextText={Object.values(item).filter(v => typeof v === "string" && v.trim()).slice(0, 3).join(" ").slice(0, 400)}
                                                                onApply={(imagePaths) => {
                                                                    const existing = Array.isArray(item[subFieldKey]) ? item[subFieldKey] : [];
                                                                    handleFieldChange([...existing, ...imagePaths], subFieldKey, "file", index);
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                    {Component_Type}
                                                    {fieldError && (
                                                        <div style={{
                                                            color: '#d32f2f',
                                                            fontSize: '1rem',
                                                            marginTop: '4px',
                                                            marginLeft: '4px'
                                                        }}>
                                                            {fieldError}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Box>
                            </Collapse>
                        </Paper>
                    );
                })}

                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    fullWidth
                    onClick={() => setShowComponentModal(true)}
                    disabled={isLoading || availableComponents.length === 0}
                    sx={{
                        borderColor: '#4945ff',
                        color: '#4945ff',
                        '&:hover': { 
                            borderColor: '#271fe0',
                            backgroundColor: 'rgba(73, 69, 255, 0.04)'
                        },
                        textTransform: 'none',
                        py: 1.5,
                        borderRadius: 1,
                        borderStyle: 'dashed'
                    }}
                >
                    {isLoading ? 'Loading components...' : 'Add a component to section'}
                </Button>
            </Box>

            {/* Component Selection Modal */}
            <Dialog
                open={showComponentModal}
                onClose={() => setShowComponentModal(false)}
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
                <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', pb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Select a component
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                        Choose a component to add to this section
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
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
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleAddComponent(component);
                                        }}
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
                                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
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
                                        {component.fields && (
                                            <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 0.5 }}>
                                                {component.fields.length} field{component.fields.length !== 1 ? 's' : ''}
                                            </Typography>
                                        )}
                                    </Paper>
                                ))}
                            </Stack>
                        </Box>
                    ))}
                </DialogContent>

                <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Button
                        onClick={() => setShowComponentModal(false)}
                        sx={{
                            color: '#555',
                            textTransform: 'none'
                        }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        minWidth: 180
                    }
                }}
            >
                <MenuItem 
                    onClick={() => handleDuplicateEntry(selectedIndex)}
                    sx={{ py: 1.5 }}
                >
                    <ListItemIcon>
                        <DifferenceIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText>Duplicate</ListItemText>
                </MenuItem>
                <MenuItem 
                    onClick={() => handleRemoveEntry(selectedIndex)}
                    sx={{ py: 1.5, color: '#d32f2f' }}
                >
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" sx={{ color: '#d32f2f' }} />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>
        </Box>
    );
};
