
import Image from 'next/image'
import React from 'react'
import "@/app/styles/admin/admin_header.scss"
import "@/app/styles/admin/dashboard-style.scss"
import Link from 'next/link'

import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import ShowFullScreen from "@/app/components/admin/header/ShowFullScreen"
import SignOut from "@/app/components/admin/SignOut.jsx"
import SearchFullScreen from "@/app/components/admin/header/SearchFullScreen.jsx"
const AdminHeader = async ({ menudata = [], useInSearch = true }) => {
  const header_list = useInSearch ? [] : menudata
  return (
    <div className="header-admin">
      <div className="container">
        <div className="header-box flex-box space-between align-item">

          <div className="menu-items">
           <div className='aling-between'> 
             <div >
              <h3 className="admin-title">
                Admin Dashboard
              </h3>
            </div>

            <div>
              <ul className="menu-list flex-box align-item">
                {
                  header_list.map((data, index) => (
                    <>
                      {
                        data.submenu ? <li className="item dropdown" key={data.name}>
                          <Link href="">{data.name}</Link>

                          <ul className="dropdown-menu">
                            {data.submenu.map((subMenuData, subIndex) => (
                              <>
                                {
                                  subMenuData.submenu ? <>
                                    <li className="item dropdown" key={subMenuData.name}>
                                      <Link href="javascript:void(0)">{subMenuData.name}</Link>
                                      <ul className="sub-menu">
                                        {
                                          subMenuData.submenu.map((data) => (
                                            <li className="item" key={data.name}><Link href={`/admin${data.url}`}>{data.name}</Link></li>
                                          ))
                                        }
                                      </ul>
                                    </li>
                                  </> : <li className="item" key={subMenuData.name}><Link href={`/admin${subMenuData.url}`}>{subMenuData.name}</Link></li>
                                }</>
                            ))}

                          </ul>
                        </li> : <li className="item"><Link href={`/admin${data.url}`}>{data.name}</Link></li>
                      }
                    </>
                  ))
                }
                <li className="item">
                  <ShowFullScreen />
                </li>
                <li className='item search-item' >
                  <SearchFullScreen menudata={menudata} />
                </li>
                <li className="item dropdown"><Link href=""><Image className="profile-icon" src="/images/admin/profile.png" alt="" width={20} height={20} /></Link>
                  <ul className="dropdown-menu">
                    <li className="item">

                      <div className='icon-down'><PermIdentityIcon /> <Link href={"/admin/profile"}>Profile</Link></div>
                    </li>
                    <li className="item sign-out">
                      <SignOut />

                    </li>
                  </ul>
                </li>
              </ul>
          
            </div>
           </div>
           <hr/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminHeader