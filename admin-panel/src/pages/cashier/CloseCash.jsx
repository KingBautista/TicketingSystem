import { useState, useRef } from 'react';
import ToastMessage from '../../components/ToastMessage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';

export default function CloseCash() {
  const [cashOnHand, setCashOnHand] = useState('');
  const [password, setPassword] = useState('');
  const [sessionClosed, setSessionClosed] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const toastRef = useRef();

  const handleCloseCash = (e) => {
    e.preventDefault();
    if (!cashOnHand || !password) {
      toastRef.current.showToast('Please enter cash on hand and password.', 'warning');
      return;
    }
    setSessionClosed(true);
    setShowPrint(true);
    toastRef.current.showToast('Cash session closed!', 'success');
  };

  const handlePrintClose = () => {
    setShowPrint(false);
  };

  return (
    <div className="card">
      <ToastMessage ref={toastRef} />
      <div className="card-header">
        <h4>Close Cash Session</h4>
      </div>
      <div className="card-body">
        {sessionClosed ? (
          <div className="alert alert-success">Cash session is closed.</div>
        ) : (
          <form onSubmit={handleCloseCash}>
            <div className="mb-3">
              <label className="form-label">Cash on Hand</label>
              <input
                type="number"
                className="form-control"
                value={cashOnHand}
                onChange={e => setCashOnHand(e.target.value)}
                min="0"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit">
              <FontAwesomeIcon icon={solidIconMap.moneyBill} className="me-2" />
              Close Cash
            </button>
          </form>
        )}
      </div>
      {/* Print Modal */}
      {showPrint && (
        <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Close Cash Summary</h5>
                <button type="button" className="btn-close" onClick={handlePrintClose}></button>
              </div>
              <div className="modal-body text-center">
                <h6>Cashier: John Doe</h6>
                <div>Date: {new Date().toLocaleString()}</div>
                <div>Cash on Hand: <strong>₱{parseFloat(cashOnHand).toFixed(2)}</strong></div>
                <div>Total Transactions: 12</div>
                <div>Total Sales: ₱2,345.00</div>
                <div>Session ID: #123456</div>
                <hr />
                <div>--- End of Summary ---</div>
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