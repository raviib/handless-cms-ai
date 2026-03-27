"use client"
import {
    Box,
    FormControl,
    FormHelperText,
    Grid,
    Radio,
    RadioGroup,
    FormControlLabel,
    TextField,
    Typography,
    Alert
} from '@mui/material';
import { IconPicker } from './IconPicker';

/**
 * ComponentFieldsConfig Component
 * Configuration fields specific to component field type
 * Replaces old tab and object types
 */
export const ComponentFieldsConfig = ({ fieldConfig, onChange, errors }) => {

    console.log(errors.field, "errors")
    const handleChange = (event) => {
        const { name, value } = event.target;
        console.log('=== COMPONENT KEY CHANGE ===');
        console.log('Field name:', name);
        console.log('Field value:', value);

        // Call onChange for the current field
        onChange(name, value);

        // Auto-sync Printvalue when component_key or component_display_name changes
        if (name === 'component_display_name') {
            console.log('Auto-syncing Printvalue to:', value);
            onChange('Printvalue', value);
        }
        if (name === 'component_key') {
            console.log('Auto-syncing Printvalue to:', value);
            onChange('field', {
                "label": value,
                "value": value
            });
        }
    };

    const handleRadioChange = (event) => {
        const { name, value } = event.target;
        console.log('=== RADIO CHANGE ===');
        console.log('Name:', name);
        console.log('Value:', value);
        console.log('Current fieldConfig:', fieldConfig);

        // Convert string "true"/"false" to boolean for component_creation_mode
        if (name === 'component_creation_mode') {
            onChange(name, value === 'new');
        } else {
            onChange(name, value);
        }
    };


    return (
        <Grid container spacing={2}>
            

           {errors?.field && <Grid item xs={12}>
                <Alert severity="error">
                    {errors?.field}
                </Alert>
            </Grid>}
            <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                    Component Field Settings
                </Typography>
            </Grid>
            {/* Db Field (Component Key) */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    size="small"
                    label="Component Key (Unique) *"
                    placeholder="address"
                    name="component_key"
                    value={fieldConfig.component_key || ''}
                    onChange={handleChange}
                    error={!!errors.component_key}
                    helperText={errors.component_key || 'Unique identifier (no spaces, use underscores or camelCase)'}
                    required
                />
            </Grid>

            {/* Display Name */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    size="small"
                    label="Display Name *"
                    placeholder="Address"
                    name="component_display_name"
                    value={fieldConfig.component_display_name || ''}
                    onChange={handleChange}
                    error={!!errors.component_display_name}
                    helperText={errors.component_display_name || 'Human-readable name for the component'}
                    required
                />
            </Grid>


            {/* Icon Picker */}
            <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Icon *
                </Typography>
                <IconPicker
                    selectedIcon={fieldConfig.component_icon || 'puzzle'}
                    onIconSelect={(iconId) => onChange('component_icon', iconId)}
                    error={errors.component_icon}
                />
            </Grid>

            {/* Component Type: Single vs Repeatable */}
            <Grid item xs={12}>
                <FormControl component="fieldset">
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                        Structure Type *
                    </Typography>
                    <RadioGroup
                        name="component_type"
                        value={fieldConfig.component_type || 'single'}
                        onChange={handleRadioChange}
                        row
                    >
                        <FormControlLabel
                            value="single"
                            control={<Radio size="small" checked={fieldConfig.component_type === 'single'} />}
                            label="Single"
                        />
                        <FormControlLabel
                            value="repeatable"
                            control={<Radio size="small" checked={fieldConfig.component_type === 'repeatable'} />}
                            label="Repeatable"
                        />
                    </RadioGroup>
                    <FormHelperText>
                        Single: Object-like structure (one instance) | Repeatable: Array of objects (multiple instances)
                    </FormHelperText>
                </FormControl>
            </Grid>

            {/* Information Box */}
            <Grid item xs={12}>
                <Box
                    sx={{
                        p: 2,
                        bgcolor: 'info.lighter',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'info.light'
                    }}
                >
                    <Typography variant="body2" color="info.dark">
                        After creating this component, you can add fields inside it by clicking the "Add field to this component" button in the field tree.
                    </Typography>
                </Box>
            </Grid>

        </Grid>
    );
};

