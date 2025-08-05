import { useState, useRef, useEffect } from "react";
import ToastMessage from "../../components/ToastMessage";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';
import axiosClient from '../../axios-client';
import { format } from 'date-fns';

export default function AuditTrail() {
  const [filters, setFilters] = useState({ 
    module: '', 
    action: '', 
    user_id: '', 
    start_date: '', 
    end_date: '', 
    search: ''
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [actions, setActions] = useState([]);
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const toastAction = useRef();

  // Fetch audit trail data
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/system-settings/audit-trail', { params: filters });
      setData(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch audit trail data:', error);
      toastAction.current.showToast('Failed to fetch audit trail data', 'error');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for filter
  const fetchUsers = async () => {
    try {
      const response = await axiosClient.get('/options/users');
      setUsers([
        { value: '', label: 'All Users' }, 
        ...(response.data || []).map(user => ({
          value: user.id,
          label: user.name || user.user_login
        }))
      ]);
      return response;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([{ value: '', label: 'All Users' }]);
      throw error;
    }
  };

  // Fetch modules and actions
  const fetchModules = async () => {
    try {
      const response = await axiosClient.get('/system-settings/audit-trail/modules');
      setModules([
        { value: '', label: 'All Modules' }, 
        ...(response.data || []).map(module => ({
          value: module,
          label: module
        }))
      ]);
      return response;
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      setModules([{ value: '', label: 'All Modules' }]);
      throw error;
    }
  };

  const fetchActions = async () => {
    try {
      const response = await axiosClient.get('/system-settings/audit-trail/actions');
      setActions([
        { value: '', label: 'All Actions' }, 
        ...(response.data || []).map(action => ({
          value: action,
          label: action
        }))
      ]);
      return response;
    } catch (error) {
      console.error('Failed to fetch actions:', error);
      setActions([{ value: '', label: 'All Actions' }]);
      throw error;
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const params = { ...filters };
      delete params.per_page;
      const response = await axiosClient.get('/system-settings/audit-trail/stats', { params });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchUsers(),
          fetchModules(),
          fetchActions(),
          fetchData(1)
        ]);
      } catch (error) {
        console.error('Failed to initialize data:', error);
        toastAction.current.showToast('Failed to load some data', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);

  // Export handlers
  const exportData = async (format) => {
    try {
      const response = await axiosClient.post('/system-settings/audit-trail/export', {
        format,
        filters: filters
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

  const handlePageChange = async (page) => {
    try {
      setLoading(true);
      await fetchData(page);
    } catch (error) {
      toastAction.current.showToast('Failed to fetch audit trail data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      module: '', 
      action: '', 
      user_id: '', 
      start_date: '', 
      end_date: '', 
      search: ''
    });
    setData(null);
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      await fetchData(1);
    } catch (error) {
      toastAction.current.showToast('Failed to fetch audit trail data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleStats = () => {
    if (!stats) {
      fetchStats();
    }
    setShowStats(!showStats);
  };

  return (
    <div className="card">
      <ToastMessage ref={toastAction} />
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4>Audit Trail</h4>
        <div>
          <button className="btn btn-outline-info btn-sm me-2" onClick={toggleStats}>
            <FontAwesomeIcon icon={solidIconMap.chartBar} className="me-1" /> 
            {showStats ? 'Hide' : 'Show'} Stats
          </button>
          <button className="btn btn-outline-primary btn-sm me-2" onClick={() => exportData('pdf')}>
            <FontAwesomeIcon icon={solidIconMap.filePdf} className="me-1" /> Export PDF
          </button>
          <button className="btn btn-outline-primary btn-sm me-2" onClick={() => exportData('csv')}>
            <FontAwesomeIcon icon={solidIconMap.fileCsv} className="me-1" /> Export CSV
          </button>
        </div>
      </div>

      {showStats && stats && (
        <div className="card-body border-bottom">
          <div className="row">
            <div className="col-md-3">
              <div className="text-center">
                <h5 className="text-primary">{stats.total_actions}</h5>
                <small className="text-muted">Total Actions</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <h5 className="text-success">{stats.actions_by_module.length}</h5>
                <small className="text-muted">Active Modules</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <h5 className="text-info">{stats.actions_by_type.length}</h5>
                <small className="text-muted">Action Types</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <h5 className="text-warning">{stats.actions_by_user.length}</h5>
                <small className="text-muted">Active Users</small>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card-header">
        <div className="row g-2 align-items-end">
          <div className="col-md-2">
            <label className="form-label">Module</label>
            <select className="form-select" value={filters.module} onChange={e => handleFilterChange('module', e.target.value)}>
              {modules.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Action</label>
            <select className="form-select" value={filters.action} onChange={e => handleFilterChange('action', e.target.value)}>
              {actions.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">User</label>
            <select className="form-select" value={filters.user_id} onChange={e => handleFilterChange('user_id', e.target.value)}>
              {users.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Start Date</label>
            <input type="date" className="form-control" value={filters.start_date} onChange={e => handleFilterChange('start_date', e.target.value)} />
          </div>
          <div className="col-md-2">
            <label className="form-label">End Date</label>
            <input type="date" className="form-control" value={filters.end_date} onChange={e => handleFilterChange('end_date', e.target.value)} />
          </div>
          <div className="col-md-2">
            <label className="form-label">Search</label>
            <input type="text" className="form-control" placeholder="Search..." value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} />
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-12">
            <button className="btn btn-primary btn-sm me-2" onClick={handleSearch}>
              <FontAwesomeIcon icon={solidIconMap.search} className="me-1" /> Search/Filter
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={clearFilters}>
              <FontAwesomeIcon icon={solidIconMap.times} className="me-1" /> Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="card-body">
        {(!data || data.length === 0) && !loading ? (
          <div className="text-center py-4">
            <FontAwesomeIcon icon={solidIconMap.search} className="me-2 text-muted" />
            <p className="text-muted">Please use the filters above and click "Search/Filter" to display audit trail data.</p>
          </div>
        ) : loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th>Date/Time</th>
                    <th>User</th>
                    <th>Module</th>
                    <th>Action</th>
                    <th>Description</th>
                    <th>IP Address</th>
                    <th>User Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {data && data.map(row => (
                    <tr key={row.id}>
                      <td>{format(new Date(row.created_at), 'yyyy-MM-dd HH:mm:ss')}</td>
                      <td>{row.user?.name || row.user?.user_login || 'Unknown'}</td>
                      <td>
                        <span className="badge bg-primary">{row.module}</span>
                      </td>
                      <td>
                        <span className={`badge ${
                          row.action === 'CREATE' ? 'bg-success' :
                          row.action === 'UPDATE' ? 'bg-warning' :
                          row.action === 'DELETE' ? 'bg-danger' :
                          row.action === 'RESTORE' ? 'bg-info' :
                          row.action === 'LOGIN' ? 'bg-success' :
                          row.action === 'LOGOUT' ? 'bg-secondary' :
                          'bg-secondary'
                        }`}>
                          {row.action}
                        </span>
                      </td>
                      <td style={{ maxWidth: '300px', wordWrap: 'break-word' }}>
                        {row.description}
                      </td>
                      <td>
                        <small className="text-muted">{row.ip_address}</small>
                      </td>
                      <td style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                        <small className="text-muted">{row.user_agent}</small>
                      </td>
                    </tr>
                  ))}
                  {(!data || data.length === 0) && (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        <FontAwesomeIcon icon={solidIconMap.search} className="me-2 text-muted" />
                        No audit trail data found for the specified filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-end align-items-center mt-3">
              <div>
                Total Entries: {data ? data.length : 0}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
