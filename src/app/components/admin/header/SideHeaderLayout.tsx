import React, { ReactNode } from 'react';
import "@/app/styles/admin/admin_common.scss"
import AppMenu from './AppMenu';
interface SideHeaderLayoutProps {
    children: ReactNode;
    menudata: any
}

const SideHeaderLayout: React.FC<SideHeaderLayoutProps> = ({ children,menudata }) => {
    return (
        <div className='admin-container'>
            <div className="container">
                <div className="admin-wrapper">
                    <div className='side-navbar'>
                        <AppMenu menudata={menudata}/>
                    </div>

                    <div className='main-comp'>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SideHeaderLayout;
