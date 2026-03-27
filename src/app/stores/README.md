# Table Filters Store

This Zustand store persists table filters, pagination, and search state across navigation.

## Features

- Persists filters, pagination, search input, and date ranges
- Stores state per page (e.g., "cms-banner", "cms-about-us")
- Uses localStorage for persistence
- Automatically restores state when returning to a table
- Auto-loads filter dropdown options when persisted values exist

## Usage

The store is automatically used in `Admin_Services_Table.js`. When you:

1. Navigate from table → detail page → back to table
2. The filters, pagination, and search state are preserved
3. Filter dropdowns automatically load their options and display selected values
4. Click "Reset" to clear persisted state

## How It Works

### State Persistence
- When you change any filter, pagination, or search value, it's automatically saved to localStorage
- Each page has its own isolated state (identified by `folder-page` key)

### Filter Restoration
- When you return to a table, the store retrieves the persisted state
- Filter dropdowns (SelectBox, MultiSelectSort) automatically detect persisted values
- They auto-load their options to display the selected values correctly
- Enumeration filters (dropdowns) immediately show selected values

## Store Methods

- `getPageState(pageKey)` - Get persisted state for a page
- `setPageState(pageKey, state)` - Update state for a page
- `clearPageState(pageKey)` - Clear state for a specific page
- `clearAllStates()` - Clear all persisted states

## Persisted State

For each page, the following is persisted:
- `Tabs` - Active tab
- `filters` - Dropdown filters (both enumeration and relation types)
- `advancedFilters` - Advanced filter values
- `StartDate` - Start date filter
- `EndDate` - End date filter
- `pagination` - Current page number
- `rowsPerPage` - Items per page
- `inputData` - Search input value

## Technical Details

### Auto-loading Filter Options
- `SelectBox` and `MultiSelectSort` components now accept an `autoLoad` prop
- When `autoLoad={true}`, options are loaded immediately on mount
- Additionally, if a persisted value exists but options aren't loaded, they auto-load
- This ensures selected values are always visible when returning to the page
