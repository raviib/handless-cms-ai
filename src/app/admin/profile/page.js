import Breadcrumb from '@/app/components/admin/breadcrumb'
import ProfilePage from "./ProfilePage.js"
import React from 'react'

const page = () => {
    const breadcrumb_ = [

        {
            Name: "profile",
            link: ``
        },

    ]
    return (
        <>
            <Breadcrumb styleClass="dark-bg" links={breadcrumb_} />
            <ProfilePage />
        </>
    )
}

export default page

export const dynamic = 'force-dynamic'