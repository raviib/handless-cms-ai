import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExtensionIcon from '@mui/icons-material/Extension';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const ActiveContextBanner = ({ componentPath = [], onClose }) => {
  if (!componentPath || componentPath.length === 0) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        p: 2,
        bgcolor: '#e3f2fd',
        border: '1px solid #90caf9',
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <ExtensionIcon sx={{ color: '#1976d2', fontSize: 24 }} />
        
        <Box>
          <Typography variant="caption" sx={{ color: '#1565c0', fontWeight: 600, display: 'block' }}>
            ACTIVE CONTEXT
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <Typography variant="body2" sx={{ color: '#0d47a1', fontWeight: 500 }}>
              Component:
            </Typography>
            {componentPath.map((component, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <ChevronRightIcon sx={{ fontSize: 16, color: '#1976d2' }} />
                )}
                <Chip
                  label={component}
                  size="small"
                  sx={{
                    bgcolor: '#1976d2',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    height: 24
                  }}
                />
              </React.Fragment>
            ))}
          </Box>
          
          <Typography variant="caption" sx={{ color: '#1565c0', mt: 0.5, display: 'block' }}>
            Fields added will be nested inside this component
          </Typography>
        </Box>
      </Box>
      
      <IconButton
        size="small"
        onClick={onClose}
        sx={{
          color: '#1976d2',
          '&:hover': {
            bgcolor: '#bbdefb'
          }
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
};

export default ActiveContextBanner;
