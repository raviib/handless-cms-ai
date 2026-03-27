"use client"
import React, { useState } from 'react'
import CreatableSelect from 'react-select/creatable';
import { useGetApi, usePostApi } from '@/app/lib/apicallHooks'
const HandleCreatableSelect = ({ url,
    postUrl,
    value,
    onChange,
    name,
    isMulti = false,
    message = "",
    getOptionLabel,
    getOptionValue,
    placeholder = "Select field",
    isClearable = false

}) => {
    const { data, isLoading, doFetch } = useGetApi(null)
    const { doPost } = usePostApi(postUrl)
    const { data: DB_FIELDS = [] } = data ?? { DB_FIELDS: [] };
    const [isCalled, setIsCalled] = useState(false)
    const handleCreate = async (inputValue) => {
        try {
            if (!postUrl) {
                return ""
            }
            const response = await doPost({ name: inputValue })
            
            // After creating, automatically select the new option
            const newOption = { [getOptionLabel]: inputValue, [getOptionValue]: inputValue }
            onChange(newOption, name, "relation")
            
            // Refresh the options list
            setIsCalled(false);
        } catch (error) {
            console.error("Error creating option:", error)
        }
    }

    return (
        <div
            onClick={() => {
                if (!isCalled) {
                    setIsCalled(true)
                    doFetch(url)
                }
            }}>

            <CreatableSelect
                placeholder={placeholder}
                getNewOptionData={inputValue => ({ [getOptionLabel]: inputValue, [getOptionValue]: inputValue })}
                className="select-field"
                classNamePrefix="select"
                isClearable={isClearable}
                options={DB_FIELDS}
                isLoading={isLoading}
                onCreateOption={handleCreate}
                value={value}
                isMulti={isMulti}
                getOptionLabel={(option) => option[getOptionLabel]}
                getOptionValue={(option) => option[getOptionValue]}
                onChange={(ele) => onChange(ele, name, "relation")}
            />

            {message && <p className='validType-msg'>{message}</p>}
        </div>
    )
}

export default HandleCreatableSelect