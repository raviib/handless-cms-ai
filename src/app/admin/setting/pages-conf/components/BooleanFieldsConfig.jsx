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

/**
 * BooleanFieldsConfig Component
 * Configuration fields specific to boolean field type
 */
export const BooleanFieldsConfig = ({ fieldConfig, onChange, errors }) => {
    const handleChange = (event) => {
        const { name, value } = event.target;
        onChange(name, value);
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                    Boolean Field Settings
                </Typography>
            </Grid>

            {/* Boolean Input Type Selection */}
            <Grid item xs={12}>
                <FormControl fullWidth size="small" error={!!errors.boolean_type}>
                    <InputLabel>Input Type *</InputLabel>
                    <Select
                        name="boolean_type"
                        value={fieldConfig.boolean_type || 'checkbox'}
                        onChange={handleChange}
                        label="Input Type *"
                    >
                        <MenuItem value="checkbox">☑️ Checkbox</MenuItem>
                        <MenuItem value="switch">🔘 Switch</MenuItem>
                    </Select>
                    <FormHelperText>
                        {errors.boolean_type || 'Select how the boolean field should be displayed'}
                    </FormHelperText>
                </FormControl>
            </Grid>

            {/* Helper Information */}
            <Grid item xs={12}>
                <FormHelperText sx={{ mt: 0 }}>
                    {fieldConfig.boolean_type === 'checkbox' && 'Traditional checkbox input (☑️)'}
                    {fieldConfig.boolean_type === 'switch' && 'Modern toggle switch input (🔘)'}
                    {!fieldConfig.boolean_type && 'Choose between checkbox or switch for true/false values'}
                </FormHelperText>
            </Grid>
        </Grid>
    );
};
