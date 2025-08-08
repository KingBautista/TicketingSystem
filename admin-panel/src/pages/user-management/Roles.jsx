import { useRef, useState } from "react"
import { Link } from "react-router-dom";
import axiosClient from "../../axios-client";
import DataTable from "../../components/table/DataTable";
import NotificationModal from "../../components/NotificationModal";
import ToastMessage from "../../components/ToastMessage";
import SearchBox from "../../components/SearchBox";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';
import { useAccess } from '../../hooks/useAccess';

export default function Roles() {
  const accessHelper = useAccess();
  const access = accessHelper.hasAccess(); // defaults to window.location.pathname

  const [totalRows, setTotalRows] = useState(0);
  const [totalTrash, setTotalTrash] = useState(0);
  const [activeTab, setActiveTab] = useState('all');  // 'all' or 'trash'
  const [params, setParams] = useState({ search: '' });
  const [modalDescription, setModalDescription] = useState("");

  const searchRef = useRef();
  const tableRef = useRef();
  const modalAction = useRef();
  const bulkAction = useRef();
  const toastAction = useRef();

  const [options, setOptions] = useState({
    dataSource: '/user-management/roles',
    dataFields: {
      name: {name: "Name", withSort: true}, 
      active: {
        name: "Status",
        withSort: true,
        badge: {
          'Active': 'bg-success',
          'Inactive': 'bg-warning text-dark'
        },
        badgeLabels: {
          'Active': 'Active',
          'Inactive': 'Inactive'
        }
      },
      updated_at: {name: "Updated At", withSort: true}
    },
    softDelete: true,
    primaryKey: "id",
    redirectUrl: '',
    otherActions: {}
  });
  
  const modalParams = {
    id: 'categoryModal',
    title: "Confirmation",
    descriptions: modalDescription,
  };

  const handleTabSwitch = (ev, tab) => {
    ev.preventDefault();
    setActiveTab(tab);

    const url = tab === 'trash' ? '/user-management/archived/roles' : '/user-management/roles';

    searchRef.current.value = null;
    tableRef.current.clearPage();
    setOptions(prevOptions => ({ ...prevOptions, dataSource: url }));
  };

  const handleSearch = () => {
    setParams({ ...params, search: searchRef.current.value });
  };

  const showModalNotification = () => {
    const action = bulkAction.current.value;
    if (!action) {
      toastAction.current.showToast('Please select an action first', 'warning');
      return;
    }

    let message = '';

    if (activeTab === 'trash' && action === 'delete') {
      message = 'You are about to permanently delete these items. This action cannot be undone.'
    } else {
      message = 'Are you sure to apply these changes?'
    }
    setModalDescription(message);
    modalAction.current.show();
  };

  const handleBulkActionConfirmation = () => {
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
    let payload = { ids: selectedRows };

    switch (action) {
      case 'restore':
        url = '/user-management/roles/bulk/restore';
        break;
      case 'delete':
        url = activeTab === 'trash' 
          ? '/user-management/roles/bulk/force-delete' 
          : '/user-management/roles/bulk/delete';
        break;
      default:
        break;
    }

    axiosClient.post(url, payload)
    .then(({ data }) => {
      handleActionResponse(action, data);
    }).catch((errors) => {
      toastAction.current.showError(errors.response);
    });
  };

  // Handle API response after bulk action
  const handleActionResponse = (action, data) => {
    const toastType = action === 'restore' ? 'success' : 'danger';
    toastAction.current.showToast(data.message, toastType);
    modalAction.current.hide();
    tableRef.current.reload();
    bulkAction.current.value = '';
  };

  const updateTotalCount = (all, trashed) => {
    setTotalRows(all);
    setTotalTrash(trashed);
  };

  return (
    <>
      <div className="card mb-2">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4>Roles</h4>
          {access?.can_create && 
            <div className="d-flex gap-2">
              <Link to="/user-management/roles/create" className="btn btn-primary btn-sm" type="button">
                <FontAwesomeIcon icon={solidIconMap.plus} className="me-2" />
                Create New Role
              </Link>
            </div>
          }
        </div>
        <div className="card-header">
          <ul className="subsubsub">
            <li>
              <a
                href="#"
                className={activeTab === 'all' ? 'current' : ''}
                onClick={(ev) => handleTabSwitch(ev, 'all')}>
                All <span className="count">({totalRows})</span>
              </a>
            </li>
            {totalTrash > 0 && (
              <li>
                <a
                  href="#"
                  className={activeTab === 'trash' ? 'current' : ''}
                  onClick={(ev) => handleTabSwitch(ev, 'trash')}>
                  Trash <span className="count">({totalTrash})</span>
                </a>
              </li>
            )}
          </ul>
        </div>
        <div className="card-header">
          <div className="row">
            <div className="col-md-6 col-12 d-flex flex-wrap gap-2 align-items-start">
              {access?.can_delete && 
                <div className="input-group input-group-sm" style={{ flex: '1 1 250px' }}>
                  <select ref={bulkAction} className="form-select" aria-label="Bulk actions">
                    <option value="">Bulk actions</option>
                    {activeTab === 'trash' && <option value="restore">Restore</option>}
                    {activeTab === 'trash' && <option value="delete">Delete Permanently</option>}
                    {activeTab === 'all' && <option value="delete">Delete</option>}                  
                  </select>
                  <button type="button" className="btn btn-primary" onClick={showModalNotification}>
                    Apply
                  </button>
                </div>
              }
            </div>
            <div className="col-md-4 col-12 offset-md-2">
              <SearchBox ref={searchRef} onClick={handleSearch} />
            </div>
          </div>
        </div>
        <div className="card-body">
          <DataTable options={options} params={params} ref={tableRef} setSubSub={updateTotalCount} access={access} />
        </div>
      </div>
      <NotificationModal params={modalParams} ref={modalAction} confirmEvent={handleBulkActionConfirmation} />
      <ToastMessage ref={toastAction} />
    </>
  )
};