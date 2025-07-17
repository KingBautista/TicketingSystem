import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/AuthProvider";

export default function Sidebar() {
  const { userRoutes } = useStateContext();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState({});

  // Only sync sub-menu open state based on current path
  useEffect(() => {
    if (!userRoutes) return;

    const newIsOpen = {};

    userRoutes.forEach(route => {
      if (route.children && route.children.length > 0) {
        const match = route.children.some(child => location.pathname.startsWith(child.path));
        if (match) {
          newIsOpen[route.name] = true;
        }
      }
    });

    setIsOpen(newIsOpen);
  }, [userRoutes, location.pathname]);

  const toggleSubMenu = (name) => {
    const newState = {
      ...isOpen,
      [name]: !isOpen[name],
    };
    setIsOpen(newState);
  };

  const isPathActive = (path) => location.pathname === path;

  if (!userRoutes || userRoutes.length === 0) return null;

  const navLinks = [
    // Add Dashboard as the first item
    <li className="nav-item" key="dashboard">
      <Link to="/dashboard" className={`nav-link ${isPathActive('/dashboard') ? "active" : ""}`}>
        <svg className="nav-icon">
          <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-speedometer" />
        </svg>
        Dashboard
      </Link>
    </li>,
    // ... existing dynamic routes
    ...userRoutes.map((navItem, idx) => {
      if (navItem.side_nav === "true") {
        const hasChildren = Array.isArray(navItem.children) && navItem.children.length > 0;
        const navIcon = "/assets/vendors/@coreui/icons/svg/free.svg#" + navItem.icon;

        if (hasChildren) {
          const childLinks = navItem.children.map((childItem, cidx) => {
            if (childItem.side_nav === "true") {
              const isActive = isPathActive(childItem.path);
              return (
                <li className="nav-item" key={cidx}>
                  <Link to={childItem.path} className={`nav-link ${isActive ? "active" : ""}`}>
                    <span className="nav-icon"><span className="nav-icon-bullet" /></span> {childItem.name}
                  </Link>
                </li>
              );
            }
            return null;
          });

          return (
            <li className={`nav-group${isOpen[navItem.name] ? " show" : ""}`} key={idx}>
              <Link
                to="#"
                className="nav-link nav-group-toggle"
                onClick={() => toggleSubMenu(navItem.name)}>
                <svg className="nav-icon">
                  <use xlinkHref={navIcon} />
                </svg>{navItem.name}
              </Link>
              <ul className="nav-group-items compact">
                {childLinks}
              </ul>
            </li>
          );
        }

        // No children
        const isActive = isPathActive(navItem.path);
        return (
          <li className="nav-item" key={idx}>
            <Link to={navItem.path} className={`nav-link ${isActive ? "active" : ""}`}>
              <svg className="nav-icon">
                <use xlinkHref={navIcon} />
              </svg>{navItem.name}
            </Link>
          </li>
        );
      }
      return null;
    })
  ];

  return (
    <div className="sidebar sidebar-dark sidebar-fixed border-end" id="sidebar">
      <div className="sidebar-header border-bottom">
        <div className="sidebar-brand">
          TICKETING SYSTEM
        </div>
      </div>
      <ul className="sidebar-nav" data-coreui="navigation">
        {navLinks}
      </ul>
    </div>
  );
}