"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
const ManageAccess = ({ items, index, updatePermissions, HeadingName, setHeadingName }) => {
    const PermissionsList = ["get", "create", "edit", "delete"]
    const [Permissions, setPermission] = useState(items)
    const handleChange = (event, name) => {
        setPermission((pre) => {
            return {
                ...pre,
                [name]: event.target.checked
            }
        })
    };
    const AllSet = (isChecked) => {
        setPermission({
            get: isChecked,
            create: isChecked,
            edit: isChecked,
            delete: isChecked
        })
    }
    const isAllChecked = () => {
        const isChecked = Object.values(Permissions).every((values) => values === true)
        return isChecked
    }
    useEffect(() => {
        // Whenever Permissions state changes, update it in the parent component
        updatePermissions(index, Permissions);
    }, [Permissions]);

    const Component_Data = useMemo(
        () => (

            <>
                <tr key={items._id}>
                    <td>
                        <>
                            <Checkbox
                                checked={isAllChecked()}
                                onChange={(event) => AllSet(event.target.checked)}
                                inputProps={{ 'aria-label': 'controlled' }}
                            />
                            {
                                items.name
                            }
                        </>
                    </td>
                    {
                        PermissionsList.map((name) => {
                            return (<>
                                <td>

                                    <Checkbox
                                        checked={Permissions[name]}
                                        onChange={(ele) => handleChange(ele, name)}
                                        inputProps={{ 'aria-label': 'controlled' }}
                                    />
                                </td>
                            </>)
                        })
                    }
                </tr>
            </>
        ),
        [Permissions]
    );
    return (<>
        {Component_Data}
    </>)
}

export default ManageAccess