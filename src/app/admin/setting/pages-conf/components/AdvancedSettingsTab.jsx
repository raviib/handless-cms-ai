"use client"
import {
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';

/**
 * AdvancedSettingsTab Component
 * Advanced validation and indexing settings for field configuration
 */
export const AdvancedSettingsTab = ({ fieldConfig, onChange, errors }) => {
    const handleChange = (event) => {
        const { name, value, checked, type: inputType } = event.target;
        const finalValue = inputType === 'checkbox' ? checked : value;
        onChange(name, finalValue);
    };

    // Hide entire advanced settings for component, media, and relation types
    if (['component', 'media', 'relation'].includes(fieldConfig.type)) {
        return (
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                        Advanced settings are not available for {fieldConfig.type} fields.
                    </Typography>
                </Grid>
            </Grid>
        );
    }

    // Render default value input based on field type
    const renderDefaultValueInput = () => {
        const commonProps = {
            fullWidth: true,
            size: "small",
            label: "Default Value",
            name: "default_value",
            value: fieldConfig.default_value || '',
            onChange: handleChange
        };

        switch (fieldConfig.type) {
            case 'date':
                const dateType = fieldConfig.date_type || 'date';
                return (
                    <TextField
                        {...commonProps}
                        type={dateType}
                        helperText={`Default ${dateType} value`}
                        InputLabelProps={{ shrink: true }}
                    />
                );

            case 'number':
                return (
                    <TextField
                        {...commonProps}
                        type="number"
                        placeholder="Enter default number"
                        helperText="Default numeric value"
                        inputProps={{
                            min: fieldConfig.min_value,
                            max: fieldConfig.max_value
                        }}
                    />
                );

            case 'boolean':
                return (
                    <FormControl fullWidth size="small">
                        <InputLabel>Default Value</InputLabel>
                        <Select
                            name="default_value"
                            value={fieldConfig.default_value ?? ''}
                            onChange={handleChange}
                            label="Default Value"
                        >
                            <MenuItem value="">None</MenuItem>
                            <MenuItem value="true">True</MenuItem>
                            <MenuItem value="false">False</MenuItem>
                        </Select>
                        <FormHelperText>Default boolean value</FormHelperText>
                    </FormControl>
                );

            case 'enumeration':
                const options = fieldConfig.option_value ? fieldConfig.option_value.split(',').map(v => v.trim()) : [];
                if (fieldConfig.enumeration_type === 'multiple') {
                    // Multi-select dropdown for multiple enumeration
                    // Ensure value is always an array
                    let selectedValues = [];
                    if (fieldConfig.default_value) {
                        if (Array.isArray(fieldConfig.default_value)) {
                            selectedValues = fieldConfig.default_value;
                        } else if (typeof fieldConfig.default_value === 'string') {
                            // Handle legacy comma-separated strings
                            selectedValues = fieldConfig.default_value.split(',').map(v => v.trim()).filter(v => v);
                        }
                    }
                    
                    return (
                        <FormControl fullWidth size="small">
                            <InputLabel>Default Values</InputLabel>
                            <Select
                                name="default_value"
                                multiple
                                value={selectedValues}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Store as array directly
                                    onChange('default_value', value);
                                }}
                                label="Default Values"
                                renderValue={(selected) => selected.join(', ')}
                            >
                                {options.map((opt, idx) => (
                                    <MenuItem key={idx} value={opt}>{opt}</MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Select multiple default values</FormHelperText>
                        </FormControl>
                    );
                } else {
                    return (
                        <FormControl fullWidth size="small">
                            <InputLabel>Default Value</InputLabel>
                            <Select
                                name="default_value"
                                value={fieldConfig.default_value || ''}
                                onChange={handleChange}
                                label="Default Value"
                            >
                                <MenuItem value="">None</MenuItem>
                                {options.map((opt, idx) => (
                                    <MenuItem key={idx} value={opt}>{opt}</MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Default enumeration value</FormHelperText>
                        </FormControl>
                    );
                }

            case 'email':
                return (
                    <TextField
                        {...commonProps}
                        type="email"
                        placeholder="default@example.com"
                        helperText="Default email address"
                    />
                );

            case 'url':
                return (
                    <TextField
                        {...commonProps}
                        type="url"
                        placeholder="https://example.com"
                        helperText="Default URL"
                    />
                );

            case 'json':
                // Use JsonEditor component for JSON type
                return (
                    <div style={{ width: '100%' }}>
                        <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
                            Default Value
                        </Typography>
                        <div style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px' }}>
                            <textarea
                                name="default_value"
                                value={fieldConfig.default_value || ''}
                                onChange={handleChange}
                                placeholder='{"key": "value"}'
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    fontFamily: 'monospace',
                                    fontSize: '14px',
                                    border: 'none',
                                    outline: 'none',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                        <FormHelperText>Default JSON object</FormHelperText>
                    </div>
                );

            case 'rich-text-markdown':
            case 'rich-text-blocks':
                return (
                    <TextField
                        {...commonProps}
                        multiline
                        rows={3}
                        placeholder="Enter default content"
                        helperText={`Default ${fieldConfig.type} content`}
                    />
                );

            default:
                // Text, password, textarea, uid, etc.
                return (
                    <TextField
                        {...commonProps}
                        placeholder="Enter default value"
                        helperText="Value used when field is empty"
                    />
                );
        }
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Advanced Validation & Indexing Options
                </Typography>
            </Grid>

            {/* Unique Toggle */}
            <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                    <InputLabel>Unique</InputLabel>
                    <Select
                        name="unique"
                        value={fieldConfig.unique ?? false}
                        onChange={handleChange}
                        label="Unique"
                    >
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                    </Select>
                    <FormHelperText>Ensure unique values across records</FormHelperText>
                </FormControl>
            </Grid>

            {/* Index Toggle */}
            <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                    <InputLabel>Search Index</InputLabel>
                    <Select
                        name="index"
                        value={fieldConfig.index ?? false}
                        onChange={handleChange}
                        label="Search Index"
                    >
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                    </Select>
                    <FormHelperText>Create database index for faster queries</FormHelperText>
                </FormControl>
            </Grid>

            {/* Sparse Toggle */}
            <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                    <InputLabel>Sparse Index</InputLabel>
                    <Select
                        name="sparse"
                        value={fieldConfig.sparse ?? false}
                        onChange={handleChange}
                        label="Sparse Index"
                    >
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                    </Select>
                    <FormHelperText>Index only documents with this field</FormHelperText>
                </FormControl>
            </Grid>

            {/* Default Value - Type-specific input */}
            {renderDefaultValueInput() && (
                <Grid item xs={12} sm={6}>
                    {renderDefaultValueInput()}
                </Grid>
            )}

            {/* Match Regex */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    size="small"
                    label="Match Regex"
                    placeholder="^[a-zA-Z0-9]+$"
                    name="match_regex"
                    value={fieldConfig.match_regex || ''}
                    onChange={handleChange}
                    error={!!errors.match_regex}
                    helperText={errors.match_regex || 'Regex pattern for validation'}
                />
            </Grid>

            {/* Trim Toggle */}
            <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                    <InputLabel>Trim</InputLabel>
                    <Select
                        name="trim"
                        value={fieldConfig.trim ?? false}
                        onChange={handleChange}
                        label="Trim"
                    >
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                    </Select>
                    <FormHelperText>Remove leading/trailing whitespace</FormHelperText>
                </FormControl>
            </Grid>

            {/* Lowercase Toggle */}
            <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                    <InputLabel>Lowercase</InputLabel>
                    <Select
                        name="lowercase"
                        value={fieldConfig.lowercase ?? false}
                        onChange={handleChange}
                        label="Lowercase"
                    >
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                    </Select>
                    <FormHelperText>Convert to lowercase before saving</FormHelperText>
                </FormControl>
            </Grid>

            {/* Uppercase Toggle */}
            <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                    <InputLabel>Uppercase</InputLabel>
                    <Select
                        name="uppercase"
                        value={fieldConfig.uppercase ?? false}
                        onChange={handleChange}
                        label="Uppercase"
                    >
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                    </Select>
                    <FormHelperText>Convert to uppercase before saving</FormHelperText>
                </FormControl>
            </Grid>
        </Grid>
    );
};
