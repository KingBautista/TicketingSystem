import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../axios-client";
import DOMPurify from 'dompurify';

export default function ForgotPassword() {	
	const emailRef = useRef();

	const [isValidated, setValidated] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState(null);
	const [message, setMessage] = useState('');

	const onSubmit = (ev) => {
		ev.preventDefault();
		setIsLoading(true);

		const payload = {
			email: emailRef.current.value,
		};

		axiosClient.post('/generate-password', payload)
			.then(({ data }) => {
				if (data) {
					emailRef.current.value = null;
					setMessage(data.message);
					setValidated('needs-validation');
				}
			})
			.catch((errors) => {
				const response = errors.response;
				if (response && response.status === 422) {
					setErrors(response.data.errors);
				}
			})
			.finally(() => setIsLoading(false));
	};

	// Sanitize the message and errors
	const sanitizedMessage = DOMPurify.sanitize(message);
	const sanitizedErrors = errors ? Object.keys(errors).reduce((acc, key) => {
		acc[key] = DOMPurify.sanitize(errors[key]);
		return acc;
	}, {}) : {};

	return (
		<div className="col-md-6">
			<div className="card mb-4 mx-4">
				<div className="card-body p-4">
					<form onSubmit={onSubmit} className={isValidated}>
						<h1>Forgot your password?</h1>

						{sanitizedMessage && 
							<div className="alert alert-success" role="alert">
								<p>{sanitizedMessage}</p>
							</div>
						}

						<p className="text-body-secondary">Email Address or Username</p>

						<div className="input-group mb-3">
							<span className="input-group-text">
								<svg className="icon">
									<use xlinkHref="assets/vendors/@coreui/icons/svg/free.svg#cil-envelope-open"></use>
								</svg>
							</span>
							<input 
								ref={emailRef}
								className={`form-control ${errors && errors.email ? 'is-invalid' : ''}`}
								type="text"
								placeholder="Email or Username"
								required
							/>
							{errors && errors.email && (
								<div className="invalid-feedback">
									{sanitizedErrors.email}
								</div>
							)}
						</div>

						<div className="row">
							<div className="col-6">
								<button className="btn btn-block btn-primary" type="submit">
									Get New Password &nbsp;
									{isLoading && <span className="spinner-border spinner-border-sm ml-1" role="status"></span>}
								</button>
							</div>
							<div className="col-6 text-end">
								<Link to="/login" className="btn btn-link px-0" type="button">
									Back to Log in
								</Link>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}