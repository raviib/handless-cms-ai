"use client";
import { FormControl, InputLabel, Select, MenuItem, Chip, Box } from '@mui/material';
import SelectBox from '@/app/components/admin/extra/SelectBox';
import MultiSelectSort from "@/app/components/admin/extra/MultiSelectSort";

const FilterDropdowns = ({ filters, setFilters, DropDownFilters }) => {
    const handleChange = (data, name) => {
        setFilters(prev => ({ ...prev, [name]: data }));
    };

    const renderEnumerationFilter = (data, index) => {
        const options = data.option_value
            ? data.option_value.split(',').map(opt => opt.trim())
            : [];

        // Multiple enumeration
        if (data.enumeration_type === 'multiple') {
            return (
                <FormControl key={index} size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>{data?.placeholder || `Select ${data.Printvalue}`}</InputLabel>
                    <Select
                        multiple
                        value={filters[data.field] || []}
                        onChange={(e) => setFilters(prev => ({
                            ...prev,
                            [data.field]: e.target.value
                        }))}
                        label={data?.placeholder || `Select ${data.Printvalue}`}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={value} size="small" />
                                ))}
                            </Box>
                        )}
                    >
                        {options.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            );
        }

        // Single enumeration
        return (
            <FormControl key={index} size="small" sx={{ minWidth: 200 }}>
                <InputLabel>{data?.placeholder || `Select ${data.Printvalue}`}</InputLabel>
                <Select
                    value={filters[data.field] || ''}
                    onChange={(e) => setFilters(prev => ({
                        ...prev,
                        [data.field]: e.target.value || null
                    }))}
                    label={data?.placeholder || `Select ${data.Printvalue}`}
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    {options.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    };

    const renderRelationFilter = (data, index) => {
        const isMultiple = data.isMultiple === true || data.isMultiple === 'true';
        
        // Build URL with dependency filter if dependency_field exists
        let apiUrl = data.api_end_point;
        if (data.dependency_field) {
            const dependencyValue = filters[data.dependency_field];
            if (dependencyValue) {
                // Extract the ID value (handle both object and string)
                const filterValue = typeof dependencyValue === 'object' 
                    ? dependencyValue[data.getOptionValue || '_id']
                    : dependencyValue;
                
                if (filterValue) {
                    // Use dependency_field_target if specified, otherwise use dependency_field
                    const targetFieldName = data.dependency_field_target || data.dependency_field;
                    
                    // Add filter parameter to URL
                    const separator = apiUrl.includes('?') ? '&' : '?';
                    apiUrl = `${apiUrl}${separator}filters[${targetFieldName}][$eq]=${filterValue}`;
                }
            }
        }

        if (isMultiple) {
            return (
                <MultiSelectSort
                    key={`${data.field}-${index}`}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={true}
                    placeholder={data?.placeholder || `Select ${data.Printvalue}`}
                    isSearchable={true}
                    onChange={handleChange}
                    value={filters}
                    getOptionLabel={(option) => option[data.getOptionLabel]}
                    getOptionValue={(option) => option[data.getOptionValue]}
                    url={apiUrl}
                    name={data.field}
                    isRefeatch={false}
                    autoLoad={true}
                />
            );
        }

        return (
            <SelectBox
                key={`${data.field}-${index}`}
                placeholder={data.placeholder || `Select ${data.Printvalue}`}
                isSearchable={true}
                onChange={handleChange}
                isClearable={true}
                value={filters}
                getOptionLabel={(option) => option[data.getOptionLabel]}
                getOptionValue={(option) => option[data.getOptionValue]}
                url={apiUrl}
                name={data.field}
                isRefeatch={false}
                autoLoad={true}
            />
        );
    };

    return (
        <>
            {DropDownFilters.map((data, index) => {
                if (data.type === 'enumeration') {
                    return renderEnumerationFilter(data, index);
                }
                
                if (data.type === 'relation') {
                    return renderRelationFilter(data, index);
                }
                
                return null;
            })}
        </>
    );
};

export default FilterDropdowns;
