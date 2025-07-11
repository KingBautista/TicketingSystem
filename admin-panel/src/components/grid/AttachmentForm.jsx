import { forwardRef, useEffect, useImperativeHandle, useState, useRef } from "react";
import { Link } from "react-router-dom";
import NotificationModal from "../NotificationModal";
import ToastMessage from "../ToastMessage";
import axiosClient from "../../axios-client";
import Field from "../Field";

const AttachmentForm = forwardRef((props, ref) => {
  const [details, setDetails] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const fileLinkRef = useRef(null);
  const toastAction = useRef();
  const notificationRef = useRef();

  const notifParams = {
    id: "AttachmentNotif",
    title: "Confirmation",
    descriptions: "You are about to permanently delete these items from your site. This action cannot be undone.",
  };

  const onConfirm = (ev) => {
    let url = '';
    if(toDelete) {
      url = props.options.dataSource+'/'+toDelete;
      axiosClient.delete(url)
      .then((response) => {
        toastAction.current.showToast(response.data.message, 'danger')
        notificationRef.current.hide();
        props.onChange('delete');
      })
    }
  };

  const onDelete = (id) => {
    setToDelete(null);
    setToDelete(id);
    notificationRef.current.show();
  };

  const handleUpdate = () => {
    axiosClient.put(props.options.dataSource+'/'+details.id, details)
    .then(() => {
      toastAction.current.showToast('Saved.', 'success')
      props.onChange();
    })
  };

  const copyToClipboard = async () => {
    try {
      let text = fileLinkRef.current.value;
      await window.navigator.clipboard.writeText(text);
      toastAction.current.showToast('Copied to clipboard!', 'success')
    } catch (err) {
      toastAction.current.showToast('Copy to clipboard failed.', 'danger')      
    }
  };

  useImperativeHandle(ref, () => {
    return {      
      set(attachment) {
        setDetails(attachment);
      },
    };
  });

  useEffect(() => {
    setDetails(props.details);
  }, [props.details]); 

  return (
    <>
    {details && <div className="attachment-info">
      <div className="thumbnail thumbnail-image">
        <img src={details.thumbnail_url} draggable="false"/>
      </div>
      <div className="details">
        <div className="uploaded"><strong>Uploaded on:</strong> {(details.created_at) ? details.created_at : ''}</div>
        <div className="uploaded-by">
          <strong>Uploaded by:</strong> <a href="#">admin</a>						
        </div>				
        <div className="filename"><strong>File name:</strong> {details.file_name}</div>
        <div className="file-type"><strong>File type:</strong> {details.file_type}</div>
        <div className="file-size"><strong>File size:</strong> {details.file_size} KB</div>
        <div className="dimensions"><strong>Dimensions:</strong> {details.width} by {details.height} pixels</div>
      </div>
      <div className="settings">
        {/* Title Field */}
        <Field
          label="Title"
          inputComponent={
            <input
              className="form-control"
              type="text"
              value={details.file_name}
              onChange={ev => setDetails({...details, file_name : ev.target.value})}
              onBlur={handleUpdate}
            />
          }
          tipMessage="The name is how it appears on your site."
          labelClass="col-sm-12 col-md-3"
          inputClass="col-sm-12 col-md-9"
        />
        {/* Caption Field */}
        <Field
          label="Caption"
          inputComponent={
            <textarea 
              className="form-control" 
              rows={2} 
              value={(details.caption) ? details.caption : ''} 
              onChange={ev => setDetails({...details, caption : ev.target.value})}
              onBlur={handleUpdate}
            />              
          }
          tipMessage="The caption is how it appears on your site."
          labelClass="col-sm-12 col-md-3"
          inputClass="col-sm-12 col-md-9"
        />
        {/* Description Field */}
        <Field
          label="Description"
          inputComponent={
            <textarea 
              className="form-control" 
              rows={2} 
              value={(details.short_descriptions) ? details.short_descriptions : ''} 
              onChange={ev => setDetails({...details, short_descriptions : ev.target.value})}
              onBlur={handleUpdate}
            />
          }
          tipMessage="The description is how it appears on your site."
          labelClass="col-sm-12 col-md-3"
          inputClass="col-sm-12 col-md-9"
        />
        {/* File URL Field */}
        <Field
          label="File URL"
          inputComponent={
            <input 
              className="form-control" 
              ref={fileLinkRef} 
              type="text" 
              disabled 
              value={details.file_url}
            />
          }
          labelClass="col-sm-12 col-md-3"
          inputClass="col-sm-12 col-md-9"
        />
        {/* Copy URL to clipboard Field */}
        <Field
          label=""
          inputComponent={
            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              onClick={copyToClipboard}> Copy URL to clipboard
            </button>
          }
          labelClass="col-sm-12 col-md-3"
          inputClass="col-sm-12 col-md-9"
        />
      </div>
      <div className="actions">
        <Link to={details.file_url} target="_blank" download>Download file</Link>
        <span className="links-separator">&nbsp;|&nbsp;</span>
        <button type="button" className="button-link delete-attachment" onClick={ ev => {ev.preventDefault(); onDelete(details.id);}}>Delete permanently</button>
      </div>
    </div>}
    <ToastMessage ref={toastAction} />
    <NotificationModal params={notifParams} ref={notificationRef} confirmEvent={onConfirm}/>
    </>
  );
});

export default AttachmentForm;