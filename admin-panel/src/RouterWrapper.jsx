import { useRoutes, Navigate } from 'react-router-dom';
import { useStateContext } from './contexts/AuthProvider.jsx';
import { useEffect, useState } from 'react';
import React from 'react';

import DefaultLayout from './layout/DefaultLayout.jsx';
import GuestLayout from './layout/GuestLayout.jsx';
import Login from './pages/user-auth/Login.jsx';
import Register from './pages/user-auth/Register.jsx';
import ForgotPassword from './pages/user-auth/ForgotPassword.jsx';
import Index from './pages/Index.jsx';
import CashierLayout from './layout/CashierLayout.jsx';

const generateUserRoutes = (routes) => {
  if (!Array.isArray(routes)) return [];

  return routes.map((route, index) => {
    const children = route.children ? generateUserRoutes(route.children) : [];

    return {
      path: route.path,
      element: <Index />, // You can map this to real components
      children,
    };
  });
};

const LayoutProvider = ({ children }) => {
  const [layout, setLayout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userRoleId = localStorage.getItem('user_role_id');
    if (userRoleId === '4') {
      setLayout(<CashierLayout />);
    } else {
      setLayout(<DefaultLayout />);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return layout && React.cloneElement(layout, {}, children);
};

const RedirectTo = () => {
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    const userRoleId = localStorage.getItem('user_role_id');
    if (userRoleId === '4') {
      setRedirectTo(<Navigate to="/cashier" />);
    } else {
      setRedirectTo(<Navigate to="/dashboard" />);
    }
  }, []);

  return redirectTo;
};

export default function RouterWrapper() {
  const { token, userRoutes } = useStateContext();
  const dynamicRoutes = generateUserRoutes(userRoutes || []);

  const routes = [
    {
      path: '/',
      element: token ? <LayoutProvider /> : <Navigate to="/login" />,
      children: [
        { path: '/', element: <RedirectTo /> },
        { path: '/dashboard', element: <Index /> },
        { path: '/cashier', element: <Index /> },
        ...dynamicRoutes,
        { path: '/profile', element: <Index /> },
      ],
    },
    {
      path: '/',
      element: <GuestLayout />,
      children: [
        { path: '/login', element: <Login /> },
        { path: '/sign-up', element: <Register /> },
        { path: '/forgot-password', element: <ForgotPassword /> },
      ],
    },
  ];

  return useRoutes(routes);
}