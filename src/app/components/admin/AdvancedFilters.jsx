"use client";
import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    IconButton,
    Select,
    MenuItem,
    TextField,
    FormControl,
    InputLabel,
    Paper,
    Typography,
    Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';

// Field types to exclude from advanced filters
const EXCLUDED_FIELD_TYPES = [
    'relation',
    'media',
    'component',
    'enumeration',
    'richtext',
    'markdown',
    'blocks'
];

// Operator definitions
const OPERATORS = {
    text: [
        { value: '$eq', label: 'is' },
        { value: '$ne', label: 'is not' },
        { value: '$contains', label: 'contains' },
        { value: '$notContains', label: 'does not contain' },
        { value: '$startsWith', label: 'starts with' },
        { value: '$endsWith', label: 'ends with' },
        { value: '$null', label: 'is null' },
        { value: '$notNull', label: 'is not null' }
    ],
    number: [
        { value: '$eq', label: 'is equal to' },
        { value: '$ne', label: 'is not equal to' },
        { value: '$gt', label: 'is greater than' },
        { value: '$gte', label: 'is greater than or equal to' },
        { value: '$lt', label: 'is less than' },
        { value: '$lte', label: 'is less than or equal to' },
        { value: '$null', label: 'is null' },
        { value: '$notNull', label: 'is not null' }
    ],
    boolean: [
        { value: '$eq', label: 'is' }
    ],
    date: [
        { value: '$eq', label: 'is' },
        { value: '$ne', label: 'is not' },
        { value: '$gt', label: 'is after' },
        { value: '$gte', label: 'is on or after' },
        { value: '$lt', label: 'is before' },
        { value: '$lte', label: 'is on or before' }
    ]
};

