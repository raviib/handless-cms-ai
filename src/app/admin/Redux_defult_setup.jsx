"use client"

import React, { useEffect } from 'react'
import { useGetApi } from '@/app/lib/apicallHooks';
import { useAuthStore, useUser } from '@/app/store/auth.store';

const AuthSetup = () => {
    const user = useUser();
    const { setUser } = useAuthStore();
    const {
        data: userData,
        doFetch,
    } = useGetApi();
    
    useEffect(() => {
        if (!user) {
            doFetch(`/administrator/user/user-details`)
        }
        if (userData) {
            const { data = {} } = userData ?? {};
            setUser(data);
        }
    }, [userData, user, setUser, doFetch])
    
    return (
        <></>
    )
}

export default AuthSetup