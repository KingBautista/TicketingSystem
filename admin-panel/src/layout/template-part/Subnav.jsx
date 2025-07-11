import React, { useEffect, useState } from 'react';
import { useLocation, Link } from "react-router-dom";
import { useStateContext } from "../../contexts/AuthProvider";

export default function Subnav() {
  const { userRoutes } = useStateContext();
  const currentPath = useLocation();

  const [childRoutes, setChildRoutes] = useState([]);
  const [parentRoute, setParentRoute] = useState("");

  const findChildRoutes = (currentPath, routes) => {
    if (!Array.isArray(routes)) return null;
    
    for (const route of routes) {
      const routePattern = route.path.replace(/:\w+/g, '[^/]+');
      const regex = new RegExp(`^${routePattern}$`);

      if (regex.test(currentPath)) {
        return (route.children || []).filter(child => child.side_nav === 'true');
      }

      if (route.children && route.children.length) {
        const result = findChildRoutes(currentPath, route.children);
        if (result !== null) return result;
      }
    }
    return null;
  };

  useEffect(() => {
    if (!userRoutes) return;

    const segments = currentPath.pathname.split('/').filter(Boolean);

    if (segments.length > 0 && isNaN(segments[segments.length - 1])) {
      segments.pop();
    }

    const parentPath = '/' + segments.join('/');
    setParentRoute(parentPath);

    const childRoutes = findChildRoutes(parentPath, userRoutes);
    setChildRoutes(childRoutes || []);
  }, [currentPath.pathname, userRoutes]);

  const getNavItemClass = (path) => {
    return currentPath.pathname === path
      ? "nav-item list-group-item list-group-item-action p-0 active"
      : "nav-item list-group-item list-group-item-action p-0";
  };

  if (!userRoutes || userRoutes.length === 0) return null;

  return (
    <ul className="sidebar-nav list-group list-group-custom pt-0" data-coreui="navigation">
      <li className={getNavItemClass(parentRoute) + " first-item"}>
        <Link to={parentRoute} className="nav-link">
          <svg className="nav-icon">
            <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-info"></use>
          </svg>
          Overview
        </Link>
      </li>

      {childRoutes.map((route, index) => {
        const id = currentPath.pathname.split('/').find(segment => /^\d+$/.test(segment));
        const path = route.path.replace(':id', id);

        return (
          <li key={index} className={getNavItemClass(path)}>
            <Link to={path} className="nav-link">
              <svg className="nav-icon">
                <use xlinkHref={`/assets/vendors/@coreui/icons/svg/free.svg#${route.icon || 'cil-info'}`}></use>
              </svg>
              {route.name}
            </Link>
          </li>
        );
      })}

      <li className={getNavItemClass("/site-management/site-listings") + " last-item"}>
        <Link to="/site-management/site-listings" className="nav-link">
          <svg className="nav-icon">
            <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-account-logout"></use>
          </svg>
          Back to List
        </Link>
      </li>
    </ul>
  );
}
