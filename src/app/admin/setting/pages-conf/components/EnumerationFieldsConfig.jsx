"use client"
import {
    Box,
    Chip,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { useMemo } from 'react';

/**
 * EnumerationFieldsConfig Component
 * Configuration fields specific to enumeration field type
 * Replaces old static-select-box type
 */
export const EnumerationFieldsConfig = ({ fieldConfig, onChange, errors }) => {
    const handleChange = (event) => {
        const { name, value } = event.target;
        onChange(name, value);
    };

    // Parse and process options for preview
    const parsedOptions = useMemo(() => {
        if (!fieldConfig.option_value || fieldConfig.option_value.trim() === '') {
            return [];
        }
        
        // Split by comma, trim each option, and remove empty values
        const options = fieldConfig.option_value
            .split(',')
            .map(opt => opt.trim())
            .filter(opt => opt !== '');
        
        // Deduplicate options
        return [...new Set(options)];
    }, [fieldConfig.option_value]);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                    Enumeration Field Settings
                </Typography>
            </Grid>

            {/* Enumeration Type Selection */}
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" error={!!errors.enumeration_type}>
                    <InputLabel>Selection Type *</InputLabel>
                    <Select
                        name="enumeration_type"
                        value={fieldConfig.enumeration_type || 'single'}
                        onChange={handleChange}
                        label="Selection Type *"
                    >
                        <MenuItem value="single">Single Selection</MenuItem>
                        <MenuItem value="multiple">Multiple Selection</MenuItem>
                    </Select>
                    <FormHelperText>
                        {errors.enumeration_type || 'Allow single or multiple option selection'}
                    </FormHelperText>
                </FormControl>
            </Grid>

            {/* Options Input */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    size="small"
                    label="Options (Comma separated) *"
                    placeholder="draft,published,archived"
                    name="option_value"
                    value={fieldConfig.option_value || ''}
                    onChange={handleChange}
                    error={!!errors.option_value}
                    helperText={
                        errors.option_value || 
                        'Enter options separated by commas. Example: draft,published,archived'
                    }
                    required
                    multiline
                    rows={2}
                />
            </Grid>

            {/* Options Preview */}
            {parsedOptions.length > 0 && (
                <Grid item xs={12}>
                    <Box>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                display: 'block', 
                                mb: 1, 
                                color: 'text.secondary',
                                fontWeight: 500
                            }}
                        >
                            Preview ({parsedOptions.length} option{parsedOptions.length !== 1 ? 's' : ''})
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {parsedOptions.map((option, index) => (
                                <Chip
                                    key={index}
                                    label={option}
                                    size="small"
                                    sx={{
                                        backgroundColor: '#e3f2fd',
                                        color: 'rgba(0,0,0,0.7)',
                                        fontWeight: 500
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>
                </Grid>
            )}

            {/* Helper Information */}
            <Grid item xs={12}>
                <FormHelperText sx={{ mt: 0 }}>
                    Options will be automatically trimmed and deduplicated. Empty options will be removed.
                </FormHelperText>
            </Grid>
        </Grid>
    );
};
