import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons.js';
import { clientPrinter } from '../../utils/printerUtils.js';

export default function PrintOpenCashModal({
  show = false,
  cashOnHand = 0,
  onClose,
  promoterName = 'N/A',
  headerStyle = {},
  modalStyle = {},
  divider = <hr style={{ borderTop: '1.5px solid #e0e0e0', margin: '1.5rem 0' }} />,
  cashierName = 'John Doe',
  sessionId = '123456',
}) {
  // Function to print open cash receipt
  const handlePrintOpenCash = async () => {
    if (!cashOnHand || !cashierName) {
      alert('Please fill in cash on hand before printing.');
      return;
    }

    // Generate a temporary session ID for printing (will be replaced with real one after opening)
    const tempSessionId = sessionId !== 'N/A' ? sessionId : 'TEMP-' + Date.now();

    try {
      console.log('🖨️ Testing frontend printing with open cash receipt...');
      
      // Use the frontend printer utility to call star-final-printer.js
      const printSuccess = await clientPrinter.printOpenCash(cashierName, cashOnHand, tempSessionId);

      if (printSuccess) {
        console.log('✅ Open cash receipt printed successfully from frontend!');
        alert('Open cash receipt printed successfully!');
      } else {
        console.error('❌ Frontend printing failed');
        alert('Failed to print open cash receipt. Check printer connection.');
      }
    } catch (error) {
      console.error('❌ Error printing open cash receipt:', error);
      alert('Error printing receipt. Please try again.');
    }
  };
  if (!show) return null;
  return (
    <div className="modal d-block cashier-print-modal" tabIndex="-1" style={{ background: 'rgba(50,31,219,0.10)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }}>
        <div className="modal-content" style={modalStyle}>
          <div style={{ background: '#f7f7fa', padding: '0.25rem 1rem', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottom: '1px solid #eee', fontWeight: 600, fontSize: 13, color: '#ffb400', letterSpacing: 0.5, whiteSpace: 'nowrap', minHeight: 28 }}>
            Promoter of the Day: <span style={{ color: '#321fdb', fontWeight: 700, marginLeft: 8 }}>{promoterName}</span>
          </div>
          <div className="modal-header profile-main-header" style={{ ...headerStyle, flexDirection: 'row', justifyContent: 'space-between', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            <h5 className="modal-title mb-0" style={{ marginLeft: 0, fontWeight: 600, whiteSpace: 'nowrap', fontSize: 16, color: 'white' }}>Open Cash Receipt</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body text-center p-3">
            <h6 className="mb-3">Cashier: {cashierName}</h6>
            <div>Date: {new Date().toLocaleString()}</div>
            <div>Cash on Hand: <strong>P{parseFloat(cashOnHand).toFixed(2)}</strong></div>
            <div>Session ID: #{sessionId}</div>
            {divider}
            <div className="text-muted">--- End of Receipt ---</div>
          </div>
          <div className="modal-footer d-flex justify-content-between">
            <button className="btn btn-outline-secondary px-3" style={{ height: 32, minHeight: 32, fontSize: 15 }} onClick={onClose}>Close</button>
            <button 
              className="btn btn-primary px-3" 
              style={{ height: 32, minHeight: 32, fontSize: 15 }} 
              onClick={handlePrintOpenCash}
              disabled={!cashOnHand || !cashierName}
            >
              <FontAwesomeIcon icon={solidIconMap.print} className="me-2" />
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

PrintOpenCashModal.propTypes = {
  show: PropTypes.bool,
  cashOnHand: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClose: PropTypes.func,
  promoterName: PropTypes.string,
  headerStyle: PropTypes.object,
  modalStyle: PropTypes.object,
  divider: PropTypes.node,
  cashierName: PropTypes.string,
  sessionId: PropTypes.string,
};
