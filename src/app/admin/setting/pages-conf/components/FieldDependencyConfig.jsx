"use client"
import {
    Box,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Typography,
    Chip,
    Stack,
    TextField
} from '@mui/material';
import { useMemo } from 'react';

/**
 * FieldDependencyConfig Component
 * Allows configuring field dependencies - when a field should be shown/hidden or enabled/disabled
 * based on another field's value at the same level
 * 
 * @param {object} fieldConfig - Current field configuration
 * @param {function} onChange - Callback when dependency settings change
 * @param {array} existingFields - Array of existing fields at the same level
 * @param {array} currentComponentPath - Current component path for nested fields
 */
export const FieldDependencyConfig = ({
    fieldConfig,
    onChange,
    existingFields = [],
    currentComponentPath = []
}) => {
    // Get fields at the same level that can be used as dependencies
    const currentValue = fieldConfig?.field?.value || fieldConfig?.component_key;

    const availableFields = useMemo(() => {
        if (!existingFields || !Array.isArray(existingFields)) return [];

        return existingFields
            .filter((field) => {
                const fieldValue =
                    field?.field?.value || field?.component_key;

                // remove current field
                return fieldValue !== currentValue;
            })
            .map((field) => ({
                value: field?.field?.value || field?.component_key,
                label:
                    field?.Printvalue ||
                    field?.component_display_name ||
                    field?.field?.label,
                type: field?.type,
            }));
    }, [existingFields, currentValue]);
    const handleDependencyFieldChange = (value) => {
        onChange('dependency_field', value);
        onChange('dependency_action', 'show');
    };

    const handleDependencyActionChange = (value) => {
        onChange('dependency_action', value);
    };

    const breadcrumb = currentComponentPath.length > 0
        ? `${currentComponentPath.join(' > ')}`
        : 'Root Level';
    console.log(availableFields,"availableFields")
    return (
        <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#666' }}>
                Configure when this field should be visible or enabled based on another field's value
            </Typography>

            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary">
                    Current Scope:
                </Typography>
                <Chip
                    label={breadcrumb}
                    size="small"
                    color="primary"
                    variant="outlined"
                />
                <Typography variant="caption" color="text.secondary">
                    •
                </Typography>
                <Chip
                    label={`${availableFields.length} field${availableFields.length !== 1 ? 's' : ''} available`}
                    size="small"
                    color="info"
                    variant="outlined"
                />
            </Stack>

            {availableFields.length === 0 ? (
                <Box>
                    <Box
                        sx={{
                            p: 3,
                            textAlign: 'center',
                            bgcolor: '#f5f5f5',
                            borderRadius: 2,
                            border: '1px dashed #ccc',
                            mb: 2
                        }}
                    >
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            No other fields available at this level to create dependencies.
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                            Total fields in scope: {existingFields.length}
                        </Typography>
                    </Box>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {/* Dependency Field Selection */}
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Depends On Field (Optional)</InputLabel>
                            <Select
                                value={fieldConfig.dependency_field || ''}
                                onChange={(e) => handleDependencyFieldChange(e.target.value)}
                                label="Depends On Field (Optional)"
                            >
                                <MenuItem value="">
                                    <em>No Dependency</em>
                                </MenuItem>
                                {availableFields.map((field) => (
                                    <MenuItem key={field.value} value={field.value}>
                                        {field.label}
                                        <Typography
                                            variant="caption"
                                            sx={{ ml: 1, color: '#666' }}
                                        >
                                            ({field.type})
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>
                                Select a field that controls when this field is shown/enabled
                            </FormHelperText>
                        </FormControl>
                    </Grid>

                    {/* Show dependency action only if a field is selected */}
                    {fieldConfig.dependency_field && (
                        <>
                            {/* Dependency Action */}
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>When Field Has Data</InputLabel>
                                    <Select
                                        value={fieldConfig.dependency_action || 'show'}
                                        onChange={(e) => handleDependencyActionChange(e.target.value)}
                                        label="When Field Has Data"
                                    >
                                        <MenuItem value="show">Show this field</MenuItem>
                                        <MenuItem value="hide">Hide this field</MenuItem>
                                        <MenuItem value="enable">Enable this field</MenuItem>
                                        <MenuItem value="disable">Disable this field</MenuItem>
                                    </Select>
                                    <FormHelperText>
                                        What happens when the dependency field has data (not empty)
                                    </FormHelperText>
                                </FormControl>
                            </Grid>

                            {/* Dependency Field Target - Only for relation fields */}
                            {fieldConfig.type === 'relation' && (
                                <Grid item xs={12}>
                                    <Box
                                        sx={{
                                            p: 2.5,
                                            bgcolor: '#fff8e1',
                                            borderRadius: 2,
                                            border: '2px solid #ffa726',
                                            boxShadow: '0 2px 4px rgba(255, 152, 0, 0.1)'
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                                            <Box
                                                sx={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: '50%',
                                                    bgcolor: '#ff9800',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '14px',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                🔗
                                            </Box>
                                            <Typography variant="subtitle2" sx={{ color: '#e65100', fontWeight: 600 }}>
                                                Relation Field Filtering
                                            </Typography>
                                        </Stack>

                                        <Typography variant="body2" sx={{ color: '#ef6c00', mb: 2, lineHeight: 1.6 }}>
                                            This relation field will automatically filter its options based on the selected "{availableFields.find(f => f.value === fieldConfig.dependency_field)?.label}" value.
                                        </Typography>

                                        <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, border: '1px solid #ffe0b2' }}>
                                            <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontWeight: 500 }}>
                                                Target Field Name (Optional)
                                            </label>
                                      
                                            <TextField
                                                fullWidth
                                                size="small"
                                                variant="outlined"
                                                placeholder={`Leave empty to use "${fieldConfig.dependency_field}"`}
                                                value={fieldConfig.dependency_field_target || ""}
                                                onChange={(e) =>
                                                    onChange("dependency_field_target", e.target.value)
                                                }
                                                sx={{ mb: 1 }}
                                            />
                                            <Typography variant="caption" sx={{ color: '#666', display: 'block', lineHeight: 1.5 }}>
                                                If the target schema uses a different field name, enter it here.
                                                <br />
                                                <strong style={{ color: '#e65100' }}>Example:</strong> Form has "state" but City schema has "mystate" → enter "mystate"
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            )}

                            {/* Explanation */}
                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: '#e3f2fd',
                                        borderRadius: 2,
                                        border: '1px solid #90caf9'
                                    }}
                                >
                                    <Typography variant="body2" sx={{ color: '#1565c0' }}>
                                        <strong>Rule:</strong> When "{availableFields.find(f => f.value === fieldConfig.dependency_field)?.label}"
                                        has data (not empty), then <strong>{fieldConfig.dependency_action || 'show'}</strong> this field.
                                        <br />
                                        {(fieldConfig.dependency_action === 'show' || fieldConfig.dependency_action === 'hide') && (
                                            <>When it's empty, the opposite action applies (field will be {fieldConfig.dependency_action === 'show' ? 'hidden' : 'shown'}).</>
                                        )}
                                        {(fieldConfig.dependency_action === 'enable' || fieldConfig.dependency_action === 'disable') && (
                                            <>When it's empty, the opposite action applies (field will be {fieldConfig.dependency_action === 'enable' ? 'disabled' : 'enabled'}).</>
                                        )}
                                        {fieldConfig.type === 'relation' && fieldConfig.dependency_field_target && (
                                            <>
                                                <br /><br />
                                                <strong>Filtering:</strong> This relation field will filter by "{fieldConfig.dependency_field_target}" in the target schema.
                                            </>
                                        )}
                                    </Typography>
                                </Box>
                            </Grid>
                        </>
                    )}
                </Grid>
            )}
        </Box>
    );
};
