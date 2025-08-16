import { useEffect, useState } from 'react';
import { useStateContext } from "../contexts/AuthProvider";
import Sidebar from "./template-part/Sidebar";
import Header from "./template-part/Header";
import { Navigate, Outlet } from "react-router-dom";
import { useSessionTimeout } from '../hooks/useSessionTimeout'; // Import the session timeout hook

export default function DefaultLayout() {
  const { token } = useStateContext();
  const [theme] = useState(() => { return localStorage.getItem('theme') || 'light'; });
  const [isReloaded, setIsReloaded] = useState(() => {
    // Get value from localStorage (default to false if not set)
    return localStorage.getItem('isReloaded') === 'true';
  });

  // Set the session timeout duration (e.g., 30 minutes)
  const sessionTimeoutDuration = 30 * 60 * 1000; // 30 minutes in milliseconds

  // Use the session timeout hook to auto-logout the user after inactivity
  useSessionTimeout(sessionTimeoutDuration);

  useEffect(() => {
    if (!isReloaded) {
      // Set the state to true
      setIsReloaded(true);
      // Persist this state in localStorage so it survives page reloads
      localStorage.setItem('isReloaded', 'true');

      window.location.reload();  // Uncomment this if you want a full page reload
    }
  }, [isReloaded]);

  // Set theme in the document and localStorage when token is available
  useEffect(() => {
    if (token) {
      document.documentElement.setAttribute('data-coreui-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [token, theme]);

  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="main-wrapper">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content-area">
          <div className="content-container">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}