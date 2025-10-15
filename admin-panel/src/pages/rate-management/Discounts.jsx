import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../axios-client";
import DataTable from "../../components/table/DataTable";
import ToastMessage from "../../components/ToastMessage";
import SearchBox from "../../components/SearchBox";
import DOMPurify from 'dompurify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';
import { useAccess } from '../../hooks/useAccess';

export default function Discounts() {
  const accessHelper = useAccess();
  const access = accessHelper.hasAccess(); // defaults to window.location.pathname

  const [options, setOptions] = useState({
    dataSource: '/rate-management/discounts',
    dataFields: {
      discount_name: { name: "Discount Name", withSort: true },
      discount_value: {
        name: "Discount Value",
        withSort: true,
        render: (value, row) => {
          console.log('Discount value:', value, 'Full row:', row); // Debug log
          const type = row?.discount_value_type;
          console.log('Type:', type); // Debug log
          
          if (type === 'percentage') {
            return `${value || 0}%`;
          } else if (type === 'amount' || type === 'fixed') {
            const numericValue = parseFloat(value);
            return `₱${isNaN(numericValue) ? '0.00' : numericValue.toFixed(2)}`;
          } else {
            // Fallback for unknown types
            return value || '0';
          }
        },
      },
      discount_value_type: { name: "Type", withSort: true },
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
    type: false,
    search: false,
  });
  const searchRef = useRef();
  const tableRef = useRef();
  const toastAction = useRef();

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
      discount_value_type: '',
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

  return (
    <>
      <div className="card mb-2">
        <div className="card-header d-flex justify-content-between align-items-center border-0">
          <h4>Discounts Management</h4>
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
                <Link to="/rate-management/discounts/create" className="btn btn-primary" type="button">
                  <FontAwesomeIcon icon={solidIconMap.plus} className="me-2" />
                  Add New Discount
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

                  {/* Type Filter */}
                  <div className="mb-4">
                    <div 
                      className="d-flex justify-content-between align-items-center cursor-pointer" 
                      onClick={() => toggleSection('type')}
                      style={{ cursor: 'pointer' }}>
                      <h6 className="fw-bold text-primary mb-0">Discount Type</h6>
                      <span className="text-muted">
                        <img 
                          src={collapsedSections.type ? "/assets/new-icons/icons-bold/fi-br-angle-small-down.svg" : "/assets/new-icons/icons-bold/fi-br-angle-small-up.svg"} 
                          alt="Toggle" 
                          style={{ width: '12px', height: '12px' }} 
                        />
                      </span>
                    </div>
                    {!collapsedSections.type && (
                      <div className="mt-3">
                        <div className="border rounded p-3">
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              name="discount_value_type" 
                              id="type-all"
                              value=""
                              checked={params.discount_value_type === ''}
                              onChange={e => handleFilterChange('discount_value_type', e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="type-all">
                              All Types
                            </label>
                          </div>
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              name="discount_value_type" 
                              id="type-percentage"
                              value="percentage"
                              checked={params.discount_value_type === 'percentage'}
                              onChange={e => handleFilterChange('discount_value_type', e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="type-percentage">
                              Percentage
                            </label>
                          </div>
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              name="discount_value_type" 
                              id="type-amount"
                              value="amount"
                              checked={params.discount_value_type === 'amount'}
                              onChange={e => handleFilterChange('discount_value_type', e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="type-amount">
                              Fixed Amount
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
                              placeholder="Search discounts..."
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
    </>
  );
} 