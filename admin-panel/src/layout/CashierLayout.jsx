import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ToastMessage from '../components/ToastMessage.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../utils/solidIcons.js';
import { useStateContext } from '../contexts/AuthProvider.jsx';
import axiosClient from '../axios-client.js';
import { QRCodeCanvas } from 'qrcode.react';

// Add brand logo if available
const BRAND_LOGO = null; // e.g. '/assets/brand/coreui.svg';
const BRAND_NAME = 'PathCast';

// Add promoter of the day (hardcoded for now, e.g., 'Jane Smith')
const PROMOTER_NAME = 'Jane Smith';

export default function CashierLayout() {
  const [showOpenCash, setShowOpenCash] = useState(true);
  const [showTransaction, setShowTransaction] = useState(false);
  const [showCloseCash, setShowCloseCash] = useState(false);
  const [cashOnHand, setCashOnHand] = useState('');
  const [password, setPassword] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [sessionOpen, setSessionOpen] = useState(false);
  const [sessionClosed, setSessionClosed] = useState(false);
  const [showPrintOpen, setShowPrintOpen] = useState(false);
  const [showPrintClose, setShowPrintClose] = useState(false);
  const [appliedDiscounts, setAppliedDiscounts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [rateId, setRateId] = useState(1);
  const toastRef = useRef();
  const navigate = useNavigate();
  const { setToken } = useStateContext();

  // State for backend data
  const [rates, setRates] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [promoter, setPromoter] = useState(null);

  // Fetch rates, discounts, and promoter of the day on mount
  useEffect(() => {
    axiosClient.get('/rate-management/rates/dropdown')
      .then(({ data }) => {
        setRates(data.rates || []);
        setDiscounts(data.discounts || []);
        // Set default rateId to first rate if not set
        if ((data.rates || []).length > 0) {
          setRateId(data.rates[0].id);
        }
      });
    axiosClient.get('/promoter-management/promoters/of-the-day')
      .then(({ data }) => {
        setPromoter(data?.data || data); // handle both resource and plain data
      });
  }, []);

  // Transaction logic
  const rate = rates.find(r => r.id === rateId) || rates[0] || { price: 0, name: '' };
  const baseTotal = Number(rate.price || 0) * Number(quantity || 0);
  let discountTotal = 0;
  appliedDiscounts.forEach(d => {
    if (d.discount_value_type === 'percentage') {
      discountTotal += (baseTotal * Number(d.discount_value || 0)) / 100;
    } else {
      discountTotal += Number(d.discount_value || 0);
    }
  });
  const total = Math.max(0, baseTotal - discountTotal);
  const changeDue = paidAmount ? Math.max(0, paidAmount - total) : 0;

  // Open Cash Handlers
  const handleOpenCash = (e) => {
    e && e.preventDefault();
    if (!cashOnHand || !password) {
      toastRef.current.showToast('Please enter cash on hand and password.', 'warning');
      return;
    }
    setSessionOpen(true);
    setShowPrintOpen(true);
    toastRef.current.showToast('Cash session opened!', 'success');
  };
  const handlePrintOpenClose = () => {
    setShowPrintOpen(false);
    setShowOpenCash(false);
    setShowTransaction(true);
  };

  // Transaction Handlers
  const handleAddDiscount = (discount) => {
    if (!appliedDiscounts.some(d => d.id === discount.id)) {
      setAppliedDiscounts([...appliedDiscounts, discount]);
    }
  };
  const handleRemoveDiscount = (id) => {
    setAppliedDiscounts(appliedDiscounts.filter(d => d.id !== id));
  };
  const handleSaveTransaction = (e) => {
    e.preventDefault();
    if (!paidAmount || paidAmount < total) {
      toastRef.current.showToast('Paid amount is less than total.', 'warning');
      return;
    }
    const cashierId = parseInt(localStorage.getItem('user_id'), 10); // or get from context
    const payload = {
      cashier_id: cashierId,
      promoter_id: promoter?.id || null,
      rate_id: rateId,
      quantity,
      total,
      paid_amount: paidAmount,
      change: changeDue,
      discounts: appliedDiscounts.map(d => ({
        discount_id: d.id,
        discount_value: d.discount_value,
      })),
    };
    axiosClient.post('/cashier/transactions', payload)
      .then(({ data }) => {
        toastRef.current.showToast('Transaction saved!', 'success');
        // Optionally show receipt/print modal here
      })
      .catch(() => {
        toastRef.current.showToast('Failed to save transaction.', 'danger');
      });
  };

  // Close Cash Handlers
  const handleShowCloseCash = () => {
    setShowCloseCash(true);
  };
  const handleCloseCash = (e) => {
    e && e.preventDefault();
    if (!cashOnHand || !password) {
      toastRef.current.showToast('Please enter cash on hand and password.', 'warning');
      return;
    }
    setSessionClosed(true);
    setShowPrintClose(true);
    toastRef.current.showToast('Cash session closed!', 'success');
  };
  const handlePrintClose = () => {
    setShowPrintClose(false);
    // Auto logout after closing cash
    localStorage.clear();
    setToken(null);
    navigate('/login');
  };

  const now = new Date().toISOString();
  const tickets = Array.from({ length: quantity }).map((_, i) => ({
    promoter: promoter?.name || 'Default Promoter',
    date: now,
    note: 'Single use only',
    rate: rate.name,
    ticketNumber: i + 1,
  }));

  const qrValues = tickets.map(t => JSON.stringify(t));

  // Restore modal/card styles
  const modalStyle = {
    background: '#fff',
    border: 'none',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(50,31,219,0.15)',
    fontFamily: 'Segoe UI, Arial, sans-serif',
    maxHeight: '98vh',
    overflow: 'hidden',
  };
  const headerStyle = {
    background: '#321fdb',
    color: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottom: '1px solid #eee',
    padding: '0.5rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontWeight: 600,
    fontSize: 16,
    letterSpacing: 1,
    minHeight: 36,
  };
  const iconCircle = {
    background: '#fff',
    color: '#321fdb',
    borderRadius: '50%',
    width: 38,
    height: 38,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    boxShadow: '0 2px 8px rgba(50,31,219,0.08)'
  };
  const divider = <hr style={{ borderTop: '1.5px solid #e0e0e0', margin: '1.5rem 0' }} />;

  // Print-specific CSS
  const printStyles = `
    @media print {
      body * { visibility: hidden !important; }
      .cashier-print-modal, .cashier-print-modal * { visibility: visible !important; }
      .cashier-print-modal {
        position: absolute !important;
        left: 0; top: 0; width: 100vw; min-height: 100vh;
        background: #fff !important;
        box-shadow: none !important;
        color: #000 !important;
        z-index: 99999 !important;
        padding: 0 !important;
      }
      .cashier-print-modal .modal-header, .cashier-print-modal .modal-footer, .btn, .btn-close {
        display: none !important;
      }
      .cashier-print-modal .modal-body { padding: 2rem 2rem 1rem 2rem !important; }
    }
  `;

  // Print-specific CSS for thermal receipt
  const thermalPrintStyles = `
    @media print {
      body * { visibility: hidden !important; }
      .thermal-receipt-print, .thermal-receipt-print * { visibility: visible !important; }
      .thermal-receipt-print {
        position: absolute !important;
        left: 0; top: 0; width: 300px; min-width: 300px; max-width: 300px;
        font-family: 'Courier New', Courier, monospace !important;
        background: #fff !important;
        color: #000 !important;
        z-index: 99999 !important;
        margin: 0 auto;
        padding: 0;
        box-shadow: none !important;
        border: none !important;
      }
      .thermal-receipt-print h3, .thermal-receipt-print h4, .thermal-receipt-print h5 {
        font-size: 1.1em !important;
        font-weight: bold !important;
        margin: 0 0 0.5em 0 !important;
        text-align: center;
      }
      .thermal-receipt-print .receipt-section {
        margin-bottom: 0.5em;
      }
      .thermal-receipt-print .receipt-line {
        display: flex;
        justify-content: space-between;
        font-size: 1em;
        margin-bottom: 0.2em;
      }
      .thermal-receipt-print .receipt-divider {
        border-top: 1px dashed #000;
        margin: 0.5em 0;
      }
      .thermal-receipt-print .receipt-discount-list {
        margin: 0 0 0.5em 0;
        padding: 0;
        list-style: none;
      }
      .thermal-receipt-print .receipt-discount-list li {
        font-size: 1em;
        display: flex;
        justify-content: space-between;
      }
      .thermal-receipt-print .receipt-footer {
        text-align: center;
        font-size: 0.95em;
        margin-top: 1em;
      }
      .thermal-receipt-print .btn, .thermal-receipt-print button { display: none !important; }
    }
  `;

  return (
    <div className="cashier-portal d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9fa 60%, #e6e9ff 100%)' }}>
      <style>{printStyles}</style>
      <ToastMessage ref={toastRef} />
      {/* Open Cash Modal */}
      {showOpenCash && (
        <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(50,31,219,0.10)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }}>
            <div className="modal-content" style={modalStyle}>
              {/* Promoter Row */}
              <div style={{ background: '#f7f7fa', padding: '0.25rem 1rem', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottom: '1px solid #eee', fontWeight: 600, fontSize: 13, color: '#ffb400', letterSpacing: 0.5, whiteSpace: 'nowrap', minHeight: 28 }}>
                Promoter of the Day: <span style={{ color: '#321fdb', fontWeight: 700, marginLeft: 8 }}>{PROMOTER_NAME}</span>
              </div>
              <div className="modal-header" style={{ ...headerStyle, flexDirection: 'row', justifyContent: 'space-between', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                <h5 className="modal-title mb-0" style={{ marginLeft: 0, fontWeight: 600, whiteSpace: 'nowrap', fontSize: 16 }}>Open Cash Session</h5>
              </div>
              <div className="modal-body p-3">
                <form onSubmit={handleOpenCash}>
                  <div className="mb-3">
                    <label className="form-label">Cash on Hand</label>
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      value={cashOnHand}
                      onChange={e => setCashOnHand(e.target.value)}
                      min="0"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="d-flex justify-content-end">
                    <button className="btn btn-primary btn-sm px-3" type="submit" style={{ background: '#321fdb', border: 'none', fontSize: 15, height: 32, minHeight: 32 }}>
                      <FontAwesomeIcon icon={solidIconMap.cashRegister} className="me-2" />
                      Open Cash
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Print Modal for Open Cash */}
      {showPrintOpen && (
        <div className="modal d-block cashier-print-modal" tabIndex="-1" style={{ background: 'rgba(50,31,219,0.10)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }}>
            <div className="modal-content" style={modalStyle}>
              {/* Promoter Row */}
              <div style={{ background: '#f7f7fa', padding: '0.25rem 1rem', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottom: '1px solid #eee', fontWeight: 600, fontSize: 13, color: '#ffb400', letterSpacing: 0.5, whiteSpace: 'nowrap', minHeight: 28 }}>
                Promoter of the Day: <span style={{ color: '#321fdb', fontWeight: 700, marginLeft: 8 }}>{PROMOTER_NAME}</span>
              </div>
              <div className="modal-header" style={{ ...headerStyle, flexDirection: 'row', justifyContent: 'space-between', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                <h5 className="modal-title mb-0" style={{ marginLeft: 0, fontWeight: 600, whiteSpace: 'nowrap', fontSize: 16 }}>Open Cash Receipt</h5>
                <button type="button" className="btn-close" onClick={handlePrintOpenClose}></button>
              </div>
              <div className="modal-body text-center p-3">
                <h6 className="mb-3">Cashier: John Doe</h6>
                <div>Date: {new Date().toLocaleString()}</div>
                <div>Cash on Hand: <strong>₱{parseFloat(cashOnHand).toFixed(2)}</strong></div>
                <div>Session ID: #123456</div>
                {divider}
                <div className="text-muted">--- End of Receipt ---</div>
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <button className="btn btn-outline-secondary btn-sm px-3" style={{ height: 32, minHeight: 32, fontSize: 15 }} onClick={handlePrintOpenClose}>Close</button>
                <button className="btn btn-primary btn-sm px-3" style={{ height: 32, minHeight: 32, fontSize: 15 }} onClick={() => window.print()}><FontAwesomeIcon icon={solidIconMap.print} className="me-2" />Print</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Transaction Page */}
      {showTransaction && !showCloseCash && (
        <div className="d-flex flex-row gap-4 w-100 justify-content-center align-items-start" style={{ maxWidth: 900 }}>
          {/* Transaction Card */}
          <div className="card shadow-lg" style={{ width: 400, borderRadius: 18, border: 'none', background: '#fff', maxHeight: '98vh', overflow: 'hidden' }}>
            {/* Promoter Row */}
            <div style={{ background: '#f7f7fa', padding: '0.25rem 1rem', borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottom: '1px solid #eee', fontWeight: 600, fontSize: 13, color: '#ffb400', letterSpacing: 0.5, whiteSpace: 'nowrap', minHeight: 28 }}>
              Promoter of the Day: <span style={{ color: '#321fdb', fontWeight: 700, marginLeft: 8 }}>{promoter?.name || 'N/A'}</span>
            </div>
            <div className="card-header d-flex align-items-center" style={{ ...headerStyle, flexDirection: 'row', justifyContent: 'space-between', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
              <h4 className="mb-0" style={{ marginLeft: 0, fontWeight: 600, whiteSpace: 'nowrap', fontSize: 16 }}>Ticket Transaction</h4>
              <button className="btn btn-warning btn-sm px-3" onClick={handleShowCloseCash} style={{ background: '#ffb400', border: 'none', color: '#321fdb', fontWeight: 600, whiteSpace: 'nowrap', height: 32, minHeight: 32, fontSize: 15 }}>
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
                        className="btn btn-outline-info btn-sm"
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
                  <button className="btn btn-success btn-sm px-3" type="submit" style={{ background: '#00c292', border: 'none', fontSize: 15, height: 32, minHeight: 32 }}>
                    <FontAwesomeIcon icon={solidIconMap.save} className="me-2" />
                    Save & Print
                  </button>
                </div>
              </form>
            </div>
          </div>
          {/* Receipt Preview: thermal style, matches printout */}
          <div style={{
                width: 300,
                minWidth: 300,
                maxWidth: 300,
                fontFamily: 'Courier New, Courier, monospace',
                background: '#fff',
                color: '#000',
                borderRadius: 8,
                boxShadow: '0 8px 32px rgba(50,31,219,0.10)',
                padding: 0,
                margin: 0,
                marginTop: 8,
                marginBottom: 8,
                maxHeight: '98vh', // Match main layout height
                overflowY: 'auto'   // Enable vertical scrolling
              }}
            >
            <style>{thermalPrintStyles}</style>
            <div style={{ padding: '12px 8px', fontSize: 15, lineHeight: 1.5 }}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 }}>RECEIPT</div>
                  
              {/* QR Code Block */}
              {qrValues.map((val, idx) => (
                <div key={idx} style={{ marginBottom: '16px' }}>
                  <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 4 }}>
                    Promoter: {tickets[idx].promoter}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <QRCodeCanvas value={val} size={128} />
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 12, marginTop: 4 }}>
                    {new Date(tickets[idx].date).toLocaleString()}<br />
                    <em>Single use only</em>
                  </div>
                  {idx < qrValues.length - 1 && (
                    <div style={{ borderTop: '1px dashed #000', margin: '12px 0' }} />
                  )}
                </div>
              ))}

              <div style={{ borderTop: '1px dashed #000', margin: '12px 0' }} />
                  
              <div><span style={{ fontWeight: 'bold' }}>PROMOTER:</span> {promoter?.name || 'N/A'}</div>
              <div><span style={{ fontWeight: 'bold' }}>DATE:</span> {new Date().toLocaleString()}</div>
              <div><span style={{ fontWeight: 'bold' }}>RATE:</span> {rate.name}</div>
              <div><span style={{ fontWeight: 'bold' }}>QTY:</span> {quantity}</div>
              <div><span style={{ fontWeight: 'bold' }}>TOTAL:</span> ₱{total.toFixed(2)}</div>
              <div style={{ fontWeight: 'bold', marginTop: 8 }}>DISCOUNTS:</div>
              {appliedDiscounts.length === 0 && <div>None</div>}
              {appliedDiscounts.map(d => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{d.discount_name}</span>
                  <span>{d.discount_value_type === 'percentage' ? `${d.discount_value}%` : `₱${d.discount_value}`}</span>
                  <button
                    type="button"
                    className="btn btn-link text-danger p-0 ms-1"
                    style={{ fontSize: 15, lineHeight: 1, height: 18 }}
                    onClick={() => handleRemoveDiscount(d.id)}
                  >
                    &times;
                  </button>
                </div>
              ))}
              <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>
              <div style={{ textAlign: 'center', fontSize: 14, marginTop: 8 }}>Thank you!</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Close Cash Modal */}
      {showCloseCash && (
        <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(50,31,219,0.10)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }}>
            <div className="modal-content" style={modalStyle}>
              {/* Promoter Row */}
              <div style={{ background: '#f7f7fa', padding: '0.25rem 1rem', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottom: '1px solid #eee', fontWeight: 600, fontSize: 13, color: '#ffb400', letterSpacing: 0.5, whiteSpace: 'nowrap', minHeight: 28 }}>
                Promoter of the Day: <span style={{ color: '#321fdb', fontWeight: 700, marginLeft: 8 }}>{PROMOTER_NAME}</span>
              </div>
              <div className="modal-header" style={{ ...headerStyle, flexDirection: 'row', justifyContent: 'space-between', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                <h5 className="modal-title mb-0" style={{ marginLeft: 0, fontWeight: 600, whiteSpace: 'nowrap', fontSize: 16 }}>Close Cash Session</h5>
              </div>
              <div className="modal-body p-3">
                <form onSubmit={handleCloseCash}>
                  <div className="mb-3">
                    <label className="form-label">Cash on Hand</label>
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      value={cashOnHand}
                      onChange={e => setCashOnHand(e.target.value)}
                      min="0"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="d-flex justify-content-end">
                    <button className="btn btn-primary btn-sm px-3" type="submit" style={{ background: '#321fdb', border: 'none', fontSize: 15, height: 32, minHeight: 32 }}>
                      <FontAwesomeIcon icon={solidIconMap.moneyBill} className="me-2" />
                      Close Cash
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Print Modal for Close Cash */}
      {showPrintClose && (
        <div className="modal d-block cashier-print-modal" tabIndex="-1" style={{ background: 'rgba(50,31,219,0.10)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }}>
            <div className="modal-content" style={modalStyle}>
              {/* Promoter Row */}
              <div style={{ background: '#f7f7fa', padding: '0.25rem 1rem', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottom: '1px solid #eee', fontWeight: 600, fontSize: 13, color: '#ffb400', letterSpacing: 0.5, whiteSpace: 'nowrap', minHeight: 28 }}>
                Promoter of the Day: <span style={{ color: '#321fdb', fontWeight: 700, marginLeft: 8 }}>{PROMOTER_NAME}</span>
              </div>
              <div className="modal-header" style={{ ...headerStyle, flexDirection: 'row', justifyContent: 'space-between', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                <h5 className="modal-title mb-0" style={{ marginLeft: 0, fontWeight: 600, whiteSpace: 'nowrap', fontSize: 16 }}>Close Cash Summary</h5>
                <button type="button" className="btn-close" onClick={handlePrintClose}></button>
              </div>
              <div className="modal-body text-center p-3">
                <h6 className="mb-3">Cashier: John Doe</h6>
                <div>Date: {new Date().toLocaleString()}</div>
                <div>Cash on Hand: <strong>₱{parseFloat(cashOnHand).toFixed(2)}</strong></div>
                <div>Total Transactions: 12</div>
                <div>Total Sales: ₱2,345.00</div>
                <div>Session ID: #123456</div>
                {divider}
                <div className="text-muted">--- End of Summary ---</div>
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <button className="btn btn-outline-secondary btn-sm px-3" style={{ height: 32, minHeight: 32, fontSize: 15 }} onClick={handlePrintClose}>Close</button>
                <button className="btn btn-primary btn-sm px-3" style={{ height: 32, minHeight: 32, fontSize: 15 }} onClick={() => window.print()}><FontAwesomeIcon icon={solidIconMap.print} className="me-2" />Print</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 