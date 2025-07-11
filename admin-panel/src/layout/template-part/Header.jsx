import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/AuthProvider";
import Breadcrumb from "./Breadcrumb";
import ToastMessage from "../../components/ToastMessage";

export default function Header() {
  const { user, setUser, setToken } = useStateContext();
  const [userIcon, setuserIcon] = useState();
  const navigate = useNavigate(); // Get the navigate function
  
  // Refs
  const toastAction = useRef();

  const onLogout = () => {
    axiosClient.post('/logout')
      .then(() => {
        setUser(null);
        setToken(null);
        localStorage.clear();
        navigate('/login'); // Redirect to login page after logout
      })
      .catch((error) => {
        console.error('Error logging out', error);
      });
  };

  // execute once component is loaded
  useEffect(() => {
    axiosClient.get('/user')
		.then(({data}) => {
      const user = data.data; 
      setUser(user);
      // setTheme(user.theme);
      setuserIcon('/assets/img/avatars/default-user.png');
      if(user.attachment_file) {
        setuserIcon(user.attachment_file);
      }      
		})
    .catch((errors) => {
      toastAction.current.showError(errors.response);
		});
  }, []); // empty array means 'run once'

  return (
    <>
    <header className="header header-sticky p-0 mb-4">
      <div className="container-fluid border-bottom px-4">
        <button className="header-toggler header-toggler-inline-start" type="button" onClick={ ()=> coreui.Sidebar.getInstance(document.querySelector('#sidebar')).toggle() }>
          <svg className="icon icon-lg">
            <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-menu"></use>
          </svg>
        </button>
        <ul className="header-nav ms-auto">
          <li className="nav-item">
            {user && user.user_login}
          </li>
        </ul>
        <ul className="header-nav">
          <li className="nav>-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <li className="nav-item dropdown">
            <a className="nav-link py-0 pe-0" data-coreui-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
              <div className="avatar avatar-md"><img className="avatar-img" src={userIcon} alt={user && user.user_login}/></div>
            </a>
            <div className="dropdown-menu dropdown-menu-end pt-0">
              <div className="dropdown-header bg-body-tertiary text-body-secondary fw-semibold rounded-top mb-2">Account</div>
              <a className="dropdown-item" href="#">
                <svg className="icon me-2">
                  <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-bell"></use>
                </svg> Notifications<span className="badge badge-sm bg-info ms-2">42</span>
              </a>
              <a className="dropdown-item" href="#">
                <svg className="icon me-2">
                  <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-envelope-open"></use>
                </svg> Messages<span className="badge badge-sm bg-success ms-2">42</span>
              </a>
              <div className="dropdown-header bg-body-tertiary text-body-secondary fw-semibold my-2">
                <div className="fw-semibold">Settings</div>
              </div>
                <Link to="/profile" className="dropdown-item"><svg className="icon me-2">
                    <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-user"></use>
                  </svg> Profile
                </Link>
              <div className="dropdown-divider"></div>
                <a className="dropdown-item" type="button" onClick={onLogout}>
                  <svg className="icon me-2">
                    <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-account-logout"></use>
                  </svg> Logout
                </a>
            </div>
          </li>
        </ul>
      </div>
      <Breadcrumb/>
    </header>
    <ToastMessage ref={toastAction} />
    </>
  ) 
}