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

  // Simulate card reader (for demo, replace with real reader logic)
  const handleCardRead = () => {
    // Simulate reading a card number
    setVIP({ ...vip, card_number: 'CARD-' + Math.floor(Math.random() * 1000000) });
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
            label="Card Number"
            required={true}
            inputComponent={
              <div className="input-group">
                <input
                  className="form-control"
                  type="text"
                  value={vip.card_number}
                  onChange={ev => setVIP({ ...vip, card_number: DOMPurify.sanitize(ev.target.value) })}
                  required
                  readOnly
                />
                <button type="button" className="btn btn-outline-secondary" onClick={handleCardRead}>
                  <FontAwesomeIcon icon={solidIconMap.plus} className="me-2" />Read Card
                </button>
              </div>
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
        <div className="card-footer">
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
      </form>
    </div>
    <ToastMessage ref={toastAction} />
    </>
  );
} 