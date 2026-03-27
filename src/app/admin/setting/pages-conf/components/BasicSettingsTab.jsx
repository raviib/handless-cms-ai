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
import { RelationFieldsConfig } from './RelationFieldsConfig';
import { EnumerationFieldsConfig } from './EnumerationFieldsConfig';
import { MediaFieldsConfig } from './MediaFieldsConfig';
import { UIDFieldsConfig } from './UIDFieldsConfig';
import { ComponentFieldsConfig } from './ComponentFieldsConfig';
import { DateFieldsConfig } from './DateFieldsConfig';
import { BooleanFieldsConfig } from './BooleanFieldsConfig';

/**
 * BasicSettingsTab Component
 * Basic settings for field configuration
 */
export const BasicSettingsTab = ({ fieldConfig, onChange, errors, fieldType, existingFields = [], currentComponentPath = [] }) => {
    

    const handleChange = (event) => {
        const { name, value } = event.target;
        onChange(name, value);
    };

    const handleFieldNameChange = (event) => {
        const { value = '' } = event ?? {};
        // Update both field.value and field.label
        onChange('field', {
            label: value,
            value: value
        });
    };

    // Check if current field type is number
    const isNumberField = fieldConfig.type === 'number' || fieldType?.id === 'number';

    // Check if current field type is relation
    const isRelationField = fieldConfig.type === 'relation' || fieldType?.id === 'relation';

    // Check if current field type is enumeration
    const isEnumerationField = fieldConfig.type === 'enumeration' || fieldType?.id === 'enumeration';

    // Check if current field type is media
    const isMediaField = fieldConfig.type === 'media' || fieldType?.id === 'media';

    // Check if current field type is uid
    const isUIDField = fieldConfig.type === 'uid' || fieldType?.id === 'uid';

    // Check if current field type is component
    const isComponentField = fieldConfig.type === 'component' || fieldType?.id === 'component';

    // Check if current field type is date
    const isDateField = fieldConfig.type === 'date' || fieldType?.id === 'date';

    // Check if current field type is boolean
    const isBooleanField = fieldConfig.type === 'boolean' || fieldType?.id === 'boolean';

    if (isComponentField) {
        return <>

            <Grid item xs={12}>
                <ComponentFieldsConfig
                    fieldConfig={fieldConfig}
                    onChange={onChange}
                    errors={errors}
                />
            </Grid></>

    }

    return (
        <Grid container spacing={2}>
            {/* Db Field (Database Field Name) */}
            <>
                <Grid item xs={12} sm={6}>

                    <HandleCreatableSelect
                        value={fieldConfig.field}
                        onChange={handleFieldNameChange}
                        url="/setting/form-field/getfield"
                        postUrl="/setting/form-field"
                        name="field"
                        getOptionLabel="label"
                        getOptionValue="value"
                    />
                    <FormHelperText error={!!errors.field}>
                        {errors.field
                            ? errors.field
                            : "No spaces allowed. Use underscores or camelCase"}
                    </FormHelperText>
                </Grid>

                {/* Print Value / Label */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Print Value"
                        placeholder="Field Label"
                        name="Printvalue"
                        value={fieldConfig.Printvalue || ''}
                        onChange={handleChange}
                        error={!!errors.Printvalue}
                        helperText={errors.Printvalue || 'Display label for the field'}
                        required
                    />
                </Grid>

                {/* Col Span Selector */}
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Column Width</InputLabel>
                        <Select
                            name="colSpace"
                            value={fieldConfig.colSpace || 'col-6'}
                            onChange={handleChange}
                            label="Column Width"
                        >
                            <MenuItem value="col-12">Full Width (12 columns)</MenuItem>
                            <MenuItem value="col-6">Half Width (6 columns)</MenuItem>
                            <MenuItem value="col-4">One Third (4 columns)</MenuItem>
                            <MenuItem value="col-3">One Quarter (3 columns)</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* Required Toggle */}
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Required</InputLabel>
                        <Select
                            name="required"
                            value={fieldConfig.required ?? false}
                            onChange={handleChange}
                            label="Required"
                        >
                            <MenuItem value={true}>Yes</MenuItem>
                            <MenuItem value={false}>No</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* Disable in Edit Toggle */}
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Disable in Edit</InputLabel>
                        <Select
                            name="disable_in_edit"
                            value={fieldConfig.disable_in_edit ?? false}
                            onChange={handleChange}
                            label="Disable in Edit"
                        >
                            <MenuItem value={true}>Yes</MenuItem>
                            <MenuItem value={false}>No</MenuItem>
                        </Select>
                        <FormHelperText>Prevent editing after creation</FormHelperText>
                    </FormControl>
                </Grid>

                {/* Show in Table Toggle */}
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Show in Table</InputLabel>
                        <Select
                            name="showInTable"
                            value={fieldConfig.showInTable ?? false}
                            onChange={handleChange}
                            label="Show in Table"
                        >
                            <MenuItem value={true}>Yes</MenuItem>
                            <MenuItem value={false}>No</MenuItem>
                        </Select>
                        <FormHelperText>Display in list view</FormHelperText>
                    </FormControl>
                </Grid>

                {/* Sort Order */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Sort Order"
                        placeholder="0"
                        name="sort"
                        value={fieldConfig.sort ?? 0}
                        onChange={handleChange}
                        helperText="Order in which field appears"
                    />
                </Grid>

                {/* Placeholder */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Placeholder"
                        placeholder="Enter placeholder text"
                        name="placeholder"
                        value={fieldConfig.placeholder || ''}
                        onChange={handleChange}
                        helperText="Hint text shown in empty field"
                    />
                </Grid>

                {/* Field Purpose */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Field Purpose"
                        placeholder="Describe the purpose of this field"
                        name="FieldPurpose"
                        value={fieldConfig.FieldPurpose || ''}
                        onChange={handleChange}
                        multiline
                        rows={2}
                        helperText="Optional description for documentation"
                    />
                </Grid>
            </>

            {/* Number-specific fields */}
            {isNumberField && (
                <>
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                            Number Field Settings
                        </Typography>
                    </Grid>

                    {/* Min Value */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Min Value"
                            placeholder="Minimum allowed value"
                            name="min_value"
                            value={fieldConfig.min_value ?? ''}
                            onChange={handleChange}
                            error={!!errors.min_value}
                            helperText={errors.min_value || 'Optional minimum value constraint'}
                        />
                    </Grid>

                    {/* Max Value */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Max Value"
                            placeholder="Maximum allowed value"
                            name="max_value"
                            value={fieldConfig.max_value ?? ''}
                            onChange={handleChange}
                            error={!!errors.max_value}
                            helperText={errors.max_value || 'Optional maximum value constraint'}
                        />
                    </Grid>
                </>
            )}

            {/* Relation-specific fields */}
            {isRelationField && (
                <Grid item xs={12}>
                    <RelationFieldsConfig
                        fieldConfig={fieldConfig}
                        onChange={onChange}
                        errors={errors}
                    />
                </Grid>
            )}

            {/* Enumeration-specific fields */}
            {isEnumerationField && (
                <Grid item xs={12}>
                    <EnumerationFieldsConfig
                        fieldConfig={fieldConfig}
                        onChange={onChange}
                        errors={errors}
                    />
                </Grid>
            )}

            {/* Media-specific fields */}
            {isMediaField && (
                <Grid item xs={12}>
                    <MediaFieldsConfig
                        fieldConfig={fieldConfig}
                        onChange={onChange}
                        errors={errors}
                    />
                </Grid>
            )}

            {/* UID-specific fields */}
            {isUIDField && (
                <Grid item xs={12}>
                    <UIDFieldsConfig
                        fieldConfig={fieldConfig}
                        onChange={onChange}
                        errors={errors}
                        existingFields={existingFields}
                        currentComponentPath={currentComponentPath}
                    />
                </Grid>
            )}

            {/* Date-specific fields */}
            {isDateField && (
                <Grid item xs={12}>
                    <DateFieldsConfig
                        fieldConfig={fieldConfig}
                        onChange={onChange}
                        errors={errors}
                    />
                </Grid>
            )}

            {/* Boolean-specific fields */}
            {isBooleanField && (
                <Grid item xs={12}>
                    <BooleanFieldsConfig
                        fieldConfig={fieldConfig}
                        onChange={onChange}
                        errors={errors}
                    />
                </Grid>
            )}

            {/* Component-specific fields */}

        </Grid>
    );
};
