import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../utils/solidIcons';
import axiosClient from '../axios-client';
import { useNavigate } from 'react-router-dom';

const mockStats = {
	liveTransaction: 3,
	views: 1245,
	allTransaction: 3200,
	totalTransactions: 3200,
	totalSales: 158000,
	dailyCounts: 120,
	cashiers: [
		{ name: 'Alice', today: 30, total: 800, sales: 40000 },
		{ name: 'Bob', today: 25, total: 700, sales: 35000 },
		{ name: 'Charlie', today: 20, total: 600, sales: 30000 },
	]
};

const getCurrentDate = () => {
	const now = new Date();
	return now.toLocaleDateString(undefined, {
		weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
	});
};

const validityBadge = (validity) => {
	if (validity === 'Good') return 'bg-success';
	if (validity === 'Expiring Soon') return 'bg-warning text-dark';
	if (validity === 'Expiring') return 'bg-danger';
	if (validity === 'Expired') return 'bg-danger';
	return 'bg-secondary';
};

export default function Dashboard() {
	const [expiringVIPs, setExpiringVIPs] = useState([]);
	const [showVIPNotification, setShowVIPNotification] = useState(false);
	const [showExpiringModal, setShowExpiringModal] = useState(false);
	const expiringModalRef = useRef();
	const navigate = useNavigate();

	useEffect(() => {
		axiosClient.get('/vip-management/vips/expiring')
			.then(({ data }) => {
				if (data && data.data && data.data.length > 0) {
					setExpiringVIPs(data.data);
					setShowVIPNotification(true);
				}
			})
			.catch(() => setExpiringVIPs([]));
	}, []);

	const handleViewList = (e) => {
		e.preventDefault();
		navigate('/vip-management/vips', { state: { showExpiringModal: true } });
	};

	const openExpiringModal = (e) => {
		e.preventDefault();
		setShowExpiringModal(true);
	};

	const closeExpiringModal = () => setShowExpiringModal(false);

	return (
		<div className="dashboard-metrics container-fluid">
			{showVIPNotification && (
				<div className="alert alert-warning d-flex align-items-center" role="alert">
					<FontAwesomeIcon icon={solidIconMap.warning} className="me-2" />
					<strong>Expiring VIPs:</strong>&nbsp;
					{expiringVIPs.length} VIP(s) expiring soon!&nbsp;
					<a href="#" className="btn btn-link btn-sm p-0" onClick={handleViewList} style={{textDecoration: 'underline'}}>View List</a>
				</div>
			)}
			<div className="row g-3 mb-3">
				<div className="col-md-6">
					<div className="card text-center h-100">
						<div className="card-body">
							<FontAwesomeIcon icon={solidIconMap.calendar} className="mb-2 text-primary" size="2x" />
							<h5 className="card-title">Current Date</h5>
							<p className="card-text fs-5 fw-bold">{getCurrentDate()}</p>
						</div>
					</div>
				</div>
				<div className="col-md-6">
					<div className="card text-center h-100">
						<div className="card-body">
							<FontAwesomeIcon icon={solidIconMap.save} className="mb-2 text-info" size="2x" />
							<h5 className="card-title">All Transactions</h5>
							<p className="card-text fs-4 fw-bold">{mockStats.allTransaction}</p>
						</div>
					</div>
				</div>
			</div>
			<div className="row g-3 mb-3">
				<div className="col-md-12">
					<div className="row g-3">
						<div className="col-md-6">
							<div className="card h-100">
								<div className="card-header fw-bold">
									<FontAwesomeIcon icon={solidIconMap.user} className="me-2 text-secondary" />Total Sales (Per Cashier)
								</div>
								<div className="card-body p-2">
									<table className="table table-sm mb-0">
										<thead>
											<tr>
												<th>Cashier</th>
												<th>Transactions</th>
												<th>Sales</th>
											</tr>
										</thead>
										<tbody>
											{mockStats.cashiers.map((c, i) => (
												<tr key={i}>
													<td>{c.name}</td>
													<td>{c.total}</td>
													<td>₱{c.sales.toLocaleString()}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
						<div className="col-md-6">
							<div className="card h-100">
								<div className="card-header fw-bold">
									<FontAwesomeIcon icon={solidIconMap.calendar} className="me-2 text-warning" />Total Transaction Count (Today)
								</div>
								<div className="card-body p-2">
									<table className="table table-sm mb-0">
										<thead>
											<tr>
												<th>Cashier</th>
												<th>Today</th>
											</tr>
										</thead>
										<tbody>
											{mockStats.cashiers.map((c, i) => (
												<tr key={i}>
													<td>{c.name}</td>
													<td>{c.today}</td>
												</tr>
											))}
										</tbody>
									</table>
									<div className="mt-2 text-end">
										<span className="fw-bold">All Transactions Today: </span>
										<span className="text-primary fw-bold">{mockStats.dailyCounts}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="row g-3">
				<div className="col-md-6">
					<div className="card text-center h-100">
						<div className="card-body">
							<FontAwesomeIcon icon={solidIconMap.save} className="mb-2 text-success" size="2x" />
							<h5 className="card-title">Total Sales</h5>
							<p className="card-text fs-4 fw-bold">₱{mockStats.totalSales.toLocaleString()}</p>
						</div>
					</div>
				</div>
				<div className="col-md-6">
					<div className="card text-center h-100">
						<div className="card-body">
							<FontAwesomeIcon icon={solidIconMap.file} className="mb-2 text-dark" size="2x" />
							<h5 className="card-title">Total Transactions</h5>
							<p className="card-text fs-4 fw-bold">{mockStats.totalTransactions}</p>
						</div>
					</div>
				</div>
			</div>
			{/* Expiring VIPs Modal */}
			{showExpiringModal && (
				<div className="modal fade show" style={{display: 'block'}} tabIndex="-1" role="dialog">
					<div className="modal-dialog modal-lg modal-dialog-centered" role="document">
						<div className="modal-content">
							<div className="modal-header bg-warning text-dark">
								<h5 className="modal-title">Expiring VIPs (5 days or less)</h5>
								<button type="button" className="btn-close" aria-label="Close" onClick={closeExpiringModal}></button>
							</div>
							<div className="modal-body p-2">
								<table className="table table-sm mb-0">
									<thead>
										<tr>
											<th>Name</th>
											<th>Card Number</th>
											<th>Validity</th>
											<th>Validity End</th>
										</tr>
									</thead>
									<tbody>
										{expiringVIPs.map((vip) => (
											<tr key={vip.id}>
												<td>{vip.name}</td>
												<td>{vip.card_number}</td>
												<td><span className={`badge ${validityBadge(vip.validity)}`}>{vip.validity}</span></td>
												<td>{vip.validity_end}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<div className="modal-footer">
								<a href="/vip-management/vips" className="btn btn-primary">Go to VIP Management</a>
								<button type="button" className="btn btn-secondary" onClick={closeExpiringModal}>Close</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}