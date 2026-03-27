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
import HandleCreatableSelect from "@/app/components/admin/extra/HandleCreatableSelect";

/**
 * RelationFieldsConfig Component
 * Configuration fields specific to relation field type
 * Replaces old select-box and multi-select-box types
 */
export const RelationFieldsConfig = ({ fieldConfig, onChange, errors }) => {
    console.log(fieldConfig.connectwith, "fieldConfig.connectwith")
    console.log(errors, "errors")
    const handleChange = (event) => {
        const { name, value } = event.target;
        onChange(name, value);
    };

    const handleRelationChange = (name, value) => {
        console.log('=== RELATION CHANGE ===');
        console.log('Name:', name);
        console.log('Value:', value);

        // value is the selected object from HandleCreatableSelect
        // name is the field name ('connectwith')
        onChange(value,name);
        
        // Set related fields based on the selected relation
        if (name) {
            onChange('CreateUrl', `/${name.under}/detail/${name.pageName}`);
            onChange('api_end_point', `${name.get_url}/selectbox`);
            onChange('getOptionValue', "_id");
            onChange('getOptionLabel', name?.entry_title ? name?.entry_title : "displayName");
        }
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                    Relation Field Settings
                </Typography>
            </Grid>

            {/* Select a relation */}
            <Grid item xs={12} sm={6}>
                <HandleCreatableSelect
                    value={fieldConfig.connectwith}
                    onChange={handleRelationChange}
                    url="/setting/pages-conf/connect-modules"
                    postUrl=""
                    name="connectwith"
                    getOptionLabel="name"
                    getOptionValue="pageName"
                    label="Select a relation *"

                />
                <FormHelperText error={!!errors.connectwith}>
                    {errors.connectwith
                        ? errors.connectwith
                        : "Choose the content type to link to"}
                </FormHelperText>
            </Grid>

            {/* Is Multiple toggle */}
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                    <InputLabel>Is Multiple</InputLabel>
                    <Select
                        name="isMultiple"
                        value={fieldConfig.isMultiple ?? false}
                        onChange={handleChange}
                        label="Is Multiple"
                    >
                        <MenuItem value={false}>Single Relation</MenuItem>
                        <MenuItem value={true}>Multiple Relations</MenuItem>
                    </Select>
                    <FormHelperText>Allow selecting multiple items</FormHelperText>
                </FormControl>
            </Grid>

            {/* API Endpoint */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    size="small"
                    label="API End Point *"
                    placeholder="/api/users"
                    name="api_end_point"
                    value={fieldConfig.api_end_point || ''}
                    onChange={handleChange}
                    error={!!errors.api_end_point}
                    helperText={errors.api_end_point || 'API endpoint to fetch options'}
                    required
                />
            </Grid>

            {/* Create URL */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    size="small"
                    label="Create URL"
                    placeholder="/admin/users/create"
                    name="CreateUrl"
                    value={fieldConfig.CreateUrl || ''}
                    onChange={handleChange}
                    error={!!errors.CreateUrl}
                    helperText="URL to create new related item"
                />
            </Grid>

            {/* Option Label */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    size="small"
                    label="Option Label *"
                    placeholder="name"
                    name="getOptionLabel"
                    value={fieldConfig.getOptionLabel || ''}
                    onChange={handleChange}
                    error={!!errors.getOptionLabel}
                    helperText={errors.getOptionLabel || 'Field to display in dropdown'}
                    required
                />
            </Grid>

            {/* Option Value */}
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    size="small"
                    label="Option Value *"
                    placeholder="_id"
                    name="getOptionValue"
                    value={fieldConfig.getOptionValue || ''}
                    onChange={handleChange}
                    error={!!errors.getOptionValue}
                    helperText={errors.getOptionValue || 'Field to use as value'}
                    required
                />
            </Grid>
        </Grid>
    );
};
