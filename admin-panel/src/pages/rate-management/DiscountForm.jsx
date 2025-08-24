import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../axios-client";
import ToastMessage from "../../components/ToastMessage";
import Field from "../../components/Field";
import DOMPurify from 'dompurify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';

export default function DiscountForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toastAction = useRef();
  const [buttonText, setButtonText] = useState('Create Discount');
  const [discount, setDiscount] = useState({
    id: null,
    discount_name: '',
    discount_value: '',
    discount_value_type: 'percentage',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (id) {
      setButtonText('Save');
      setIsLoading(true);
      axiosClient.get(`/rate-management/discounts/${id}`)
        .then(({ data }) => {
          setDiscount({
            ...data,
            discount_value_type: data.discount_value_type || 'percentage',
          });
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
    discount.status = isActive;
    const request = discount.id
      ? axiosClient.put(`/rate-management/discounts/${discount.id}`, discount)
      : axiosClient.post('/rate-management/discounts', discount);
    request
      .then(() => {
        const action = discount.id ? 'updated' : 'added';
        toastAction.current.showToast(`Discount has been ${action}.`, 'success');
        setIsLoading(false);
        setTimeout(() => navigate('/rate-management/discounts'), 2000);
      })
      .catch((errors) => {
        toastAction.current.showError(errors.response);
        setIsLoading(false);
      });
  };

  // Handle delete
  const handleDelete = () => {
    if (!discount.id) return;
    
    if (window.confirm('Are you sure you want to delete this discount?')) {
      setIsLoading(true);
      axiosClient.delete(`/rate-management/discounts/${discount.id}`)
        .then(() => {
          toastAction.current.showToast('Discount has been deleted.', 'success');
          setIsLoading(false);
          setTimeout(() => navigate('/rate-management/discounts'), 2000);
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
          <h4>
            {discount.id ? 'Edit Discount' : 'Create New Discount'}
          </h4>
          {!discount.id && <p className="tip-message">Create a new discount.</p>}
        </div>
        <div className="card-body">
          <Field
            label="Discount Name"
            required={true}
            inputComponent={
              <input
                className="form-control"
                type="text"
                value={discount.discount_name}
                onChange={ev => setDiscount({ ...discount, discount_name: DOMPurify.sanitize(ev.target.value) })}
                required
              />
            }
            labelClass="col-12 col-md-3"
            inputClass="col-12 col-md-9"
          />
          <Field
            label="Discount Value Type"
            required={true}
            inputComponent={
              <select
                className="form-select"
                value={discount.discount_value_type}
                onChange={ev => setDiscount({ ...discount, discount_value_type: ev.target.value })}
                required
              >
                <option value="percentage">Percentage (%)</option>
                <option value="amount">Exact Amount</option>
              </select>
            }
            labelClass="col-12 col-md-3"
            inputClass="col-12 col-md-9"
          />
          <Field
            label={discount.discount_value_type === 'percentage' ? 'Discount Value (%)' : 'Discount Value (Amount)'}
            required={true}
            inputComponent={
              <input
                className="form-control"
                type="number"
                min="0"
                step="0.01"
                value={discount.discount_value}
                onChange={ev => setDiscount({ ...discount, discount_value: ev.target.value })}
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
        <div className="card-footer d-flex justify-content-between">
          <div>
            <Link type="button" to="/rate-management/discounts" className="btn btn-secondary">
              <FontAwesomeIcon icon={solidIconMap.arrowleft} className="me-2" />
              Cancel
            </Link> &nbsp;
            <button type="submit" className="btn btn-primary">
              <FontAwesomeIcon icon={solidIconMap.save} className="me-2" />
              {buttonText} &nbsp;
              {isLoading && <span className="spinner-border ml-1" role="status"></span>}
            </button>
          </div>
          {discount.id && (
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