"use client"
import React, { useEffect, useState } from 'react'
import { AdminCommonHeading, LoadingButton } from '@/app/components/admin/common';
import { usePutApi } from '@/app/lib/apicallHooks';
const ForgotPassword = () => {
    const [formData, setFormData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const { isLoading: LoadingPut, doPut } = usePutApi("/administrator/user/update-password")
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
            doPut(formData)
        } catch (error) {

        }
    }
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <div className='admin-form-section panel'>
                <AdminCommonHeading Heading={"reset password"} key={"reset password"} />
                <div className={`col-12`}>
                    <label className={`form-label starlabel`}>old password</label>
                    <input required={true} type="text" className="form-control" autoFocus placeholder={"enter old password"} name={"old_password"} key={"old_password"} onChange={onChangeFormDataHandler} value={formData["old_password"]} />
                </div>
                <div className={`col-12`}>
                    <label className={`form-label starlabel`}>new password</label>
                    <input required={true} type="text" className="form-control" autoFocus placeholder={"enter new password"} name={"new_password"} key={"new_password"} onChange={onChangeFormDataHandler} value={formData["new_password"]} />
                </div>
                <div className={`col-12`}>
                    <label className={`form-label starlabel`}>confirm password</label>
                    <input required={true} type="text" className="form-control" autoFocus placeholder={"enter confirm password "} name={"confirm_password"} key={"confirm_password"} onChange={onChangeFormDataHandler} value={formData["confirm_password"]} />
                </div>
            </div>
            <LoadingButton loading={LoadingPut} submitHandler={submitHandler} />
        </>
    )
}

export default ForgotPassword