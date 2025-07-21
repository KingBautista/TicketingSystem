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
		<div className="col-lg-5">
			<div className="card-group d-block d-md-flex row">
				<div className="card col-md-7 p-4 mb-0">
					<div className="card-body">
						<form onSubmit={onSubmit} className={isValidated}>
							<h1>Sign In</h1>
							<p className="text-body-secondary">Sign In to your account</p>
							{sanitizedMessage && 
								<div className="alert alert-success" role="alert">
									<p>{sanitizedMessage}</p>
								</div>
							}
							{Object.keys(sanitizedErrors).length > 0 && 
								<div className="alert alert-danger" role="alert">
									{Object.keys(sanitizedErrors).map(key => (
										<div key={key}>{sanitizedErrors[key]}</div>
									))}
								</div>
							}
							<div className="input-group mb-3">
								<span className="input-group-text">
									<FontAwesomeIcon icon={solidIconMap.user} />
								</span>
								<input ref={emailRef} className="form-control" type="text" placeholder="Email" required/>
							</div>
							<div className="input-group mb-3">
								<span className="input-group-text">
									<FontAwesomeIcon icon={solidIconMap.lock} />
								</span>
								<input
									ref={passwordRef}
									className="form-control"
									type={showPassword ? "text" : "password"}
									placeholder="Password"
									required
								/>
							</div>
							<div className="mb-3 d-flex align-items-center" style={{marginTop: '-0.5rem'}}>
								<input
									type="checkbox"
									id="showPassword"
									checked={showPassword}
									onChange={() => setShowPassword(!showPassword)}
									style={{ accentColor: '#321fdb', width: '1.1em', height: '1.1em', verticalAlign: 'middle', marginTop: '-2px' }}
								/>
								<label htmlFor="showPassword" className="show-password-label ms-2 mb-0" style={{ fontSize: '0.97em', color: '#4f5d73', cursor: 'pointer', userSelect: 'none', verticalAlign: 'middle' }}>Show Password</label>
							</div>
							<div className="row">
								<div className="col-6">
									<button className="btn btn-block btn-primary" type="submit">Sign In &nbsp;
										{isLoading && <span className="spinner-border spinner-border-sm ml-1" role="status"></span>}
									</button>
								</div>
								<div className="col-6 text-end">
									<Link to="/forgot-password" className="btn btn-link px-0" type="button">Forgot password?</Link>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}