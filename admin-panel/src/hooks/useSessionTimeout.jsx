import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // To navigate the user to the login page
import { useStateContext } from '../contexts/AuthProvider'; // Assuming you have a context to handle authentication

export const useSessionTimeout = (timeoutDuration) => {
  const { setToken, setUserRoutes } = useStateContext();
  const navigate = useNavigate();

  useEffect(() => {
    let timeout;
    const resetTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        // Logout logic when session expires
        setToken(null);  // Remove the token
        setUserRoutes([]); // Clear user routes
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('USER_ROUTES');
        navigate('/login');  // Redirect to login page
      }, timeoutDuration); // Set the timeout duration
    };

    // Set up event listeners for user activity
    const events = ['mousemove', 'keydown', 'scroll', 'click'];

    events.forEach(event => window.addEventListener(event, resetTimeout));

    // Initial call to set the timeout
    resetTimeout();

    // Cleanup event listeners on unmount
    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimeout));
      clearTimeout(timeout);
    };
  }, [timeoutDuration, navigate, setToken, setUserRoutes]);
};
