# Admin Table Components

This directory contains reusable sub-components for the Admin Services Table.

## Components

### FilterDropdowns.jsx
Handles rendering of filter dropdowns for enumeration and relation fields.

**Props:**
- `filters` - Current filter state object
- `setFilters` - Function to update filters
- `DropDownFilters` - Array of filter configurations

**Features:**
- Supports single and multiple enumeration filters
- Supports single and multiple relation filters
- Uses MUI Select for enumerations
- Uses custom SelectBox/MultiSelectSort for relations

### BulkActionsBar.jsx
Displays the bulk actions bar when items are selected.

**Props:**
- `selectedCount` - Number of selected items
- `onActivate` - Handler for bulk activate
- `onDeactivate` - Handler for bulk deactivate
- `onDelete` - Handler for bulk delete
- `onClear` - Handler to clear selection
- `permissions` - Access permissions object

**Features:**
- Shows selected item count
- Conditional rendering based on permissions
- Styled with gradient background
- Responsive button layout

## Usage Example

```jsx
import FilterDropdowns from './components/FilterDropdowns';
import BulkActionsBar from './components/BulkActionsBar';

// In your component
<FilterDropdowns
    filters={filters}
    setFilters={setFilters}
    DropDownFilters={DropDownFilters}
/>

<BulkActionsBar
    selectedCount={selectedItems.length}
    onActivate={handleBulkActivate}
    onDeactivate={handleBulkDeactivate}
    onDelete={handleBulkDelete}
    onClear={clearSelection}
    permissions={Access_Permissions}
/>
```
