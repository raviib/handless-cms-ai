"use client"
import CloseIcon from '@mui/icons-material/Close';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Typography
} from '@mui/material';



/**
 * FieldDetailsDialog Component
 * Displays all details of a selected field in a modal
 */
export const FieldDetailsDialog = ({ open, onClose, field }) => {
    if (!field) return null;

    // Helper to determine which fields to show based on type
    const getRelevantKeys = (fieldData) => {
        const baseKeys = [
            'field', 'Printvalue', 'type', 'FieldPurpose', 'placeholder',
            'colSpace', 'required', 'disable_in_edit', 'showInTable', 'sort',
            'unique', 'index', 'sparse', 'trim', 'lowercase', 'uppercase', 'default_value', 'match_regex'
        ];

        const specificKeys = [];
        const { type, object_type, tab_type } = fieldData;

        // Valid values to check against
        const selectBoxTypes = ['select-box', 'multi-select-box'];
        const fileType = 'file';
        const numberType = 'number';
        const tabType = 'tab';
        const objectType = 'object';
        const statucSelectBoxType = 'static-select-box';

        // Check helper - checks if ANY of the type fields match the target type(s)
        const isType = (target) => {
            if (Array.isArray(target)) {
                return target.includes(type) || target.includes(object_type) || target.includes(tab_type);
            }
            return type === target || object_type === target || tab_type === target;
        };

        // 1. Select Box / Multi-Select Box Logic
        if (isType(selectBoxTypes)) {
            specificKeys.push('connectwith', 'api_end_point', 'CreateUrl', 'getOptionLabel', 'getOptionValue');
        }

        // 2. Static Select Box Logic
        if (isType(statucSelectBoxType)) {
            specificKeys.push('option_value');
        }

        // 3. File Logic
        if (isType(fileType)) {
            specificKeys.push('fileLimit', 'accept_type', 'isMulti');
        }

        // 4. Number Logic
        if (isType(numberType)) {
            specificKeys.push('min_value', 'max_value');
        }

        // 5. Tab specific fields (when the main type is tab)
        if (type === tabType) {
            specificKeys.push('tab_name', 'tab_type');
        }

        // 6. Object specific fields (when the main type is object)
        if (type === objectType) {
            specificKeys.push('obj_name', 'object_type');
            // If the object contains a tab structure, show tab name
            if (object_type === tabType) {
                specificKeys.push('tab_name');
            }
        }

        return [...baseKeys, ...specificKeys];
    };

    const displayKeys = getRelevantKeys(field);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <DialogTitle sx={{
                m: 0,
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0'
            }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: '#334155' }}>
                    Field Details
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ color: (theme) => theme.palette.grey[500] }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                <List sx={{ p: 0 }}>
                    {displayKeys.map((key, index) => {
                        let value = field[key];
                        // Handle special cases and type conversions for display
                        let displayValue = "N/A";

                        // For boolean fields, explicit check
                        if (value === undefined || value === null || value === "") {
                            displayValue = <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>Not Set</Typography>;
                        } else if (typeof value === 'boolean' || value === "true" || value === "false") {
                            const boolVal = String(value) === "true";
                            displayValue = (
                                <Chip
                                    label={boolVal ? "True" : "False"}
                                    size="small"
                                    color={boolVal ? "success" : "default"}
                                    variant={boolVal ? "filled" : "outlined"}
                                    sx={{ height: 20 }}
                                />
                            );
                        } else if (key === 'connectwith' && typeof value === 'object') {
                            // Special handling for connectwith object which often has pageName/name
                            displayValue = (
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {value.name || value.pageName || 'Selected'}
                                    {value.pageName ? ` (${value.pageName})` : ''}
                                </Typography>
                            );
                        } else if (typeof value === 'object') {
                            displayValue = (
                                <Box component="pre" sx={{ m: 0, p: 1, bgcolor: '#f1f5f9', borderRadius: 1, fontSize: '1rem', overflow: 'auto' }}>
                                    {JSON.stringify(value, null, 2)}
                                </Box>
                            );
                        } else {
                            displayValue = String(value);
                        }

                        // Use custom labels if needed, or format the key
                        const label = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();

                        return (
                            <div key={key}>
                                <ListItem sx={{ py: 1.5, px: 3 }}>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', textTransform: 'capitalize', mb: 0.5 }}>
                                                {label}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="body2" component="div" sx={{ color: 'text.primary', fontWeight: 500 }}>
                                                {displayValue}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                {index < displayKeys.length - 1 && <Divider component="li" />}
                            </div>
                        );
                    })}
                </List>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <Button onClick={onClose} variant="contained" sx={{ textTransform: 'none', borderRadius: 2 }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};