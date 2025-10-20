import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../utils/solidIcons';
import axiosClient from '../axios-client';
import { useNavigate } from 'react-router-dom';

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
	const [dashboardData, setDashboardData] = useState({
		statistics: {
			total_transactions: 0,
			total_sales: 0,
			today_transactions: 0,
			today_sales: 0,
			active_sessions: 0,
			expiring_vips: 0,
		},
		cashier_performance: [],
		today_summary: {
			total_transactions: 0,
			total_sales: 0,
			total_quantity: 0,
		}
	});
	const [expiringVIPs, setExpiringVIPs] = useState([]);
	const [showVIPNotification, setShowVIPNotification] = useState(false);
	const [showExpiringModal, setShowExpiringModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const expiringModalRef = useRef();
	const navigate = useNavigate();

	useEffect(() => {
		loadDashboardData();
		loadExpiringVIPs();
	}, []);

	const loadDashboardData = async () => {
		try {
			setLoading(true);
			const [statsResponse, performanceResponse, summaryResponse] = await Promise.allSettled([
				axiosClient.get('/dashboard/statistics'),
				axiosClient.get('/dashboard/cashier-performance'),
				axiosClient.get('/dashboard/today-summary')
			]);

			// Debug: Log the responses
			console.log('Dashboard Stats Response:', statsResponse);
			console.log('Dashboard Performance Response:', performanceResponse);
			console.log('Dashboard Summary Response:', summaryResponse);

			setDashboardData({
				statistics: statsResponse.status === 'fulfilled' ? statsResponse.value.data.data : {
					total_transactions: 0,
					total_sales: 0,
					today_transactions: 0,
					today_sales: 0,
					active_sessions: 0,
					expiring_vips: 0,
				},
				cashier_performance: performanceResponse.status === 'fulfilled' ? performanceResponse.value.data.data : [],
				today_summary: summaryResponse.status === 'fulfilled' ? summaryResponse.value.data.data : {
					total_transactions: 0,
					total_sales: 0,
					total_quantity: 0,
				},
			});
		} catch (error) {
			console.error('Error loading dashboard data:', error);
			// Ensure data structure is maintained even on error
			setDashboardData(prevData => ({
				...prevData,
				statistics: prevData.statistics || {
					total_transactions: 0,
					total_sales: 0,
					today_transactions: 0,
					today_sales: 0,
					active_sessions: 0,
					expiring_vips: 0,
				},
				cashier_performance: prevData.cashier_performance || [],
				today_summary: prevData.today_summary || {
					total_transactions: 0,
					total_sales: 0,
					total_quantity: 0,
				}
			}));
		} finally {
			setLoading(false);
		}
	};

	const loadExpiringVIPs = async () => {
		try {
			const { data } = await axiosClient.get('/vip-management/vips/expiring');
			if (data && data.data && data.data.length > 0) {
				setExpiringVIPs(data.data);
				setShowVIPNotification(true);
			}
		} catch (error) {
			console.error('Error loading expiring VIPs:', error);
			setExpiringVIPs([]);
		}
	};

	const handleViewList = (e) => {
		e.preventDefault();
		navigate('/vip-management/vips', { state: { showExpiringModal: true } });
	};

	const openExpiringModal = (e) => {
		e.preventDefault();
		setShowExpiringModal(true);
	};

	const closeExpiringModal = () => setShowExpiringModal(false);

	if (loading) {
		return (
			<div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="dashboard-metrics container-fluid">
			{showVIPNotification && (
				<div className="alert alert-warning d-flex align-items-center" role="alert">
					<FontAwesomeIcon icon={solidIconMap.warning} className="me-2" />
					<strong>Expiring VIPs:</strong>&nbsp;
					{expiringVIPs.length} VIP(s) expiring soon!&nbsp;
					<a href="#" className="btn btn-link p-0" onClick={handleViewList} style={{textDecoration: 'underline'}}>View List</a>
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
							<p className="card-text fs-4 fw-bold">{dashboardData.statistics?.total_transactions || 0}</p>
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
											{dashboardData.cashier_performance && dashboardData.cashier_performance.length > 0 ? (
												dashboardData.cashier_performance.map((cashier, i) => (
													<tr key={i}>
														<td>{cashier.name}</td>
														<td>{cashier.total_transactions}</td>
														<td>P{parseFloat(cashier.total_sales || 0).toLocaleString()}</td>
													</tr>
												))
											) : (
												<tr>
													<td colSpan="3" className="text-center text-muted">No cashier data available</td>
												</tr>
											)}
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
											{dashboardData.cashier_performance && dashboardData.cashier_performance.length > 0 ? (
												dashboardData.cashier_performance.map((cashier, i) => (
													<tr key={i}>
														<td>{cashier.name}</td>
														<td>{cashier.today_transactions}</td>
													</tr>
												))
											) : (
												<tr>
													<td colSpan="2" className="text-center text-muted">No cashier data available</td>
												</tr>
											)}
										</tbody>
									</table>
									<div className="mt-2 text-end">
										<span className="fw-bold">All Transactions Today: </span>
										<span className="text-primary fw-bold">{dashboardData.today_summary?.total_transactions || 0}</span>
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
							<p className="card-text fs-4 fw-bold">P{parseFloat(dashboardData.statistics?.total_sales || 0).toLocaleString()}</p>
						</div>
					</div>
				</div>
				<div className="col-md-6">
					<div className="card text-center h-100">
						<div className="card-body">
							<FontAwesomeIcon icon={solidIconMap.file} className="mb-2 text-dark" size="2x" />
							<h5 className="card-title">Today's Sales</h5>
							<p className="card-text fs-4 fw-bold">P{parseFloat(dashboardData.statistics?.today_sales || 0).toLocaleString()}</p>
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