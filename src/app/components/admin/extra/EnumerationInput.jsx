"use client";
import React from 'react';
import { 
    Box, 
    FormControl, 
    Select, 
    MenuItem, 
    Chip, 
    OutlinedInput,
    InputLabel
} from '@mui/material';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const EnumerationInput = ({ 
    value, 
    onChange, 
    name, 
    options = [],
    placeholder = "Select...",
    disabled = false,
    required = false,
    isMultiple = false
}) => {
    const handleChange = (event) => {
        const selectedValue = event.target.value;
        
        // Create synthetic event to match expected onChange signature
        const syntheticEvent = {
            target: {
                name: name,
                value: isMultiple ? selectedValue : selectedValue
            }
        };
        
        onChange(syntheticEvent);
    };

    if (isMultiple) {
        const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
        
        return (
            <FormControl fullWidth size="small">
                <Select
                    multiple
                    disabled={disabled}
                    required={required}
                    value={selectedValues}
                    onChange={handleChange}
                    input={<OutlinedInput />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((val) => (
                                <Chip 
                                    key={val} 
                                    label={val} 
                                    size="small"
                                    sx={{ 
                                        backgroundColor: 'rgba(0,0,0,0.7)',
                                        color: 'white',
                                        '& .MuiChip-deleteIcon': {
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            '&:hover': {
                                                color: 'white'
                                            }
                                        }
                                    }}
                                />
                            ))}
                        </Box>
                    )}
                    MenuProps={MenuProps}
                    displayEmpty
                    sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#ced4da',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#86b7fe',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#86b7fe',
                            borderWidth: '1px',
                        },
                        minHeight: '38px',
                    }}
                >
                    <MenuItem disabled value="">
                        <em>{placeholder}</em>
                    </MenuItem>
                    {options.map((option) => (
                        <MenuItem 
                            key={option} 
                            value={option}
                            sx={{
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(29, 68, 129, 0.08)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(29, 68, 129, 0.12)',
                                    }
                                }
                            }}
                        >
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }

    // Single select
    return (
        <FormControl fullWidth size="small">
            <Select
                disabled={disabled}
                required={required}
                value={value || ""}
                onChange={handleChange}
                displayEmpty
                sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#ced4da',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#86b7fe',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#86b7fe',
                        borderWidth: '1px',
                    },
                    minHeight: '38px',
                }}
            >
                <MenuItem value="">
                    <em>{placeholder}</em>
                </MenuItem>
                {options.map((option) => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default EnumerationInput;
