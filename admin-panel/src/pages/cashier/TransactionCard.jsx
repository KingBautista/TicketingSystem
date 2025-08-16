import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons.js';

export default function TransactionCard({
  promoter,
  rates,
  discounts,
  appliedDiscounts,
  handleAddDiscount,
  handleRemoveDiscount,
  rateId,
  setRateId,
  quantity,
  setQuantity,
  total,
  paidAmount,
  setPaidAmount,
  changeDue,
  handleSaveTransaction,
  handleShowCloseCash,
  headerStyle
}) {
  return (
    <div className="card shadow-lg" style={{ width: 400, borderRadius: 18, border: 'none', background: '#fff', maxHeight: '98vh', overflow: 'hidden' }}>
      <div style={{ background: '#f7f7fa', padding: '0.25rem 1rem', borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottom: '1px solid #eee', fontWeight: 600, fontSize: 13, color: '#ffb400', letterSpacing: 0.5, whiteSpace: 'nowrap', minHeight: 28 }}>
        Promoter of the Day: <span style={{ color: '#321fdb', fontWeight: 700, marginLeft: 8 }}>{promoter?.name || 'N/A'}</span>
      </div>
      <div className="card-header d-flex align-items-center" style={{ ...headerStyle, flexDirection: 'row', justifyContent: 'space-between', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        <h4 className="mb-0" style={{ marginLeft: 0, fontWeight: 600, whiteSpace: 'nowrap', fontSize: 16 }}>Ticket Transaction</h4>
        <button className="btn btn-warning px-3" onClick={handleShowCloseCash} style={{ background: '#ffb400', border: 'none', color: '#321fdb', fontWeight: 600, whiteSpace: 'nowrap', height: 32, minHeight: 32, fontSize: 15 }}>
          <FontAwesomeIcon icon={solidIconMap.moneyBill} className="me-2" />
          Close Cash
        </button>
      </div>
      <div className="card-body p-3">
        <form onSubmit={handleSaveTransaction}>
          <div className="mb-3">
            <label className="form-label">Ticket Quantity</label>
            <input type="number" className="form-control form-control-lg" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Select Rate</label>
            <select className="form-select form-select-lg" value={rateId} onChange={e => setRateId(Number(e.target.value))}>
              {rates.map(r => <option key={r.id} value={r.id}>{r.name} (₱{r.price})</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Discounts</label>
            <div className="d-flex flex-wrap gap-2 mb-2" style={{ overflowX: 'auto' }}>
              {discounts.map(d => (
                <button
                  type="button"
                  className="btn btn-outline-info"
                  key={d.id}
                  onClick={() => handleAddDiscount(d)}
                  disabled={appliedDiscounts.some(ad => ad.id === d.id)}
                  style={{ fontSize: 13, padding: '0.25em 0.7em', whiteSpace: 'nowrap', minWidth: 0 }}
                >
                  <FontAwesomeIcon icon={solidIconMap.percent} className="me-1" />
                  {d.discount_name} ({d.discount_value_type === 'percentage' ? `${d.discount_value}%` : `₱${d.discount_value}`})
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Total Amount</label>
            <div className="h4">₱{total.toFixed(2)}</div>
          </div>
          <div className="mb-3">
            <label className="form-label">Paid Amount</label>
            <input type="number" className="form-control form-control-lg" min="0" value={paidAmount} onChange={e => setPaidAmount(Number(e.target.value))} required />
          </div>
          <div className="mb-4">
            <label className="form-label">Change Due</label>
            <div className="h4">₱{changeDue.toFixed(2)}</div>
          </div>
          <div className="d-flex justify-content-end">
            <button className="btn btn-success px-3" type="submit" style={{ background: '#00c292', border: 'none', fontSize: 15, height: 32, minHeight: 32 }}>
              <FontAwesomeIcon icon={solidIconMap.save} className="me-2" />
              Save & Print
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
