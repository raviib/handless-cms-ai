/* eslint-disable react-hooks/rules-of-hooks */
"use client"
import React, { useEffect, useState, useCallback } from 'react'
import Breadcrumb from "@/app/components/admin/breadcrumb";
import TableSkeleton from '@/app/components/admin/TableSkeleton';
import { useGetApi, usePutApi } from '@/app/lib/apicallHooks';
import "@/app/styles/admin/admin_table.scss"
import ManageAccess from "../ManageAccess"
import { AdminCommonHeading, LoadingButton } from '@/app/components/admin/common';
const EditRbac = ({ slug, searchParams }) => {
    const [HeadingName, setHeadingName] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const { isLoading: LoadingPut, doPutRedirect } = usePutApi(`/administrator/rbac/${slug}`)
    const onChangeFormDataHandler = (e) => {
        setFormData((pre) => ({
            ...pre,
            [e.target.name]: e.target.value
        }))
    }
    const [permissionsData, setPermissionsData] = useState([]);


    const breadcrumb_ = [

        {
            Name: "config",
            link: `/admin/config/detail/access-control`
        },
        {
            Name: "detail",
            link: `/admin/config/detail/access-control`
        },
        {
            Name: "access control",
            link: `/admin/config/detail/access-control`
        },
        {
            Name: "Edit",
            link: ``
        }
    ]
    const {
        data: sectionDeatilsData,
        isLoading,
    } = useGetApi(`/administrator/rbac/${slug}`);
    const { data: sectionDeatils } = sectionDeatilsData ?? {};

    const updatePermissions = useCallback((index, newPermissions) => {
        setPermissionsData((prevPermissions) => {
            const updatedPermissions = [...prevPermissions];
            updatedPermissions[index] = { ...updatedPermissions[index], ...newPermissions };
            return updatedPermissions;
        });
    }, []);
    useEffect(() => {
        if (sectionDeatils && sectionDeatils.permissions && sectionDeatils.permissions.length > 0) {
            setFormData({
                name: sectionDeatils.name,
                description: sectionDeatils.description
            })
            setPermissionsData(sectionDeatils.permissions)
        }
    }, [sectionDeatils])


    const submitHandler = async () => {
        const data = {
            ...formData,
            permissions: permissionsData.map(data => {
                return {
                    create: data.create,
                    delete: data.delete,
                    edit: data.edit,
                    view: data.view,
                    access_of: data.access_of,
                }
            })

        }
        try {
            doPutRedirect(data, false, '/admin/config/detail/access-control')
        } catch (error) {

        }
    }
    return (
        <>
            <Breadcrumb styleClass="dark-bg" links={breadcrumb_} />
            <div className='admin-form'>
                <div className='admin-form-section panel'>
                    <AdminCommonHeading Heading={"access control"} key={"access control"} />
                    <div className={`col-12`}>
                        <label className={`form-label starlabel`}>role Name</label>
                        <input required={true} type="text" className="form-control" autoFocus placeholder={"enter role Name"} name={"name"} key={"name"} onChange={onChangeFormDataHandler} value={formData["name"] || ''} />
                    </div>
                    <div className={`col-12`}>
                        <label className={`form-label starlabel`}>description</label>
                        <textarea required={true} type="text" className="form-control" autoFocus placeholder={"enter description"} name={"description"} key={"description"} onChange={onChangeFormDataHandler} value={formData["description"] || ''} />
                    </div>
                </div>
            </div>
            <div className='table-container panel'>
                <div className='d-flex'>
                    <h3 className='table-heading'>Roles</h3>
                </div>
                {isLoading ?
                    <>
                        <TableSkeleton />
                    </> :
                    <>

                        <div className="admin-table-section table-height-normal">
                            <table className="admin-table" cellPadding={0} cellSpacing={0}>
                                <thead>
                                    <tr id="table-Heading">
                                        {/* <th>ID</th> */}
                                        <th>Name</th>
                                        <th>view</th>
                                        <th>Create</th>
                                        <th>Edit</th>
                                        <th>Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {permissionsData &&
                                        permissionsData.length > 0 &&
                                        permissionsData.map((ele, index) => {
                                            return (
                                                <ManageAccess
                                                    items={ele}
                                                    key={index}
                                                    index={index}
                                                    HeadingName={HeadingName}
                                                    setHeadingName={setHeadingName}
                                                    updatePermissions={updatePermissions}
                                                />
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>

                    </>

                }
            </div>
            {<LoadingButton
                // loading={LoadingPut || LoadingPost}
                submitHandler={submitHandler} />}
        </>
    )
}

export default EditRbac