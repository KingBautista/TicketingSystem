import { useState, useRef } from "react";
import ToastMessage from "../../components/ToastMessage";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';

// Sample JSON data
const sampleData = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  cashier: `Cashier ${((i % 3) + 1)}`,
  transaction_id: `TXN${1000 + i}`,
  date: `2024-06-${(i % 30 + 1).toString().padStart(2, '0')}`,
  amount: (Math.random() * 100 + 10).toFixed(2),
}));

const cashiers = [
  { value: '', label: 'All Cashiers' },
  { value: 'Cashier 1', label: 'Cashier 1' },
  { value: 'Cashier 2', label: 'Cashier 2' },
  { value: 'Cashier 3', label: 'Cashier 3' },
];

export default function SalesReports() {
  const [filters, setFilters] = useState({ cashier: '', startDate: '', endDate: '' });
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const toastAction = useRef();
  const rowsPerPage = 10;

  // Filtered and paginated data
  const filteredData = sampleData.filter(row =>
    (!filters.cashier || row.cashier === filters.cashier) &&
    (!filters.startDate || row.date >= filters.startDate) &&
    (!filters.endDate || row.date <= filters.endDate)
  );
  const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Export handlers (simulate for now)
  const exportData = (type, format) => {
    let dataToExport = [];
    if (type === 'current') {
      dataToExport = paginatedData;
    } else if (type === 'selected') {
      dataToExport = sampleData.filter(row => selectedRows.includes(row.id));
    }
    toastAction.current.showToast(`Exporting ${dataToExport.length} records as ${format.toUpperCase()}.`, 'info');
    // Implement actual export logic here
  };

  return (
    <div className="card">
      <ToastMessage ref={toastAction} />
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4>Sales Reports</h4>
        <div>
          <button className="btn btn-outline-primary btn-sm me-2" onClick={() => exportData('current', 'pdf')}>
            <FontAwesomeIcon icon={solidIconMap.filePdf} className="me-1" /> Export Current Page (PDF)
          </button>
          <button className="btn btn-outline-primary btn-sm me-2" onClick={() => exportData('current', 'csv')}>
            <FontAwesomeIcon icon={solidIconMap.fileCsv} className="me-1" /> Export Current Page (CSV)
          </button>
          <button className="btn btn-outline-success btn-sm me-2" onClick={() => exportData('selected', 'pdf')} disabled={selectedRows.length === 0}>
            <FontAwesomeIcon icon={solidIconMap.filePdf} className="me-1" /> Export Selected (PDF)
          </button>
          <button className="btn btn-outline-success btn-sm" onClick={() => exportData('selected', 'csv')} disabled={selectedRows.length === 0}>
            <FontAwesomeIcon icon={solidIconMap.fileCsv} className="me-1" /> Export Selected (CSV)
          </button>
        </div>
      </div>
      <div className="card-header">
        <div className="row g-2 align-items-end">
          <div className="col-md-3">
            <label className="form-label">Cashier</label>
            <select className="form-select" value={filters.cashier} onChange={e => setFilters(f => ({ ...f, cashier: e.target.value }))}>
              {cashiers.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Start Date</label>
            <input type="date" className="form-control" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div className="col-md-3">
            <label className="form-label">End Date</label>
            <input type="date" className="form-control" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
          </div>
        </div>
      </div>
      <div className="card-body">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th></th>
              <th>Transaction ID</th>
              <th>Cashier</th>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map(row => (
              <tr key={row.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={e => {
                      setSelectedRows(sel =>
                        e.target.checked
                          ? [...sel, row.id]
                          : sel.filter(id => id !== row.id)
                      );
                    }}
                  />
                </td>
                <td>{row.transaction_id}</td>
                <td>{row.cashier}</td>
                <td>{row.date}</td>
                <td>{row.amount}</td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center">No data found.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="d-flex justify-content-between align-items-center">
          <div>Page {page} of {totalPages}</div>
          <div>
            <button className="btn btn-sm btn-outline-secondary me-2" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
            <button className="btn btn-sm btn-outline-secondary" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
} 