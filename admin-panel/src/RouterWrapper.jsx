// IMPORTANT: Always call hooks (useState, useEffect, useContext, etc) at the top level of your component.
// Never call hooks inside conditions, loops, or after returns. This prevents hook order bugs.

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
  const userRoleId = localStorage.getItem('user_role_id');
  const Layout = userRoleId === '4' ? CashierLayout : DefaultLayout;
  
  return <Layout>{children}</Layout>;
};

const RedirectTo = () => {
  const userRoleId = localStorage.getItem('user_role_id');
  
  if (userRoleId === '4') {
    return <Navigate to="/cashier" replace />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
};

export default function RouterWrapper() {
  const { token, userRoutes, loading } = useStateContext();
  const dynamicRoutes = generateUserRoutes(userRoutes || []);

  if (loading) {
    return null; // or a spinner if you want
  }

  const routes = [
    // Guest routes (no token required)
    {
      path: '/login',
      element: <GuestLayout />,
      children: [
        { path: '/login', element: <Login /> },
      ],
    },
    {
      path: '/sign-up',
      element: <GuestLayout />,
      children: [
        { path: '/sign-up', element: <Register /> },
      ],
    },
    {
      path: '/forgot-password',
      element: <GuestLayout />,
      children: [
        { path: '/forgot-password', element: <ForgotPassword /> },
      ],
    },
    // Cashier routes (role ID 4)
    ...(token && localStorage.getItem('user_role_id') === '4' ? [
      {
        path: '/cashier',
        element: <CashierLayout />,
      },
      {
        path: '/cashier/transactions',
        element: <CashierLayout />,
      },
      {
        path: '*',
        element: <Navigate to="/cashier" replace />,
      },
    ] : []),
    // Protected routes (token required) - for non-cashier users
    {
      path: '/',
      element: token ? <LayoutProvider /> : <Navigate to="/login" replace />,
      children: [
        { path: '/', element: <RedirectTo /> },
        { path: '/dashboard', element: <Index /> },
        ...dynamicRoutes,
        { path: '/information', element: <Index /> },
        { path: '/profile', element: <Index /> },
      ],
    },
  ];

  return useRoutes(routes);
}