import { useState, useRef } from 'react';
import ToastMessage from '../../components/ToastMessage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';

export default function OpenCash() {
  const [cashOnHand, setCashOnHand] = useState('');
  const [password, setPassword] = useState('');
  const [sessionOpen, setSessionOpen] = useState(false); // Simulate session
  const [showPrint, setShowPrint] = useState(false);
  const toastRef = useRef();

  const handleOpenCash = (e) => {
    e.preventDefault();
    if (!cashOnHand || !password) {
      toastRef.current.showToast('Please enter cash on hand and password.', 'warning');
      return;
    }
    setSessionOpen(true);
    setShowPrint(true);
    toastRef.current.showToast('Cash session opened!', 'success');
  };

  const handlePrintClose = () => {
    setShowPrint(false);
  };

  return (
    <div className="card">
      <ToastMessage ref={toastRef} />
      <div className="card-header">
        <h4>Open Cash Session</h4>
      </div>
      <div className="card-body">
        {sessionOpen ? (
          <div className="alert alert-success">Cash session is already open.</div>
        ) : (
          <form onSubmit={handleOpenCash}>
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
              <FontAwesomeIcon icon={solidIconMap.cashRegister} className="me-2" />
              Open Cash
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
                <h5 className="modal-title">Open Cash Receipt</h5>
                <button type="button" className="btn-close" onClick={handlePrintClose}></button>
              </div>
              <div className="modal-body text-center">
                <h6>Cashier: John Doe</h6>
                <div>Date: {new Date().toLocaleString()}</div>
                <div>Cash on Hand: <strong>₱{parseFloat(cashOnHand).toFixed(2)}</strong></div>
                <div>Session ID: #123456</div>
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