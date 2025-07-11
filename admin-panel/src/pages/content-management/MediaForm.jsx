import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactPlayer from 'react-player';
import ToastMessage from "../../components/ToastMessage";
import axiosClient from "../../axios-client";
import NotificationModal from "../../components/NotificationModal";
import Field from "../../components/Field";

export default function MediaForm() {
  const {id} = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState();
  const [toDelete, setToDelete] = useState(null);

  const toastAction = useRef();
  const fileLinkRef = useRef();
  const actionRef = useRef();
  
  const [details, setDetails] = useState({
    id: null,
    file_name: '',
    file_type: '',
    file_size: '',
    width: '',
    height: '',
    file_dimensions: '',
    file_url: '',
    thumbnail_url: '',
    caption: '',
    short_descriptions: '',
    created_at: '',
    updated_at: ''
  });

  const notifParams = {
    id: 'mediaModal',
    title: "Confirmation",
    descriptions: "You are about to permanently delete these items from your site. This action cannot be undone.",
  };

  const onSubmit = (ev) => {
		ev.preventDefault();
    setIsLoading(true);

    axiosClient.put('/content-management/media-library/'+details.id, details)
    .then(() => {
      toastAction.current.showToast('Media has beed updated.', 'success');
      setIsLoading(false);
      setTimeout(() => navigate('/content-management/media-library'), 2000);
    })
    .catch((errors) => {
      toastAction.current.showError(errors.response);
      setIsLoading(false);
    });
  };

  const doAction = (id, action = '') => {
    setToDelete(null);
    setToDelete(id);
    actionRef.current.show();
  };

  const onConfirm = () => {
    if(toDelete) {
      axiosClient.delete('/content-management/media-library/'+toDelete)
      .then((response) => {
        toastAction.current.showToast(response.data.message, 'danger');
        actionRef.current.hide();
        setIsLoading(false);
        setTimeout(() => navigate('/content-management/media-library/'), 2000);
      })
    }
  };

  const copyToClipboard = async () => {
    try {
      let text = fileLinkRef.current.value;
      await window.navigator.clipboard.writeText(text);
      toastAction.current.showToast('Copied to clipboard!', 'success');
    } catch (err) {
      toastAction.current.showToast('Copy to clipboard failed.', 'danger');
    }
  };

  const preview = () => {
    return (
      <>
      {details && details.file_type.split('/')[0] === 'image' && <div className="thumbnail">
        <img className="details-image" src={details.file_url} draggable="false"/>
      </div>}
      {details && (details.file_type.split('/')[0] === 'video' || details.file_type.split('/')[0] === 'audio') && <div className='player-wrapper'>
        <ReactPlayer className='react-player' url={details.file_url} width='100%' height='100%' muted={true} playing={true} controls={true}/>
      </div>}
      {details && details.file_type.split('/')[0] === 'application' && <div className="thumbnail">
        <img className="details-image" src="/assets/img/view-file-icon.jpg" draggable="false"/>
      </div>}
      </>
    );
  };

  const attachmentForm = () => {
    return (
      <>
      {details && <div className="attachment-info">
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
          <button type="button" className="button-link delete-attachment" data-coreui-dismiss="modal" onClick={ ev => {doAction(details.id);}}>Delete permanently</button>
          <button type="submit" className="btn btn-primary btn-sm float-end" style={{marginLeft:5+'px'}} >Update &nbsp;
            {isLoading && <span className="spinner-border spinner-border-sm ml-1" role="status"></span>}
          </button>
          <Link type="button" to="/content-management/media-library" className="btn btn-secondary btn-sm float-end">Cancel </Link>
        </div>
      </div>}
      </>
    );
  };

  if(id) {
    useEffect(() => {
      setIsLoading(true);
      axiosClient.get('/content-management/media-library/'+id)
      .then(({data}) => {
        setDetails(data);
        setIsLoading(false);
      })
      .catch((errors) => {
        toastAction.current.showError(errors.response);
        setIsLoading(false);
      });
    }, []);
  }

  const attachmentPreview = preview();
  const attachmentDetails = attachmentForm();

  return (
    <>
    <div className="card">
      <form onSubmit={onSubmit}>
        <div className="card-header">Edit Media</div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-7 col-12 attachment-media-view">
              {attachmentPreview}
            </div>
            <div className="col-md-5 col-12">
              {attachmentDetails}
            </div>
          </div>
        </div>
      </form>
    </div>
    <NotificationModal params={notifParams} ref={actionRef} confirmEvent={onConfirm}/>
    <ToastMessage ref={toastAction}/>
    </>
  )
};