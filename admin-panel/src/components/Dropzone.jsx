import { forwardRef, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../axios-client";
import ToastMessage from "../components/ToastMessage";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../utils/solidIcons';

const Dropzone = forwardRef((props, ref) => {
  const fileUpload = useRef();
  const [accepted, setAccepted] = useState([]);
  const [rejected, setRejected] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isMulti, setIsMulti] = useState(true);
  const toastAction = useRef();
  const navigate = useNavigate();

  const handleDragOver = (ev) => {
    ev.preventDefault();
  };

  const handleDrop = (ev) => {
    setIsLoading(false);
    ev.preventDefault();
    filter(ev.dataTransfer.files);  
  };

  const handleChange = (ev) => {
    ev.preventDefault();
    filter(ev.target.files);
  };

  const handleRemoveItem = (ev, name, from) => {
    ev.preventDefault();
    if(from === 'accepted') {
      setAccepted(accepted.filter(item => item.name !== name));
    } else {
      setRejected(rejected.filter(item => item.name !== name));
    }
  };

  const validate = (type, ext, size) => {
    const accept = props.options.accept;
    const errors = [];
    if(!accept[type]) {
      errors.push('Invalid file type.');
      return errors;
    }
    if(accept[type].type.length > 0 && accept[type].type.indexOf(ext) === -1) {
      errors.push('Invalid file type.');
    } 
    if(size > accept[type].maxSize) {
      errors.push('Invalid file size.');
    }
    return errors;
  }

  const filter = (files) => {
    Array.from(files).map(file => {
      let errors = validate(file.type.split('/')[0], file.name.substring(file.name.lastIndexOf(".")+1), file.size);
      let preview = URL.createObjectURL(file);
      switch(file.type.split('/')[0]) {
        case 'video':
          preview = '/assets/img/video_icon.png';
        break;
        case 'audio':
          preview = '/assets/img/mp3-icon.png';
        break;
        case 'application':
        case 'text':
            preview = '/assets/img/file-icon.png';
        break;
      }
      file.preview = preview;
      if(errors.length > 0) {
        file.errors = errors;
        setRejected(rejected => [...rejected, file]);
      } else {
        setAccepted(accepted => [...accepted, file]);
      }
    });
  };

  const handleUpload = async () => {
    setIsLoading(true);
  
    const { postUrl: url, redirectUrl: redirect } = props.options;
  
    if (!url) {
      toastAction.current.showToast('API Url is empty.', 'danger');
      setIsLoading(false);
      return;
    }
  
    try {
      const formData = new FormData();
      accepted.forEach(file => formData.append('files[]', file));
  
      await axiosClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      handleUploadSuccess(redirect);
    } catch (error) {
      handleUploadError(error.response);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUploadSuccess = (redirect) => {
    setRejected([]);
    setAccepted([]);
    toastAction.current.showToast('Media has been uploaded.', 'success');
    
    if (redirect === '#') {
      props.onChange();
    } else {
      setTimeout(() => navigate(redirect), 2000);
    }
  };
  
  const handleUploadError = (response) => {
    setRejected([]);
    setAccepted([]);
    if (response?.status === 422) {
      handleValidationError(response.data);
    }
  };
  
  const handleValidationError = (data) => {
    if (data.errors) {
      // Handle specific error messages
    } else {
      toastAction.current.showToast(data.message, 'danger');
    }
  };

  const MediaItem = ({ file, type, handleRemoveItem }) => (
    <div className="media-item">
      <div className="attachment-details">
        <img className="pinkynail" src={file.preview} alt={file.name} />
        <div className="filename">
          <span className="media-list-title">{file.name}</span>
          <span className="media-list-subtitle">{file.type}</span>
          {file.errors && file.errors.map((error, idx) => (
            <span key={idx} className="text-danger" style={{ display: 'block', fontSize: '12px' }}>
              {error}
            </span>
          ))}
          <div className="attachment-tools">
            <a className="delete-attachment" 
              href="#" 
              onClick={(e) => handleRemoveItem(e, file.name, type)}>
                <FontAwesomeIcon icon={solidIconMap.trash} className="me-2" />
                Delete
            </a>
          </div>
        </div>
      </div>
    </div>
  );
  
  const handleUploaded = () => {
    return (
      <>
        <ToastMessage ref={toastAction} />
        {accepted.length > 0 && (
          <CardList title="Accepted" items={accepted} type="accepted" handleRemoveItem={handleRemoveItem} />
        )}
        {rejected.length > 0 && (
          <CardList title="Rejected" items={rejected} type="rejected" handleRemoveItem={handleRemoveItem} />
        )}
      </>
    );
  };
  
  const CardList = ({ title, items, type, handleRemoveItem }) => (
    <div className="card mb-2">
      <div className="card-header"><h6>{title}</h6></div>
      <div className="media-items">
        {Array.from(items).map((file, idx) => (
          <MediaItem 
            key={idx} 
            file={file} 
            type={type} 
            handleRemoveItem={handleRemoveItem} 
          />
        ))}
      </div>
      <div className="card-footer">
        <button 
          type="button" 
          className="btn btn-primary" 
          onClick={handleUpload}
        >
          <FontAwesomeIcon icon={solidIconMap.upload} className="me-2" />
          Upload &nbsp;
          {isLoading && <span className="spinner-border spinner-border-sm ml-1" role="status"></span>}
        </button>
      </div>
    </div>
  );
  
  const uploaded = handleUploaded();

  const fileSizeInfo = (
    <p>Maximum upload file size: 2 MB (Images, Files), 5 MB (Videos, Mp3).</p>
  );

  const switchUploader = (
    <p className="mt-2">
      You are using the {isMulti ? "multi-file" : "browser’s built-in"} uploader. 
      {isMulti ? (
        <>
          Problems? Try the{" "}
          <a href="#" onClick={ev => { ev.preventDefault(); setIsMulti(false); }}>
            browser uploader
          </a>&nbsp;
          instead.
        </>
      ) : (
        <>
          The Media Library uploader includes multiple file selection and drag and drop capability. &nbsp;
          <a href="#" onClick={ev => { ev.preventDefault(); setIsMulti(true); }}>
            Switch to the drag and drop uploader
          </a>.
        </>
      )}
    </p>
  );

  return (
    <>
      {isMulti ? (
        <div className="drag-drop" onDragOver={handleDragOver} onDrop={handleDrop}>
          <div id="drag-drop-area" style={{ position: "relative" }}>
            <div className="drag-drop-inside">
              <p className="drag-drop-info">Drop files to upload</p>
              <p>or</p>
              <input ref={fileUpload} type="file" onChange={handleChange} multiple hidden />
              <p className="drag-drop-buttons">
                <input
                  type="button"
                  value="Select Files"
                  className="button"
                  style={{ position: "relative", zIndex: 1 }}
                  onClick={() => fileUpload.current.click()}
                />
              </p>
            </div>
          </div>
          {switchUploader}
          {fileSizeInfo}
          {uploaded}
        </div>
      ) : (
        <div>
          <p>
            <input type="file" onChange={handleChange} multiple />
          </p>
          {switchUploader}
          {fileSizeInfo}
          {uploaded}
        </div>
      )}
    </>
  );
});

export default Dropzone;