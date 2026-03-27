"use client"
import { AdminCommonHeading, LoadingButton } from '@/app/components/admin/common';
import { usePutApi } from '@/app/lib/apicallHooks';
import { useAuthStore, useUser } from '@/app/store/auth.store';
import { useEffect, useState } from 'react';
const Generalnfo = () => {
    const user = useUser();
    const { updateProfile } = useAuthStore();
    const [formData, setFormData] = useState(user);
    const { isLoading: LoadingPut, doPut } = usePutApi("/administrator/user/update-profile")

    const onChangeFormDataHandler = (e, name, is_coustom = null, obj_type) => {
        if (is_coustom === "file") {
            setFormData((pre) => ({
                ...pre,
                [name]: e
            }))
        } else if (is_coustom === "switchbox" || is_coustom === "checkbox") {
            setFormData((pre) => ({
                ...pre,
                [e.target.name]: e.target.checked
            }))
        } else if (is_coustom === "relation") {
            setFormData((pre) => ({
                ...pre,
                [name]: e
            }))
        } else if (is_coustom === "text-editor") {
            setFormData((pre) => ({
                ...pre,
                [name]: e
            }))
        } else if (e.target.name === "name") {
            setFormData((pre) => ({
                ...pre,
                [e.target.name]: e.target.value,
                slug: convertToSEOUrl(e.target.value)
            }))
        } else {
            setFormData((pre) => ({
                ...pre,
                [e.target.name]: e.target.value
            }))
        }
    }

    const submitHandler = () => {
        try {
            updateProfile(formData);
            doPut(formData);
        } catch (error) {
            console.error('Profile update error:', error);
        }
    }
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);


    return (
        <>
            <div className='admin-form-section panel'>
                <AdminCommonHeading Heading={"General Information"} key={"products"} />
                <div className={`col-6`}>
                    <label className={`form-label starlabel`}>first Name</label>
                    <input required={true} type="text" className="form-control" autoFocus placeholder={"enter first name"} name={"f_name"} key={"f_name"} onChange={onChangeFormDataHandler} value={formData?.f_name ?? ""} />
                </div>
                <div className={`col-6`}>
                    <label className={`form-label starlabel`}>last Name</label>
                    <input required={true} type="text" className="form-control" autoFocus placeholder={"enter last name"} name={"l_name"} key={"l_name"} onChange={onChangeFormDataHandler} value={formData?.l_name ?? ""} />
                </div>
                <div className={`col-6`}>
                    <label className={`form-label starlabel`}>Email</label>
                    <input required={true} type="text" className="form-control" autoFocus placeholder={"enter email "} name={"email"} key={"email"} onChange={onChangeFormDataHandler} value={formData?.email ?? ""} />
                </div>
                <div className={`col-6`}>
                    <label className={`form-label starlabel`}>Phone no</label>
                    <input required={true} type="text" className="form-control" autoFocus placeholder={"enter Phone no name"} name={"phone_no"} key={"phone_no"} onChange={onChangeFormDataHandler} value={formData?.phone_no ?? ""} />
                </div>
            </div>
            <LoadingButton loading={LoadingPut} submitHandler={submitHandler} />
        </>
    )
}

export default Generalnfo