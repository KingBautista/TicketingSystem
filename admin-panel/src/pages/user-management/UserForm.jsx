import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../axios-client";
import ToastMessage from "../../components/ToastMessage";
import Field from "../../components/Field";
import DOMPurify from 'dompurify';
import PasswordGenerator from "../../components/PasswordGenerator";
 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toastAction = useRef();
  
  const [roles, setRoles] = useState([]);
  const [buttonText, setButtonText] = useState('Create User');
  const [user, setUser] = useState({
    id: null,
    user_login: '',
    user_email: '',
    user_pass: '',
    first_name: '',
    last_name: '',
    user_role: '',
    user_status: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Load user data for editing (if ID exists)
  useEffect(() => {
    if (id) {
      setButtonText('Save');
      setIsLoading(true);
      axiosClient.get(`/user-management/users/${id}`)
        .then(({ data }) => {
          setUser(data);
          setIsLoading(false);
          setIsActive(data.user_status === 'Inactive' ? false : true);
        })
        .catch((errors) => {
          toastAction.current.showError(errors.response);
          setIsLoading(false); // Ensure loading state is cleared
        });
    }
  }, [id]);

  useEffect(() => {
    axiosClient.get(`/options/roles`)
    .then(({ data }) => {
      const roles = data;
      setRoles(roles);
    })
    .catch((errors) => {
      toastAction.current.showError(errors.response);
    });
  }, []);

  // Handle form submission
  const onSubmit = (ev) => {
    ev.preventDefault();
    
    // Validate required fields
    if (!user.user_role_id) {
      toastAction.current.showToast('Please select a role', 'warning');
      return;
    }

    setIsLoading(true);

    // Prepare the data for submission
    const submitData = {
      ...user,
      user_status: isActive,
      first_name: user.user_details?.first_name || '',
      last_name: user.user_details?.last_name || '',
    };

    const request = user.id
      ? axiosClient.put(`/user-management/users/${user.id}`, submitData)
      : axiosClient.post('/user-management/users', submitData);

    request
      .then(() => {
        const action = user.id ? 'updated' : 'added';
        toastAction.current.showToast(`User has been ${action}.`, 'success');
        setIsLoading(false);
        setTimeout(() => navigate('/user-management/users'), 2000);
      })
      .catch((errors) => {
        toastAction.current.showError(errors.response);
        setIsLoading(false); // Ensure loading state is cleared
      });
  };

  // Handle delete
  const handleDelete = () => {
    if (!user.id) return;
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      setIsLoading(true);
      axiosClient.delete(`/user-management/users/${user.id}`)
        .then(() => {
          toastAction.current.showToast('User has been deleted.', 'success');
          setIsLoading(false);
          setTimeout(() => navigate('/user-management/users'), 2000);
        })
        .catch((errors) => {
          toastAction.current.showError(errors.response);
          setIsLoading(false);
        });
    }
  };

  return (
    <>
    <div className="card">
      <form onSubmit={onSubmit}>
        <div className="card-header">
          <h4>
            {user.id ? 'Edit User' : 'Create New User'}
          </h4>
          {!user.id && <p className="tip-message">Create a new user and add them to this site.</p>}
        </div>
        <div className="card-body">
          {/* Username Field */}
          <Field
            label="Username"
            required={true}
            inputComponent={
              <input
                className="form-control"
                type="text"
                value={user.user_login}
                onChange={ev => setUser({ ...user, user_login: DOMPurify.sanitize(ev.target.value) })}
                required
              />
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          {/* Email Field */}
          <Field
            label="Email"
            required={true}
            inputComponent={
              <input
                className="form-control"
                type="text"
                value={user.user_email}
                onChange={ev => setUser({ ...user, user_email: DOMPurify.sanitize(ev.target.value) })}
                required
              />
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          {/* First Name Field */}
          <Field
            label="First Name"
            inputComponent={
              <input
                className="form-control"
                type="text"
                value={user.user_details?.first_name || ''}
                onChange={ev => setUser({ 
                  ...user, 
                  user_details: {
                    ...user.user_details,
                    first_name: DOMPurify.sanitize(ev.target.value)
                  }
                })}
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
                className="form-control"
                type="text"
                value={user.user_details?.last_name || ''}
                onChange={ev => setUser({ 
                  ...user, 
                  user_details: {
                    ...user.user_details,
                    last_name: DOMPurify.sanitize(ev.target.value)
                  }
                })}
              />
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          {/* Password Field */}
          <PasswordGenerator 
            label="Password"
            setUser={setUser} 
            user={user}
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          {/* Role Field */}
          <Field
            label="Role"
            required={true}
            inputComponent={
              <select
                className="form-select"
                value={user?.user_role_id || ''}
                onChange={ev => setUser({ ...user, user_role_id: ev.target.value })}
                required
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          {/* Active Field */}
          <Field
            label="Active"
            inputComponent={
              <input
                className="form-check-input"
                type="checkbox"
                checked={isActive}
                onChange={() => setIsActive(!isActive)}
              />
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
        </div>
        <div className="card-footer d-flex justify-content-between">
          <div>
            <Link type="button" to="/user-management/users" className="btn btn-secondary">
              <FontAwesomeIcon icon={solidIconMap.arrowleft} className="me-2" />
              Cancel
            </Link> &nbsp;
            <button type="submit" className="btn btn-primary">
              <FontAwesomeIcon icon={solidIconMap.save} className="me-2" />
              {buttonText} &nbsp;
              {isLoading && <span className="spinner-border spinner-border-sm ml-1" role="status"></span>}
            </button>
          </div>
          {user.id && (
            <button 
              type="button" 
              className="btn btn-danger" 
              onClick={handleDelete}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={solidIconMap.trash} className="me-2" />
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
    <ToastMessage ref={toastAction} />
    </>
  );
}