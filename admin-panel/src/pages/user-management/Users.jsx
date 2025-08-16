import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom";
import axiosClient from "../../axios-client";
import DataTable from "../../components/table/DataTable";
import NotificationModal from "../../components/NotificationModal";
import ToastMessage from "../../components/ToastMessage";
import SearchBox from "../../components/SearchBox";
import TreeDropdown from "../../components/TreeDropdown";
import DOMPurify from 'dompurify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';
import { useAccess } from '../../hooks/useAccess';

export default function Users() {

  const accessHelper = useAccess();
  const access = accessHelper.hasAccess(); // defaults to window.location.pathname
  // Grouping states that are related
  const [dataStatus, setDataStatus] = useState({
    totalRows: 0,
    totalTrash: 0,
    classAll: 'current',
    classTrash: null,
  });

  const [options, setOptions] = useState({
    dataSource: '/user-management/users',
    dataFields: {
      user_login: { name: "Username", withSort: true },
      user_email: { name: "Email", withSort: true },
      user_role: { name: "Role", withSort: false },
      user_status: {
        name: "Status",
        withSort: true,
        badge: {
          'Active': 'bg-success',
          'Inactive': 'bg-warning text-dark',
          'Pending': 'bg-info',
          'Suspended': 'bg-danger'
        },
        badgeLabels: {
          'Active': 'Active',
          'Inactive': 'Inactive',
          'Pending': 'Pending',
          'Suspended': 'Suspended'
        }
      },
      updated_at: { name: "Updated At", withSort: true },
    },
    softDelete: true,
    primaryKey: "id",
    redirectUrl: '',
    edit_link: true,
  });

  const [params, setParams] = useState({ search: '' });
  const [roles, setRoles] = useState([]);
  const [roleAction, setRoleAction] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Refs
  const searchRef = useRef();
  const tableRef = useRef();
  const modalAction = useRef();
  const bulkAction = useRef();
  const bulkRole = useRef();
  const toastAction = useRef();

  const [modalParams, setModalParams] = useState({
    id: 'businessModal',
    title: "Confirmation",
    descriptions: "Are you sure to apply these changes?",
  });

  // Helper function to update data source and tabs
  const handleTabChange = (ev, type) => {
    ev.preventDefault();

    const isTrash = type === 'Trash';
    setDataStatus(prevStatus => ({
      ...prevStatus,
      classAll: isTrash ? null : 'current',
      classTrash: isTrash ? 'current' : null,
    }));

    // Clear search input and parameters
    searchRef.current.value = '';
    setParams({ search: '' });
    tableRef.current.clearPage();

    setOptions(prevOptions => ({
      ...prevOptions,
      dataSource: isTrash ? '/user-management/archived/users' : '/user-management/users',
    }));
  };

  // Handle search action
  const handleSearch = () => {
    setParams(prevParams => ({
      ...prevParams,
      search: searchRef.current.value,
    }));
  };

  // Show modal and set description based on action
  const showNotificationModal = () => {
    const action = bulkAction.current.value || roleAction;
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

  // Handle bulk actions (restore, delete, reset_password, or change role)
  const onConfirm = () => {
    const selectedRows = tableRef.current.getSelectedRows();
    const action = bulkAction.current.value || roleAction;

    if (!action) {
      toastAction.current.showToast('Please select an action first', 'warning');
      return;
    }

    if (selectedRows.length === 0) {
      toastAction.current.showToast('Please select at least one item', 'warning');
      return;
    }

    if (action === 'change_role' && !selectedRole) {
      toastAction.current.showToast('Please select a role first', 'warning');
      return;
    }

    const url = getBulkActionUrl(action, dataStatus.classTrash);
    const payload = { ids: selectedRows };

    if (action === 'change_role') {
      payload.role = selectedRole;
    }

    axiosClient.post(url, payload)
    .then(({ data }) => {
      handleActionResponse(action, data);
    }).catch((errors) => {
      toastAction.current.showError(errors.response);
    });
  };

  // Helper to get URL based on action and trash state
  const getBulkActionUrl = (action, isTrash) => {
    switch (action) {
      case 'restore':
        return '/user-management/users/bulk/restore';
      case 'delete':
        return isTrash ? '/user-management/users/bulk/force-delete' : '/user-management/users/bulk/delete';
      case 'reset_password':
        return '/user-management/users/bulk/password';
      case 'change_role':
        return '/user-management/users/bulk/role';
      default:
        return '';
    }
  };

  // Handle API response after bulk action
  const handleActionResponse = (action, data) => {
    const toastType = action === 'restore' || 'change_role' ? 'success' : 'danger';
    toastAction.current.showToast(data.message, toastType);
    modalAction.current.hide();
    tableRef.current.reload();
    bulkAction.current.value = '';
    bulkRole.current.value = '';
  };

  // Show total rows and total trash count
  const showSubSub = (all, archived) => {
    setDataStatus(prevStatus => ({
      ...prevStatus,
      totalRows: all,
      totalTrash: archived,
    }));
  };

  useEffect(() => {
    axiosClient.get(`/options/roles`)
    .then(({ data }) => {
      const roles = data;
      setRoles(roles);
    })
    .catch((errors) => {
      toastAction.current.showError(errors.response);
    });
  }, []);

  return (
    <>
      <div className="card mb-2">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4>Users</h4>
          {access?.can_create && 
            <div className="d-flex gap-2">
              <Link to="/user-management/users/create" className="btn btn-primary" type="button">
                <FontAwesomeIcon icon={solidIconMap.plus} className="me-2" />
                Create New User
              </Link>
            </div>
          }
        </div>
        <div className="card-header">
          <div className="row"> 
            <div className="col-md-8 col-12">
              <SearchBox ref={searchRef} onClick={handleSearch} />
            </div>
          </div>
        </div>
        <div className="card-body">
          <DataTable options={options} params={params} ref={tableRef} setSubSub={showSubSub} access={access} />
        </div>
      </div>
      <NotificationModal params={modalParams} ref={modalAction} confirmEvent={onConfirm} />
      <ToastMessage ref={toastAction} />
    </>
  );
};