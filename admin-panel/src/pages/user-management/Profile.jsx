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

    try {
      // Prepare the data for submission
      const updatedProfile = {
        ...user,
        attachment_file: attachment ? JSON.stringify(attachment) : user.attachment_file
      };
    
      const apiUrl = '/profile';
      const method = 'post';
    
      // Make the API call
      const response = await axiosClient[method](apiUrl, updatedProfile);
  
      const successMessage = response.data.message || 'Profile has been updated successfully.';
      toastAction.current.showToast(successMessage, 'success');
  
      // Update the user state with the response data
      if (response.data.user) {
        setUser(prev => ({
          ...prev,
          ...response.data.user,
          first_name: response.data.user.first_name || response.data.user.user_details?.first_name || '',
          last_name: response.data.user.last_name || response.data.user.user_details?.last_name || '',
          nickname: response.data.user.nickname || response.data.user.user_details?.nickname || '',
          biography: response.data.user.biography || response.data.user.user_details?.biography || '',
          theme: response.data.user.theme || response.data.user.user_details?.theme || '',
          attachment_file: response.data.user.attachment_file || response.data.user.user_details?.attachment_file || '',
        }));
      }
  
      setIsLoading(false);
    } catch (errors) {
      console.error('Profile update error:', errors);
      toastAction.current.showError(errors.response);
      setIsLoading(false);
    }
  };

  const handleSelectedTheme = (theme) => {
    // Set the theme attribute on the document
    document.documentElement.setAttribute('data-coreui-theme', theme);
    // Save the theme to localStorage so it persists across page reloads
    localStorage.setItem('theme', theme);
    // Update user state
    setUser(prev => ({ ...prev, theme }));
  };

  // execute once component is loaded
  useEffect(() => {
    axiosClient.get('/user')
    .then(({data}) => {
      const userData = data; 
      setUser({
        id: userData.id,
        user_login: userData.user_login || '',
        user_email: userData.user_email || '',
        user_pass: '',
        first_name: userData.first_name || userData.user_details?.first_name || '',
        last_name: userData.last_name || userData.user_details?.last_name || '',
        nickname: userData.nickname || userData.user_details?.nickname || '',
        biography: userData.biography || userData.user_details?.biography || '',
        attachment_file: userData.attachment_file || userData.user_details?.attachment_file || '',
        theme: userData.theme || userData.user_details?.theme || '',
      });

      // Set attachment if exists
      if (userData.attachment_file || userData.attachment_metadata) {
        try {
          const attachmentData = JSON.parse(userData.attachment_file || userData.attachment_metadata);
          setAttachment(attachmentData);
        } catch (e) {
          console.log('No valid attachment data');
        }
      }
    })
    .catch(error => {
      console.error('Failed to fetch user data:', error);
      toastAction.current.showToast('Failed to load profile data', 'error');
    });
  }, []); // empty array means 'run once'

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0 profile-card">
            <ToastMessage ref={toastAction} />
            <form onSubmit={onSubmit}>
              {/* Header */}
              <div className="card-header border-0" style={{ backgroundColor: 'rgb(4, 120, 87)', color: 'white' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="mb-0" style={{ color: 'white' }}>
                    <FontAwesomeIcon icon={solidIconMap.user} className="me-2" />
                    Profile Settings
                  </h4>
                  <button 
                    type="submit" 
                    className="btn btn-light btn-sm"
                    disabled={isLoading}
                  >
                    <FontAwesomeIcon icon={solidIconMap.save} className="me-2" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                    {isLoading && <span className="spinner-border spinner-border-sm ms-2" role="status"></span>}
                  </button>
                </div>
              </div>

              <div className="card-body p-4">
                <div className="row">
                  {/* Left Column */}
                  <div className="col-lg-8">
                    {/* Personal Information */}
                    <div className="card border-0 bg-light mb-4 profile-section">
                      <div className="card-header bg-white border-bottom">
                        <h5 className="mb-0" style={{ color: 'black' }}>
                          <FontAwesomeIcon icon={solidIconMap.user} className="me-2" />
                          Personal Information
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          {/* Username Field */}
                          <div className="col-md-6">
                            <label className="form-label fw-bold">Username</label>
                            <input
                              className="form-control profile-form-control"
                              type="text"
                              value={user.user_login}
                              onChange={ev => setUser({ ...user, user_login: DOMPurify.sanitize(ev.target.value) })}
                              disabled
                            />
                            <small className="text-muted">Usernames cannot be changed.</small>
                          </div>
                          
                          {/* Email Field */}
                          <div className="col-md-6">
                            <label className="form-label fw-bold">Email Address</label>
                            <input
                              className="form-control profile-form-control"
                              type="email"
                              value={user.user_email}
                              onChange={ev => setUser({ ...user, user_email: DOMPurify.sanitize(ev.target.value) })}
                              required
                            />
                            <small className="text-muted">If you change this, an email will be sent to confirm it.</small>
                          </div>

                          {/* First Name Field */}
                          <div className="col-md-6">
                            <label className="form-label fw-bold">First Name</label>
                            <input
                              className="form-control"
                              type="text"
                              value={user.first_name}
                              onChange={ev => setUser({ ...user, first_name: DOMPurify.sanitize(ev.target.value) })}
                              placeholder="Enter your first name"
                            />
                          </div>

                          {/* Last Name Field */}
                          <div className="col-md-6">
                            <label className="form-label fw-bold">Last Name</label>
                            <input
                              className="form-control"
                              type="text"
                              value={user.last_name}
                              onChange={ev => setUser({ ...user, last_name: DOMPurify.sanitize(ev.target.value) })}
                              placeholder="Enter your last name"
                            />
                          </div>

                          {/* Nickname Field */}
                          <div className="col-md-6">
                            <label className="form-label fw-bold">Nickname</label>
                            <input
                              className="form-control"
                              type="text"
                              value={user.nickname}
                              onChange={ev => setUser({ ...user, nickname: DOMPurify.sanitize(ev.target.value) })}
                              placeholder="Enter your nickname"
                            />
                          </div>

                          {/* Theme Field */}
                          <div className="col-md-6">
                            <label className="form-label fw-bold">Theme Preference</label>
                            <select 
                              className="form-select profile-form-control" 
                              value={user?.theme} 
                              onChange={ev => handleSelectedTheme(ev.target.value)}
                            >
                              <option value="">Select Theme</option>
                              <option value="light">Light Theme</option>
                              <option value="dark">Dark Theme</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* About Yourself */}
                    <div className="card border-0 bg-light mb-4 profile-section">
                      <div className="card-header bg-white border-bottom">
                        <h5 className="mb-0" style={{ color: 'black' }}>
                          <FontAwesomeIcon icon={solidIconMap.info} className="me-2" />
                          About Yourself
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <label className="form-label fw-bold">Biographical Information</label>
                          <textarea 
                            className="form-control profile-form-control" 
                            rows={4} 
                            value={user.biography || ''} 
                            onChange={ev => setUser({...user, biography: ev.target.value})}
                            placeholder="Share a little biographical information to fill out your profile..."
                          />
                          <small className="text-muted">This may be shown publicly.</small>
                        </div>
                      </div>
                    </div>

                    {/* Password Section */}
                    <div className="card border-0 bg-light profile-section">
                      <div className="card-header bg-white border-bottom">
                        <h5 className="mb-0" style={{ color: 'black' }}>
                          <FontAwesomeIcon icon={solidIconMap.lock} className="me-2" />
                          Security Settings
                        </h5>
                      </div>
                      <div className="card-body">
                        <PasswordGenerator 
                          label="New Password"
                          setUser={setUser} 
                          user={user}
                          labelClass="col-12 col-md-3"
                          inputClass="col-12 col-md-9"
                        />
                        <small className="text-muted">Leave blank to keep your current password.</small>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="col-lg-4">
                    {/* Profile Picture */}
                    <div className="card border-0 bg-light profile-section">
                      <div className="card-header bg-white border-bottom">
                        <h5 className="mb-0" style={{ color: 'black' }}>
                          <FontAwesomeIcon icon={solidIconMap.image} className="me-2" />
                          Profile Picture
                        </h5>
                      </div>
                      <div className="card-body">
                        <AddMedia onChange={setAttachment} value={user.attachment_metadata} />
                        <small className="text-muted">Upload a profile picture to personalize your account.</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="card-footer bg-light border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Last updated: {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'Never'}
                  </small>
                  <button 
                    type="submit" 
                    className="btn btn-primary profile-submit-btn"
                    disabled={isLoading}
                  >
                    <FontAwesomeIcon icon={solidIconMap.save} className="me-2" />
                    {isLoading ? 'Saving Changes...' : 'Save Profile'}
                    {isLoading && <span className="spinner-border spinner-border-sm ms-2" role="status"></span>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}