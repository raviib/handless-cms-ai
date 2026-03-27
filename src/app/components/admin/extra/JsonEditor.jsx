"use client";
import { Alert, Box } from '@mui/material';
import { useState } from 'react';

const JsonEditor = ({ value, onChange, name, placeholder = "Enter JSON...", disabled = false }) => {
    const [error, setError] = useState(null);
    const [displayValue, setDisplayValue] = useState(() => {
        if (!value) return '';
        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }
        return value;
    });

    const handleChange = (e) => {
        const newValue = e.target.value;
        setDisplayValue(newValue);
        
        // Try to parse JSON to validate
        if (newValue.trim() === '') {
            setError(null);
            onChange(e, name, 'json');
            return;
        }
        
        try {
            JSON.parse(newValue);
            setError(null);
            onChange(e, name, 'json');
        } catch (err) {
            setError(err.message);
            // Still call onChange to update the raw value
            onChange(e, name, 'json');
        }
    };

    const handleBlur = () => {
        // Try to format JSON on blur if valid
        if (displayValue.trim() && !error) {
            try {
                const parsed = JSON.parse(displayValue);
                const formatted = JSON.stringify(parsed, null, 2);
                setDisplayValue(formatted);
            } catch (err) {
                // Keep as is if invalid
            }
        }
    };

    return (
        <Box>
            <textarea
                disabled={disabled}
                className="form-control"
                name={name}
                onChange={handleChange}
                onBlur={handleBlur}
                value={displayValue}
                placeholder={placeholder}
                rows={10}
                style={{ 
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    lineHeight: '1.5'
                }}
            />
            {error && (
                <Alert severity="error" sx={{ mt: 1, fontSize: '0.875rem' }}>
                    Invalid JSON: {error}
                </Alert>
            )}
        </Box>
    );
};

export default JsonEditor;
