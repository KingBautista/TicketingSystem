import { useState, useRef } from 'react';
import ToastMessage from '../../components/ToastMessage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';

const rates = [
  { id: 1, name: 'Regular', price: 100 },
  { id: 2, name: 'VIP', price: 250 },
];
const discounts = [
  { id: 1, name: 'Student', type: 'percentage', value: 10 },
  { id: 2, name: 'Senior', type: 'amount', value: 20 },
];

export default function Transaction() {
  const [quantity, setQuantity] = useState(1);
  const [rateId, setRateId] = useState(rates[0].id);
  const [appliedDiscounts, setAppliedDiscounts] = useState([]);
  const [paidAmount, setPaidAmount] = useState('');
  const [showPrint, setShowPrint] = useState(false);
  const toastRef = useRef();

  const rate = rates.find(r => r.id === rateId);
  const baseTotal = rate.price * quantity;
  let discountTotal = 0;
  appliedDiscounts.forEach(d => {
    if (d.type === 'percentage') {
      discountTotal += (baseTotal * d.value) / 100;
    } else {
      discountTotal += d.value;
    }
  });
  const total = Math.max(0, baseTotal - discountTotal);
  const changeDue = paidAmount ? Math.max(0, paidAmount - total) : 0;

  const handleAddDiscount = (discount) => {
    if (!appliedDiscounts.some(d => d.id === discount.id)) {
      setAppliedDiscounts([...appliedDiscounts, discount]);
    }
  };
  const handleRemoveDiscount = (id) => {
    setAppliedDiscounts(appliedDiscounts.filter(d => d.id !== id));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!paidAmount || paidAmount < total) {
      toastRef.current.showToast('Paid amount is less than total.', 'warning');
      return;
    }
    setShowPrint(true);
    toastRef.current.showToast('Transaction saved and ticket printed!', 'success');
  };

  const handlePrintClose = () => {
    setShowPrint(false);
  };

  return (
    <div className="card">
      <ToastMessage ref={toastRef} />
      <div className="card-header">
        <h4>Ticket Transaction</h4>
      </div>
      <div className="card-body">
        <form onSubmit={handleSave}>
          <div className="mb-3">
            <label className="form-label">Ticket Quantity</label>
            <input type="number" className="form-control" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Select Rate</label>
            <select className="form-select" value={rateId} onChange={e => setRateId(Number(e.target.value))}>
              {rates.map(r => <option key={r.id} value={r.id}>{r.name} (₱{r.price})</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Discounts</label>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {discounts.map(d => (
                <button type="button" className="btn btn-outline-info btn-sm" key={d.id} onClick={() => handleAddDiscount(d)} disabled={appliedDiscounts.some(ad => ad.id === d.id)}>
                  {d.name} ({d.type === 'percentage' ? `${d.value}%` : `₱${d.value}`})
                </button>
              ))}
            </div>
            <div>
              {appliedDiscounts.map(d => (
                <span className="badge bg-info text-dark me-2" key={d.id}>
                  {d.name} <button type="button" className="btn btn-sm btn-link text-danger p-0 ms-1" onClick={() => handleRemoveDiscount(d.id)}>&times;</button>
                </span>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Total Amount</label>
            <div className="h5">₱{total.toFixed(2)}</div>
          </div>
          <div className="mb-3">
            <label className="form-label">Paid Amount</label>
            <input type="number" className="form-control" min="0" value={paidAmount} onChange={e => setPaidAmount(Number(e.target.value))} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Change Due</label>
            <div className="h5">₱{changeDue.toFixed(2)}</div>
          </div>
          <button className="btn btn-success" type="submit">
            <FontAwesomeIcon icon={solidIconMap.save} className="me-2" />
            Save & Print
          </button>
        </form>
      </div>
      {/* Print Modal */}
      {showPrint && (
        <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Receipt / Ticket</h5>
                <button type="button" className="btn-close" onClick={handlePrintClose}></button>
              </div>
              <div className="modal-body text-center">
                <h6>Cashier: John Doe</h6>
                <div>Date: {new Date().toLocaleString()}</div>
                <div>Rate: {rate.name}</div>
                <div>Quantity: {quantity}</div>
                <div>Total: <strong>₱{total.toFixed(2)}</strong></div>
                <div>Paid: <strong>₱{Number(paidAmount).toFixed(2)}</strong></div>
                <div>Change: <strong>₱{changeDue.toFixed(2)}</strong></div>
                <div>Discounts: {appliedDiscounts.length > 0 ? appliedDiscounts.map(d => d.name).join(', ') : 'None'}</div>
                <hr />
                <div>--- End of Receipt ---</div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handlePrintClose}>Close</button>
                <button className="btn btn-primary" onClick={() => window.print()}>Print</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 