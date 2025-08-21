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

export default function Rates() {
  const accessHelper = useAccess();
  const access = accessHelper.hasAccess(); // defaults to window.location.pathname

  const [options, setOptions] = useState({
    dataSource: '/rate-management/rates',
    dataFields: {
      name: { name: "Name", withSort: true },
      description: { name: "Description", withSort: false },
      price: { name: "Price", withSort: true },
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
          <h4>Rates Management</h4>
        </div>
        <div className="card-header pb-0 pt-0 border-0">
          <div className="row">
            <div className="col-md-5 col-12">
              <SearchBox ref={searchRef} onClick={handleSearch} />
            </div>
            <div className="col-md-7 col-12 d-flex justify-content-end align-items-center">
              {access?.can_create && 
                <Link to="/rate-management/rates/create" className="btn btn-primary" type="button">
                  <FontAwesomeIcon icon={solidIconMap.plus} className="me-2" />
                  Add New Rate
                </Link>
              }
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