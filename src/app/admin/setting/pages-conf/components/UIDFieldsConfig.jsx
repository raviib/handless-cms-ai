"use client"
import {
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Typography
} from '@mui/material';
import { useMemo } from 'react';

/**
 * UIDFieldsConfig Component
 * Configuration fields specific to UID field type
 * Allows creating unique identifier fields with optional attachment to text fields
 */
export const UIDFieldsConfig = ({ fieldConfig, onChange, errors, existingFields = [], currentComponentPath = [] }) => {
    const handleChange = (event) => {
        const { name, value } = event.target;
        onChange(name, value === 'none' ? null : value);
    };

    // Filter existing fields to only show text fields from the current scope
    const textFields = useMemo(() => {
        if (!existingFields || existingFields.length === 0) {
            return [];
        }
        
        let fieldsToCheck = existingFields;
        
        // If we're in a nested component, navigate to that level
        if (currentComponentPath.length > 0) {
            console.log('Filtering UID attached fields for component path:', currentComponentPath);
            
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
                    // If we can't find the component, use root level
                    currentLevel = existingFields;
                    break;
                }
            }
            
            fieldsToCheck = currentLevel;
            console.log('Fields at current scope:', fieldsToCheck);
        }
        
        // Filter for text-based field types at the current scope
        const textFieldTypes = ['text', 'email', 'password'];
        const filtered = fieldsToCheck.filter(field => 
            textFieldTypes.includes(field.type)
        );
        
        console.log('Filtered text fields:', filtered);
        return filtered;
    }, [existingFields, currentComponentPath]);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                    UID Field Settings
                </Typography>
            </Grid>

            {/* Attached Field Dropdown */}
            <Grid item xs={12}>
                <FormControl fullWidth size="small">
                    <InputLabel>Attached field</InputLabel>
                    <Select
                        name="attached_field"
                        value={fieldConfig.attached_field || 'none'}
                        onChange={handleChange}
                        label="Attached field"
                    >
                        <MenuItem value="none">None</MenuItem>
                        {textFields.map((field) => (
                            <MenuItem 
                                key={field.field?.value || field.field?.label} 
                                value={field.field?.value || field.field?.label}
                            >
                                {field.Printvalue || field.field?.label}
                            </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>
                        {textFields.length === 0 
                            ? 'No text fields available. Create a text field first to enable auto-generation.'
                            : 'Select a text field to auto-generate UID from (e.g., slug from title)'
                        }
                    </FormHelperText>
                </FormControl>
            </Grid>

            {/* Helper Information */}
            <Grid item xs={12}>
                <FormHelperText sx={{ mt: 0 }}>
                    UID fields create unique identifiers. When attached to a text field, 
                    the UID will be auto-generated from that field's value (useful for slugs).
                </FormHelperText>
            </Grid>
        </Grid>
    );
};
