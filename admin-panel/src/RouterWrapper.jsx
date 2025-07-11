import { useRoutes, Navigate } from 'react-router-dom';
import { useStateContext } from './contexts/AuthProvider.jsx';

import DefaultLayout from './layout/DefaultLayout.jsx';
import GuestLayout from './layout/GuestLayout.jsx';
import Login from './pages/user-auth/Login.jsx';
import Register from './pages/user-auth/Register.jsx';
import ForgotPassword from './pages/user-auth/ForgotPassword.jsx';
import Index from './pages/Index.jsx';

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

export default function RouterWrapper() {
  const { token, userRoutes } = useStateContext();
  const dynamicRoutes = generateUserRoutes(userRoutes || []);

  const routes = [
    {
      path: '/',
      element: token ? <DefaultLayout /> : <Navigate to="/login" />,
      children: [
        { path: '/', element: <Navigate to="/dashboard" /> },
        { path: '/dashboard', element: <Index /> },
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