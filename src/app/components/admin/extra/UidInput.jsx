"use client";
import React, { useEffect, useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { convertToSEOUrl } from '@/app/utils/usefullFunction/usedFunction';

const UidInput = ({ 
    value, 
    onChange, 
    name, 
    placeholder = "Enter UID...", 
    disabled = false,
    required = false,
    attachedField = null,
    formData = {}
}) => {
    const [manuallyEdited, setManuallyEdited] = useState(false);

    // Generate UID from attached field
    const generateUid = () => {
        if (attachedField && formData[attachedField]) {
            const generatedUid = convertToSEOUrl(formData[attachedField]);
            // Create a synthetic event to match the expected onChange signature
            const syntheticEvent = {
                target: {
                    name: name,
                    value: generatedUid
                }
            };
            onChange(syntheticEvent);
            setManuallyEdited(false);
        }
    };

    // Auto-generate on attached field change (only if not manually edited)
    useEffect(() => {
        if (attachedField && formData[attachedField] && !manuallyEdited && !value) {
            generateUid();
        }
    }, [formData[attachedField]]);

    const handleChange = (e) => {
        setManuallyEdited(true);
        onChange(e);
    };

    const handleRegenerate = () => {
        generateUid();
    };

    return (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <input
                disabled={disabled}
                required={required}
                type="text"
                className="form-control"
                placeholder={placeholder}
                name={name}
                onChange={handleChange}
                value={value ?? ""}
                style={{ flex: 1 }}
            />
            {attachedField && (
                <Tooltip title={`Generate from ${attachedField}`}>
                    <IconButton 
                        onClick={handleRegenerate}
                        disabled={disabled}
                        size="small"
                        sx={{ 
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            '&:hover': { backgroundColor: '#062352ff' },
                            '&:disabled': { backgroundColor: '#ccc' }
                        }}
                    >
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );
};

export default UidInput;
