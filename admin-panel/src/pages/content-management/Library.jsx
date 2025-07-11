import { useRef, useState } from "react"
import { Link } from "react-router-dom";
import axiosClient from "../../axios-client";
import DataTable from "../../components/table/DataTable";
import MediaGrid from "../../components/grid/MediaGrid";
import NotificationModal from "../../components/NotificationModal";
import MediaDateDropdown from "../../components/MediaDateDropdown";
import MediaTypeDropdown from "../../components/MediaTypeDropdown";
import SearchBox from "../../components/SearchBox";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';

export default function Library() {
  const [mode, setMode] = useState('grid');
  const [editMode, setEditMode] = useState(true);
  const [params, setParams] = useState({ mode: 'grid', type: '', date: '', search: '' });

  const searchRef = useRef();
  const mediaTypeRef = useRef();
  const mediaDateRef = useRef();
  const refMedia = useRef();
  const tableRef = useRef();
  const modalAction = useRef();
  const bulkAction = useRef();

  const options = {
    dataSource: '/content-management/media-library',
    dataFields: {
      file_name: { name: 'File Name', withSort: true, attachment: 'thumbnail_url', downloadUrl: "file_url" },
      file_type: { name: 'File Type', withSort: true },
      file_dimensions: { name: 'Dimensions', withSort: false },
      updated_at: { name: 'Updated At', withSort: true },
    },
    softDelete: false,
    primaryKey: 'id',
    redirectUrl: '',
    otherActions: {},
  };

  const notificationParams = {
    id: 'bulkDeleteNotif',
    title: 'Confirmation',
    descriptions: 'You are about to permanently delete these items from your site. This action cannot be undone.',
  };

  const mediaFilter = () => {
    if (mode === 'list') {
      tableRef.current.clearPage();
    } else {
      refMedia.current.clearGrid();
    }

    setParams({
      ...params,
      type: mediaTypeRef.current.value,
      date: mediaDateRef.current.value,
      search: searchRef.current.value,
    });
  };

  const onConfirm = () => {
    let selectedRows = [];
    if (mode === 'list' && bulkAction.current.value !== '') {
      selectedRows = tableRef.current.getSelectedRows();
    } else if (mode === 'grid') {
      selectedRows = refMedia.current.getSelectedRows();
    }

    const payload = { ids: selectedRows };
    if (selectedRows.length) {
      axiosClient.post('/content-management/media-library/bulk/delete', payload).then(() => {
        if (mode === 'list') {
          tableRef.current.reload();
        } else {
          setEditMode(true);
          refMedia.current.reload();
        }
        modalAction.current.hide();
      });
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setParams((prevParams) => ({ ...prevParams, mode: newMode }));
  };

  const renderModeButtons = () => (
    <div className="input-group">
      <button
        type="button"
        className={`btn btn-primary btn-sm ${mode === 'list' ? 'current' : ''}`}
        onClick={() => handleModeChange('list')}>
        <svg className="sidebar-brand-narrow" width="18" height="18">
          <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-list-rich" />
        </svg>
      </button>
      &nbsp;
      <button
        type="button"
        className={`btn btn-primary btn-sm ${mode === 'grid' ? 'current' : ''}`}
        onClick={() => handleModeChange('grid')}>
        <svg className="sidebar-brand-narrow" width="18" height="18">
          <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-border-all" />
        </svg>
      </button>
      &nbsp;
      <MediaTypeDropdown ref={mediaTypeRef} onChange={mediaFilter} />
      &nbsp;
      <MediaDateDropdown ref={mediaDateRef} onChange={mediaFilter} />
      {mode === 'grid' && (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={(ev) => {
            ev.preventDefault();
            setEditMode(false);
            refMedia.current.onEdit(false);
          }}>
          Bulk select &nbsp;
          <svg className="sidebar-brand-narrow" width="18" height="18">
            <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-check-alt" />
          </svg>
        </button>
      )}
      {mode === 'list' && (
        <>
          &nbsp;
          <select ref={bulkAction} className="form-select form-select-sm" aria-label="Default select example">
            <option value="">Bulk actions</option>
            <option value="delete">Delete Permanently</option>
          </select>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => modalAction.current.show()}>
            Apply
          </button>
        </>
      )}
    </div>
  );

  const renderEditModeActions = () => (
    <div>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={(ev) => {
          ev.preventDefault();
          modalAction.current.show();
        }}>
        Delete permanently
      </button>
      &nbsp;&nbsp;
      <button
        type="button"
        className="btn btn-primary btn-sm"
        onClick={(ev) => {
          ev.preventDefault();
          setEditMode(true);
          refMedia.current.onEdit(true);
        }}>
        Cancel
      </button>
    </div>
  );

  return (
    <>
      <div className="card mb-2">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4>
            Media Library
          </h4>
          <Link to="/content-management/media-library/upload" className="btn btn-primary btn-sm" type="button">
            <FontAwesomeIcon icon={solidIconMap.plus} className="me-2" />
            Add New Media File
          </Link>
        </div>
        <div className="card-header">
          <div className="row">
            <div className="col-md-6 col-12">
              {editMode && renderModeButtons()}
              {!editMode && renderEditModeActions()}
            </div>
            <div className="col-md-3 col-12 offset-md-3">
              <SearchBox ref={searchRef} onClick={mediaFilter} />
            </div>
          </div>
        </div>
        <div className="card-body">
          {mode === 'list' && <DataTable options={options} params={params} ref={tableRef} />}
          {mode === 'grid' && <MediaGrid options={options} params={params} ref={refMedia} />}
        </div>
      </div>
      <NotificationModal params={notificationParams} ref={modalAction} confirmEvent={onConfirm} />
    </>
  );
};