import React from 'react';
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Box,
  Collapse,
  List,
  Button,
  Stack,
  Typography
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import NumbersIcon from '@mui/icons-material/Numbers';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import CodeIcon from '@mui/icons-material/Code';
import ExtensionIcon from '@mui/icons-material/Extension';
import ArticleIcon from '@mui/icons-material/Article';

const getFieldTypeIcon = (type) => {
  const iconMap = {
    'text': <TextFieldsIcon fontSize="small" />,
    'number': <NumbersIcon fontSize="small" />,
    'date': <CalendarTodayIcon fontSize="small" />,
    'boolean': <CheckBoxIcon fontSize="small" />,
    'email': <EmailIcon fontSize="small" />,
    'password': <LockIcon fontSize="small" />,
    'enumeration': <ListAltIcon fontSize="small" />,
    'media': <ImageIcon fontSize="small" />,
    'relation': <LinkIcon fontSize="small" />,
    'uid': <FingerprintIcon fontSize="small" />,
    'json': <CodeIcon fontSize="small" />,
    'component': <ExtensionIcon fontSize="small" />,
    'rich-text-blocks': <ArticleIcon fontSize="small" />,
    'rich-text-markdown': <ArticleIcon fontSize="small" />
  };
  
  return iconMap[type] || <TextFieldsIcon fontSize="small" />;
};

