import { forwardRef, useEffect, useState, useRef } from "react";
import MediaDateDropdown from "../MediaDateDropdown";
import MediaTypeDropdown from "../MediaTypeDropdown";
import SearchBox from "../SearchBox";
import MediaGrid from "./MediaGrid";
import Dropzone from "../Dropzone";
import AttachmentForm from "./AttachmentForm";
import ThumbnailDisplay from "../ThumbnailDisplay.jsx";

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
  const [attachments, setAttachments] = useState([]);
  const [isShow, setIsShow] = useState(false);

  const mediaFilter = () => {
    refMedia.current.clearGrid();
    setParams({...params, type : mediaTypeRef.current.value, date: mediaDateRef.current.value, search : searchRef.current.value});
  };

  const handleSelected = (media) => {
    attachmentRef.current.set(media);
    setAttachment(media);
    // Also add to attachments array for multiple selection preview
    setAttachments(prev => {
      const exists = prev.find(item => item.id === media.id);
      if (!exists) {
        return [...prev, media];
      }
      return prev;
    });
  };

  const refreshGrid = () => {
    attachmentRef.current.set(null);
    setAttachment(null);
    setAttachments([]);
    refMedia.current.clearGrid();
    setParams({...params, type : '', date: '', search : ''});
  };

  const setActionIcon = () => {
    return (
      <>
      {attachment && (
        <div className="image-wrap position-relative">
          <div 
            className="border rounded overflow-hidden cursor-pointer"
            style={{ 
              width: '150px', 
              height: '150px',
              backgroundImage: `url(${attachment.thumbnail_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            onClick={() => showModal()}
          >
            <img 
              src={attachment.thumbnail_url} 
              alt={attachment.file_name || 'Selected media'}
              className="w-100 h-100 object-fit-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div 
              className="w-100 h-100 d-flex align-items-center justify-content-center bg-light"
              style={{ display: 'none' }}
            >
              <i className="fas fa-image text-muted"></i>
            </div>
          </div>
          <div className="image-wrap-actions position-absolute top-0 end-0 p-2">
            <a 
              className="image-wrap-icon rounded-circle p-1 me-1" 
              data-name="edit" 
              title="Edit" 
              onClick={ev => {ev.preventDefault(); showModal();}}
              style={{ 
                width: '36px', 
                height: '36px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(4px)',
                border: '2px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease-in-out',
                color: '#007bff'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)';
              }}
            >
              <svg width="18" height="18" fill="currentColor">
                <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-pencil"></use>
              </svg>
            </a>
            <a 
              className="image-wrap-icon rounded-circle p-1" 
              data-name="remove" 
              title="Remove" 
              onClick={ev => {ev.preventDefault(); setIsShow(false); setAttachment(null); setAttachments([]); props.onChange(null);}}
              style={{ 
                width: '36px', 
                height: '36px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(4px)',
                border: '2px solid rgba(220, 53, 69, 0.3)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease-in-out',
                color: '#dc3545'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3), 0 2px 6px rgba(0, 0, 0, 0.15)';
                e.target.style.borderColor = 'rgba(220, 53, 69, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)';
                e.target.style.borderColor = 'rgba(220, 53, 69, 0.3)';
              }}
            >
              <svg width="18" height="18" fill="currentColor">
                <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-trash"></use>
              </svg>
            </a>
          </div>
        </div>
      )}
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
    if (props.buttonDesign) {
      return props.buttonDesign({ showModal });
    }
    return (
      <>
      <button className="btn btn-primary" type="button" onClick={showModal} {...props.buttonProps}>
        <svg className="sidebar-brand-narrow" width="18" height="18">
          <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-image-plus"></use>
        </svg>&nbsp;
        Add Media
      </button>
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
          {/* Selected Media Preview */}
          {attachments.length > 0 && (
            <div className="mt-3">
              <h6 className="border-bottom pb-2">Selected Media ({attachments.length})</h6>
              <div className="d-flex flex-wrap gap-2">
                {attachments.map((att, index) => (
                  <div 
                    key={att.id}
                    className="border rounded overflow-hidden cursor-pointer position-relative"
                    style={{ 
                      width: '80px', 
                      height: '80px',
                      backgroundImage: `url(${att.thumbnail_url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                    onClick={() => {
                      const selectedMedia = attachments.find(item => item.id === att.id);
                      if (selectedMedia) {
                        setAttachment(selectedMedia);
                      }
                    }}
                  >
                    <img 
                      src={att.thumbnail_url} 
                      alt={att.file_name || 'Selected media'}
                      className="w-100 h-100 object-fit-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="w-100 h-100 d-flex align-items-center justify-content-center bg-light"
                      style={{ display: 'none' }}
                    >
                      <i className="fas fa-image text-muted"></i>
                    </div>
                    {/* Remove button for individual items */}
                    <button 
                      className="position-absolute top-0 end-0 rounded-circle"
                      style={{ 
                        width: '24px', 
                        height: '24px', 
                        fontSize: '12px',
                        padding: '0',
                        lineHeight: '1',
                        backgroundColor: 'rgba(220, 53, 69, 0.95)',
                        border: '2px solid rgba(255, 255, 255, 0.8)',
                        color: 'white',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        transition: 'all 0.2s ease-in-out',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(220, 53, 69, 1)';
                        e.target.style.transform = 'scale(1.2)';
                        e.target.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.95)';
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setAttachments(prev => prev.filter(item => item.id !== att.id));
                        if (attachment && attachment.id === att.id) {
                          setAttachment(null);
                        }
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button 
                className="btn btn-outline-danger mt-2 w-100"
                onClick={() => {
                  setAttachments([]);
                  setAttachment(null);
                }}
              >
                Clear All
              </button>
            </div>
          )}
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
        <div className="modal-dialog modal-fullscreen custom-fullscreen-with-margin">
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
              <button type="button" className="btn btn-primary" onClick={ ev => { ev.preventDefault(); setIsShow(true); props.onChange(attachment); hideModal(); }}>Select</button>
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
        let parsedValue = props.value;
        if (typeof props.value === 'string') {
          try {
            parsedValue = JSON.parse(props.value);
          } catch (e) {
            // fallback: keep as string or set to null
            parsedValue = null;
          }
        }
        if (parsedValue) {
          setAttachment(parsedValue);
          // If it's an array, set attachments too
          if (Array.isArray(parsedValue)) {
            setAttachments(parsedValue);
          } else {
            setAttachments([parsedValue]);
          }
          setIsShow(true);
        }
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