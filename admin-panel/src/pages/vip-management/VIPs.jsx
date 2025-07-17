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

export default function VIPs() {
  const [dataStatus, setDataStatus] = useState({
    totalRows: 0,
    totalTrash: 0,
    classAll: 'current',
    classTrash: null,
  });
  const [options, setOptions] = useState({
    dataSource: '/vip-management/vips',
    dataFields: {
      name: { name: "Name", withSort: true },
      card_number: { name: "Card Number", withSort: true },
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
  });
  const [params, setParams] = useState({ search: '' });
  const searchRef = useRef();
  const tableRef = useRef();
  const modalAction = useRef();
  const toastAction = useRef();
  const [modalParams, setModalParams] = useState({
    id: 'vipModal',
    title: "Confirmation",
    descriptions: "Are you sure to apply these changes?",
  });
  const [expiringVIPs, setExpiringVIPs] = useState([]);
  const [showExpiringModal, setShowExpiringModal] = useState(false);
  const location = useLocation();
  const bulkAction = useRef();

  // Helper function to update data source and tabs
  const handleTabChange = (ev, type) => {
    ev.preventDefault();
    const isTrash = type === 'Trash';
    setDataStatus(prevStatus => ({
      ...prevStatus,
      classAll: isTrash ? null : 'current',
      classTrash: isTrash ? 'current' : null,
    }));
    searchRef.current.value = '';
    setParams({ search: '' });
    tableRef.current.clearPage();
    setOptions(prevOptions => ({
      ...prevOptions,
      dataSource: isTrash ? '/vip-management/archived/vips' : '/vip-management/vips',
    }));
  };

  // Handle search action
  const handleSearch = () => {
    setParams(prevParams => ({
      ...prevParams,
      search: searchRef.current.value,
    }));
  };

  // Show total rows and total trash count
  const showSubSub = (all, archived) => {
    setDataStatus(prevStatus => ({
      ...prevStatus,
      totalRows: all,
      totalTrash: archived,
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

  // Show modal and set description based on action
  const showNotificationModal = () => {
    const action = bulkAction.current.value;
    if (!action) {
      toastAction.current.showToast('Please select an action first', 'warning');
      return;
    }
    const isDelete = action === 'delete' && dataStatus.classTrash;
    const message = isDelete
      ? 'You are about to permanently delete these items from your site. This action cannot be undone.'
      : 'Are you sure to apply this change?';
    setModalParams((prev) => ({
      ...prev,
      descriptions: message,
    }));
    modalAction.current.show();
  };

  // Handle bulk actions (restore, delete, force delete)
  const onConfirm = () => {
    const selectedRows = tableRef.current.getSelectedRows();
    const action = bulkAction.current.value;
    if (!action) {
      toastAction.current.showToast('Please select an action first', 'warning');
      return;
    }
    if (selectedRows.length === 0) {
      toastAction.current.showToast('Please select at least one item', 'warning');
      return;
    }
    let url = '';
    if (action === 'restore') {
      url = '/vip-management/vips/bulk/restore';
    } else if (action === 'delete') {
      url = dataStatus.classTrash ? '/vip-management/vips/bulk/force-delete' : '/vip-management/vips/bulk/delete';
    }
    axiosClient.post(url, { ids: selectedRows })
      .then(({ data }) => {
        toastAction.current.showToast(data.message, 'success');
        modalAction.current.hide();
        tableRef.current.reload();
        bulkAction.current.value = '';
      })
      .catch((errors) => {
        toastAction.current.showError(errors.response);
      });
  };

  return (
    <>
      <div className="card mb-2">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4>VIP Management</h4>
          <Link to="/vip-management/vips/create" className="btn btn-primary btn-sm" type="button">
            <FontAwesomeIcon icon={solidIconMap.plus} className="me-2" />
            Enroll New VIP
          </Link>
        </div>
        <div className="card-header">
          <ul className="subsubsub">
            <li>
              <a href="#" className={dataStatus.classAll} onClick={ev => handleTabChange(ev, 'All')}>
                All <span className="count">({dataStatus.totalRows})</span>
              </a>
            </li>
            {dataStatus.totalTrash > 0 && (
              <li>
                |<a href="#" className={dataStatus.classTrash} onClick={ev => handleTabChange(ev, 'Trash')}>
                  Trash <span className="count">({dataStatus.totalTrash})</span>
                </a>
              </li>
            )}
          </ul>
        </div>
        <div className="card-header">
          <div className="row">
            <div className="col-md-3 col-12">
              <div className="input-group">
                <select ref={bulkAction} className="form-select form-select-sm" aria-label="Bulk actions">
                  <option value="">Bulk actions</option>
                  {dataStatus.classTrash && <option value="restore">Restore</option>}
                  {dataStatus.classTrash && <option value="delete">Delete Permanently</option>}
                  {dataStatus.classAll && <option value="delete">Delete</option>}
                </select>
                <button type="button" className="btn btn-primary btn-sm" onClick={showNotificationModal}>
                  Apply
                </button>
              </div>
            </div>
            <div className="col-md-4 col-12 offset-md-5">
              <SearchBox ref={searchRef} onClick={handleSearch} />
            </div>
          </div>
        </div>
        <div className="card-body">
          <DataTable options={options} params={params} ref={tableRef} setSubSub={showSubSub} />
        </div>
      </div>
      <NotificationModal params={modalParams} ref={modalAction} confirmEvent={onConfirm} />
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