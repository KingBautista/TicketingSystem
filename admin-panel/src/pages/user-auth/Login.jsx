import { Link, useParams } from "react-router-dom";
import { useStateContext } from "../../contexts/AuthProvider";
import { useRef, useState, useEffect } from "react";
import axiosClient from "../../axios-client";
import DOMPurify from 'dompurify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';

export default function Login() {
	const { vcode } = useParams();
	const emailRef = useRef();
	const passwordRef = useRef();

	const [isValidated, setValidated] = useState();
	const [message, setMessage] = useState();
	const [errors, setErrors] = useState();
	const [isLoading, setIsLoading] = useState();
	const [showPassword, setShowPassword] = useState(false);

	const { setToken, setUserRoutes } = useStateContext();

  useEffect(() => {
    localStorage.setItem('isReloaded', 'false');
  }, []);

	const validateUser = (code) => {
		const payload = {
			activation_key: code
		};

		axiosClient.post('/validate', payload)
		.then(({data}) => {
			if(data.message) {
				setMessage(data.message);
			}
		});
	};

	if(vcode) {
		validateUser(vcode);
	}

	const onSubmit = (ev) => {
		ev.preventDefault();
		setIsLoading(true);

		const payload = {
			email: emailRef.current.value,
			password: passwordRef.current.value,
		};

		axiosClient.post('/login', payload)
		.then(({data}) => {
			setToken(data.token);
			setUserRoutes(data.user.user_routes || []);
			if (data.user.user_role_id == 4) {
				localStorage.setItem('theme', 'light');
				localStorage.setItem('user_role_id', data.user.user_role_id);
				navigate('/cashier');
			} else {
				localStorage.setItem('theme', data.user?.theme || 'light');
				localStorage.setItem('user_role_id', data.user.user_role_id);
				navigate('/dashboard');
			}
		})
		.catch((errors) => {
			const response = errors.response;
			if(response && response.status === 422) {
				emailRef.current.value = null;
				passwordRef.current.value = null;
				setErrors(response.data.errors);
				setValidated('needs-validation was-validated');
				setIsLoading(false);
			}
		});
	};

	// Sanitize the message and errors
	const sanitizedMessage = message ? DOMPurify.sanitize(message) : '';
	const sanitizedErrors = errors ? Object.keys(errors).reduce((acc, key) => {
		acc[key] = DOMPurify.sanitize(errors[key]);
		return acc;
	}, {}) : {};

	useEffect(() => {
    localStorage.clear();
    localStorage.setItem('theme', 'light');
  }, []);

	return (
		<div className="col-lg-9">
			<div className="row g-0 rounded-4 overflow-hidden shadow-lg" style={{ backgroundColor: 'white' }}>
				{/* Login Form - Left Side */}
				<div className="col-lg-6">
					<div className="h-100 d-flex flex-column justify-content-center">
						<div className="p-4">
							{/* Header Section */}
							<div className="text-center mb-4">
								<div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle mb-2" style={{ width: '50px', height: '50px' }}>
									<FontAwesomeIcon icon={solidIconMap.user} className="text-primary fs-5" />
								</div>
								<h1 className="fw-bold text-dark mb-1">Welcome Back</h1>
								<p className="text-muted mb-0">Sign in to continue to your account</p>
							</div>

							<form onSubmit={onSubmit} className={isValidated}>
								{/* Success Message */}
								{sanitizedMessage && 
									<div className="alert alert-success border-0 shadow-sm" role="alert">
										<div className="d-flex align-items-center">
											<FontAwesomeIcon icon={solidIconMap.check} className="text-success me-2" />
											<p className="mb-0 fw-medium">{sanitizedMessage}</p>
										</div>
									</div>
								}
								
								{/* Error Messages */}
								{Object.keys(sanitizedErrors).length > 0 && 
									<div className="alert alert-danger border-0 shadow-sm" role="alert">
										<div className="d-flex align-items-center mb-2">
											<FontAwesomeIcon icon={solidIconMap.exclamationTriangle} className="text-danger me-2" />
											<span className="fw-medium">Please fix the following errors:</span>
										</div>
										{Object.keys(sanitizedErrors).map(key => (
											<div key={key} className="ms-4">• {sanitizedErrors[key]}</div>
										))}
									</div>
								}
								
								{/* Email/Username Input */}
								<div className="mb-3">
									<label htmlFor="email" className="form-label fw-medium text-dark mb-1">Email or Username</label>
									<div className="input-group">
										<span className="input-group-text bg-light border-end-0 border-2">
											<FontAwesomeIcon icon={solidIconMap.user} className="text-muted" />
										</span>
										<input 
											id="email"
											ref={emailRef} 
											className="form-control border-start-0 border-2" 
											type="text" 
											placeholder="Enter your email or username" 
											required
											style={{ fontSize: '1rem' }}
										/>
									</div>
								</div>
								
								{/* Password Input */}
								<div className="mb-3">
									<label htmlFor="password" className="form-label fw-medium text-dark mb-1">Password</label>
									<div className="input-group">
										<span className="input-group-text bg-light border-end-0 border-2">
											<FontAwesomeIcon icon={solidIconMap.lock} className="text-muted" />
										</span>
										<input
											id="password"
											ref={passwordRef}
											className="form-control border-start-0 border-2"
											type={showPassword ? "text" : "password"}
											placeholder="Enter your password"
											required
											style={{ fontSize: '1rem' }}
										/>
									</div>
								</div>
								
								{/* Show Password Toggle */}
								<div className="mb-3">
									<div className="form-check">
										<input
											type="checkbox"
											id="showPassword"
											checked={showPassword}
											onChange={() => setShowPassword(!showPassword)}
											className="form-check-input"
											style={{ 
												width: '1.2em', 
												height: '1.2em',
												accentColor: '#321fdb'
											}}
										/>
										<label htmlFor="showPassword" className="form-check-label text-muted fw-medium">
											Show password
										</label>
									</div>
								</div>
								
								{/* Submit Button */}
								<div className="mb-3">
									<button 
										className="btn btn-primary w-100 fw-semibold" 
										type="submit"
										disabled={isLoading}
										style={{ 
											padding: '0.6rem 1.2rem',
											fontSize: '1rem',
											borderRadius: '0.5rem'
										}}
									>
										{isLoading ? (
											<>
												<span className="spinner-border spinner-border-sm me-2" role="status"></span>
												Signing In...
											</>
										) : (
											<>
												<FontAwesomeIcon icon={solidIconMap.signIn} className="me-2" />
												Sign In
											</>
										)}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
				
				{/* Logo Section - Right Side */}
				<div className="col-lg-6 position-relative">
					<div 
						className="h-100 d-flex align-items-center justify-content-center"
						style={{ 
							background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
							minHeight: '500px'
						}}
					>
						{/* Background Pattern */}
						<div 
							className="position-absolute w-100 h-100"
							style={{
								backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)',
								backgroundSize: '200px 200px'
							}}
						></div>
						
						{/* Content */}
						<div className="text-center text-white position-relative">
							{/* Logo */}
							<div className="mb-3">
								<img 
									src="/assets/img/hitec-logo.png" 
									alt="HITEC Logo" 
									className="img-fluid"
									style={{ 
										maxWidth: '250px', 
										height: 'auto',
										filter: 'brightness(1.2) contrast(1.1) drop-shadow(0 0 15px rgba(255,255,255,0.5))'
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}