import { useState, useRef } from "react";
import ToastMessage from "../../components/ToastMessage";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';
import axiosClient from '../../axios-client';
import { format } from 'date-fns';

const modules = [
  { value: '', label: 'All Modules' },
  { value: 'Login', label: 'Login' },
  { value: 'User Management', label: 'User Management' },
  { value: 'Sales', label: 'Sales' },
  { value: 'VIP Management', label: 'VIP Management' },
  { value: 'Rate Management', label: 'Rate Management' },
  { value: 'Promoter Management', label: 'Promoter Management' },
];

export default function AuditTrail() {
  const [filters, setFilters] = useState({ module: '', startDate: '', endDate: '', user: '' });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [users, setUsers] = useState([]);
  const toastAction = useRef();
  const rowsPerPage = 10;

  // Fetch audit trail data
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/api/audit-trail', { params: filters });
      setData(response.data);
    } catch (error) {
      toastAction.current.showToast('Failed to fetch audit trail data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for filter
  const fetchUsers = async () => {
    try {
      const response = await axiosClient.get('/api/users');
      setUsers([{ value: '', label: 'All Users' }, ...response.data.map(user => ({
        value: user.id,
        label: user.name
      }))]);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useState(() => {
    fetchData();
    fetchUsers();
  }, []);

  // Filter and paginate data
  const filteredData = data.filter(row =>
    (!filters.module || row.module === filters.module) &&
    (!filters.startDate || row.created_at >= filters.startDate) &&
    (!filters.endDate || row.created_at <= filters.endDate) &&
    (!filters.user || row.user_id === filters.user)
  );
  const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Export handlers
  const exportData = async (type, format) => {
    try {
      let dataToExport = type === 'current' ? paginatedData : 
                        type === 'selected' ? data.filter(row => selectedRows.includes(row.id)) :
                        data;

      const response = await axiosClient.post('/api/audit-trail/export', {
        data: dataToExport,
        format
      }, {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-trail-${format}.${format.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toastAction.current.showToast(`Successfully exported audit trail as ${format}`, 'success');
    } catch (error) {
      toastAction.current.showToast(`Failed to export audit trail: ${error.message}`, 'error');
    }
  };

  return (
    <div className="card">
      <ToastMessage ref={toastAction} />
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4>Audit Trail</h4>
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
            <label className="form-label">Module</label>
            <select className="form-select" value={filters.module} onChange={e => setFilters(f => ({ ...f, module: e.target.value }))}>
              {modules.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">User</label>
            <select className="form-select" value={filters.user} onChange={e => setFilters(f => ({ ...f, user: e.target.value }))}>
              {users.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
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
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <>
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th></th>
                  <th>Date/Time</th>
                  <th>User</th>
                  <th>Module</th>
                  <th>Action</th>
                  <th>Description</th>
                  <th>IP Address</th>
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
                    <td>{format(new Date(row.created_at), 'yyyy-MM-dd HH:mm:ss')}</td>
                    <td>{row.user?.name}</td>
                    <td>{row.module}</td>
                    <td>{row.action}</td>
                    <td>{row.description}</td>
                    <td>{row.ip_address}</td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center">No data found.</td>
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
          </>
        )}
      </div>
    </div>
  );
}
