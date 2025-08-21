import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../axios-client";
import DataTable from "../../components/table/DataTable";
import ToastMessage from "../../components/ToastMessage";
import SearchBox from "../../components/SearchBox";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';
import { useAccess } from '../../hooks/useAccess';

export default function Promoters() {
  const accessHelper = useAccess();
  const access = accessHelper.hasAccess(); // defaults to window.location.pathname

  const [options, setOptions] = useState({
    dataSource: '/promoter-management/promoters',
    dataFields: {
      name: { name: "Name", withSort: true },
      description: { name: "Description", withSort: false },
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
      schedules: {
        name: "Schedules",
        withSort: false,
        render: (row) => {
          try {
            // Handle different data formats
            let schedules = row.schedules;
            
            // If schedules is a string, try to parse it
            if (typeof schedules === 'string') {
              try {
                schedules = JSON.parse(schedules);
              } catch (e) {
                return schedules || '—';
              }
            }
            
            // If schedules is not an array or is empty
            if (!Array.isArray(schedules) || schedules.length === 0) {
              return '—';
            }
            
            // Map schedules to readable format
            const scheduleStrings = schedules.map(schedule => {
              if (typeof schedule === 'object' && schedule !== null) {
                const date = schedule.date || schedule.schedule_date || '';
                const isManual = schedule.is_manual || false;
                return `${date}${isManual ? ' (Manual)' : ''}`;
              }
              return String(schedule);
            });
            
            return scheduleStrings.join(', ');
          } catch (error) {
            console.error('Error rendering schedules:', error);
            return '—';
          }
        },
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
    search: false,
  });
  const searchRef = useRef();
  const tableRef = useRef();
  const toastAction = useRef();

  // Handle search action
  const handleSearch = () => {
    setParams(prevParams => ({
      ...prevParams,
      search: searchRef.current.value,
    }));
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
      status: '',
    });
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
          <h4>Promoters Management</h4>
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
                <Link to="/promoter-management/promoters/create" className="btn btn-primary" type="button">
                  <FontAwesomeIcon icon={solidIconMap.plus} className="me-2" />
                  Add New Promoter
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
                              placeholder="Search promoters..."
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