"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// Recursive component to handle menu rendering
const MenuItem: React.FC<{ item: any; defultOpen: boolean }> = ({ item, defultOpen }) => {
  const [isOpen, setIsOpen] = useState<boolean>(defultOpen);
  const pathname = usePathname();

  const hassubmenu = item?.submenu && item?.submenu?.length > 0;
  const isActive = pathname.startsWith(`/admin${item.url}`);
  // Open the menu if the current URL matches or if a child is active
  useEffect(() => {
    if (isActive || hasActiveChild(item)) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [pathname]);

  // Check if any submenu item is active
  const hasActiveChild = (menuItem: any): boolean => {
    if (!menuItem.submenu) return false;
    return menuItem.submenu.some((subItem: any) =>
      pathname.startsWith(`/admin${subItem.url}`) || hasActiveChild(subItem)
    );
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <li>
      <div className={`nav-item ${isActive ? "active" : ""}`} onClick={toggleOpen}>
        {hassubmenu ? (
          <>
            {item.name}
            {isOpen ? <i className="arrow active"></i> : <i className="arrow"></i>}
          </>
        ) : (
          <Link href={`/admin${item.url}`} className={isActive ? "active" : ""}>
            {item.name}
          </Link>
        )}
      </div>
      {hassubmenu && isOpen && (
        <ul className="sub-nav-item">
          {item.submenu.map((subItem: any, index: number) => (
            <MenuItem key={index} item={subItem} defultOpen={false} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default MenuItem;
