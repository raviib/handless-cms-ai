"use client"
import Image from 'next/image';
import MenuItem from "./MenuItem";

const Navbar = ({ menudata }: { menudata: any }) => {
  return (
    <nav className='dashboard-nav'>
      <div className="logo"><Image priority  src="/images/admin/logo.webp" alt="" width={300} height={54} /></div>
      <ul>
        {menudata.map((item: any, index: number) => (
          <MenuItem key={index} item={item} defultOpen={true} />
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
