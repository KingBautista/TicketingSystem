import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons.js';

export default function PrintCloseCashModal({
  show,
  cashOnHand,
  handlePrintClose,
  PROMOTER_NAME,
  headerStyle,
  modalStyle,
  divider
}) {
  if (!show) return null;
  return (
    <div className="modal d-block cashier-print-modal" tabIndex="-1" style={{ background: 'rgba(50,31,219,0.10)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }}>
        <div className="modal-content" style={modalStyle}>
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
  );
}
