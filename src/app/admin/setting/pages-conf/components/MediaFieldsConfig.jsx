"use client"
import {
    Box,
    Button,
    ButtonGroup,
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

/**
 * MediaFieldsConfig Component
 * Configuration fields specific to media field type
 * Replaces old file type
 */
export const MediaFieldsConfig = ({ fieldConfig, onChange, errors }) => {
    const handleChange = (event) => {
        const { name, value } = event.target;
        onChange(name, value);
    };

    // Preset button handlers
    const handlePresetClick = (preset) => {
        let acceptType = '';
        switch (preset) {
            case 'images':
                acceptType = 'image/*';
                break;
            case 'videos':
                acceptType = 'video/*';
                break;
            case 'documents':
                acceptType = '.pdf,.doc,.docx';
                break;
            case 'all':
                acceptType = '.*';
                break;
            default:
                acceptType = '';
        }
        onChange('accept_type', acceptType);
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                    Media Field Settings
                </Typography>
            </Grid>

            {/* Is Multi toggle */}
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                    <InputLabel>Is Multi</InputLabel>
                    <Select
                        name="isMulti"
                        value={fieldConfig.isMulti ?? false}
                        onChange={handleChange}
                        label="Is Multi"
                    >
                        <MenuItem value={false}>Single File</MenuItem>
                        <MenuItem value={true}>Multiple Files</MenuItem>
                    </Select>
                    <FormHelperText>Allow uploading multiple files</FormHelperText>
                </FormControl>
            </Grid>

            {/* File Limit (MB) */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="File Limit (MB)"
                    placeholder="5"
                    name="fileLimit"
                    value={fieldConfig.fileLimit ?? ''}
                    onChange={handleChange}
                    error={!!errors.fileLimit}
                    helperText={errors.fileLimit || 'Maximum file size (0.1-100 MB)'}
                    inputProps={{
                        min: 0.1,
                        max: 100,
                        step: 0.1
                    }}
                />
            </Grid>

            {/* Accept Type (Regex) */}
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    size="small"
                    label="Accept Type (Regex)"
                    placeholder="image/*"
                    name="accept_type"
                    value={fieldConfig.accept_type || ''}
                    onChange={handleChange}
                    error={!!errors.accept_type}
                    helperText={
                        errors.accept_type || 
                        'File type restrictions (e.g., image/*, video/*, .pdf)'
                    }
                />
            </Grid>

            {/* Preset Buttons */}
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
                        Quick Presets
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Button
                            size="small"
                            variant={fieldConfig.accept_type === 'image/*' ? 'contained' : 'outlined'}
                            onClick={() => handlePresetClick('images')}
                            sx={{ textTransform: 'none' }}
                        >
                            Images
                        </Button>
                        <Button
                            size="small"
                            variant={fieldConfig.accept_type === 'video/*' ? 'contained' : 'outlined'}
                            onClick={() => handlePresetClick('videos')}
                            sx={{ textTransform: 'none' }}
                        >
                            Videos
                        </Button>
                        <Button
                            size="small"
                            variant={fieldConfig.accept_type === '.pdf,.doc,.docx' ? 'contained' : 'outlined'}
                            onClick={() => handlePresetClick('documents')}
                            sx={{ textTransform: 'none' }}
                        >
                            Documents
                        </Button>
                        <Button
                            size="small"
                            variant={fieldConfig.accept_type === '.*' ? 'contained' : 'outlined'}
                            onClick={() => handlePresetClick('all')}
                            sx={{ textTransform: 'none' }}
                        >
                            All
                        </Button>
                    </Stack>
                </Box>
            </Grid>

            {/* Helper Information */}
            <Grid item xs={12}>
                <FormHelperText sx={{ mt: 0 }}>
                    Use preset buttons for common file types or enter a custom regex pattern.
                </FormHelperText>
            </Grid>
        </Grid>
    );
};
