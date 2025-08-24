import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axiosClient from "../../axios-client";
import DataTable from "../../components/table/DataTable";
import NotificationModal from "../../components/NotificationModal";
import ToastMessage from "../../components/ToastMessage";
import SearchBox from "../../components/SearchBox";
import DOMPurify from 'dompurify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';
import { useAccess } from '../../hooks/useAccess';

export default function VIPs() {
  const accessHelper = useAccess();
  const access = accessHelper.hasAccess(); // defaults to window.location.pathname

  const [options, setOptions] = useState({
    dataSource: '/vip-management/vips',
    dataFields: {
      card_number: { name: "Card Number", withSort: true },
      name: { name: "Name", withSort: true },
      validity_days: { name: "Validity Days", withSort: false },
      validity: {
        name: "Validity",
        withSort: false,
        badge: {
          'Good': 'bg-success',
          'Expiring Soon': 'bg-warning text-dark',
          'Expiring': 'bg-danger',
          'Expired': 'bg-danger',
        },
        badgeLabels: {
          'Good': 'Good',
          'Expiring Soon': '5 Days Left',
          'Expiring': '1 Day Left',
          'Expired': 'Expired',
        }
      },
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
      updated_at: { name: "Updated At", withSort: true },
    },
    softDelete: true,
    primaryKey: "id",
    redirectUrl: '',
    edit_link: true,
    bulk_action: false,
  });
  const [params, setParams] = useState({ search: '' });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    status: false,
    validity: false,
    search: false,
  });
  const searchRef = useRef();
  const tableRef = useRef();
  const toastAction = useRef();
  const [expiringVIPs, setExpiringVIPs] = useState([]);
  const [showExpiringModal, setShowExpiringModal] = useState(false);
  const location = useLocation();

  // Handle search action
  const handleSearch = () => {
    const searchValue = searchRef.current.value;
    setParams(prevParams => ({
      ...prevParams,
      search: searchValue,
    }));
  };

  const handleFilterChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
    // Auto-trigger search for non-search fields
    if (key !== 'search') {
      setTimeout(() => handleSearch(), 100);
    }
  };

  // Sync search input with params
  const syncSearchInput = () => {
    if (searchRef.current && searchRef.current.value !== params.search) {
      searchRef.current.value = params.search || '';
    }
  };

  // Effect to sync search input when params change
  useEffect(() => {
    syncSearchInput();
  }, [params.search]);

  const clearFilters = () => {
    setParams({
      search: '',
      status: '',
      validity: '',
    });
    // Clear search input
    if (searchRef.current) {
      searchRef.current.value = '';
    }
    // Close modal after clearing
    setShowFilterModal(false);
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

  // Notification logic for expiring VIPs (mockup)
  useEffect(() => {
    // This would be replaced with real API logic
    // For now, just show a toast if there are expiring soon/expired
    // toastAction.current.showToast('VIP expiring soon!', 'warning');
  }, []);

  useEffect(() => {
    // Fetch expiring VIPs if coming from dashboard or on mount
    axiosClient.get('/vip-management/vips/expiring')
      .then(({ data }) => {
        if (data && data.data && data.data.length > 0) {
          setExpiringVIPs(data.data);
          // Only show modal if coming from dashboard with flag
          if (location.state && location.state.showExpiringModal) {
            setShowExpiringModal(true);
          }
        }
      });
  }, [location.state]);

  const closeExpiringModal = () => setShowExpiringModal(false);

  return (
    <>
      <div className="card mb-2">
        <div className="card-header d-flex justify-content-between align-items-center border-0">
          <h4>VIP Management</h4>
        </div>
        <div className="card-header pb-0 pt-0 border-0">
          <div className="row">
                                      <div className="col-md-7 col-12">
               <div className="d-flex align-items-center gap-2">
                 <SearchBox ref={searchRef} onClick={handleSearch} />
                 <button className="btn btn-primary h-100 text-nowrap" onClick={toggleFilterModal}>
                   <img src="/assets/new-icons/icons-bold/fi-br-filter.svg" alt="Filter" className="me-1" style={{ width: '14px', height: '14px', filter: 'brightness(0) invert(1)' }} />
                   Filters
                 </button>
                 <button className="btn btn-secondary h-100 text-nowrap" onClick={clearFilters}>
                   <img src="/assets/new-icons/icons-bold/fi-br-cross.svg" alt="Clear" className="me-1" style={{ width: '14px', height: '14px', filter: 'brightness(0) invert(1)' }} />
                   Clear
                 </button>
               </div>
             </div>
             <div className="col-md-5 col-12 d-flex justify-content-end align-items-center">
              {access?.can_create && 
                <Link to="/vip-management/vips/create" className="btn btn-primary" type="button">
                  <FontAwesomeIcon icon={solidIconMap.plus} className="me-2" />
                  Enroll New VIP
                </Link>
              }
            </div>
          </div>
        </div>
        <div className="card-body pb-0 pt-3">
          <DataTable options={options} params={params} ref={tableRef} access={access} />
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <>
          <div className="modal-backdrop fade show" onClick={toggleFilterModal}></div>
          <div className={`modal fade show ${showFilterModal ? 'd-block' : ''}`} style={{ zIndex: 1050 }} onClick={toggleFilterModal}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '350px', margin: '0 0 0 auto', height: '100vh' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-content h-100" style={{ height: '100vh', borderRadius: '0', border: 'none' }}>
                <div className="modal-header border-0" style={{ backgroundColor: '#047857', color: 'white' }}>
                  <h5 className="modal-title" style={{ color: 'white' }}>Filters</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={toggleFilterModal}></button>
                </div>
                <div className="modal-body p-4">
                  <p className="text-muted mb-4">Refine results using the filters below.</p>
                  
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
                        <div className="border rounded p-3">
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              name="status" 
                              id="status-all"
                              value=""
                              checked={params.status === ''}
                              onChange={e => handleFilterChange('status', e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="status-all">
                              All Status
                            </label>
                          </div>
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              name="status" 
                              id="status-active"
                              value="Active"
                              checked={params.status === 'Active'}
                              onChange={e => handleFilterChange('status', e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="status-active">
                              Active
                            </label>
                          </div>
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              name="status" 
                              id="status-inactive"
                              value="Inactive"
                              checked={params.status === 'Inactive'}
                              onChange={e => handleFilterChange('status', e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="status-inactive">
                              Inactive
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Validity Filter */}
                  <div className="mb-4">
                    <div 
                      className="d-flex justify-content-between align-items-center cursor-pointer" 
                      onClick={() => toggleSection('validity')}
                      style={{ cursor: 'pointer' }}>
                      <h6 className="fw-bold text-primary mb-0">Validity</h6>
                      <span className="text-muted">
                        <img 
                          src={collapsedSections.validity ? "/assets/new-icons/icons-bold/fi-br-angle-small-down.svg" : "/assets/new-icons/icons-bold/fi-br-angle-small-up.svg"} 
                          alt="Toggle" 
                          style={{ width: '12px', height: '12px' }} 
                        />
                      </span>
                    </div>
                    {!collapsedSections.validity && (
                      <div className="mt-3">
                        <div className="border rounded p-3">
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              name="validity" 
                              id="validity-all"
                              value=""
                              checked={params.validity === ''}
                              onChange={e => handleFilterChange('validity', e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="validity-all">
                              All Validity
                            </label>
                          </div>
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              name="validity" 
                              id="validity-good"
                              value="Good"
                              checked={params.validity === 'Good'}
                              onChange={e => handleFilterChange('validity', e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="validity-good">
                              Good
                            </label>
                          </div>
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              name="validity" 
                              id="validity-expiring-soon"
                              value="Expiring Soon"
                              checked={params.validity === 'Expiring Soon'}
                              onChange={e => handleFilterChange('validity', e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="validity-expiring-soon">
                              Expiring Soon (5 Days Left)
                            </label>
                          </div>
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              name="validity" 
                              id="validity-expiring"
                              value="Expiring"
                              checked={params.validity === 'Expiring'}
                              onChange={e => handleFilterChange('validity', e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="validity-expiring">
                              Expiring (1 Day Left)
                            </label>
                          </div>
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              name="validity" 
                              id="validity-expired"
                              value="Expired"
                              checked={params.validity === 'Expired'}
                              onChange={e => handleFilterChange('validity', e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="validity-expired">
                              Expired
                            </label>
                          </div>
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
                              placeholder="Search VIPs..."
                              value={params.search || ''}
                              onChange={e => {
                                handleFilterChange('search', e.target.value);
                                // Update the main search box as well
                                if (searchRef.current) {
                                  searchRef.current.value = e.target.value;
                                }
                              }}
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
      {showExpiringModal && expiringVIPs.length > 0 && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show" style={{display: 'block'}} tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header bg-warning text-dark">
                  <h5 className="modal-title">Expiring VIPs (5 days or less)</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={closeExpiringModal}></button>
                </div>
                <div className="modal-body p-2">
                  <table className="table table-sm mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Card Number</th>
                        <th>Validity</th>
                        <th>Validity Days</th>
                        <th>Validity End</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expiringVIPs.map((vip) => (
                        <tr key={vip.id}>
                          <td>{vip.name}</td>
                          <td>{vip.card_number}</td>
                          <td><span className={`badge ${vip.validity === 'Good' ? 'bg-success' : vip.validity === 'Expiring Soon' ? 'bg-warning text-dark' : 'bg-danger'}`}>{vip.validity}</span></td>
                          <td>{vip.validity_days}</td>
                          <td>{vip.validity_end}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeExpiringModal}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
} 