const FieldTreeItem = ({
  field,
  index,
  level = 0,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  expanded = false,
  expandedComponents = new Set(),
  onToggleExpand,
  isDragging = false,
  isDragOver = false,
  onAddFieldToComponent,
  parentComponentPath = [], // Track the path from parent components
  draggedIndex = null,
  draggedComponentPath = [],
  dragOverIndex = null,
  dragOverComponentPath = []
}) => {
  const hasNestedFields = field.type === 'component' && field.fields && field.fields.length > 0;
  const isComponent = field.type === 'component';
  const canExpand = isComponent; // Components can always be expanded, even if empty
  
  // Build the full component path for this field
  const fieldKey = field.component_key || field.field?.value;
  const currentComponentPath = isComponent 
    ? [...parentComponentPath, fieldKey]
    : parentComponentPath;
  
  // Create a unique ID for this field that includes the full path
  // This ensures nested components with the same name are tracked separately
  const uniqueFieldId = parentComponentPath.length > 0 
    ? [...parentComponentPath, fieldKey].join('.')  // e.g., "tab.tab.tab"
    : fieldKey;  // e.g., "tab"
  
  // Check if THIS specific component is expanded using its unique ID
  const isThisComponentExpanded = expandedComponents.has(uniqueFieldId);
  
  // Debug logging for components
  if (isComponent) {
    console.log('Component Field:', {
      name: field.Printvalue || field.field?.label,
      type: field.type,
      component_type: field.component_type,
      component_key: field.component_key,
      hasFields: !!field.fields,
      fieldsLength: field.fields?.length || 0,
      fields: field.fields,
      parentPath: parentComponentPath,
      currentPath: currentComponentPath,
      uniqueId: uniqueFieldId,
      isExpanded: isThisComponentExpanded,
      expandedProp: expanded
    });
  }
  
  const handleDragStart = (e) => {
    e.stopPropagation();
    if (onDragStart) {
      // Pass both index and component path for nested drag and drop
      onDragStart(index, e, parentComponentPath);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDragOver) {
      onDragOver(index, e, parentComponentPath);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDrop) {
      onDrop(index, e, parentComponentPath);
    }
  };
  
  const handleDragEnd = (e) => {
    e.stopPropagation();
    if (onDragEnd) {
      onDragEnd(e);
    }
  };
  
  const handleToggleExpand = (e) => {
    e.stopPropagation();
    if (onToggleExpand) {
      console.log('Toggle expand for:', uniqueFieldId, 'Current state in Set:', expandedComponents.has(uniqueFieldId));
      onToggleExpand(uniqueFieldId);
    }
  };
  
  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      // Pass both field and parent component path for proper context
      onEdit(field, parentComponentPath);
    }
  };
  
  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      // Pass both field ID and parent component path for proper deletion
      onDelete(field.field.value, parentComponentPath);
    }
  };
  
  return (
    <>
      <ListItem
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
        sx={{
          pl: level * 3 + 1,
          cursor: 'grab',
          opacity: isDragging ? 0.5 : 1,
          backgroundColor: isDragOver ? 'action.hover' : 'transparent',
          borderLeft: isDragOver ? '3px solid primary.main' : 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'action.hover'
          },
          '&:active': {
            cursor: 'grabbing'
          }
        }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          <DragIndicatorIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        </ListItemIcon>
        
        {canExpand && (
          <IconButton 
            size="small" 
            onClick={handleToggleExpand}
            sx={{ mr: 1 }}
          >
            {isThisComponentExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        )}
        
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {field.Printvalue || field.field.label}
              </Typography>
            </Box>
          }
          secondary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {field.type === 'component' && field.component_type 
                  ? `${field.component_type === 'repeatable' ? 'Repeatable' : 'Single'} Component`
                  : field.type.charAt(0).toUpperCase() + field.type.slice(1)
                }
              </Typography>
              {field.type === 'component' && field.component_key && (
                <Typography variant="caption" sx={{ color: 'primary.main' }}>
                  ({field.component_key})
                </Typography>
              )}
            </Box>
          }
          primaryTypographyProps={{
            fontSize: '0.875rem',
            fontWeight: 500
          }}
        />
        
        <ListItemSecondaryAction>
          <IconButton 
            size="small" 
            onClick={handleEdit}
            sx={{ mr: 0.5 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={handleDelete}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
      
      {isComponent && (
        <Collapse in={isThisComponentExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {hasNestedFields && field.fields.map((nestedField, nestedIndex) => {
              // Build unique ID for nested field including full path
              const nestedComponentKey = nestedField.component_key || nestedField.field?.value;
              const nestedUniqueId = [...currentComponentPath, nestedComponentKey].join('.');
              const isNestedExpanded = expandedComponents.has(nestedUniqueId);
              
              // Check if this nested field is being dragged or is drag over target
              const isNestedDragging = draggedIndex === nestedIndex && 
                                      JSON.stringify(draggedComponentPath) === JSON.stringify(currentComponentPath);
              const isNestedDragOver = dragOverIndex === nestedIndex && 
                                      JSON.stringify(dragOverComponentPath) === JSON.stringify(currentComponentPath);
              
              console.log('Rendering nested field:', {
                nestedComponentKey,
                nestedUniqueId,
                isNestedExpanded,
                currentPath: currentComponentPath,
                isNestedDragging,
                isNestedDragOver
              });
              
              return (
                <FieldTreeItem
                  key={nestedUniqueId}
                  field={nestedField}
                  index={nestedIndex}
                  level={level + 1}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  onDragEnd={onDragEnd}
                  expanded={isNestedExpanded}
                  expandedComponents={expandedComponents}
                  onToggleExpand={onToggleExpand}
                  isDragging={isNestedDragging}
                  isDragOver={isNestedDragOver}
                  onAddFieldToComponent={onAddFieldToComponent}
                  parentComponentPath={currentComponentPath}
                  draggedIndex={draggedIndex}
                  draggedComponentPath={draggedComponentPath}
                  dragOverIndex={dragOverIndex}
                  dragOverComponentPath={dragOverComponentPath}
                />
              );
            })}
            
            {/* Add Field Button for Component - Strapi Style */}
            <ListItem
              sx={{
                pl: (level + 1) * 3 + 1,
                py: 1.5,
                '&:hover': {
                  bgcolor: 'transparent'
                }
              }}
            >
              <Stack 
                direction="row" 
                alignItems="center" 
                spacing={1.5}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover .add-icon': {
                    bgcolor: 'primary.main',
                    color: 'white'
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAddFieldToComponent) {
                    // Pass the field with its full component path
                    onAddFieldToComponent(field, currentComponentPath);
                  }
                }}
              >
                <Box
                  className="add-icon"
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: 'action.hover',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    border: '2px solid',
                    borderColor: 'divider'
                  }}
                >
                  <AddCircleOutlineIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    userSelect: 'none'
                  }}
                >
                  Add another field to this component
                </Typography>
              </Stack>
            </ListItem>
          </List>
        </Collapse>
      )}
    </>
  );
};

export default FieldTreeItem;
