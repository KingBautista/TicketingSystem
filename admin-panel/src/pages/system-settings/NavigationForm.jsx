import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../axios-client";
import ToastMessage from "../../components/ToastMessage";
import Field from "../../components/Field";
import TreeDropdown from "../../components/TreeDropdown";
import DOMPurify from 'dompurify';

export default function NavigationForm() {
  const {id} = useParams();
  const navigate = useNavigate();
  const toastAction = useRef();
  const navigationRef = useRef();

  const [buttonText, setButtonText] = useState('Create Navigation');  
	const [isLoading, setIsLoading] = useState();
  const [isActive, setIsActive] = useState(true);
  const [isShowInMenu, setIsShowInMenu] = useState(true);
  const [navigation, setNavigaion] = useState({
    id: null,
    name: '',
    slug: '',
    parent_id: '',
  });

  const loadOptions = (parentId, callback) => {
    let url = `/options/navigations${parentId ? `/${parentId}` : ''}`;
    setTimeout(() => {
      axiosClient.get(url)
        .then(({ data }) => callback(data.data))
        .catch((errors) => toastAction.current.showToast(errors.response.data.message, 'danger'));
    }, 500);
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    setIsLoading(true);

    navigation.active = isActive;
    navigation.show_in_menu = isShowInMenu;
    navigation.parent_id = navigationRef.current.getValue().id;

    const request = navigation.id 
      ? axiosClient.put(`/system-settings/navigation/${navigation.id}`, navigation)
      : axiosClient.post('/system-settings/navigation', navigation);

    request
      .then(() => {
        const action = navigation.id ? 'updated' : 'added';
        toastAction.current.showToast(`Navigation has been ${action}.`, 'success');
        setIsLoading(false);
        setTimeout(() => navigate('/system-settings/navigation'), 2000);
      })
      .catch((errors) => {
        toastAction.current.showError(errors.response);
        setIsLoading(false); // Ensure loading state is cleared
      });
  };

  useEffect(() => {
    if (id) {
      setButtonText('Save');
      setIsLoading(true);
      axiosClient.get(`/system-settings/navigation/${id}`)
      .then(({ data }) => {
        setNavigaion(data);
        setIsLoading(false);
      })
      .catch((errors) => {
        toastAction.current.showError(errors.response);
        setIsLoading(false); // Ensure loading state is cleared
      });
    }
  }, [id]);

  return (
    <>
    <div className="card">
      <form onSubmit={handleSubmit}>
        <div className="card-header">
          {navigation.id ? 'Edit Navigation' : 'Create New Navigation'}
          {!navigation.id && <p className="tip-message">Create a new Navigation and add them to this site.</p>}
        </div>
        <div className="card-body">
          {/* Name Field */}
          <Field
            label="Name"
            required={true}
            inputComponent={
              <input 
                className="form-control" 
                type="text" 
                value={navigation.name} 
                onChange={ev => {setNavigaion({...navigation, name : DOMPurify.sanitize(ev.target.value)}); }}
                required
              />
            }
            tipMessage="The name is how it appears on your site."
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          {/* Slug Field */}
          <Field
            label="Slug"
            required={true}
            inputComponent={
              <input 
                className="form-control" 
                type="text" 
                value={navigation.slug} 
                onChange={ev => {setNavigaion({...navigation, slug : DOMPurify.sanitize(ev.target.value)}); }}
                required
              />
            }
            tipMessage="The slug is how it appears on your site."
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          {/* Icon Field */}
          <Field
            label="Icon"
            inputComponent={
              <input 
                className="form-control" 
                type="text" 
                value={navigation.icon} 
                onChange={ev => {setNavigaion({...navigation, icon : DOMPurify.sanitize(ev.target.value)}); }}
              />
            }
            tipMessage="The icon is how it appears on your site."
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          {/* Parent Navigation Field */}
          <Field
            label="Parent Navigation"
            inputComponent={
              <TreeDropdown
                ref={navigationRef}
                values={(navigation.parent_navigation) ? JSON.stringify(navigation.parent_navigation) : null}
                loadOptions={loadOptions}
                placeholder="Select Navigation"
              />
            }
            tipMessage="Navigations, unlike tags, can have a hierarchy."
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          {/* Active Field */}
          <Field
            label="Active"
            inputComponent={
              <input
                className="form-check-input"
                type="checkbox"
                checked={isActive}
                onChange={() => setIsActive(!isActive)}
              />
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          {/* Show in Menu Field */}
          <Field
            label="Show in menu"
            inputComponent={
              <input
                className="form-check-input"
                type="checkbox"
                checked={isShowInMenu}
                onChange={() => setIsShowInMenu(!isShowInMenu)}
              />
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
        </div>
        <div className="card-footer">
          <Link type="button" to="/system-settings/navigation" className="btn btn-secondary">Cancel</Link>&nbsp;
          <button type="submit" className="btn btn-primary">
            {buttonText} {isLoading && <span className="spinner-border spinner-border-sm ml-1" />}
          </button>
        </div>
      </form>
    </div>
    <ToastMessage ref={toastAction}/>
    </>
  )
}