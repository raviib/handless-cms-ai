"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncSelect from 'react-select/async';
import Select from "react-select";
import RefreshIcon from '@mui/icons-material/Refresh';
import { useGetApi } from '@/app/lib/apicallHooks';

const SelectBox = ({ url, getOptionLabel, getOptionValue, value, isSearchable, placeholder, onChange, name, isMulti = false, disabled = false, isRefeatch = true, isClearable = false, autoLoad = false }) => {
    const [isCalled, setIsCalled] = useState(false)
    const [isClient, setIsClient] = useState(false)
    const [previousUrl, setPreviousUrl] = useState(url)
    const [allOptions, setAllOptions] = useState([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [selectKey, setSelectKey] = useState(0) // Key to force re-render
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
        if (isClient && value[name] && allOptions.length === 0 && !isCalled && !disabled) {
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
        
        // Fetch next page
        const response = await doFetch(apiUrl);
        
        // The response will be handled by the useEffect above, but we need to append data
        // So we'll handle it differently here
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
    }, [hasMore, isLoadingMore, url, page, doFetch]);

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
    const instanceId = `select-${name || 'default'}`

    const SelectComponent = useMemo(() => {
        if (!isClient) return null;
        
        // Use AsyncSelect for searchable, regular Select for non-searchable
        if (isSearchable) {
            return (
                <AsyncSelect
                    key={selectKey} // Force re-render on refresh
                    instanceId={instanceId}
                    className="select-field"
                    classNamePrefix="select"
                    placeholder={placeholder}
                    isClearable={isClearable}
                    cacheOptions
                    defaultOptions={allOptions}
                    loadOptions={loadOptions}
                    onChange={(ele) => onChange(ele, name, "relation")}
                    value={value[name]}
                    getOptionLabel={getOptionLabel}
                    getOptionValue={getOptionValue}
                    isMulti={isMulti}
                    isDisabled={disabled}
                    onMenuScrollToBottom={handleMenuScrollToBottom}
                    noOptionsMessage={() => "No options found"}
                />
            );
        }
        
        return (
            <Select
                key={selectKey} // Force re-render on refresh
                instanceId={instanceId}
                className="select-field"
                classNamePrefix="select"
                placeholder={placeholder}
                isClearable={isClearable}
                onChange={(ele) => onChange(ele, name, "relation")}
                value={value[name]}
                options={allOptions}
                getOptionLabel={getOptionLabel}
                getOptionValue={getOptionValue}
                isMulti={isMulti}
                isDisabled={disabled}
                onMenuScrollToBottom={handleMenuScrollToBottom}
                noOptionsMessage={() => "No options found"}
            />
        );
    }, [isClient, instanceId, value[name], allOptions, placeholder, isClearable, isSearchable, onChange, name, getOptionLabel, getOptionValue, isMulti, disabled, loadOptions, hasMore, isLoadingMore, selectKey])
    
    return (
        <div
            className='select-box-loader'
            onClick={() => {
                if (!isCalled) {
                    setIsCalled(true)
                    if (!disabled) {
                        loadInitialOptions()
                    }
                }
            }}>
            {SelectComponent}
            {isRefeatch && <span 
                className={`reload-icon ${(isLoadingMore || isRefreshing) ? "rotate" : ""}`}
                onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering parent onClick
                    if (isLoadingMore || isRefreshing) return; // Prevent multiple clicks
                    setPage(1)
                    setHasMore(true)
                    setSelectKey(prev => prev + 1) // Force AsyncSelect to reset
                    loadInitialOptions()
                }}
                style={{ 
                    cursor: (isLoadingMore || isRefreshing) ? 'not-allowed' : 'pointer',
                    opacity: (isLoadingMore || isRefreshing) ? 0.5 : 1
                }}
            > <RefreshIcon fontSize="small" /></span>}
        </div>
    )
}

export default SelectBox
