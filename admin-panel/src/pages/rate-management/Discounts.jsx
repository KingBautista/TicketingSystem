import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../axios-client";
import DataTable from "../../components/table/DataTable";
import NotificationModal from "../../components/NotificationModal";
import ToastMessage from "../../components/ToastMessage";
import SearchBox from "../../components/SearchBox";
import DOMPurify from 'dompurify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';

export default function Discounts() {
  const [dataStatus, setDataStatus] = useState({
    totalRows: 0,
    totalTrash: 0,
    classAll: 'current',
    classTrash: null,
  });
  const [options, setOptions] = useState({
    dataSource: '/rate-management/discounts',
    dataFields: {
      discount_name: { name: "Discount Name", withSort: true },
      discount_value: { name: "Discount Value", withSort: true },
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
      created_at: { name: "Created At", withSort: true },
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
    id: 'discountModal',
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
      dataSource: isTrash ? '/rate-management/archived/discounts' : '/rate-management/discounts',
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
      url = '/rate-management/discounts/bulk/restore';
    } else if (action === 'delete') {
      url = dataStatus.classTrash ? '/rate-management/discounts/bulk/force-delete' : '/rate-management/discounts/bulk/delete';
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
          <h4>Discounts Management</h4>
          <Link to="/rate-management/discounts/create" className="btn btn-primary btn-sm" type="button">
            <FontAwesomeIcon icon={solidIconMap.plus} className="me-2" />
            Add New Discount
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
    </>
  );
} 