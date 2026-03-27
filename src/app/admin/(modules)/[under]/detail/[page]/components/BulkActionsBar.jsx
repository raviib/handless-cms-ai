"use client";
import { Button } from '@mui/material';

const BulkActionsBar = ({ 
    selectedCount, 
    onActivate, 
    onDeactivate, 
    onDelete, 
    onClear, 
    permissions 
}) => {
    return (
        <div 
            className="bulk-actions-bar" 
            style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                marginBottom: '20px',
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                color: 'white'
            }}
        >
            {/* Selection Count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <span style={{
                        backgroundColor: 'white',
                        color: '#667eea',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}>
                        {selectedCount}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                        {selectedCount === 1 ? 'item selected' : 'items selected'}
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap'
            }}>
                {permissions.edit && (
                    <>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={onActivate}
                            style={{
                                backgroundColor: '#10b981',
                                color: 'white',
                                minWidth: '90px',
                                borderRadius: '6px',
                                textTransform: 'none',
                                fontWeight: '500',
                                boxShadow: 'none'
                            }}
                        >
                            ✓ Activate
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={onDeactivate}
                            style={{
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                minWidth: '90px',
                                borderRadius: '6px',
                                textTransform: 'none',
                                fontWeight: '500',
                                boxShadow: 'none'
                            }}
                        >
                            ✕ Deactivate
                        </Button>
                    </>
                )}

                {permissions.delete && (
                    <Button
                        variant="contained"
                        size="small"
                        onClick={onDelete}
                        style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            minWidth: '80px',
                            borderRadius: '6px',
                            textTransform: 'none',
                            fontWeight: '500',
                            boxShadow: 'none'
                        }}
                    >
                        🗑️ Delete
                    </Button>
                )}

                <Button
                    variant="text"
                    size="small"
                    onClick={onClear}
                    style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        minWidth: '60px',
                        borderRadius: '6px',
                        textTransform: 'none',
                        fontWeight: '500'
                    }}
                >
                    Clear
                </Button>
            </div>
        </div>
    );
};

export default BulkActionsBar;
