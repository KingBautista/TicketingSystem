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

  return (
    <>
      <div className="card mb-2">
        <div className="card-header d-flex justify-content-between align-items-center border-0">
          <h4>Promoters Management</h4>
          {access?.can_create && 
            <div className="d-flex gap-2">
              <Link to="/promoter-management/promoters/create" className="btn btn-primary" type="button">
                <FontAwesomeIcon icon={solidIconMap.plus} className="me-2" />
                Add New Promoter
              </Link>
            </div>
          }
        </div>
        <div className="card-header pb-0 pt-0 border-0">
          <div className="row">
            <div className="col-md-5 col-12">
              <SearchBox ref={searchRef} onClick={handleSearch} />
            </div>
          </div>
        </div>
        <div className="card-body pb-0 pt-3">
          <DataTable options={options} params={params} ref={tableRef} access={access} />
        </div>
      </div>
      <ToastMessage ref={toastAction} />
    </>
  );
} 