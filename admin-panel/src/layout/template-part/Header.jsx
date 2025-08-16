import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/AuthProvider";
import Breadcrumb from "./Breadcrumb";
import ToastMessage from "../../components/ToastMessage";

export default function Header() {
  const { user, setUser, setToken } = useStateContext();
  const [userIcon, setuserIcon] = useState();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refs
  const toastAction = useRef();
  const dropdownRef = useRef();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
  
    // Get the first segment after the initial slash
    const segments = path.split('/').filter(segment => segment !== '');
    const firstSegment = segments[0];
  
    if (!firstSegment) return 'Dashboard';
  
    // Convert to title case and handle special cases
    switch (firstSegment) {
      case 'dashboard':
        return 'Dashboard';
      case 'tickets':
        return 'Tickets';
      case 'users':
        return 'User Management';
      case 'reports':
        return 'Reports';
      case 'settings':
        return 'Settings';
      case 'profile':
        return 'Profile';
      case 'rates':
        return 'Rate Management';
      case 'promoters':
        return 'Promoter Management';
      case 'vip':
        return 'VIP Management';
      default:
        // Convert dashed or lowercase words to Title Case
        return firstSegment
          .toLowerCase()
          .replace(/-/g, " ")
          .replace(/\b\w/g, char => char.toUpperCase());
    }
  };
  

  // Get user initials
  const getUserInitials = () => {
    if (!user || !user.user_login) return 'U';
    const name = user.user_login;
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Get user role
  const getUserRole = () => {
    if (!user) return 'User';
    // You can customize this based on your user roles
    return user.role || 'User';
  };

  const onLogout = () => {
    axiosClient.post('/logout')
      .then(() => {
        setUser(null);
        setToken(null);
        localStorage.clear();
        navigate('/login');
      })
      .catch((error) => {
        console.error('Error logging out', error);
      });
  };

  // execute once component is loaded
  useEffect(() => {
    axiosClient.get('/user')
		.then(({data}) => {
      const user = data; 
      setUser(user);
      setuserIcon('/assets/img/avatars/default-user.png');
      if(user.attachment_file) {
        setuserIcon(user.attachment_file);
      }      
		})
    .catch((errors) => {
      toastAction.current.showError(errors.response);
		});
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <>
    <header className="header header-modern">
      <div className="header-container">
        {/* Left side - Title and Breadcrumb */}
        <div className="header-left">
          <div className="page-title">
            <h1 className="page-title-text">{getPageTitle()}</h1>
            <div className="page-breadcrumb">
              <Breadcrumb />
            </div>
          </div>
        </div>

        {/* Right side - User Profile */}
        <div className="header-right">
          <div className="user-dropdown" ref={dropdownRef}>
            <div className="user-profile" onClick={toggleDropdown}>
              <div className="user-avatar">
                {userIcon && userIcon !== '/assets/img/avatars/default-user.png' ? (
                  <img className="user-avatar-img" src={userIcon} alt={user && user.user_login} />
                ) : (
                  <div className="user-avatar-initials">
                    {getUserInitials()}
                  </div>
                )}
              </div>
              <div className="user-info">
                <div className="user-name">{user && user.user_login ? user.user_login : 'User'}</div>
                <div className="user-role">{getUserRole()}</div>
              </div>
            </div>

            {/* Dropdown Menu */}
            <div className={`dropdown-menu dropdown-menu-end ${isDropdownOpen ? 'show' : ''}`}>
              <div className="dropdown-header">
                <div className="dropdown-header-title">Settings</div>
              </div>
              <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                <svg className="dropdown-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Profile
              </Link>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={() => {
                setIsDropdownOpen(false);
                onLogout();
              }}>
                <svg className="dropdown-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
    <ToastMessage ref={toastAction} />
    </>
  ) 
}