import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../axios-client";
import ToastMessage from "../../components/ToastMessage";
import Field from "../../components/Field";
import DOMPurify from 'dompurify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';

export default function RateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toastAction = useRef();
  const [buttonText, setButtonText] = useState('Create Rate');
  const [rate, setRate] = useState({
    id: null,
    name: '',
    description: '',
    price: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (id) {
      setButtonText('Save');
      setIsLoading(true);
      axiosClient.get(`/rate-management/rates/${id}`)
        .then(({ data }) => {
          setRate(data);
          setIsLoading(false);
          setIsActive(Boolean(data.status));
        })
        .catch((errors) => {
          toastAction.current.showError(errors.response);
          setIsLoading(false);
        });
    }
  }, [id]);

  // Handle form submission
  const onSubmit = (ev) => {
    ev.preventDefault();
    setIsLoading(true);
    rate.status = isActive;
    const request = rate.id
      ? axiosClient.put(`/rate-management/rates/${rate.id}`, rate)
      : axiosClient.post('/rate-management/rates', rate);
    request
      .then(() => {
        const action = rate.id ? 'updated' : 'added';
        toastAction.current.showToast(`Rate has been ${action}.`, 'success');
        setIsLoading(false);
        setTimeout(() => navigate('/rate-management/rates'), 2000);
      })
      .catch((errors) => {
        toastAction.current.showError(errors.response);
        setIsLoading(false);
      });
  };

  return (
    <>
    <div className="card">
      <form onSubmit={onSubmit}>
        <div className="card-header">
          <h4>
            {rate.id ? 'Edit Rate' : 'Create New Rate'}
          </h4>
          {!rate.id && <p className="tip-message">Create a new ticket rate.</p>}
        </div>
        <div className="card-body">
          <Field
            label="Name"
            required={true}
            inputComponent={
              <input
                className="form-control"
                type="text"
                value={rate.name}
                onChange={ev => setRate({ ...rate, name: DOMPurify.sanitize(ev.target.value) })}
                required
              />
            }
            labelClass="col-12 col-md-3"
            inputClass="col-12 col-md-9"
          />
          <Field
            label="Description"
            inputComponent={
              <textarea
                className="form-control"
                value={rate.description}
                onChange={ev => setRate({ ...rate, description: DOMPurify.sanitize(ev.target.value) })}
              />
            }
            labelClass="col-12 col-md-3"
            inputClass="col-12 col-md-9"
          />
          <Field
            label="Price"
            required={true}
            inputComponent={
              <input
                className="form-control"
                type="number"
                min="0"
                step="0.01"
                value={rate.price}
                onChange={ev => setRate({ ...rate, price: ev.target.value })}
                required
              />
            }
            labelClass="col-12 col-md-3"
            inputClass="col-12 col-md-9"
          />
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
            labelClass="col-12 col-md-3"
            inputClass="col-12 col-md-9"
          />
        </div>
        <div className="card-footer">
          <Link type="button" to="/rate-management/rates" className="btn btn-secondary">
            <FontAwesomeIcon icon={solidIconMap.arrowleft} className="me-2" />
            Cancel
          </Link> &nbsp;
          <button type="submit" className="btn btn-primary">
            <FontAwesomeIcon icon={solidIconMap.save} className="me-2" />
            {buttonText} &nbsp;
            {isLoading && <span className="spinner-border ml-1" role="status"></span>}
          </button>
        </div>
      </form>
    </div>
    <ToastMessage ref={toastAction} />
    </>
  );
} 