import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';
import axiosClient from '../../axios-client';
import DataTable from '../../components/table/DataTable';
import ToastMessage from '../../components/ToastMessage';
import { useAccess } from '../../hooks/useAccess';

export default function ClosingReports() {
  const accessHelper = useAccess();
  const access = accessHelper.hasAccess();

  const [options, setOptions] = useState({
    dataSource: '/reports/closing',
    dataFields: {
      session_id: { name: "Session ID", withSort: true },
      cashier: { name: "Cashier", withSort: true },
      opened_at: { name: "Opened At", withSort: true },
      closed_at: { name: "Closed At", withSort: true },
      cash_on_hand: { name: "Opening Cash", withSort: true },
      closing_cash: { name: "Closing Cash", withSort: true },
      total_sales: { name: "Total Sales", withSort: true },
      total_transactions: { name: "Transactions", withSort: true },
      status: { name: "Status", withSort: true }
    },
    primaryKey: "id",
    redirectUrl: '',
    softDelete: false,
    edit_link: false,
    bulk_action: false,
    hide_actions: true,
  });

  const [params, setParams] = useState({ 
    search: '',
    cashier: '', 
    startDate: '', 
    endDate: '',
    status: ''
  });

  const [loading, setLoading] = useState(false);
  const [cashiers, setCashiers] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    dateRange: false,
    cashier: false,
    status: false,
    search: false
  });
  
  const tableRef = useRef();
  const toastAction = useRef();

  // Fetch filter options
  const fetchFilterOptions = async () => {
    setLoading(true);
    try {
      // Fetch cashiers for filter
      const cashiersResponse = await axiosClient.get('/options/users').catch(() => ({ data: [] }));

      // Set cashiers
      console.log('Cashiers API Response:', cashiersResponse?.data);
      setCashiers([
        { value: '', label: 'All Cashiers' },
        ...(cashiersResponse?.data || [])
          .filter(user => user.user_login) // Filter out users without user_login
          .map(user => ({
            value: user.user_login,
            label: user.name || user.user_login
          }))
      ]);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
      toastAction.current.showToast('Failed to fetch filter options', 'error');
      
      // Set default values on error
      setCashiers([{ value: '', label: 'All Cashiers' }]);
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
      const response = await axiosClient.post('/reports/closing/export', {
        format,
        filters: params
      }, {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `closing-report-${format}-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toastAction.current.showToast(`Successfully exported closing report as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      toastAction.current.showToast(`Failed to export closing report: ${error.message}`, 'error');
    }
  };

  const handleFilterChange = (key, value) => {
    console.log('Filter changed:', key, value);
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setParams({
      search: '',
      cashier: '', 
      startDate: '', 
      endDate: '',
      status: ''
    });
    // Close modal after clearing
    setShowFilterModal(false);
  };

  const handleSearch = () => {
    // Trigger a reload of the DataTable with current params
    if (tableRef.current) {
      tableRef.current.clearPage();
    }
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

    return (
    <>
      <div className="card mb-0">
        <div className="card-header d-flex justify-content-between align-items-center border-0 py-2">
          <h5 className="mb-2 mt-2">Closing Reports</h5>
            <div className="d-flex gap-1">
             <button className="btn btn-primary btn-sm" onClick={toggleFilterModal}>
               <img src="/assets/new-icons/icons-bold/fi-br-filter.svg" alt="Filter" className="me-1" style={{ width: '14px', height: '14px', filter: 'brightness(0) invert(1)' }} />
               Filters
             </button>
             <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
               <img src="/assets/new-icons/icons-bold/fi-br-cross.svg" alt="Clear" className="me-1" style={{ width: '14px', height: '14px', filter: 'brightness(0) invert(1)' }} />
               Clear
             </button>
             <button className="btn btn-primary btn-sm me-1" onClick={() => exportData('pdf')}>
               <img src="/assets/new-icons/icons-bold/fi-br-file.svg" alt="Export PDF" className="me-1" style={{ width: '14px', height: '14px', filter: 'brightness(0) invert(1)' }} />
               Export PDF
             </button>
             <button className="btn btn-primary btn-sm me-1" onClick={() => exportData('csv')}>
               <img src="/assets/new-icons/icons-bold/fi-br-file.svg" alt="Export CSV" className="me-1" style={{ width: '14px', height: '14px', filter: 'brightness(0) invert(1)' }} />
               Export CSV
             </button>
           </div>
        </div>
        
        <div className="card-body pb-0 pt-1">
          <DataTable options={options} params={params} ref={tableRef} access={access} />
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <>
          <div className="modal-backdrop fade show" onClick={toggleFilterModal}></div>
          <div className={`modal fade show ${showFilterModal ? 'd-block' : ''}`} style={{ zIndex: 1050 }} onClick={toggleFilterModal}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '350px', margin: '0 0 0 auto' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-content h-100" style={{ height: '100vh', borderRadius: '0', border: 'none' }}>
                <div className="modal-header border-0" style={{ backgroundColor: '#047857', color: 'white' }}>
                  <h5 className="modal-title" style={{ color: 'white' }}>Filters</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={toggleFilterModal}></button>
                </div>
                  <div className="modal-body p-4">
                    <p className="text-muted mb-4">Refine results using the filters below.</p>
                    {/* Date Range Filter */}
                     <div className="mb-4">
                       <div 
                         className="d-flex justify-content-between align-items-center cursor-pointer" 
                         onClick={() => toggleSection('dateRange')}
                         style={{ cursor: 'pointer' }}>
                         <h6 className="fw-bold text-primary mb-0">Date Range</h6>
                          <span className="text-muted">
                            <img 
                              src={collapsedSections.dateRange ? "/assets/new-icons/icons-bold/fi-br-angle-small-down.svg" : "/assets/new-icons/icons-bold/fi-br-angle-small-up.svg"} 
                              alt="Toggle" 
                              style={{ width: '12px', height: '12px' }} 
                            />
                          </span>
                       </div>
                       {!collapsedSections.dateRange && (
                         <div className="mt-3">
                           <div className="row g-2">
                             <div className="col-6">
                               <label className="form-label small">Start Date</label>
                               <input 
                                 type="date" 
                                 className="form-control form-control-sm" 
                                 value={params.startDate} 
                                 onChange={e => handleFilterChange('startDate', e.target.value)} 
                               />
                             </div>
                             <div className="col-6">
                               <label className="form-label small">End Date</label>
                               <input 
                                 type="date" 
                                 className="form-control form-control-sm" 
                                 value={params.endDate} 
                                 onChange={e => handleFilterChange('endDate', e.target.value)} 
                               />
                             </div>
                           </div>
                         </div>
                       )}
                     </div>
                    {/* Cashier Filter */}
                    <div className="mb-4">
                      <div 
                        className="d-flex justify-content-between align-items-center cursor-pointer" 
                        onClick={() => toggleSection('cashier')}
                        style={{ cursor: 'pointer' }}>
                        <h6 className="fw-bold text-primary mb-0">Cashier</h6>
                          <span className="text-muted">
                           <img 
                             src={collapsedSections.cashier ? "/assets/new-icons/icons-bold/fi-br-angle-small-down.svg" : "/assets/new-icons/icons-bold/fi-br-angle-small-up.svg"} 
                             alt="Toggle" 
                             style={{ width: '12px', height: '12px' }} 
                           />
                         </span>
                      </div>
                      {!collapsedSections.cashier && (
                        <div className="mt-3">
                          <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {cashiers
                              .filter(c => c.value !== undefined && c.value !== null) // Additional safety filter
                              .map(c => (
                              <div key={c.value} className="form-check">
                                <input 
                                  className="form-check-input" 
                                  type="radio" 
                                  name="cashier" 
                                  id={`cashier-${c.value}`}
                                  value={c.value}
                                  checked={params.cashier === c.value}
                                  onChange={e => handleFilterChange('cashier', e.target.value)}
                                />
                                <label className="form-check-label" htmlFor={`cashier-${c.value}`}>
                                  {c.label}
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
                          <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {[
                              { value: '', label: 'All Status' },
                              { value: 'open', label: 'Open' },
                              { value: 'closed', label: 'Closed' }
                            ].map(s => (
                              <div key={s.value} className="form-check">
                                <input 
                                  className="form-check-input" 
                                  type="radio" 
                                  name="status" 
                                  id={`status-${s.value}`}
                                  value={s.value}
                                  checked={params.status === s.value}
                                  onChange={e => handleFilterChange('status', e.target.value)}
                                />
                                <label className="form-check-label" htmlFor={`status-${s.value}`}>
                                  {s.label}
                                </label>
                              </div>
                            ))}
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
                                 placeholder="Search sessions..."
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
     <ToastMessage ref={toastAction} />
     </>
  );
}
