import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../axios-client";
import DataTable from "../../components/table/DataTable";
import NotificationModal from "../../components/NotificationModal";
import ToastMessage from "../../components/ToastMessage";
import SearchBox from "../../components/SearchBox";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';

export default function SalesReports() {
  const [dataStatus, setDataStatus] = useState({
    totalRows: 0,
    totalTrash: 0,
    classAll: 'current',
    classTrash: null,
  });
  const [options, setOptions] = useState({
    dataSource: '/reports/sales',
    dataFields: {
      transaction_id: { name: "Transaction ID", withSort: true },
      cashier: { name: "Cashier", withSort: true },
      date: { name: "Date", withSort: true },
      amount: { name: "Amount", withSort: true },
      quantity: { name: "Quantity", withSort: true },
      rate_name: { name: "Rate", withSort: true },
      promoter_name: { name: "Promoter", withSort: true },
      created_at: { name: "Created At", withSort: true },
    },
    softDelete: false,
    primaryKey: "id",
    redirectUrl: '',
  });
  const [params, setParams] = useState({ 
    search: '',
    cashier: '',
    startDate: '',
    endDate: '',
    promoter: '',
    rate: ''
  });
  const searchRef = useRef();
  const tableRef = useRef();
  const modalAction = useRef();
  const toastAction = useRef();
  const bulkAction = useRef();
  const [modalParams, setModalParams] = useState({
    id: 'salesReportModal',
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
      dataSource: isTrash ? '/reports/sales/archived' : '/reports/sales',
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

      const response = await axiosClient.post('/reports/sales/export', {
        format,
        filters: exportFilters
      }, {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report-${format}-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toastAction.current.showToast(`Successfully exported sales report as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      toastAction.current.showToast(`Failed to export sales report: ${error.message}`, 'error');
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
          <h4>Sales Reports</h4>
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
            <div className="col-md-3 col-12">
              <div className="input-group">
                <select ref={bulkAction} className="form-select form-select-sm" aria-label="Bulk actions">
                  <option value="">Bulk actions</option>
                  <option value="export">Export Selected</option>
                </select>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => exportData('selected', 'csv')}>
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
      <NotificationModal params={modalParams} ref={modalAction} confirmEvent={() => {}} />
      <ToastMessage ref={toastAction} />
    </>
  );
} 