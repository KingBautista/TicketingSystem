import { forwardRef, useEffect, useState, useRef } from "react";
import MediaDateDropdown from "../MediaDateDropdown";
import MediaTypeDropdown from "../MediaTypeDropdown";
import SearchBox from "../SearchBox";
import MediaGrid from "./MediaGrid";
import Dropzone from "../Dropzone";
import AttachmentForm from "./AttachmentForm";

const AddMedia = forwardRef((props, ref) => {
  const options = {
    dataSource: '/content-management/media-library',
    dataFields: {
      file_name: {name: "File Name", withSort: true, attachment: "thumbnail_url"}, 
      file_type: {name: "File Type", withSort: true}, 
      file_dimensions: {name: "Dimensions", withSort: false}, 
      updated_at: {name: "Updated At", withSort: true}
    },
    softDelete: false,
    primaryKey: "id",
    redirectUrl: '',
    otherActions: {}
  };

  const [params, setParams] = useState({
    mode: 'grid',
    type: '',
    date: '',
    search: '',
  });

  const uploadOptions = {
    accept: {
      'image': {type: ['png', 'jpg'], maxSize: 1024 * 2000},
      'video': {type: [], maxSize: 1024 * 5000},
      'audio': {type: [], maxSize: 1024 * 5000},
      'application': {type: [], maxSize: 1024 * 2000},
      'text': {type: [], maxSize: 1024 * 2000}
    },
    postUrl: '/content-management/media-library',
    redirectUrl: '#'
  };

  const addModal = useRef('AddMediaModal'); // Ref for the modal
  const mediaTypeRef = useRef();
  const mediaDateRef = useRef();
  const searchRef = useRef();
  const refMedia = useRef();
  const attachmentRef = useRef();
  const [isUploadFile, setisUploadFile] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [isShow, setIsShow] = useState(false);

  const mediaFilter = () => {
    refMedia.current.clearGrid();
    setParams({...params, type : mediaTypeRef.current.value, date: mediaDateRef.current.value, search : searchRef.current.value});
  };

  const handleSelected = (media) => {
    attachmentRef.current.set(media);
    setAttachment(media);
  };

  const refreshGrid = () => {
    attachmentRef.current.set(null);
    setAttachment(null);
    refMedia.current.clearGrid();
    setParams({...params, type : '', date: '', search : ''});
  };

  const setActionIcon = () => {
    return (
      <>
      {attachment && <div className="image-wrap">
        <img src={attachment.thumbnail_url} />
        <div className="image-wrap-actions">
          <a className="image-wrap-icon dark" data-name="edit" title="Edit" onClick={ ev => {ev.preventDefault(); showModal();}}>
            <svg width="18" height="18">
              <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-pencil"></use>
            </svg>
          </a>
          <a className="image-wrap-icon dark" data-name="remove" title="Remove" onClick={ ev => {ev.preventDefault(); setIsShow(false); setAttachment(null); }}>
            <svg width="18" height="18">
              <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-trash"></use>
            </svg>
          </a>
        </div>
      </div>}
      </>
    );
  };

  const showModal = () => {
    window.addMediaModal.show();
  };

  const hideModal = () => {
    window.addMediaModal.hide();
  };

  const setButton = () => {
    return (
      <>
      <button className="btn btn-primary btn-sm" type="button" onClick={showModal}>
      <svg className="sidebar-brand-narrow" width="18" height="18">
        <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-image-plus"></use>
      </svg>&nbsp;
      Add Media</button>
      <p className="tip-message" style={{margin:0}}>The media attachment to appears on your site.</p>
      </>
    );
  };

  const setTabs = () => {
    return (
      <ul className="nav nav-tabs position-absolute bottom-0 start-0 pl-2" id="addMediaTab" role="tablist">
        <li className="nav-item" role="presentation">
          <a className={"nav-link "+ (isUploadFile ? 'active' : '')} onClick={ ev => setisUploadFile(true)} id="home-tab" data-bs-toggle="tab" role="tab" aria-controls="home" aria-selected="true">Upload files</a>
        </li>
        <li className="nav-item" role="presentation">
          <a className={"nav-link "+ (!isUploadFile ? 'active' : '')} onClick={ ev => setisUploadFile(false)} id="profile-tab" data-bs-toggle="tab" role="tab" aria-controls="profile" aria-selected="false">Media Library</a>
        </li>
      </ul>
    );
  };

  const setGridTab = () => {
    return (
      <div className="row">
        <div className="col-9">
          <div className="card-header">
            <div className="row">
              <div className="col-md-6 col-12">
                <div className="input-group">
                  <MediaTypeDropdown ref={mediaTypeRef} onChange={mediaFilter}/>
                  &nbsp;
                  <MediaDateDropdown ref={mediaDateRef} onChange={mediaFilter}/>
                </div>
              </div>
              <div className="col-md-4 col-12 offset-md-2">
                <SearchBox ref={searchRef} onClick={mediaFilter} />
              </div>
            </div>
          </div>
          <div className="card-body card-body-scrollable">
            <MediaGrid options={options} params={params} ref={refMedia} onClick={handleSelected}/> 
          </div>
        </div>
        <div className="col-3">
          <AttachmentForm ref={attachmentRef} options={options} onChange={refreshGrid} />
        </div>              
      </div>
    );
  };

  const goToLibrary = () => {
    setisUploadFile(false);
  };

  const setUploadFile = () => {
    return (
      <div className="row">
        <div className="col-12">
          <Dropzone options={uploadOptions} onChange={goToLibrary}/>
        </div>
      </div>
    );
  };

  const navTabs = setTabs();
  const gridTab = setGridTab();
  const uploadTab = setUploadFile();

  const setMainModal = () => {
    return (
      <div className="modal fade" ref={addModal} tabIndex="-1">
        <div className="modal-dialog modal-xxl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header position-relative">
              <h5 className="modal-title mb-4 pb-2">Add Media</h5>
              <button type="button" className="btn-close" onClick={hideModal} aria-label="Close"></button>
              {navTabs}
            </div>
            <div className="modal-body">
              {isUploadFile && uploadTab}
              {!isUploadFile && gridTab}
            </div>
            {!isUploadFile &&
            <div className="modal-footer">
              <button type="button" className="btn btn-primary btn-sm" onClick={ ev => { ev.preventDefault(); setIsShow(true); props.onChange(attachment); hideModal(); }}>Select</button>
            </div>}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    // Check if the addModal is properly set
    if (addModal.current) {
      // Initialize CoreUI modal
      window.addMediaModal = new coreui.Modal(addModal.current);
      if(props.value !== undefined && props.value !== "") {
        setAttachment(JSON.parse(props.value));
        setIsShow(true);
      }
    }
  }, [props.value]);

  const mainModal = setMainModal();
  const actionIcon = setActionIcon();
  const addButton = setButton();

  return (
    <>
    {mainModal}
    {!isShow && addButton}
    {isShow && attachment && actionIcon}
    </>
  );
});

export default AddMedia;