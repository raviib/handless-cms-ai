import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  Divider,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FieldTreeItem from './FieldTreeItem';

const FieldListSidebar = ({
  fields = [],
  onFieldClick,
  onFieldEdit,
  onFieldDelete,
  onFieldReorder,
  onAddField,
  onAddFieldToComponent
}) => {
  const [expandedComponents, setExpandedComponents] = useState(new Set());
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [draggedComponentPath, setDraggedComponentPath] = useState([]);
  const [dragOverComponentPath, setDragOverComponentPath] = useState([]);
  
  // Helper to check if a field is being dragged
  const isDraggingField = (index, componentPath = []) => {
    return draggedIndex === index && 
           JSON.stringify(draggedComponentPath) === JSON.stringify(componentPath);
  };
  
  // Helper to check if a field is drag over target
  const isDragOverField = (index, componentPath = []) => {
    return dragOverIndex === index && 
           JSON.stringify(dragOverComponentPath) === JSON.stringify(componentPath);
  };
  
  const handleToggleExpand = (fieldId) => {
    console.log('=== TOGGLE EXPAND ===');
    console.log('Field ID:', fieldId);
    console.log('Current expandedComponents:', Array.from(expandedComponents));
    
    setExpandedComponents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldId)) {
        console.log('Removing from expanded:', fieldId);
        newSet.delete(fieldId);
      } else {
        console.log('Adding to expanded:', fieldId);
        newSet.add(fieldId);
      }
      console.log('New expandedComponents:', Array.from(newSet));
      return newSet;
    });
  };
  
  const handleDragStart = (index, e, componentPath = []) => {
    e.dataTransfer.effectAllowed = 'move';
    // Store both index and component path
    e.dataTransfer.setData('text/plain', JSON.stringify({ index, componentPath }));
    setDraggedIndex(index);
    setDraggedComponentPath(componentPath);
  };
  
  const handleDragOver = (index, e, componentPath = []) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Only allow drag within the same component level
    const isSameLevel = JSON.stringify(draggedComponentPath) === JSON.stringify(componentPath);
    
    if (draggedIndex !== null && draggedIndex !== index && isSameLevel) {
      setDragOverIndex(index);
      setDragOverComponentPath(componentPath);
    }
  };
  
  const handleDrop = (dropIndex, e, componentPath = []) => {
    e.preventDefault();
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
      const dragIndex = dragData.index;
      const dragPath = dragData.componentPath || [];
      
      // Only allow reorder within the same component level
      const isSameLevel = JSON.stringify(dragPath) === JSON.stringify(componentPath);
      
      if (!isSameLevel) {
        console.log('Cannot drag between different component levels');
        return;
      }
      
      // Only trigger reorder if indices are different and callback exists
      if (dragIndex !== dropIndex && !isNaN(dragIndex) && onFieldReorder) {
        console.log('Reordering:', { dragIndex, dropIndex, componentPath });
        onFieldReorder(dragIndex, dropIndex, componentPath);
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
    
    // Reset drag state
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDraggedComponentPath([]);
    setDragOverComponentPath([]);
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDraggedComponentPath([]);
    setDragOverComponentPath([]);
  };
  
  return (
    <Paper
      elevation={0}
      sx={{
        width:'100%',
        height: '100%',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
          Fields
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {fields.length} field{fields.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
      
      {/* Scrollable List Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'divider',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }
        }}
      >
        {fields.length === 0 ? (
          <Box
            sx={{
              p: 3,
              textAlign: 'center',
              color: 'text.secondary'
            }}
          >
            <Typography variant="body2">
              No fields yet
            </Typography>
            <Typography variant="caption">
              Click "Add another field" to get started
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {fields.map((field, index) => {
              // Create unique ID for root level fields
              const fieldId = field.component_key || field.field.value;
              return (
                <FieldTreeItem
                  key={fieldId}
                  field={field}
                  index={index}
                  level={0}
                  onEdit={onFieldEdit}
                  onDelete={onFieldDelete}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  expanded={expandedComponents.has(fieldId)}
                  expandedComponents={expandedComponents}
                  onToggleExpand={handleToggleExpand}
                  isDragging={isDraggingField(index, [])}
                  isDragOver={isDragOverField(index, [])}
                  onAddFieldToComponent={onAddFieldToComponent}
                  draggedIndex={draggedIndex}
                  draggedComponentPath={draggedComponentPath}
                  dragOverIndex={dragOverIndex}
                  dragOverComponentPath={dragOverComponentPath}
                />
              );
            })}
          </List>
        )}
      </Box>
      
      <Divider />
      
      {/* Add Field Button */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddField}
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover'
            }
          }}
        >
          Add another field
        </Button>
      </Box>
    </Paper>
  );
};

export default FieldListSidebar;
