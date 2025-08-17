import { useRef, useState } from "react"
import { Link } from "react-router-dom";
import axiosClient from "../../axios-client";
import DataTable from "../../components/table/DataTable";
import ToastMessage from "../../components/ToastMessage";
import SearchBox from "../../components/SearchBox";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';
import { useAccess } from '../../hooks/useAccess';

export default function Navigations() {
  const accessHelper = useAccess();
  const access = accessHelper.hasAccess(); // defaults to window.location.pathname

  const [params, setParams] = useState({ search: '' });

  const [options, setOptions] = useState({
    dataSource: '/system-settings/navigation',
    dataFields: {
      name: {name: "Name", withSort: true}, 
      slug: {name: "Slug", withSort: true}, 
      parent_navigation_name: {name: "Parent Name", withSort: false}, 
      active: {
        name: "Status",
        withSort: true,
        badge: {
          'Active': 'bg-success',
          'Inactive': 'bg-warning text-dark'
        },
        badgeLabels: {
          'Active': 'Active',
          'Inactive': 'Inactive'
        }
      },
      show_in_menu: {
        name: "Display Status",
        withSort: true,
        badge: {
          'Yes': 'bg-success',
          'No': 'bg-secondary'
        },
        badgeLabels: {
          'Yes': 'Yes',
          'No': 'No'
        }
      },
      updated_at: {name: "Updated At", withSort: true}
    },
    softDelete: true,
    primaryKey: "id",
    redirectUrl: '',
    otherActions: {},
    edit_link: true,
    bulk_action: false,
  });

  const searchRef = useRef();
  const tableRef = useRef();
  const toastAction = useRef();

  const handleSearch = () => {
    setParams({ ...params, search: searchRef.current.value });
  };

  return (
    <>
      <div className="card mb-2">
        <div className="card-header d-flex justify-content-between align-items-center border-0">
          <h4>
            Navigation
          </h4>
          {access?.can_create && 
            <div className="d-flex gap-2">
              <Link to="/system-settings/navigation/create" className="btn btn-primary" type="button">
                <FontAwesomeIcon icon={solidIconMap.plus} className="me-2" />
                Create New Navigation
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
  )
};