const AdvancedFilters = ({ fields = [], onApplyFilters, onClearFilters, persistedFilters = {} }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState([]);
    const [lastPersistedKeys, setLastPersistedKeys] = useState('');

    // Convert persisted filters back to filter array format on mount
    useEffect(() => {
        const currentKeys = Object.keys(persistedFilters).sort().join(',');
        
        // Only update if persistedFilters actually changed from outside
        if (currentKeys !== lastPersistedKeys) {
            setLastPersistedKeys(currentKeys);
            
            if (Object.keys(persistedFilters).length > 0) {
                const reconstructedFilters = [];

                // Parse the persisted filter params back into filter objects
                Object.keys(persistedFilters).forEach(key => {
                    // Key format: filters[fieldName][$operator]
                    const match = key.match(/filters\[([^\]]+)\]\[([^\]]+)\]/);
                    if (match) {
                        const [, field, operator] = match;
                        const value = persistedFilters[key];

                        reconstructedFilters.push({
                            field,
                            operator,
                            value: value === 'true' && (operator === '$null' || operator === '$notNull') ? '' : value
                        });
                    }
                });

                if (reconstructedFilters.length > 0) {
                    setFilters(reconstructedFilters);
                    setShowFilters(true);
                }
            } else {
                // persistedFilters is empty, clear local filters
                setFilters([]);
            }
        }
    }, [persistedFilters, lastPersistedKeys]);

    // Filter out excluded field types
    const availableFields = fields.filter(field => {
        const fieldType = field.type?.toLowerCase() || '';
        return !EXCLUDED_FIELD_TYPES.includes(fieldType);
    });

    const addFilter = () => {
        setFilters([...filters, { field: '', operator: '', value: '' }]);
    };

    const removeFilter = (index) => {
        setFilters(filters.filter((_, i) => i !== index));
    };

    const updateFilter = (index, key, value) => {
        const newFilters = [...filters];
        newFilters[index][key] = value;

        // Reset operator and value when field changes
        if (key === 'field') {
            newFilters[index].operator = '';
            newFilters[index].value = '';
        }

        setFilters(newFilters);
    };

    const getOperatorsForField = (fieldName) => {
        const field = availableFields.find(f => (f.field?.value || f.field) === fieldName);
        if (!field) return [];

        // Map field types to operator types
        const typeMap = {
            'text': 'text',
            'textarea': 'text',
            'email': 'text',
            'url': 'text',
            'number': 'number',
            'boolean': 'boolean',
            'date': 'date'
        };

        const operatorType = typeMap[field.type] || 'text';
        return OPERATORS[operatorType] || OPERATORS.text;
    };

    const getFieldType = (fieldName) => {
        const field = availableFields.find(f => (f.field?.value || f.field) === fieldName);
        return field?.type || 'text';
    };

    const getDateType = (fieldName) => {
        const field = availableFields.find(f => (f.field?.value || f.field) === fieldName);
        return field?.date_type || 'date';
    };

    const handleApply = () => {
        // Build filter URL params
        const filterParams = {};

        filters.forEach(filter => {
            if (filter.field && filter.operator) {
                const key = `filters[${filter.field}][${filter.operator}]`;
                filterParams[key] = filter.value || 'true';
            }
        });

        onApplyFilters(filterParams);
    };

    const handleClear = () => {
        setFilters([]);
        onClearFilters();
    };

    const needsValueInput = (operator) => {
        return operator && !['$null', '$notNull'].includes(operator);
    };

    const renderValueInput = (filter, index) => {
        const fieldType = getFieldType(filter.field);

        if (!needsValueInput(filter.operator)) {
            return null;
        }

        // Boolean field - show dropdown
        if (fieldType === 'boolean') {
            return (
                <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
                    <InputLabel>Value</InputLabel>
                    <Select
                        value={filter.value}
                        onChange={(e) => updateFilter(index, 'value', e.target.value)}
                        label="Value"
                        sx={{ backgroundColor: 'white' }}
                    >
                        <MenuItem value="true">True</MenuItem>
                        <MenuItem value="false">False</MenuItem>
                    </Select>
                </FormControl>
            );
        }

        // Date field - show date input
        if (fieldType === 'date') {
            const dateType = getDateType(filter.field);
            return (
                <TextField
                    size="small"
                    label="Value"
                    type={dateType}
                    value={filter.value}
                    onChange={(e) => updateFilter(index, 'value', e.target.value)}
                    sx={{ minWidth: 200, flex: 1, backgroundColor: 'white' }}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            );
        }

        // Number field
        if (fieldType === 'number') {
            return (
                <TextField
                    size="small"
                    label="Value"
                    type="number"
                    value={filter.value}
                    onChange={(e) => updateFilter(index, 'value', e.target.value)}
                    sx={{ minWidth: 200, flex: 1, backgroundColor: 'white' }}
                />
            );
        }

        // Text field (default)
        return (
            <TextField
                size="small"
                label="Value"
                value={filter.value}
                onChange={(e) => updateFilter(index, 'value', e.target.value)}
                sx={{ minWidth: 200, flex: 1, backgroundColor: 'white' }}
            />
        );
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                    mb: showFilters ? 2 : 0,
                    borderColor: '#d5dce6',
                    color: '#32324d',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                        borderColor: '#4945ff',
                        backgroundColor: '#f0f0ff'
                    }
                }}
            >
                Filters {filters.length > 0 && `(${filters.length})`}
            </Button>

            {showFilters && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        border: '1px solid #eaeaef',
                        borderRadius: '4px',
                        backgroundColor: '#ffffff'
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 600, color: '#32324d' }}>
                            Filters
                        </Typography>
                        <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={addFilter}
                            disabled={availableFields.length === 0}
                            sx={{
                                textTransform: 'none',
                                color: '#4945ff',
                                fontWeight: 500,
                                '&:hover': {
                                    backgroundColor: '#f0f0ff'
                                },
                                '&:disabled': {
                                    color: '#a5a5ba'
                                }
                            }}
                        >
                            Add filter
                        </Button>
                    </Box>

                    {availableFields.length === 0 ? (
                        <Box sx={{
                            textAlign: 'center',
                            py: 4,
                            color: '#666687',
                            backgroundColor: '#fafafb',
                            borderRadius: '4px',
                            border: '1px dashed #dcdce4'
                        }}>
                            <FilterListIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                            <Typography>No filterable fields available</Typography>
                        </Box>
                    ) : filters.length === 0 ? (
                        <Box sx={{
                            textAlign: 'center',
                            py: 4,
                            color: '#666687',
                            backgroundColor: '#fafafb',
                            borderRadius: '4px',
                            border: '1px dashed #dcdce4'
                        }}>
                            <FilterListIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                            <Typography>No filters applied</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Add a filter to refine results
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {filters.map((filter, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        gap: 2,
                                        alignItems: 'flex-start',
                                        p: 2,
                                        backgroundColor: '#fafafb',
                                        borderRadius: '4px',
                                        border: '1px solid #eaeaef'
                                    }}
                                >
                                    {index > 0 && (
                                        <Chip
                                            label="AND"
                                            size="small"
                                            sx={{
                                                mt: 1,
                                                backgroundColor: '#eafbe7',
                                                color: '#328048',
                                                fontWeight: 600,
                                                fontSize: '11px',
                                                height: '24px'
                                            }}
                                        />
                                    )}

                                    <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
                                        <InputLabel>Field</InputLabel>
                                        <Select
                                            value={filter.field}
                                            onChange={(e) => updateFilter(index, 'field', e.target.value)}
                                            label="Field"
                                            sx={{
                                                backgroundColor: 'white',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#dcdce4'
                                                }
                                            }}
                                        >
                                            {availableFields.map((field) => {
                                                const fieldName = field.field?.value || field.field;
                                                return (
                                                    <MenuItem key={fieldName} value={fieldName}>
                                                        {field.Printvalue || fieldName}
                                                    </MenuItem>
                                                );
                                            })}
                                        </Select>
                                    </FormControl>

                                    <FormControl size="small" sx={{ minWidth: 200, flex: 1 }} disabled={!filter.field}>
                                        <InputLabel>Operator</InputLabel>
                                        <Select
                                            value={filter.operator}
                                            onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                                            label="Operator"
                                            sx={{
                                                backgroundColor: 'white',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#dcdce4'
                                                }
                                            }}
                                        >
                                            {getOperatorsForField(filter.field).map((op) => (
                                                <MenuItem key={op.value} value={op.value}>
                                                    {op.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {renderValueInput(filter, index)}

                                    <IconButton
                                        size="small"
                                        onClick={() => removeFilter(index)}
                                        sx={{
                                            mt: 0.5,
                                            color: '#d02b20',
                                            '&:hover': {
                                                backgroundColor: '#fee7e5'
                                            }
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {filters.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                onClick={handleClear}
                                sx={{
                                    textTransform: 'none',
                                    borderColor: '#dcdce4',
                                    color: '#32324d',
                                    fontWeight: 500,
                                    '&:hover': {
                                        borderColor: '#8e8ea9',
                                        backgroundColor: '#fafafb'
                                    }
                                }}
                            >
                                Clear
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleApply}
                                sx={{
                                    textTransform: 'none',
                                    backgroundColor: '#4945ff',
                                    fontWeight: 500,
                                    boxShadow: 'none',
                                    '&:hover': {
                                        backgroundColor: '#271fe0',
                                        boxShadow: 'none'
                                    }
                                }}
                            >
                                Apply
                            </Button>
                        </Box>
                    )}
                </Paper>
            )}
        </Box>
    );
};

export default AdvancedFilters;
