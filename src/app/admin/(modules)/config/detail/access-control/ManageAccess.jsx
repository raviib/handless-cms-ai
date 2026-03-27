"use client";
import Checkbox from '@mui/material/Checkbox';
import { useEffect, useMemo, useState, useCallback } from 'react';

const ManageAccess = ({ items, index, updatePermissions, HeadingName, setHeadingName }) => {

    const PermissionsList = ["view", "create", "edit", "delete"];
    const [Permissions, setPermission] = useState(items);

    // 🔥 useCallback (prevents re-creation on every render)
    const handleChange = useCallback((event, name) => {

        if (name === 'view') {
            if (event.target.checked) {
                setPermission((pre) => ({
                    ...pre,
                    [name]: event.target.checked
                }));
            } else {
                setPermission({ view: false, create: false, edit: false, delete: false });
            }
        } else {
            if (!Permissions['view']) return false;

            setPermission((pre) => ({
                ...pre,
                [name]: event.target.checked
            }));
        }

    }, [Permissions]);

    const AllSet = useCallback((isChecked) => {
        setPermission({
            view: isChecked,
            create: isChecked,
            edit: isChecked,
            delete: isChecked
        });
    }, []);

    const isAllChecked = useCallback(() => {
        return ["view", "create", "edit", "delete"].every((v) => Permissions[v] === true);
    }, [Permissions]);

    // ⭐ FIX — include index + updatePermissions by using useCallback above
    useEffect(() => {
        updatePermissions(index, Permissions);
    }, [index, updatePermissions, Permissions]);


    // ⭐ FIX — include all used dependencies
    const Component_Data = useMemo(() => (
        <>
            <tr key={items._id}>
                <td>
                    <>
                        <Checkbox
                            checked={isAllChecked()}
                            onChange={(event) => AllSet(event.target.checked)}
                            inputProps={{ 'aria-label': 'controlled' }}
                        />
                        {items.name}
                    </>
                </td>

                {PermissionsList.map((name) => (
                    <td key={name}>
                        <Checkbox
                            checked={Permissions[name]}
                            onChange={(ele) => handleChange(ele, name)}
                            inputProps={{ 'aria-label': 'controlled' }}
                        />
                    </td>
                ))}
            </tr>
        </>
    ), [Permissions, PermissionsList, items._id, items.name, handleChange, isAllChecked, AllSet]);

    return <>{Component_Data}</>;
};

export default ManageAccess;
