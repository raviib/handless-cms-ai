"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import RefreshIcon from '@mui/icons-material/Refresh';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useGetApi } from '@/app/lib/apicallHooks';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, IconButton, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function MultiSelectSort({ url, isClearable, isSearchable, getOptionLabel, getOptionValue, onChange, value, name, disabled, placeholder, isRefeatch = true, isDragDrop = false, autoLoad = false }) {

    const [isCalled, setIsCalled] = useState(false)
    const [isClient, setIsClient] = useState(false)
    const [previousUrl, setPreviousUrl] = useState(url)
    const [allOptions, setAllOptions] = useState([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [selectKey, setSelectKey] = useState(0) // Key to force re-render
    const [showSortModal, setShowSortModal] = useState(false)
    const [sortedItems, setSortedItems] = useState([])
    const [draggedIndex, setDraggedIndex] = useState(null)
    const requestIdRef = useRef(0)

    // Use the useGetApi hook
    const { data: apiResponse, isLoading: isLoadingMore, doFetch } = useGetApi(null, false)

    // Ensure component only renders on client to avoid hydration issues
    useEffect(() => {
        setIsClient(true)
    }, [])

    // Load initial options
    const loadInitialOptions = useCallback(async () => {
        const currentRequestId = ++requestIdRef.current;
        setIsRefreshing(true);

        try {
            const separator = url.includes('?') ? '&' : '?';
            await doFetch(`${url}${separator}page=1&limit=50`);

            // Only update if this is still the latest request
            if (currentRequestId === requestIdRef.current) {
                setIsRefreshing(false);
            }
        } catch (error) {
            console.error('Error loading initial options:', error);
            if (currentRequestId === requestIdRef.current) {
                setIsRefreshing(false);
            }
        }
    }, [url, doFetch]);

    // Auto-load options if autoLoad is true or if there's a persisted value
    useEffect(() => {
        if (isClient && autoLoad && !isCalled && !disabled) {
            setIsCalled(true)
            loadInitialOptions()
        }
    }, [isClient, autoLoad, isCalled, disabled, loadInitialOptions])

    // Load initial options when there's a value but no options loaded yet
    useEffect(() => {
        if (isClient && value[name] && Array.isArray(value[name]) && value[name].length > 0 && allOptions.length === 0 && !isCalled && !disabled) {
            setIsCalled(true)
            loadInitialOptions()
        }
    }, [isClient, value, name, allOptions.length, isCalled, disabled, loadInitialOptions])

    // Handle API response
    useEffect(() => {
        if (apiResponse?.success && apiResponse?.data) {
            setAllOptions(apiResponse.data);
            setPage(apiResponse.pagination?.page || 1);
            setHasMore(apiResponse.pagination?.hasMore || false);
        }
    }, [apiResponse]);

    // Refetch when URL changes (e.g., when dependency field value changes)
    useEffect(() => {
        if (url !== previousUrl && isCalled) {
            setPreviousUrl(url)
            setAllOptions([])
            setPage(1)
            setHasMore(true)
            setSelectKey(prev => prev + 1) // Force AsyncSelect to reset on URL change
            if (!disabled) {
                loadInitialOptions()
            }
        }
    }, [url, previousUrl, isCalled, disabled, loadInitialOptions])

    // Load more options (for pagination)
    const loadMoreOptions = useCallback(async () => {
        if (!hasMore || isLoadingMore) return;

        const separator = url.includes('?') ? '&' : '?';
        const nextPage = page + 1;
        const apiUrl = `${url}${separator}page=${nextPage}&limit=50`;

        try {
            const Token = await import('@/app/lib/auth.improved.js').then(m => m.generateApiAccessToken());
            const { axiosInstance } = await import('@/app/config/axiosInstance');
            const config = { headers: { Authorization: `Bearer ${Token}` } };
            const { data: result } = await axiosInstance.get(apiUrl, config);

            if (result.success && result.data) {
                setAllOptions(prev => [...prev, ...result.data]);
                setPage(result.pagination?.page || nextPage);
                setHasMore(result.pagination?.hasMore || false);
            }
        } catch (error) {
            console.error('Error loading more options:', error);
        }
    }, [hasMore, isLoadingMore, url, page]);

    // Load options with search
    const loadOptions = useCallback(async (inputValue) => {
        try {
            const separator = url.includes('?') ? '&' : '?';
            const searchParam = inputValue ? `&search=${encodeURIComponent(inputValue)}` : '';
            const apiUrl = `${url}${separator}page=1&limit=50${searchParam}`;

            const Token = await import('@/app/lib/auth.improved.js').then(m => m.generateApiAccessToken());
            const { axiosInstance } = await import('@/app/config/axiosInstance');
            const config = { headers: { Authorization: `Bearer ${Token}` } };
            const { data: result } = await axiosInstance.get(apiUrl, config);

            if (result.success && result.data) {
                return result.data;
            }
            return [];
        } catch (error) {
            console.error('Error searching options:', error);
            return [];
        }
    }, [url]);

    // Handle menu scroll to load more
    const handleMenuScrollToBottom = () => {
        if (hasMore && !isLoadingMore) {
            loadMoreOptions();
        }
    };

    // Generate stable instanceId based on name to avoid hydration mismatches
    const instanceId = `multiselect-${name || 'default'}`

    // Open sort modal
    const handleOpenSortModal = () => {
        const selectedValues = value[name] || [];
        setSortedItems([...selectedValues]);
        setShowSortModal(true);
    };

    // Handle drag start
    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    // Handle drag over
    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const items = Array.from(sortedItems);
        const draggedItem = items[draggedIndex];

        items.splice(draggedIndex, 1);
        items.splice(index, 0, draggedItem);

        setSortedItems(items);
        setDraggedIndex(index);
    };

    // Handle drag end
    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    // Save sorted items
    const handleSaveSortedItems = () => {
        onChange(sortedItems, name, "relation");
        setShowSortModal(false);
    };

    // Remove item from sorted list
    const handleRemoveItem = (index) => {
        const items = sortedItems.filter((_, i) => i !== index);
        setSortedItems(items);
    };

    const MultiSelect = useMemo(() => {
        if (!isClient) return null

        // Use AsyncSelect for searchable, regular Select for non-searchable
        if (isSearchable) {
            return (
                <AsyncSelect
                    key={selectKey}
                    instanceId={instanceId}
                    isMulti
                    cacheOptions
                    defaultOptions={allOptions}
                    loadOptions={loadOptions}
                    placeholder={placeholder ?? "Select..."}
                    value={value[name]}
                    onChange={(ele) => onChange(ele, name, "relation")}
                    isClearable={isClearable}
                    getOptionLabel={getOptionLabel}
                    getOptionValue={getOptionValue}
                    isDisabled={disabled}
                    closeMenuOnSelect={false}
                    onMenuScrollToBottom={handleMenuScrollToBottom}
                    noOptionsMessage={() => "No options found"}
                />
            );
        }

        return (
            <Select
                key={selectKey}
                instanceId={instanceId}
                isMulti
                options={allOptions}
                placeholder={placeholder ?? "Select..."}
                value={value[name]}
                onChange={(ele) => onChange(ele, name, "relation")}
                isClearable={isClearable}
                getOptionLabel={getOptionLabel}
                getOptionValue={getOptionValue}
                isLoadingMore={isLoadingMore}
                isLoading={isRefreshing}
                isDisabled={disabled}
                closeMenuOnSelect={false}
                onMenuScrollToBottom={handleMenuScrollToBottom}
                noOptionsMessage={() => "No options found"}
            />
        );
    }, [isClient, instanceId, value[name], allOptions, isClearable, isSearchable, getOptionLabel, getOptionValue, disabled, placeholder, loadOptions, hasMore, isLoadingMore, selectKey])

    return (
        <>
            <div className='select-box-loader' onClick={() => {
                if (!isCalled) {
                    setIsCalled(true)
                    if (!disabled) {
                        loadInitialOptions()
                    }
                }
            }}>
                {MultiSelect}
                <div style={{ display: 'flex', gap: '2px', width: "10%" }}>
                    {/* Drag and Drop Icon */}
                    {isDragDrop && value[name] && value[name].length > 0 && (
                        <span
                            className="reload-icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!disabled) {
                                    handleOpenSortModal();
                                }
                            }}
                            style={{
                                cursor: disabled ? 'not-allowed' : 'pointer',
                                opacity: disabled ? 0.5 : 1
                            }}
                            title="Sort selected items"
                        >
                            <DragIndicatorIcon fontSize="small" />
                        </span>
                    )}

                    {/* Refresh Icon */}
                    {isRefeatch && (
                        <span
                            className={`reload-icon ${(isLoadingMore || isRefreshing) ? "rotate" : ""}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isLoadingMore || isRefreshing) return;

                                setAllOptions([])
                                setPage(1)
                                setHasMore(true)
                                setSelectKey(prev => prev + 1)
                                loadInitialOptions()
                            }}
                            style={{
                                cursor: (isLoadingMore || isRefreshing) ? 'not-allowed' : 'pointer',
                                opacity: (isLoadingMore || isRefreshing) ? 0.5 : 1
                            }}
                            title="Refresh options"
                        >
                            <RefreshIcon fontSize="small" />
                        </span>
                    )}
                </div>
            </div>

            {/* Sort Modal */}
            <Dialog
                open={showSortModal}
                onClose={() => setShowSortModal(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Sort Selected Items
                    <IconButton
                        onClick={() => setShowSortModal(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {sortedItems.length === 0 ? (
                        <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                            No items selected
                        </Typography>
                    ) : (
                        <List sx={{ bgcolor: 'background.paper' }}>
                            {sortedItems.map((item, index) => (
                                <ListItem
                                    key={getOptionValue(item)}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    sx={{
                                        mb: 1,
                                        bgcolor: draggedIndex === index ? 'action.hover' : 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        cursor: 'grab',
                                        '&:active': {
                                            cursor: 'grabbing'
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', cursor: 'grab' }}>
                                        <DragIndicatorIcon color="action" />
                                    </Box>
                                    <Typography sx={{ flex: 1 }}>
                                        {getOptionLabel(item)}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleRemoveItem(index)}
                                        color="error"
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowSortModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveSortedItems}
                        variant="contained"
                        disabled={sortedItems.length === 0}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
