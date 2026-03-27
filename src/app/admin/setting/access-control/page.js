/* eslint-disable react-hooks/rules-of-hooks */
"use client"
import React, { useEffect, useState, useCallback } from 'react'
import Breadcrumb from "@/app/components/admin/breadcrumb";
import TableSkeleton from '@/app/components/admin/TableSkeleton';
import { useGetApi, usePostApi } from '@/app/lib/apicallHooks';
import "@/app/styles/admin/admin_table.scss"
import ManageAccess from "./ManageAccess"
import { AdminCommonHeading, LoadingButton } from '@/app/components/admin/common';
const page = ({ searchParams }) => {
    const [HeadingName, setHeadingName] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const { isLoading: LoadingPut, doPost } = usePostApi("/administrator/rbac")
    const onChangeFormDataHandler = (e) => {
        setFormData((pre) => ({
            ...pre,
            [e.target.name]: e.target.value
        }))
    }
    const [permissionsData, setPermissionsData] = useState([]);
    const list = [
        { Name: "setting", link: "" },
        { Name: "pages conf", link: "" },
    ]
    const {
        data: sectionDeatilsData,
        isLoading,
    } = useGetApi(`/setting/pages-conf/get-pages`);
    const { data: sectionDeatils } = sectionDeatilsData ?? {};

    const updatePermissions = useCallback((index, newPermissions) => {
        setPermissionsData((prevPermissions) => {
            const updatedPermissions = [...prevPermissions];
            updatedPermissions[index] = { ...updatedPermissions[index], ...newPermissions };
            return updatedPermissions;
        });
    }, []);
    useEffect(() => {

        if (sectionDeatils && sectionDeatils.length > 0) {
            const setData = sectionDeatils.map((list) => {
                const { _id, ...rest } = list
                return {
                    ...rest,
                    get: false,
                    create: false,
                    edit: false,
                    delete: false,
                    access_of: _id
                }
            })
            setPermissionsData(setData)
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
                    get: data.get,
                    access_of: data.access_of,
                }
            })

        }
        try {
            doPost(data)
        } catch (error) {

        }
    }
    return (
        <>
            <Breadcrumb styleClass="dark-bg" links={list} />
            <div className='admin-form'>
                <div className='admin-form-section panel'>
                    <AdminCommonHeading Heading={"access control"} key={"access control"} />
                    <div className={`col-12`}>
                        <label className={`form-label starlabel`}>role Name</label>
                        <input required={true} type="text" className="form-control" autoFocus placeholder={"enter role Name"} name={"name"} key={"name"} onChange={onChangeFormDataHandler} value={formData["name"]} />
                    </div>
                    <div className={`col-12`}>
                        <label className={`form-label starlabel`}>description</label>
                        <textarea required={true} type="text" className="form-control" autoFocus placeholder={"enter description"} name={"description"} key={"description"} onChange={onChangeFormDataHandler} value={formData["description"]} />
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
                                        <th>Get</th>
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

export default page

export const dynamic = 'force-dynamic'