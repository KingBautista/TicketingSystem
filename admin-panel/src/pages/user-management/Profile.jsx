import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../axios-client";
import ToastMessage from "../../components/ToastMessage";
import Field from "../../components/Field";
import DOMPurify from 'dompurify';
import PasswordGenerator from "../../components/PasswordGenerator";
import AddMedia from "../../components/grid/AddMedia";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';

export default function Profile() {
  const toastAction = useRef();
  const [attachment, setAttachment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({
    id: null,
    user_login: '',
    user_email: '',
    user_pass: '',
    first_name: '',
    last_name: '',
    nickname: '',
    biography: '',
    attachment_file: '',
    theme: '',
  });

  const onSubmit = async (ev) => {
		ev.preventDefault();
    setIsLoading(true);

    // Prepare the data for submission
    const updatedProfile = {
      ...user,
      attachment_file: attachment ? JSON.stringify(attachment) : ''
    };
  
    try {
      const apiUrl = '/profile';
      const method = 'post';
  
      // Make the API call based on the method (PUT or POST)
      await axiosClient[method](apiUrl, updatedProfile);
  
      const successMessage = 'Profile has been updated.';
      toastAction.current.showToast(successMessage, 'success');
  
      setIsLoading(false);
    } catch (errors) {
      toastAction.current.showError(errors.response);
      setIsLoading(false);
    }
  };

  const handleSelectedTheme = (theme) => {
    // Set the theme attribute on the document
    document.documentElement.setAttribute('data-coreui-theme', theme);
    // Save the theme to localStorage so it persists across page reloads
    localStorage.setItem('theme', theme);
  };

  // execute once component is loaded
  useEffect(() => {
    axiosClient.get('/user')
		.then(({data}) => {
      const user = data; 
      setUser(user);
		})
  }, []); // empty array means 'run once'

  return (
    <div className="card">
      <ToastMessage ref={toastAction} />
      <form onSubmit={onSubmit}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <FontAwesomeIcon icon={solidIconMap.user} className="me-2" />
            Personal Options
          </h4>
        </div>
        <div className="card-body">
          {/* Admin Color Scheme Field */}
          <Field
            label="Admin Color Scheme"
            inputComponent={
              <select className="form-select form-select-sm" value={user?.theme} aria-label="Bulk actions" onChange={ev => {handleSelectedTheme(ev.target.value); setUser({ ...user, theme: DOMPurify.sanitize(ev.target.value) }); }}>
                <option value="">Select Theme Color</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
        </div>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <FontAwesomeIcon icon={solidIconMap.user} className="me-2" />
            Name
          </h4>
        </div>
        <div className="card-body">
          {/* Username Field */}
          <Field
            label="Username"
            inputComponent={
              <input
                className="form-control form-control-sm"
                type="text"
                value={user.user_login}
                onChange={ev => setUser({ ...user, user_login: DOMPurify.sanitize(ev.target.value) })}
                disabled
              />
            }
            tipMessage="Usernames cannot be changed."
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          {/* Email Field */}
          <Field
            label="Email"
            inputComponent={
              <input
                className="form-control form-control-sm"
                type="text"
                value={user.user_email}
                onChange={ev => setUser({ ...user, user_email: DOMPurify.sanitize(ev.target.value) })}
              />
            }
            tipMessage="If you change this, an email will be sent at your new address to confirm it. The new address will not become active until confirmed."
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          {/* First Name Field */}
          <Field
            label="First Name"
            inputComponent={
              <input
                className="form-control form-control-sm"
                type="text"
                value={user.first_name}
                onChange={ev => setUser({ ...user, first_name: DOMPurify.sanitize(ev.target.value) })}
              />
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          {/* Last Name Field */}
          <Field
            label="Last Name"
            inputComponent={
              <input
                className="form-control form-control-sm"
                type="text"
                value={user.last_name}
                onChange={ev => setUser({ ...user, last_name: DOMPurify.sanitize(ev.target.value) })}
              />
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          {/* Nickname Field */}
          <Field
            label="Nickname"
            inputComponent={
              <input
                className="form-control form-control-sm"
                type="text"
                value={user.nickname}
                onChange={ev => setUser({ ...user, nickname: DOMPurify.sanitize(ev.target.value) })}
              />
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
        </div>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <FontAwesomeIcon icon={solidIconMap.lock} className="me-2" />
            About Yourself
          </h4>
        </div>
        <div className="card-body">
          {/* Biographical Info Field */}
          <Field
            label="Biographical Info"
            inputComponent={
              <textarea 
                className="form-control form-control-sm" 
                rows={4} 
                value={(user.biography) ? user.biography : ''} 
                onChange={ev => setUser({...user, biography : ev.target.value})}
              />              
            }
            tipMessage="Share a little biographical information to fill out your profile. This may be shown publicly."
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          {/* Profile Picture Field */}
          <Field
            label="Profile Picture"
            inputComponent={<AddMedia onChange={setAttachment} value={user.attachment_metadata} />}
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
        </div>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <FontAwesomeIcon icon={solidIconMap.lock} className="me-2" />
            Password
          </h4>
        </div>
        <div className="card-body">
          {/* New Password Field */}
          <PasswordGenerator 
            label="New Password"
            setUser={setUser} 
            user={user}
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
        </div>
        <div className="card-footer">
          <button type="submit" className="btn btn-primary">
            <FontAwesomeIcon icon={solidIconMap.save} className="me-2" />
            Update Profile &nbsp;
            {isLoading && <span className="spinner-border spinner-border-sm ml-1" role="status"></span>}
          </button>
        </div>
      </form>
    </div>
  )
}