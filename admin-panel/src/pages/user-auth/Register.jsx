import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../axios-client";
import DOMPurify from 'dompurify';

export default function Register() {
  // Refs for form inputs
  const userNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmationRef = useRef();

  // State management
  const [isValidated, setIsValidated] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Set form errors
  const setFormErrors = (errorData) => {
    setErrors({
      username: errorData.username || [],
      email: errorData.email || [],
      password: errorData.password || [],
    });

    // Clear input fields that have errors
    if (errorData.username) userNameRef.current.value = '';
    if (errorData.email) emailRef.current.value = '';
    if (errorData.password) {
      passwordRef.current.value = '';
      passwordConfirmationRef.current.value = '';
    }
  };

  // Handle form submission
  const onSubmit = (ev) => {
    ev.preventDefault();
    setIsLoading(true);
    setIsValidated('needs-validation');

    const payload = {
      username: DOMPurify.sanitize(userNameRef.current.value),
      email: DOMPurify.sanitize(emailRef.current.value),
      password: passwordRef.current.value,
      password_confirmation: passwordConfirmationRef.current.value,
    };

    axiosClient
      .post('/signup', payload)
      .then(({ data }) => {
        if (data.message) {
          setMessage(data.message);
          // Reset form after successful registration
          userNameRef.current.value = '';
          emailRef.current.value = '';
          passwordRef.current.value = '';
          passwordConfirmationRef.current.value = '';
          setIsValidated('');
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 422) {
          setFormErrors(error.response.data.errors);
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="col-md-6">
      <div className="card mb-4 mx-4">
        <div className="card-body p-4">
          <form onSubmit={onSubmit} className={isValidated}>
            <h1>Register</h1>
            <p className="text-body-secondary">Create your account</p>

            {message && (
              <div className="alert alert-success" role="alert">
                <h4 className="alert-heading">Well done!</h4>
                <p>{message}</p>
              </div>
            )}

            <div className="input-group has-validation mb-3">
              <span className="input-group-text">
                <svg className="icon">
                  <use xlinkHref="assets/vendors/@coreui/icons/svg/free.svg#cil-user" />
                </svg>
              </span>
              <input
                ref={userNameRef}
                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                type="text"
                placeholder="Username"
                required
              />
              {errors.username && (
                <div className="invalid-feedback">
                  {errors.username.map((err, idx) => (
                    <div key={idx}>{err}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="input-group mb-3">
              <span className="input-group-text">
                <svg className="icon">
                  <use xlinkHref="assets/vendors/@coreui/icons/svg/free.svg#cil-envelope-open" />
                </svg>
              </span>
              <input
                ref={emailRef}
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                type="email"
                placeholder="Email"
                required
              />
              {errors.email && (
                <div className="invalid-feedback">
                  {errors.email.map((err, idx) => (
                    <div key={idx}>{err}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="input-group mb-3">
              <span className="input-group-text">
                <svg className="icon">
                  <use xlinkHref="assets/vendors/@coreui/icons/svg/free.svg#cil-lock-locked" />
                </svg>
              </span>
              <input
                ref={passwordRef}
                className="form-control"
                type="password"
                placeholder="Password"
                required
              />
            </div>

            <div className="input-group mb-4">
              <span className="input-group-text">
                <svg className="icon">
                  <use xlinkHref="assets/vendors/@coreui/icons/svg/free.svg#cil-lock-locked" />
                </svg>
              </span>
              <input
                ref={passwordConfirmationRef}
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                type="password"
                placeholder="Repeat password"
                required
              />
              {errors.password && (
                <div className="invalid-feedback">
                  {errors.password.map((err, idx) => (
                    <div key={idx}>{err}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="row">
              <div className="col-6">
                <button className="btn btn-block btn-primary" type="submit">
                  Create Account &nbsp;
                  {isLoading && <span className="spinner-border spinner-border-sm ml-1" role="status" />}
                </button>
              </div>
              <div className="col-6 text-end">
                <Link to="/login" className="btn btn-link px-0" type="button">
                  Log in
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};