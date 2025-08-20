import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';
import axiosClient from '../../axios-client';
import DataTable from '../../components/table/DataTable';
import ToastMessage from '../../components/ToastMessage';
import { useAccess } from '../../hooks/useAccess';

export default function SalesReports() {
  const accessHelper = useAccess();
  const access = accessHelper.hasAccess();

  const [options, setOptions] = useState({
    dataSource: '/reports/sales',
    dataFields: {
      transaction_id: { name: "Transaction ID", withSort: true },
      cashier: { name: "Cashier", withSort: true },
      promoter: { name: "Promoter", withSort: true },
      rate: { name: "Rate", withSort: true },
      quantity: { name: "Quantity", withSort: true },
      total: { 
         name: "Total Amount", 
         withSort: true,
       },
       paid_amount: { 
         name: "Paid Amount", 
         withSort: true,
       },
       change: { 
         name: "Change", 
         withSort: true,
       },
      date: { name: "Date", withSort: true }
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
    promoter: '',
    rate: ''
  });

  const [loading, setLoading] = useState(false);
  const [cashiers, setCashiers] = useState([]);
  const [promoters, setPromoters] = useState([]);
  const [rates, setRates] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    dateRange: false,
    cashier: false,
    promoter: false,
    rate: false,
    search: false
  });
  
  const tableRef = useRef();
  const toastAction = useRef();

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
        filters: params
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
      cashier: '', 
      startDate: '', 
      endDate: '',
      promoter: '',
      rate: ''
    });
    // Close modal after clearing
    setShowFilterModal(false);
  };

  const handleSearch = () => {
    // The DataTable will automatically reload when params change
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
          <h5 className="mb-0">Sales Reports</h5>
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
          <DataTable 
            options={options} 
            params={params} 
            ref={tableRef}
            access={access}
          />
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <>
          <div className="modal-backdrop fade show" onClick={toggleFilterModal}></div>
          <div 
            className={`modal fade show ${showFilterModal ? 'd-block' : ''}`} 
            style={{ zIndex: 1050 }}
            onClick={toggleFilterModal}
          >
                         <div 
               className="modal-dialog modal-dialog-centered" 
               style={{ maxWidth: '350px', margin: '0 0 0 auto' }}
               onClick={(e) => e.stopPropagation()}
             >
              <div className="modal-content h-100" style={{ height: '100vh', borderRadius: '0', border: 'none' }}>
                                 <div className="modal-header border-0" style={{ backgroundColor: '#047857', color: 'white' }}>
                   <h5 className="modal-title">Filters</h5>
                   <button type="button" className="btn-close btn-close-white" onClick={toggleFilterModal}></button>
                 </div>
                                   <div className="modal-body p-4">
                    <p className="text-muted mb-4">Refine results using the filters below.</p>
                    
                                         {/* Date Range Filter */}
                     <div className="mb-4">
                       <div 
                         className="d-flex justify-content-between align-items-center cursor-pointer" 
                         onClick={() => toggleSection('dateRange')}
                         style={{ cursor: 'pointer' }}
                       >
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
                        style={{ cursor: 'pointer' }}
                      >
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
                            {cashiers.map(c => (
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

                                       {/* Promoter Filter */}
                    <div className="mb-4">
                      <div 
                        className="d-flex justify-content-between align-items-center cursor-pointer" 
                        onClick={() => toggleSection('promoter')}
                        style={{ cursor: 'pointer' }}
                      >
                        <h6 className="fw-bold text-primary mb-0">Promoter</h6>
                                                 <span className="text-muted">
                           <img 
                             src={collapsedSections.promoter ? "/assets/new-icons/icons-bold/fi-br-angle-small-down.svg" : "/assets/new-icons/icons-bold/fi-br-angle-small-up.svg"} 
                             alt="Toggle" 
                             style={{ width: '12px', height: '12px' }} 
                           />
                         </span>
                      </div>
                      {!collapsedSections.promoter && (
                        <div className="mt-3">
                          <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {promoters.map(p => (
                              <div key={p.value} className="form-check">
                                <input 
                                  className="form-check-input" 
                                  type="radio" 
                                  name="promoter" 
                                  id={`promoter-${p.value}`}
                                  value={p.value}
                                  checked={params.promoter === p.value}
                                  onChange={e => handleFilterChange('promoter', e.target.value)}
                                />
                                <label className="form-check-label" htmlFor={`promoter-${p.value}`}>
                                  {p.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                                       {/* Rate Filter */}
                    <div className="mb-4">
                      <div 
                        className="d-flex justify-content-between align-items-center cursor-pointer" 
                        onClick={() => toggleSection('rate')}
                        style={{ cursor: 'pointer' }}
                      >
                        <h6 className="fw-bold text-primary mb-0">Rate</h6>
                                                 <span className="text-muted">
                           <img 
                             src={collapsedSections.rate ? "/assets/new-icons/icons-bold/fi-br-angle-small-down.svg" : "/assets/new-icons/icons-bold/fi-br-angle-small-up.svg"} 
                             alt="Toggle" 
                             style={{ width: '12px', height: '12px' }} 
                           />
                         </span>
                      </div>
                      {!collapsedSections.rate && (
                        <div className="mt-3">
                          <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {rates.map(r => (
                              <div key={r.value} className="form-check">
                                <input 
                                  className="form-check-input" 
                                  type="radio" 
                                  name="rate" 
                                  id={`rate-${r.value}`}
                                  value={r.value}
                                  checked={params.rate === r.value}
                                  onChange={e => handleFilterChange('rate', e.target.value)}
                                />
                                <label className="form-check-label" htmlFor={`rate-${r.value}`}>
                                  {r.label}
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
                         style={{ cursor: 'pointer' }}
                       >
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
                                 placeholder="Search transactions..."
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