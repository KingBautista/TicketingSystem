import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../axios-client";
import DataTable from "../../components/table/DataTable";
import NotificationModal from "../../components/NotificationModal";
import ToastMessage from "../../components/ToastMessage";
import SearchBox from "../../components/SearchBox";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';
import { useAccess } from '../../hooks/useAccess';

export default function Promoters() {
  const accessHelper = useAccess();
  const access = accessHelper.hasAccess(); // defaults to window.location.pathname

  const [dataStatus, setDataStatus] = useState({
    totalRows: 0,
    totalTrash: 0,
    classAll: 'current',
    classTrash: null,
  });
  const [options, setOptions] = useState({
    dataSource: '/promoter-management/promoters',
    dataFields: {
      name: { name: "Name", withSort: true },
      description: { name: "Description", withSort: false },
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
      schedules: {
        name: "Schedules",
        withSort: false,
        render: (row) => {
          try {
            // Handle different data formats
            let schedules = row.schedules;
            
            // If schedules is a string, try to parse it
            if (typeof schedules === 'string') {
              try {
                schedules = JSON.parse(schedules);
              } catch (e) {
                return schedules || '—';
              }
            }
            
            // If schedules is not an array or is empty
            if (!Array.isArray(schedules) || schedules.length === 0) {
              return '—';
            }
            
            // Map schedules to readable format
            const scheduleStrings = schedules.map(schedule => {
              if (typeof schedule === 'object' && schedule !== null) {
                const date = schedule.date || schedule.schedule_date || '';
                const isManual = schedule.is_manual || false;
                return `${date}${isManual ? ' (Manual)' : ''}`;
              }
              return String(schedule);
            });
            
            return scheduleStrings.join(', ');
          } catch (error) {
            console.error('Error rendering schedules:', error);
            return '—';
          }
        },
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
  const bulkAction = useRef();
  const [modalParams, setModalParams] = useState({
    id: 'promoterModal',
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
    searchRef.current.value = '';
    setParams({ search: '' });
    tableRef.current.clearPage();
    setOptions(prevOptions => ({
      ...prevOptions,
      dataSource: isTrash ? '/promoter-management/archived/promoters' : '/promoter-management/promoters',
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
      url = '/promoter-management/promoters/bulk/restore';
    } else if (action === 'delete') {
      url = dataStatus.classTrash ? '/promoter-management/promoters/bulk/force-delete' : '/promoter-management/promoters/bulk/delete';
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

  // Show total rows and total trash count
  const showSubSub = (all, archived) => {
    setDataStatus(prevStatus => ({
      ...prevStatus,
      totalRows: all,
      totalTrash: archived,
    }));
  };

  return (
    <>
      <div className="card mb-2">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4>Promoters Management</h4>
          {access?.can_create && 
            <div className="d-flex gap-2">
              <Link to="/promoter-management/promoters/create" className="btn btn-primary btn-sm" type="button">
                <FontAwesomeIcon icon={solidIconMap.plus} className="me-2" />
                Add New Promoter
              </Link>
            </div>
          }
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
            <div className="col-md-6 col-12 d-flex flex-wrap gap-2 align-items-start">
              {access?.can_delete && 
                <div className="input-group input-group-sm" style={{ flex: '1 1 250px' }}>
                  <select ref={bulkAction} className="form-select" aria-label="Bulk actions">
                    <option value="">Bulk actions</option>
                    {dataStatus.classTrash && <option value="restore">Restore</option>}
                    {dataStatus.classTrash && <option value="delete">Delete Permanently</option>}
                    {dataStatus.classAll && <option value="delete">Delete</option>}
                  </select>
                  <button type="button" className="btn btn-primary" onClick={showNotificationModal}>
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
          <DataTable options={options} params={params} ref={tableRef} setSubSub={showSubSub} access={access} />
        </div>
      </div>
      <NotificationModal params={modalParams} ref={modalAction} confirmEvent={onConfirm} />
      <ToastMessage ref={toastAction} />
    </>
  );
} 