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

  useEffect(() => {
    if (id) {
      setButtonText('Save');
      setIsLoading(true);
      axiosClient.get(`/promoter-management/promoters/${id}`)
        .then(({ data }) => {
          const promoterData = data.data || data; // Handle both wrapped and direct data
          console.log('Promoter data received:', promoterData);
          setPromoter({
            ...promoterData,
            status: promoterData.status === 'Active',
            schedules: promoterData.schedules || [],
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

  // Handle delete
  const handleDelete = () => {
    if (!promoter.id) return;
    
    if (window.confirm('Are you sure you want to delete this promoter?')) {
      setIsLoading(true);
      axiosClient.delete(`/promoter-management/promoters/${promoter.id}`)
        .then(() => {
          toastAction.current.showToast('Promoter has been deleted.', 'success');
          setIsLoading(false);
          setTimeout(() => navigate('/promoter-management/promoters'), 2000);
        })
        .catch((errors) => {
          toastAction.current.showError(errors.response);
          setIsLoading(false);
        });
    }
  };

  // Add schedule date
  const addSchedule = () => {
    if (!scheduleDate) return;
    axiosClient.post('/promoter-management/promoters/schedule', {
      promoter_id: promoter.id,
      date: scheduleDate,
      is_manual: false, // Always set to false since manual override is hidden
    })
      .then(({ data }) => {
        setPromoter(prev => ({
          ...prev,
          schedules: [...(prev.schedules || []), data.schedule],
        }));
        setScheduleDate('');
        toastAction.current.showToast('Schedule added.', 'success');
      })
      .catch((errors) => {
        toastAction.current.showError(errors.response);
      });
  };

  // Delete schedule from database
  const deleteSchedule = (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      console.log('Deleting schedule with ID:', scheduleId);
      
      // Use POST method with data in body for better compatibility
      axiosClient.post('/promoter-management/promoters/schedule/delete', {
        schedule_id: scheduleId
      })
        .then(({ data }) => {
          console.log('Delete response:', data);
          // Remove the schedule from local state
          setPromoter(prev => ({
            ...prev,
            schedules: (prev.schedules || []).filter(s => s.id !== scheduleId),
          }));
          toastAction.current.showToast('Schedule deleted successfully.', 'success');
        })
        .catch((errors) => {
          console.error('Delete error:', errors);
          toastAction.current.showError(errors.response);
        });
    }
  };

  // Remove schedule date (local only, for new unsaved schedules)
  const removeSchedule = (date) => {
    setPromoter(prev => ({
      ...prev,
      schedules: (prev.schedules || []).filter(s => s.date !== date),
    }));
  };

  return (
    <>
    <div className="card">
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
            <div className="col-md-6">
              <label className="form-label">Add Schedule Date</label>
              <input
                type="date"
                className="form-control"
                value={scheduleDate}
                onChange={ev => setScheduleDate(ev.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">&nbsp;</label>
              <div>
                <button type="button" className="btn btn-success" onClick={addSchedule} disabled={!promoter.id || !scheduleDate}>
                  <FontAwesomeIcon icon={solidIconMap.plus} className="me-2" />
                  Add Schedule
                </button>
              </div>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Current Schedules</label>
            <ul className="list-group">
              {(promoter.schedules || []).length === 0 && <li className="list-group-item">No schedules set.</li>}
              {(promoter.schedules || []).map(s => (
                <li className="list-group-item d-flex justify-content-between align-items-center" key={s.id || s.date}>
                  <div>
                    <strong>{s.date}</strong>
                  </div>
                  {s.id && (
                    <button 
                      type="button" 
                      className="btn btn-danger btn-sm" 
                      onClick={() => deleteSchedule(s.id)}
                      title="Delete this schedule"
                    >
                      <FontAwesomeIcon icon={solidIconMap.trash} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="card-footer d-flex justify-content-between">
          <div>
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
          {promoter.id && (
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