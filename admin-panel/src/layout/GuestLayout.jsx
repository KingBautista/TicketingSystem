import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/AuthProvider";

export default function GuestLayout() {
	const {token} = useStateContext();

	if (token) {
		return <Navigate to="/" />
	}

	return (
		<div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
			<div className="container">
				<div className="row justify-content-center">
					<Outlet/>
				</div>
			</div>      
		</div>
	) 
}