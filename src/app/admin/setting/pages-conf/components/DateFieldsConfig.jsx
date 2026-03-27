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
 * DateFieldsConfig Component
 * Configuration fields specific to date field type
 */
export const DateFieldsConfig = ({ fieldConfig, onChange, errors }) => {
    const handleChange = (event) => {
        const { name, value } = event.target;
        onChange(name, value);
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                    📅 Date & Time Settings
                </Typography>
            </Grid>

            {/* Date Type Selection */}
            <Grid item xs={12}>
                <FormControl fullWidth size="small" error={!!errors.date_type}>
                    <InputLabel>Date Type *</InputLabel>
                    <Select
                        name="date_type"
                        value={fieldConfig.date_type || 'date'}
                        onChange={handleChange}
                        label="Date Type *"
                    >
                        <MenuItem value="date">📅 Date (YYYY-MM-DD)</MenuItem>
                        <MenuItem value="datetime-local">🕐 Date & Time (YYYY-MM-DD HH:MM)</MenuItem>
                        <MenuItem value="month">📆 Month (YYYY-MM)</MenuItem>
                        <MenuItem value="week">📊 Week (YYYY-Www)</MenuItem>
                        <MenuItem value="time">⏰ Time (HH:MM)</MenuItem>
                    </Select>
                    <FormHelperText>
                        {errors.date_type || 'Select the type of date/time input'}
                    </FormHelperText>
                </FormControl>
            </Grid>

            {/* Helper Information */}
            <Grid item xs={12}>
                <FormHelperText sx={{ mt: 0 }}>
                    {fieldConfig.date_type === 'date' && 'Standard date picker (e.g., 2024-12-25)'}
                    {fieldConfig.date_type === 'datetime-local' && 'Date and time picker (e.g., 2024-12-25 14:30)'}
                    {fieldConfig.date_type === 'month' && 'Month and year picker (e.g., 2024-12)'}
                    {fieldConfig.date_type === 'week' && 'Week picker (e.g., 2024-W52)'}
                    {fieldConfig.date_type === 'time' && 'Time picker (e.g., 14:30)'}
                    {!fieldConfig.date_type && 'Choose the appropriate date/time format for your needs'}
                </FormHelperText>
            </Grid>
        </Grid>
    );
};
