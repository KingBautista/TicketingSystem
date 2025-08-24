import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../axios-client";
import ToastMessage from "../../components/ToastMessage";
import Field from "../../components/Field";
import DOMPurify from 'dompurify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';

export default function VIPForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toastAction = useRef();
  const cardNumberRef = useRef();
  const [buttonText, setButtonText] = useState('Enroll VIP');
  const [vip, setVIP] = useState({
    id: null,
    name: '',
    address: '',
    contact_number: '',
    other_info: '',
    card_number: '',
    validity_start: '',
    validity_end: '',
    status: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Load VIP data for editing (if ID exists)
  useEffect(() => {
    if (id) {
      setButtonText('Save');
      setIsLoading(true);
      axiosClient.get(`/vip-management/vips/${id}`)
        .then(({ data }) => {
          setVIP(data);
          setIsLoading(false);
          setIsActive(data.status);
        })
        .catch((errors) => {
          toastAction.current.showError(errors.response);
          setIsLoading(false);
        });
    } else {
      // Focus on card number field when creating new VIP
      setTimeout(() => {
        if (cardNumberRef.current) {
          cardNumberRef.current.focus();
        }
      }, 100);
    }
  }, [id]);

  // Handle form submission
  const onSubmit = (ev) => {
    ev.preventDefault();
    setIsLoading(true);
    vip.status = isActive;
    const request = vip.id
      ? axiosClient.put(`/vip-management/vips/${vip.id}`, vip)
      : axiosClient.post('/vip-management/vips', vip);
    request
      .then(() => {
        const action = vip.id ? 'updated' : 'enrolled';
        toastAction.current.showToast(`VIP has been ${action}.`, 'success');
        setIsLoading(false);
        setTimeout(() => navigate('/vip-management/vips'), 2000);
      })
      .catch((errors) => {
        toastAction.current.showError(errors.response);
        setIsLoading(false);
      });
  };

  // Handle delete
  const handleDelete = () => {
    if (!vip.id) return;
    
    if (window.confirm('Are you sure you want to delete this VIP?')) {
      setIsLoading(true);
      axiosClient.delete(`/vip-management/vips/${vip.id}`)
        .then(() => {
          toastAction.current.showToast('VIP has been deleted.', 'success');
          setIsLoading(false);
          setTimeout(() => navigate('/vip-management/vips'), 2000);
        })
        .catch((errors) => {
          toastAction.current.showError(errors.response);
          setIsLoading(false);
        });
    }
  };

  return (
    <>
    <div className="card">
      <form onSubmit={onSubmit}>
        <div className="card-header">
          <h4>{vip.id ? 'Edit VIP' : 'Enroll New VIP'}</h4>
          {!vip.id && <p className="tip-message">Enroll a new VIP using the MIFARE Card Reader.</p>}
        </div>
        <div className="card-body">
          <Field
            label="Card Number"
            required={true}
            inputComponent={
              <input
                ref={cardNumberRef}
                className="form-control"
                type="text"
                value={vip.card_number}
                onChange={ev => {
                  const value = ev.target.value.replace(/\D/g, ''); // Remove non-digits
                  if (value.length <= 10) { // Limit to 10 characters
                    setVIP({ ...vip, card_number: value });
                  }
                }}
                maxLength={10}
                pattern="[0-9]*"
                inputMode="numeric"
                required
              />
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          <Field
            label="Validity Start"
            required={true}
            inputComponent={
              <input
                className="form-control"
                type="date"
                value={vip.validity_start}
                onChange={ev => setVIP({ ...vip, validity_start: ev.target.value })}
                required
              />
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          <Field
            label="Validity End"
            required={true}
            inputComponent={
              <input
                className="form-control"
                type="date"
                value={vip.validity_end}
                onChange={ev => setVIP({ ...vip, validity_end: ev.target.value })}
                required
              />
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          <Field
            label="Name"
            required={true}
            inputComponent={
              <input
                className="form-control"
                type="text"
                value={vip.name}
                onChange={ev => setVIP({ ...vip, name: DOMPurify.sanitize(ev.target.value) })}
                required
              />
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          <Field
            label="Address"
            inputComponent={
              <input
                className="form-control"
                type="text"
                value={vip.address}
                onChange={ev => setVIP({ ...vip, address: DOMPurify.sanitize(ev.target.value) })}
              />
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          <Field
            label="Contact Number"
            inputComponent={
              <input
                className="form-control"
                type="text"
                value={vip.contact_number}
                onChange={ev => setVIP({ ...vip, contact_number: DOMPurify.sanitize(ev.target.value) })}
              />
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          <Field
            label="Other Info"
            inputComponent={
              <input
                className="form-control"
                type="text"
                value={vip.other_info}
                onChange={ev => setVIP({ ...vip, other_info: DOMPurify.sanitize(ev.target.value) })}
              />
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
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
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
        </div>
        <div className="card-footer d-flex justify-content-between">
          <div>
            <Link type="button" to="/vip-management/vips" className="btn btn-secondary">
              <FontAwesomeIcon icon={solidIconMap.arrowleft} className="me-2" />
              Cancel
            </Link> &nbsp;
            <button type="submit" className="btn btn-primary">
              <FontAwesomeIcon icon={solidIconMap.save} className="me-2" />
              {buttonText} &nbsp;
              {isLoading && <span className="spinner-border spinner-border-sm ml-1" role="status"></span>}
            </button>
          </div>
          {vip.id && (
            <button 
              type="button" 
              className="btn btn-danger" 
              onClick={handleDelete}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={solidIconMap.trash} className="me-2" />
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
    <ToastMessage ref={toastAction} />
    </>
  );
} 