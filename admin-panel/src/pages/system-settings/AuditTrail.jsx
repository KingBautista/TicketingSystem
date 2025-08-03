import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../axios-client";
import DataTable from "../../components/table/DataTable";
import NotificationModal from "../../components/NotificationModal";
import ToastMessage from "../../components/ToastMessage";
import SearchBox from "../../components/SearchBox";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';

export default function AuditTrail() {
  const [dataStatus, setDataStatus] = useState({
    totalRows: 0,
    totalTrash: 0,
    classAll: 'current',
    classTrash: null,
  });
  const [options, setOptions] = useState({
    dataSource: '/system-settings/audit-trail',
    dataFields: {
      created_at: { name: "Date/Time", withSort: true },
      user: { name: "User", withSort: false },
      module: { name: "Module", withSort: true },
      action: { 
        name: "Action", 
        withSort: true,
        badge: {
          'CREATE': 'bg-success',
          'UPDATE': 'bg-warning',
          'DELETE': 'bg-danger',
          'RESTORE': 'bg-info',
          'VIEW': 'bg-primary',
          'LOGIN': 'bg-success',
          'LOGOUT': 'bg-secondary',
          'EXPORT': 'bg-info',
          'BULK_DELETE': 'bg-danger',
          'BULK_RESTORE': 'bg-info',
          'PASSWORD_RESET': 'bg-warning',
          'PASSWORD_VALIDATION': 'bg-primary'
        },
        badgeLabels: {
          'CREATE': 'CREATE',
          'UPDATE': 'UPDATE',
          'DELETE': 'DELETE',
          'RESTORE': 'RESTORE',
          'VIEW': 'VIEW',
          'LOGIN': 'LOGIN',
          'LOGOUT': 'LOGOUT',
          'EXPORT': 'EXPORT',
          'BULK_DELETE': 'BULK DELETE',
          'BULK_RESTORE': 'BULK RESTORE',
          'PASSWORD_RESET': 'PASSWORD RESET',
          'PASSWORD_VALIDATION': 'PASSWORD VALIDATION'
        }
      },
      description: { name: "Description", withSort: false },
      ip_address: { name: "IP Address", withSort: false },
      user_agent: { name: "User Agent", withSort: false },
    },
    softDelete: false,
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
    id: 'auditTrailModal',
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
      dataSource: isTrash ? '/system-settings/audit-trail/archived' : '/system-settings/audit-trail',
    }));
  };

  // Handle search action
  const handleSearch = () => {
    setParams(prevParams => ({
      ...prevParams,
      search: searchRef.current.value,
    }));
  };

  // Export handlers
  const exportData = async (type, format) => {
    try {
      let exportFilters = { ...params };
      
      if (type === 'selected' && tableRef.current.getSelectedRows().length > 0) {
        exportFilters.selected_ids = tableRef.current.getSelectedRows();
      }

      const response = await axiosClient.post('/system-settings/audit-trail/export', {
        format,
        filters: exportFilters
      }, {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-trail-${format}-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toastAction.current.showToast(`Successfully exported audit trail as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      toastAction.current.showToast(`Failed to export audit trail: ${error.message}`, 'error');
    }
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
          <h4>Audit Trail</h4>
          <div>
            <button className="btn btn-outline-primary btn-sm me-2" onClick={() => exportData('current', 'pdf')}>
              <FontAwesomeIcon icon={solidIconMap.filePdf} className="me-1" /> Export Current (PDF)
            </button>
            <button className="btn btn-outline-primary btn-sm me-2" onClick={() => exportData('current', 'csv')}>
              <FontAwesomeIcon icon={solidIconMap.fileCsv} className="me-1" /> Export Current (CSV)
            </button>
            <button className="btn btn-outline-success btn-sm me-2" onClick={() => exportData('selected', 'pdf')} disabled={tableRef.current?.getSelectedRows()?.length === 0}>
              <FontAwesomeIcon icon={solidIconMap.filePdf} className="me-1" /> Export Selected (PDF)
            </button>
            <button className="btn btn-outline-success btn-sm" onClick={() => exportData('selected', 'csv')} disabled={tableRef.current?.getSelectedRows()?.length === 0}>
              <FontAwesomeIcon icon={solidIconMap.fileCsv} className="me-1" /> Export Selected (CSV)
            </button>
          </div>
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
            <div className="col-md-4 col-12 offset-md-8">
              <SearchBox ref={searchRef} onClick={handleSearch} />
            </div>
          </div>
        </div>
        <div className="card-body">
          <DataTable options={options} params={params} ref={tableRef} setSubSub={showSubSub} />
        </div>
      </div>
      <NotificationModal params={modalParams} ref={modalAction} confirmEvent={() => {}} />
      <ToastMessage ref={toastAction} />
    </>
  );
}
