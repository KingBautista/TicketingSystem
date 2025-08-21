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
    bulk_action: false,
  });

  const [params, setParams] = useState({ search: '' });
  const [roles, setRoles] = useState([]);
  const [roleAction, setRoleAction] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    role: false,
    status: false,
    search: false,
  });

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

  const handleFilterChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
    // Auto-trigger search for non-search fields
    if (key !== 'search') {
      setTimeout(() => handleSearch(), 100);
    }
  };

  const clearFilters = () => {
    setParams({
      search: '',
      user_role: '',
      user_status: '',
    });
    // Close modal after clearing
    setShowFilterModal(false);
  };

  const toggleFilterModal = () => {
    setShowFilterModal(!showFilterModal);
  };

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
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
        <div className="card-header d-flex justify-content-between align-items-center border-0">
          <h4>Users</h4>
        </div>
        <div className="card-header pb-0 pt-0 border-0">
          <div className="row"> 
                                      <div className="col-md-7 col-12">
               <div className="d-flex align-items-center gap-2">
                 <SearchBox ref={searchRef} onClick={handleSearch} />
                 <button className="btn btn-primary h-100 text-nowrap" onClick={toggleFilterModal}>
                   <img src="/assets/new-icons/icons-bold/fi-br-filter.svg" alt="Filter" className="me-1" style={{ width: '14px', height: '14px', filter: 'brightness(0) invert(1)' }} />
                   Filters
                 </button>
                 <button className="btn btn-secondary h-100 text-nowrap" onClick={clearFilters}>
                   <img src="/assets/new-icons/icons-bold/fi-br-cross.svg" alt="Clear" className="me-1" style={{ width: '14px', height: '14px', filter: 'brightness(0) invert(1)' }} />
                   Clear
                 </button>
               </div>
             </div>
             <div className="col-md-5 col-12 d-flex justify-content-end align-items-center">
              {access?.can_create && 
                <Link to="/user-management/users/create" className="btn btn-primary" type="button">
                  <FontAwesomeIcon icon={solidIconMap.plus} className="me-2" />
                  Create New User
                </Link>
              }
            </div>
          </div>
        </div>
        <div className="card-body pb-0 pt-3">
          <DataTable options={options} params={params} ref={tableRef} setSubSub={showSubSub} access={access} />
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <>
          <div className="modal-backdrop fade show" onClick={toggleFilterModal}></div>
          <div className={`modal fade show ${showFilterModal ? 'd-block' : ''}`} style={{ zIndex: 1050 }} onClick={toggleFilterModal}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '350px', margin: '0 0 0 auto', height: '100vh' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-content h-100" style={{ height: '100vh', borderRadius: '0', border: 'none' }}>
                <div className="modal-header border-0" style={{ backgroundColor: '#047857', color: 'white' }}>
                  <h5 className="modal-title" style={{ color: 'white' }}>Filters</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={toggleFilterModal}></button>
                </div>
                <div className="modal-body p-4">
                  <p className="text-muted mb-4">Refine results using the filters below.</p>
                  
                  {/* Role Filter */}
                  <div className="mb-4">
                    <div 
                      className="d-flex justify-content-between align-items-center cursor-pointer" 
                      onClick={() => toggleSection('role')}
                      style={{ cursor: 'pointer' }}>
                      <h6 className="fw-bold text-primary mb-0">Role</h6>
                      <span className="text-muted">
                        <img 
                          src={collapsedSections.role ? "/assets/new-icons/icons-bold/fi-br-angle-small-down.svg" : "/assets/new-icons/icons-bold/fi-br-angle-small-up.svg"} 
                          alt="Toggle" 
                          style={{ width: '12px', height: '12px' }} 
                        />
                      </span>
                    </div>
                    {!collapsedSections.role && (
                      <div className="mt-3">
                        <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              name="user_role" 
                              id="role-all"
                              value=""
                              checked={params.user_role === ''}
                              onChange={e => handleFilterChange('user_role', e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="role-all">
                              All Roles
                            </label>
                          </div>
                          {roles.map(role => (
                            <div key={role.id} className="form-check">
                              <input 
                                className="form-check-input" 
                                type="radio" 
                                name="user_role" 
                                id={`role-${role.id}`}
                                value={role.name}
                                checked={params.user_role === role.name}
                                onChange={e => handleFilterChange('user_role', e.target.value)}
                              />
                              <label className="form-check-label" htmlFor={`role-${role.id}`}>
                                {role.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Filter */}
                  <div className="mb-4">
                    <div 
                      className="d-flex justify-content-between align-items-center cursor-pointer" 
                      onClick={() => toggleSection('status')}
                      style={{ cursor: 'pointer' }}>
                      <h6 className="fw-bold text-primary mb-0">Status</h6>
                      <span className="text-muted">
                        <img 
                          src={collapsedSections.status ? "/assets/new-icons/icons-bold/fi-br-angle-small-down.svg" : "/assets/new-icons/icons-bold/fi-br-angle-small-up.svg"} 
                          alt="Toggle" 
                          style={{ width: '12px', height: '12px' }} 
                        />
                      </span>
                    </div>
                    {!collapsedSections.status && (
                      <div className="mt-3">
                        <div className="border rounded p-3">
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              name="user_status" 
                              id="status-all"
                              value=""
                              checked={params.user_status === ''}
                              onChange={e => handleFilterChange('user_status', e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="status-all">
                              All Status
                            </label>
                          </div>
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              name="user_status" 
                              id="status-active"
                              value="Active"
                              checked={params.user_status === 'Active'}
                              onChange={e => handleFilterChange('user_status', e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="status-active">
                              Active
                            </label>
                          </div>
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              name="user_status" 
                              id="status-inactive"
                              value="Inactive"
                              checked={params.user_status === 'Inactive'}
                              onChange={e => handleFilterChange('user_status', e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="status-inactive">
                              Inactive
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Search Filter */}
                  <div className="mb-4">
                    <div 
                      className="d-flex justify-content-between align-items-center cursor-pointer" 
                      onClick={() => toggleSection('search')}
                      style={{ cursor: 'pointer' }}>
                      <h6 className="fw-bold text-primary mb-0">Search</h6>
                      <span className="text-muted">
                        <img 
                          src={collapsedSections.search ? "/assets/new-icons/icons-bold/fi-br-angle-small-down.svg" : "/assets/new-icons/icons-bold/fi-br-angle-small-up.svg"} 
                          alt="Toggle" 
                          style={{ width: '12px', height: '12px' }} 
                        />
                      </span>
                    </div>
                    {!collapsedSections.search && (
                      <div className="mt-3">
                        <div className="mb-3">
                          <label className="form-label">Search</label>
                          <div className="input-group">
                            <input 
                              type="text" 
                              className="form-control" 
                              placeholder="Search users..."
                              value={params.search}
                              onChange={e => handleFilterChange('search', e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleSearch();
                                }
                              }}
                            />
                            <button 
                              className="btn btn-primary" 
                              type="button"
                              onClick={handleSearch}
                            >
                              <img 
                                src="/assets/new-icons/icons-bold/fi-br-search.svg" 
                                alt="Search" 
                                style={{ width: '14px', height: '14px', filter: 'brightness(0) invert(1)' }} 
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <NotificationModal params={modalParams} ref={modalAction} confirmEvent={onConfirm} />
      <ToastMessage ref={toastAction} />
    </>
  );
};