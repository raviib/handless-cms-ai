"use client"
import "@/app/styles/admin/AdminFilters.scss";
import "@/app/styles/admin/profilepage.scss";
import PersonIcon from '@mui/icons-material/Person';
import { useState } from 'react';
import ForgotPassword from "./ForgotPassword.js";
import Generalnfo from "./Generalnfo.js";
import HttpsIcon from '@mui/icons-material/Https';
const TABS_LIST = [
    {
        name: "Profile",
        value: "Generalnfo",
        icon: <PersonIcon/>
    },
    {
        name: "reset password",
        value: "ForgotPassword",
        icon: <HttpsIcon/>
    },
];

export default function ProfilePage() {
    const [value, setValue] = useState('Generalnfo');

    return (
        <>
            <div className="tab mb-5">
                {TABS_LIST.map((tabs) => (
                    <div
                        key={tabs.value}
                        className={`tab-list tablinks ${value === tabs.value && "active"}`}
                        onClick={() => {
                            setValue(tabs.value);
                        }}
                    >
                        {tabs.name}   {tabs.icon}
                    </div>
                ))}
            </div>
            <div className='admin-form '>
                <>

                    {
                        value === 'Generalnfo' && <Generalnfo />
                    }

                    {
                        value === 'ForgotPassword' && <ForgotPassword />
                    }

                </>


            </div>
        </>
    );
}
