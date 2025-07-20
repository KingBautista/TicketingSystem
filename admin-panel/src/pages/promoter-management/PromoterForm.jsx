import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../axios-client";
import ToastMessage from "../../components/ToastMessage";
import Field from "../../components/Field";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';

export default function PromoterForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toastAction = useRef();
  const [buttonText, setButtonText] = useState('Create Promoter');
  const [promoter, setPromoter] = useState({
    id: null,
    name: '',
    description: '',
    status: true,
    schedules: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    if (id) {
      setButtonText('Save');
      setIsLoading(true);
      axiosClient.get(`/promoter-management/promoters/${id}`)
        .then(({ data }) => {
          setPromoter({
            ...data,
            status: data.status === 'Active',
            schedules: data.schedules || [],
          });
          setIsLoading(false);
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
    const payload = {
      ...promoter,
      status: !!promoter.status,
    };
    const request = promoter.id
      ? axiosClient.put(`/promoter-management/promoters/${promoter.id}`, payload)
      : axiosClient.post('/promoter-management/promoters', payload);
    request
      .then(({ data }) => {
        const action = promoter.id ? 'updated' : 'added';
        toastAction.current.showToast(`Promoter has been ${action}.`, 'success');
        setIsLoading(false);
        setTimeout(() => navigate('/promoter-management/promoters'), 2000);
      })
      .catch((errors) => {
        toastAction.current.showError(errors.response);
        setIsLoading(false);
      });
  };

  // Add schedule date
  const addSchedule = () => {
    if (!scheduleDate) return;
    axiosClient.post('/promoter-management/promoters/schedule', {
      promoter_id: promoter.id,
      date: scheduleDate,
      is_manual: isManual,
    })
      .then(({ data }) => {
        setPromoter(prev => ({
          ...prev,
          schedules: [...(prev.schedules || []), data.schedule],
        }));
        setScheduleDate('');
        setIsManual(false);
        toastAction.current.showToast('Schedule added.', 'success');
      })
      .catch((errors) => {
        toastAction.current.showError(errors.response);
      });
  };

  // Remove schedule date (local only, for new unsaved schedules)
  const removeSchedule = (date) => {
    setPromoter(prev => ({
      ...prev,
      schedules: (prev.schedules || []).filter(s => s.date !== date),
    }));
  };

  return (
    <div className="card">
      <ToastMessage ref={toastAction} />
      <form onSubmit={onSubmit}>
        <div className="card-header">
          <h4>
            {promoter.id ? 'Edit Promoter' : 'Create New Promoter'}
          </h4>
          {!promoter.id && <p className="tip-message">Create a new promoter and manage their schedule.</p>}
        </div>
        <div className="card-body">
          <Field
            label="Name"
            required={true}
            inputComponent={
              <input
                className="form-control"
                type="text"
                value={promoter.name}
                onChange={ev => setPromoter({ ...promoter, name: ev.target.value })}
                required
              />
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          <Field
            label="Description"
            inputComponent={
              <textarea
                className="form-control"
                value={promoter.description}
                onChange={ev => setPromoter({ ...promoter, description: ev.target.value })}
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
                checked={promoter.status}
                onChange={() => setPromoter({ ...promoter, status: !promoter.status })}
              />
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          <div className="row mb-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Add Schedule Date</label>
              <input
                type="date"
                className="form-control"
                value={scheduleDate}
                onChange={ev => setScheduleDate(ev.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Manual Override</label>
              <input
                type="checkbox"
                className="form-check-input ms-2"
                checked={isManual}
                onChange={() => setIsManual(!isManual)}
              />
            </div>
            <div className="col-md-3">
              <button type="button" className="btn btn-success" onClick={addSchedule} disabled={!promoter.id || !scheduleDate}>
                <FontAwesomeIcon icon={solidIconMap.plus} className="me-2" />
                Add Schedule
              </button>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Current Schedules</label>
            <ul className="list-group">
              {(promoter.schedules || []).length === 0 && <li className="list-group-item">No schedules set.</li>}
              {(promoter.schedules || []).map(s => (
                <li className="list-group-item d-flex justify-content-between align-items-center" key={s.id || s.date}>
                  {s.date} {s.is_manual ? <span className="badge bg-warning ms-2">Manual</span> : ''}
                  {/* Optionally, add remove button for unsaved schedules */}
                  {/* <button className="btn btn-sm btn-danger" onClick={() => removeSchedule(s.date)}>Remove</button> */}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="card-footer">
          <Link type="button" to="/promoter-management/promoters" className="btn btn-secondary">
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
  );
} 