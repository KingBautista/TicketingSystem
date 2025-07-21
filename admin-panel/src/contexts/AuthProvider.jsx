import { createContext, useContext, useState, useEffect } from "react";

const StateContext = createContext({
  user: null,
  token: null,
  userRoutes: null,
  loading: true,
  setUser: () => {},
  setToken: () => {},
  setUserRoutes: () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [token, _setToken] = useState(localStorage.getItem('ACCESS_TOKEN'));
  const [userRoutes, _setUserRoutes] = useState(() => {
    const storedRoutes = localStorage.getItem('USER_ROUTES');
    try {
      return storedRoutes ? JSON.parse(storedRoutes) : null;
    } catch (e) {
      console.error("Failed to parse stored userRoutes", e);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate async check (could be replaced with real API call)
    setLoading(false);
  }, []);

  const setToken = (token) => {
    _setToken(token);
    if (token) {
      localStorage.setItem('ACCESS_TOKEN', token);
    } else {
      localStorage.removeItem('ACCESS_TOKEN');
    }
  };

  const setUserRoutes = (routes) => {
    _setUserRoutes(routes);
    if(routes) {
      localStorage.setItem('USER_ROUTES', JSON.stringify(routes));
    } else {
      localStorage.removeItem('USER_ROUTES');
    }
  };

  return (
    <StateContext.Provider value={{
      user,
      token,
      userRoutes,
      loading,
      setUser,
      setToken,
      setUserRoutes
    }}>
      {children}
    </StateContext.Provider>
  );
}

export const useStateContext = () => useContext(StateContext);