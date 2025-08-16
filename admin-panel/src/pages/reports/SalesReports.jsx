import { useState, useRef, useEffect } from "react";
import ToastMessage from "../../components/ToastMessage";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';
import axiosClient from '../../axios-client';

export default function SalesReports() {
  const [filters, setFilters] = useState({ 
    cashier: '', 
    startDate: '', 
    endDate: '',
    promoter: '',
    rate: '',
    search: ''
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const [cashiers, setCashiers] = useState([]);
  const [promoters, setPromoters] = useState([]);
  const [rates, setRates] = useState([]);
  const toastAction = useRef();

  // Fetch sales report data
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/reports/sales', { params: filters });
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch sales report data:', error);
      toastAction.current.showToast('Failed to fetch sales report data', 'error');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter options
  const fetchFilterOptions = async () => {
    setLoading(true);
    try {
      // Fetch all filter options in parallel
      const [cashiersResponse, promotersResponse, ratesResponse] = await Promise.all([
        axiosClient.get('/options/users').catch(() => ({ data: [] })),
        axiosClient.get('/options/promoters').catch(() => ({ data: [] })),
        axiosClient.get('/options/rates').catch(() => ({ data: [] }))
      ]);

      // Set cashiers
      setCashiers([
        { value: '', label: 'All Cashiers' },
        ...(cashiersResponse?.data || []).map(user => ({
          value: user.user_login,
          label: user.name || user.user_login
        }))
      ]);

      // Set promoters
      setPromoters([
        { value: '', label: 'All Promoters' },
        ...(promotersResponse?.data || []).map(promoter => ({
          value: promoter.id.toString(),
          label: promoter.name
        }))
      ]);

      // Set rates
      setRates([
        { value: '', label: 'All Rates' },
        ...(ratesResponse?.data || []).map(rate => ({
          value: rate.id.toString(),
          label: rate.name
        }))
      ]);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
      toastAction.current.showToast('Failed to fetch filter options', 'error');
      
      // Set default values on error
      setCashiers([{ value: '', label: 'All Cashiers' }]);
      setPromoters([{ value: '', label: 'All Promoters' }]);
      setRates([{ value: '', label: 'All Rates' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Export handlers
  const exportData = async (format) => {
    try {
      const response = await axiosClient.post('/reports/sales/export', {
        format,
        filters: filters
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

  const handlePageChange = (page) => {
    fetchData(page);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      cashier: '', 
      startDate: '', 
      endDate: '',
      promoter: '',
      rate: '',
      search: ''
    });
    setData(null);
  };

  const handleSearch = () => {
    fetchData(1);
  };

  return (
    <div className="card">
      <ToastMessage ref={toastAction} />
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4>Sales Reports</h4>
        <div>
          <button className="btn btn-outline-primary me-2" onClick={() => exportData('pdf')}>
            <FontAwesomeIcon icon={solidIconMap.filePdf} className="me-1" /> Export PDF
          </button>
          <button className="btn btn-outline-primary me-2" onClick={() => exportData('csv')}>
            <FontAwesomeIcon icon={solidIconMap.fileCsv} className="me-1" /> Export CSV
          </button>
        </div>
      </div>

      <div className="card-header">
        <div className="row g-2 align-items-end">
          <div className="col-md-2">
            <label className="form-label">Cashier</label>
            <select className="form-select" value={filters.cashier} onChange={e => handleFilterChange('cashier', e.target.value)}>
              {cashiers.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Promoter</label>
            <select className="form-select" value={filters.promoter} onChange={e => handleFilterChange('promoter', e.target.value)}>
              {promoters.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Rate</label>
            <select className="form-select" value={filters.rate} onChange={e => handleFilterChange('rate', e.target.value)}>
              {rates.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Start Date</label>
            <input type="date" className="form-control" value={filters.startDate} onChange={e => handleFilterChange('startDate', e.target.value)} />
          </div>
          <div className="col-md-2">
            <label className="form-label">End Date</label>
            <input type="date" className="form-control" value={filters.endDate} onChange={e => handleFilterChange('endDate', e.target.value)} />
          </div>
          <div className="col-md-2">
            <label className="form-label">Search</label>
            <input type="text" className="form-control" placeholder="Search..." value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} />
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-12">
            <button className="btn btn-primary me-2" onClick={handleSearch}>
              <FontAwesomeIcon icon={solidIconMap.search} className="me-1" /> Search/Filter
            </button>
            <button className="btn btn-outline-secondary" onClick={clearFilters}>
              <FontAwesomeIcon icon={solidIconMap.times} className="me-1" /> Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="card-body">
        {(!data || data.length === 0) && !loading ? (
          <div className="text-center py-4">
            <FontAwesomeIcon icon={solidIconMap.search} className="me-2 text-muted" />
            <p className="text-muted">Please use the filters above and click "Search/Filter" to display sales data.</p>
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
                    <th>Transaction ID</th>
                    <th>Cashier</th>
                    <th>Promoter</th>
                    <th>Rate</th>
                    <th>Quantity</th>
                    <th>Total Amount</th>
                    <th>Paid Amount</th>
                    <th>Change</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data && data.map(row => (
                    <tr key={row.id}>
                      <td>{row.transaction_id}</td>
                      <td>{row.cashier}</td>
                      <td>{row.promoter}</td>
                      <td>{row.rate}</td>
                      <td>{row.quantity}</td>
                      <td>₱{parseFloat(row.total).toFixed(2)}</td>
                      <td>₱{parseFloat(row.paid_amount).toFixed(2)}</td>
                      <td>₱{parseFloat(row.change).toFixed(2)}</td>
                      <td>{row.date}</td>
                    </tr>
                  ))}
                  {(!data || data.length === 0) && (
                    <tr>
                      <td colSpan={9} className="text-center py-4">
                        <FontAwesomeIcon icon={solidIconMap.search} className="me-2 text-muted" />
                        No sales data found for the specified filters.
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