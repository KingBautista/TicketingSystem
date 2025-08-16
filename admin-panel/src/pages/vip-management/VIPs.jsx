import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axiosClient from "../../axios-client";
import DataTable from "../../components/table/DataTable";
import NotificationModal from "../../components/NotificationModal";
import ToastMessage from "../../components/ToastMessage";
import SearchBox from "../../components/SearchBox";
import DOMPurify from 'dompurify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';
import { useAccess } from '../../hooks/useAccess';

export default function VIPs() {
  const accessHelper = useAccess();
  const access = accessHelper.hasAccess(); // defaults to window.location.pathname

  const [options, setOptions] = useState({
    dataSource: '/vip-management/vips',
    dataFields: {
      card_number: { name: "Card Number", withSort: true },
      name: { name: "Name", withSort: true },
      validity_days: { name: "Validity Days", withSort: false },
      validity: {
        name: "Validity",
        withSort: false,
        badge: {
          'Good': 'bg-success',
          'Expiring Soon': 'bg-warning text-dark',
          'Expiring': 'bg-danger',
          'Expired': 'bg-danger',
        },
        badgeLabels: {
          'Good': 'Good',
          'Expiring Soon': '5 Days Left',
          'Expiring': '1 Day Left',
          'Expired': 'Expired',
        }
      },
      status: {
        name: "Status",
        withSort: true,
        badge: {
          'Active': 'bg-success',
          'Inactive': 'bg-secondary'
        },
        badgeLabels: {
          'Active': 'Active',
          'Inactive': 'Inactive'
        }
      },
      updated_at: { name: "Updated At", withSort: true },
    },
    softDelete: true,
    primaryKey: "id",
    redirectUrl: '',
    edit_link: true,
    bulk_action: false,
  });
  const [params, setParams] = useState({ search: '' });
  const searchRef = useRef();
  const tableRef = useRef();
  const toastAction = useRef();
  const [expiringVIPs, setExpiringVIPs] = useState([]);
  const [showExpiringModal, setShowExpiringModal] = useState(false);
  const location = useLocation();

  // Handle search action
  const handleSearch = () => {
    setParams(prevParams => ({
      ...prevParams,
      search: searchRef.current.value,
    }));
  };

  // Notification logic for expiring VIPs (mockup)
  useEffect(() => {
    // This would be replaced with real API logic
    // For now, just show a toast if there are expiring soon/expired
    // toastAction.current.showToast('VIP expiring soon!', 'warning');
  }, []);

  useEffect(() => {
    // Fetch expiring VIPs if coming from dashboard or on mount
    axiosClient.get('/vip-management/vips/expiring')
      .then(({ data }) => {
        if (data && data.data && data.data.length > 0) {
          setExpiringVIPs(data.data);
          // Only show modal if coming from dashboard with flag
          if (location.state && location.state.showExpiringModal) {
            setShowExpiringModal(true);
          }
        }
      });
  }, [location.state]);

  const closeExpiringModal = () => setShowExpiringModal(false);

  return (
    <>
      <div className="card mb-2">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4>VIP Management</h4>
          {access?.can_create && 
            <div className="d-flex gap-2">
              <Link to="/vip-management/vips/create" className="btn btn-primary" type="button">
                <FontAwesomeIcon icon={solidIconMap.plus} className="me-2" />
                Enroll New VIP
              </Link>
            </div>
          }
        </div>
        <div className="card-header pb-0 pt-0">
          <div className="row">
            <div className="col-md-5 col-12">
              <SearchBox ref={searchRef} onClick={handleSearch} />
            </div>
          </div>
        </div>
        <div className="card-body pb-0 pt-3">
          <DataTable options={options} params={params} ref={tableRef} access={access} />
        </div>
      </div>
      <ToastMessage ref={toastAction} />
      {showExpiringModal && expiringVIPs.length > 0 && (
        <>
          <div className="modal-backdrop fade show"></div>
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
                        <th>Validity Days</th>
                        <th>Validity End</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expiringVIPs.map((vip) => (
                        <tr key={vip.id}>
                          <td>{vip.name}</td>
                          <td>{vip.card_number}</td>
                          <td><span className={`badge ${vip.validity === 'Good' ? 'bg-success' : vip.validity === 'Expiring Soon' ? 'bg-warning text-dark' : 'bg-danger'}`}>{vip.validity}</span></td>
                          <td>{vip.validity_days}</td>
                          <td>{vip.validity_end}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeExpiringModal}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
} 