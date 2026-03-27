"use client";
import FieldPurpose from "@/app/components/admin/extra/FieldPurpose";
import ImproveContentButton from "@/app/components/admin/extra/ImproveContentButton";
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
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from "@mui/material";
import { useState, useMemo } from "react";
import GenerateSeoButton from "@/app/components/admin/extra/GenerateSeoButton";

// Recursive component renderer for nested components
const NestedComponentRenderer = ({
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
    aiContentEnabled = false,
}) => {
    const fieldKey = field.field?.value || field.field;
    const fullPath = parentPath ? `${parentPath}.${fieldKey}` : fieldKey;

    if (field.type === "component") {
        if (field.component_type === "repeatable") {
            return (
                <RepeatableComponent
                    field={field}
                    formData={formData}
                    onChange={onChange}
                    handleFileChange={handleFileChange}
                    handleFileChange_multy={handleFileChange_multy}
                    deleteSingleImage={deleteSingleImage}
                    deleteMultImage={deleteMultImage}
                    isEdit={isEdit}
                    parentPath={parentPath}
                    fieldErrors={fieldErrors}
                    locale={locale}
                    moduleSlug={moduleSlug}
                    recordId={recordId}
                    aiContentEnabled={aiContentEnabled}
                />
            );
        } else if (field.component_type === "single") {
            return (
                <SingleComponent
                    field={field}
                    formData={formData}
                    onChange={onChange}
                    handleFileChange={handleFileChange}
                    handleFileChange_multy={handleFileChange_multy}
                    deleteSingleImage={deleteSingleImage}
                    deleteMultImage={deleteMultImage}
                    isEdit={isEdit}
                    parentPath={parentPath}
                    fieldErrors={fieldErrors}
                    locale={locale}
                    moduleSlug={moduleSlug}
                    recordId={recordId}
                    aiContentEnabled={aiContentEnabled}
                />
            );
        }
    }

    return null;
};
// Single (non-repeatable) component
const SingleComponent = ({
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
    const componentData = formData[fieldKey] || {};

    // Filter fields based on dependencies
    const visibleFields = useMemo(() => {
        if (!field.fields || !Array.isArray(field.fields)) return [];

        return field.fields
            .map(subField => {
                const dependencyState = subField.dependency_field
                    ? evaluateFieldDependency(subField, componentData)
                    : { visible: true, enabled: true };

                return {
                    ...subField,
                    _dependencyState: dependencyState
                };
            })
            .filter(subField => subField._dependencyState.visible);
    }, [field.fields, componentData]);

    const handleFieldChange = (val, name, customType) => {
        let finalValue = val;
        let targetName = name;

        if (customType === "file") {
            finalValue = val;
        } else if (customType === "switchbox" || customType === "checkbox") {
            if (val && val.target) {
                targetName = val.target.name || name;
                finalValue = val.target.checked;
            }
        } else if (["relation", "text-editor"].includes(customType)) {
            finalValue = val;
        } else {
            if (val && val.target) {
                targetName = val.target.name || name;
                finalValue = val.target.value;
            }
        }

        const key = targetName || name;
        let updatedData = { ...componentData, [key]: finalValue };
        
        // Clear dependent fields if this is a relation field change
        if (customType === "relation" && field.fields) {
            field.fields.forEach(subField => {
                const subFieldKey = subField.field?.value || subField.field;
                if (subField.dependency_field === key) {
                    // Clear the dependent field
                    if (subField.type === 'relation' && subField.isMultiple) {
                        updatedData[subFieldKey] = [];
                    } else {
                        updatedData[subFieldKey] = null;
                    }
                }
            });
        }
        
        onChange(updatedData, fieldKey, "component");
    };
    const isSeo = fieldKey === "seo";
    return (
        <Box sx={isSeo ? {
            mb: 2, mt: 2, p: "18px 20px",
            border: "1px solid #e0e7ff",
            borderRadius: "10px",
            backgroundColor: "#fafbff",
            backgroundImage: "linear-gradient(135deg, #fafbff 0%, #f5f3ff 100%)",
        } : {
            mb: 2, mt: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 1, backgroundColor: "#f9f9f9",
        }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isSeo ? "#4f46e5" : "#333", fontSize: isSeo ? 14 : 13, display: "flex", alignItems: "center", gap: "6px" }}>
                    {isSeo && <span style={{ fontSize: 16 }}>🔍</span>}
                    {field.Printvalue || field.component_display_name || fieldKey}
                </Typography>
                {isSeo && (
                    <GenerateSeoButton
                        formData={formData}
                        onChange={(seoPayload) => onChange(seoPayload, fieldKey, "component")}
                    />
                )}
            </div>
            <div className="admin-form">
                <div className="row">
                    {visibleFields.map((subField, idx) => {
                        const subFieldKey = subField.field?.value || subField.field;

                        if (subField.type === "component") {
                            return (
                                <div key={idx} className="col-12">
                                    <NestedComponentRenderer
                                        field={subField}
                                        formData={componentData}
                                        onChange={(val, name, type) => {
                                            const updatedData = { ...componentData, [name]: val };
                                            onChange(updatedData, fieldKey, "component");
                                        }}
                                        handleFileChange={handleFileChange}
                                        handleFileChange_multy={handleFileChange_multy}
                                        deleteSingleImage={deleteSingleImage}
                                        deleteMultImage={deleteMultImage}
                                        isEdit={isEdit}
                                        parentPath={`${parentPath ? parentPath + '.' : ''}${fieldKey}`}
                                        fieldErrors={fieldErrors}
                                        locale={locale}
                                        moduleSlug={moduleSlug}
                                        recordId={recordId}
                                    />
                                </div>
                            );
                        }

                        const { Component_Type, fileSizeMessage, Lable_Component } = returnFormFields({
                            formData: componentData,
                            onChangeFormDataHandler: (val, name, customType) =>
                                handleFieldChange(val, name || subFieldKey, customType),
                            field_data: { ...subField, field: subFieldKey },
                            handleFileChange: (e, name, limit, accept) => {
                                // Process single file from event
                                const files = e?.target?.files;
                                if (files && files[0]) {
                                    handleFieldChange(files[0], subFieldKey, "file");
                                    // Also call parent handler for tracking
                                    handleFileChange(e, `${parentPath ? parentPath + '.' : ''}${fieldKey}.${subFieldKey}`, limit, accept);
                                } else {
                                    handleFieldChange("", subFieldKey, "file");
                                }
                            },
                            handleFileChange_multy: (e, name, limit, accept) => {
                                // Process multiple files from event
                                const files = e?.target?.files;
                                if (files && files.length > 0) {
                                    const fileArray = Array.from(files);
                                    const existingFiles = Array.isArray(componentData[subFieldKey]) ? componentData[subFieldKey] : [];
                                    handleFieldChange([...existingFiles, ...fileArray], subFieldKey, "file");
                                    // Also call parent handler for tracking
                                    handleFileChange_multy(e, `${parentPath ? parentPath + '.' : ''}${fieldKey}.${subFieldKey}`, limit, accept);
                                } else {
                                    handleFieldChange([], subFieldKey, "file");
                                }
                            },
                            deleteSingleImage: (link, fieldName) => {
                                if (typeof link === 'string' && link.startsWith('/')) {
                                    deleteSingleImage(link, `${parentPath ? parentPath + '.' : ''}${fieldKey}.${subFieldKey}`);
                                }
                                handleFieldChange("", subFieldKey, "file");
                            },
                            deleteMultImage: (link, fieldName, unset_field) => {
                                deleteMultImage(link, `${parentPath ? parentPath + '.' : ''}${fieldKey}.${subFieldKey}`, unset_field);
                                handleFieldChange(link, subFieldKey, "file");
                            },
                            isEdit
                        });

                        const isRequired = subField.required === true || subField.required === "true";

                        // Get error for this field
                        const fieldPath = `${parentPath ? parentPath + '.' : ''}${fieldKey}.${subFieldKey}`;
                        const fieldError = fieldErrors[fieldPath];

                        return (
                            <div className={subField.colSpace || 'col-12'} key={idx}>
                                <div className='flex with-tooltip'>
                                    <label className={`form-label ${isRequired ? "starlabel" : ""}`}>
                                        {`${subField.Printvalue} ${fileSizeMessage}`}
                                    </label>
                                    <FieldPurpose Purpose={subField?.FieldPurpose} />
                                    {Lable_Component}
                                    {["text", "rich-text-blocks", "rich-text-markdown"].includes(subField.type) && (
                                        <ImproveContentButton
                                            value={componentData[subFieldKey]}
                                            fieldType={subField.type}
                                            locale={locale}
                                            fieldId={[recordId, locale !== "en" ? locale : "", moduleSlug, fieldKey, subFieldKey].filter(Boolean).join(".")}
                                            onApply={(newValue) => {
                                                if (subField.type === "rich-text-markdown") {
                                                    handleFieldChange(newValue, subFieldKey, "text-editor");
                                                } else {
                                                    handleFieldChange({ target: { name: subFieldKey, value: newValue } }, subFieldKey, null);
                                                }
                                            }}
                                        />
                                    )}
                                </div>
                                {Component_Type}
                                {/* Inline error message */}
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
            </div>
        </Box>
    );
};

// Repeatable component (array of items)
const RepeatableComponent = ({
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
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);

    const toggleExpand = (index) => {
        setExpanded(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleAddEntry = () => {
        // Helper function to get default value based on field type and name
        const getDefaultValueForField = (field) => {
            const fieldName = field.field?.value || field.field;

            // First check if field has a configured default_value
            if (field.default_value !== undefined && field.default_value !== null && field.default_value !== "") {
                // Parse boolean strings
                if (field.default_value === "true") return true;
                if (field.default_value === "false") return false;

                // Parse enumeration multiple (handle both array and comma-separated string)
                if (field.type === "enumeration" && field.enumeration_type === "multiple") {
                    if (Array.isArray(field.default_value)) {
                        return field.default_value;
                    } else if (typeof field.default_value === 'string') {
                        return field.default_value.split(',').map(v => v.trim()).filter(v => v);
                    }
                    return [];
                }

                // Parse numbers if field type suggests it
                if (field.type === "number" && !isNaN(field.default_value)) {
                    return Number(field.default_value);
                }

                return field.default_value;
            }

            // Check for special field names
            if (fieldName === "isActive" || fieldName === "showInHomePage" || fieldName === "showInHeader") {
                return true;
            } else if (fieldName === "sort") {
                return -1;
            }

            // Then check field type
            if (field.type === "relation") {
                return field.isMultiple ? [] : null;
            } else if (field.type === "boolean") {
                return false;
            } else if (field.type === "enumeration" && field.enumeration_type === "multiple") {
                return [];
            } else if (field.type === "media" && field.isMulti) {
                return [];
            } else {
                return "";
            }
        };

        // Helper function to initialize nested component fields
        const initializeComponentFields = (component) => {
            if (!component || !component.fields) return null;

            if (component.component_type === "repeatable") {
                return [];
            } else {
                const componentObj = {};
                component.fields.forEach((subField) => {
                    const key = subField.field?.value || subField.field;
                    if (subField.type === "component") {
                        componentObj[key] = initializeComponentFields(subField);
                    } else {
                        componentObj[key] = getDefaultValueForField(subField);
                    }
                });
                return componentObj;
            }
        };

        const newItem = {};
        field.fields?.forEach(f => {
            const key = f.field?.value || f.field;
            if (f.type === "component") {
                newItem[key] = initializeComponentFields(f);
            } else {
                newItem[key] = getDefaultValueForField(f);
            }
        });

        const newItems = [...items, newItem];
        onChange(newItems, fieldKey, "component");
        setExpanded(prev => ({ ...prev, [items.length]: true }));
    };

    const handleRemoveEntry = (index, e) => {
        if (e) e.stopPropagation();
        
        const confirmed = window.confirm('Are you sure you want to delete this entry? This action cannot be undone.');
        
        if (confirmed) {
            const newItems = items.filter((_, i) => i !== index);
            onChange(newItems, fieldKey, "component");
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
        
        onChange(newItems, fieldKey, "component");
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

        onChange(newItems, fieldKey, "component");
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
        
        // Clear dependent fields if this is a relation field change
        if (customType === "relation" && field.fields) {
            field.fields.forEach(subField => {
                const subFieldKey = subField.field?.value || subField.field;
                if (subField.dependency_field === key) {
                    // Clear the dependent field
                    if (subField.type === 'relation' && subField.isMultiple) {
                        currentItem[subFieldKey] = [];
                    } else {
                        currentItem[subFieldKey] = null;
                    }
                }
            });
        }
        
        newItems[index] = currentItem;
        onChange(newItems, fieldKey, "component");
    };

    return (
        <Box sx={{ mb: 2, mt: 2, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden', backgroundColor: '#fff' }}>
            <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ color: '#333', fontWeight: 600 }}>
                    {field.Printvalue || field.component_display_name || fieldKey} <span style={{ opacity: 0.6, fontSize: '0.9em' }}>({items.length})</span>
                </Typography>
            </Box>

            <Box sx={{ p: 2 }}>
                {items.length === 0 && (
                    <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', mb: 2 }}>
                        No entries found.
                    </Typography>
                )}

                {items.map((item, index) => {
                    const isExpanded = !!expanded[index];
                    const titleField = field.fields?.find(f => {
                        const key = f.field?.value || f.field;
                        return key && (key.toLowerCase().includes('title') || key.toLowerCase().includes('name'));
                    }) || field.fields?.[0];

                    let itemTitle = `Entry ${index + 1}`;
                    if (titleField) {
                        const titleKey = titleField.field?.value || titleField.field;
                        const rawValue = item[titleKey];
                        if (rawValue && typeof rawValue === 'string') {
                            itemTitle = rawValue;
                        } else if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
                            itemTitle = rawValue.displayName || rawValue.name || rawValue.title || itemTitle;
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
                                    <Typography variant="body2" sx={{ color: '#444', fontWeight: 500 }}>
                                        {itemTitle}
                                    </Typography>
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
                                        {field.fields?.filter(subField => {
                                            // Filter based on dependencies
                                            if (!subField.dependency_field) return true;
                                            const dependencyState = evaluateFieldDependency(subField, item);
                                            return dependencyState.visible;
                                        }).map((subField, subIdx) => {
                                            const subFieldKey = subField.field?.value || subField.field;

                                            if (subField.type === "component") {
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

                                            // Check if field should be disabled due to dependencies
                                            const dependencyState = subField.dependency_field
                                                ? evaluateFieldDependency(subField, item)
                                                : { visible: true, enabled: true };
                                            const isDependencyDisabled = !dependencyState.enabled;
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
                                                    // Process single file from event
                                                    const files = e?.target?.files;
                                                    if (files && files[0]) {
                                                        handleFieldChange(files[0], subFieldKey, "file", index);
                                                        // Also call parent handler for tracking
                                                        handleFileChange(e, `${parentPath ? parentPath + '.' : ''}${fieldKey}#${index}.${subFieldKey}`, limit, accept);
                                                    } else {
                                                        handleFieldChange("", subFieldKey, "file", index);
                                                    }
                                                },
                                                handleFileChange_multy: (e, name, limit, accept) => {
                                                    // Process multiple files from event
                                                    const files = e?.target?.files;
                                                    if (files && files.length > 0) {
                                                        const fileArray = Array.from(files);
                                                        const existingFiles = Array.isArray(item[subFieldKey]) ? item[subFieldKey] : [];
                                                        handleFieldChange([...existingFiles, ...fileArray], subFieldKey, "file", index);
                                                        // Also call parent handler for tracking
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

                                            // Get error for this field
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
                                                        {["text", "rich-text-blocks", "rich-text-markdown"].includes(subField.type) && (
                                                            <ImproveContentButton
                                                                value={item[subFieldKey]}
                                                                fieldType={subField.type}
                                                                locale={locale}
                                                                fieldId={[recordId, locale !== "en" ? locale : "", moduleSlug, fieldKey, index, subFieldKey].filter(v => v !== "" && v !== null && v !== undefined).join(".")}
                                                                onApply={(newValue) => {
                                                                    if (subField.type === "rich-text-markdown") {
                                                                        handleFieldChange(newValue, subFieldKey, "text-editor", index);
                                                                    } else {
                                                                        handleFieldChange({ target: { name: subFieldKey, value: newValue } }, subFieldKey, null, index);
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                    {Component_Type}
                                                    {/* Inline error message */}
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
                    variant="contained"
                    startIcon={<AddIcon />}
                    fullWidth
                    onClick={handleAddEntry}
                    sx={{
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        '&:hover': { backgroundColor: '#062352ff' },
                        textTransform: 'none',
                        color: '#fff',
                        py: 1,
                        borderRadius: 1.5
                    }}
                >
                    Add an entry
                </Button>
            </Box>

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

export { NestedComponentRenderer };

