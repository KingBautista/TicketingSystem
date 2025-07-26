import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons.js';

export default function PrintCloseCashModal({
  show,
  cashOnHand,
  handleCloseAndLogout,
  promoterName,
  headerStyle,
  modalStyle,
  divider,
  dailyTransactions = [],
  dailyTotal = 0,
  thermalPrintStyles,
  sessionId,
  cashierName,
  closingCash
}) {

  if (!show) return null;
  return (
    <div className="modal d-block cashier-print-modal" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }}>
        <div className="modal-content" style={modalStyle}>
          <div className="modal-header bg-primary text-white" style={{ ...headerStyle }}>
            <h5 className="modal-title mb-0" style={{ marginLeft: 0, fontWeight: 600, whiteSpace: 'nowrap', fontSize: 16 }}>Close Cash Summary</h5>
          </div>
          
          <div className="modal-body p-0" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ 
              width: 300,
              minWidth: 300,
              maxWidth: 300,
              fontFamily: 'Courier New, Courier, monospace',
              background: '#fff',
              color: '#000',
              padding: '20px 10px',
              margin: '0 auto',
            }} className="thermal-receipt-print print-content">
            <style>{thermalPrintStyles}</style>
            
            <div style={{ textAlign: 'center', marginBottom: 10, borderBottom: '1px dashed #000', paddingBottom: 10 }}>
              <div style={{ fontSize: '1.2em', fontWeight: 'bold', marginBottom: 5 }}>CLOSE CASH REPORT</div>
              <div style={{ fontSize: '0.9em' }}>================================</div>
              <div style={{ fontSize: '0.9em' }}>Date: {new Date().toLocaleString()}</div>
              <div style={{ fontSize: '0.9em' }}>Cashier: {cashierName}</div>
              <div style={{ fontSize: '0.9em' }}>Session: #{sessionId}</div>
              <div style={{ fontSize: '0.9em' }}>================================</div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ textAlign: 'center', fontSize: '0.9em', marginBottom: 5 }}>*** DAILY TRANSACTIONS ***</div>
              {dailyTransactions.map((transaction, idx) => (
                <div key={transaction.id} style={{ marginBottom: 8, fontSize: '0.85em' }}>
                  <div style={{ marginBottom: 2 }}>
                    <div>Transaction #{transaction.id}</div>
                    <div>Time: {new Date(transaction.created_at).toLocaleTimeString()}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span>{transaction.rate?.name}</span>
                    <span>x{transaction.quantity}</span>
                  </div>
                  {transaction.discounts?.length > 0 && (
                    <div style={{ paddingLeft: 8 }}>
                      {transaction.discounts.map(d => (
                        <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>- {d.discount_name}</span>
                          <span>{d.discount_value_type === 'percentage' ? `${d.discount_value}%` : `₱${d.discount_value}`}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dotted #000', paddingTop: 2, marginTop: 2 }}>
                    <span>Total:</span>
                    <span>₱{parseFloat(transaction.total).toFixed(2)}</span>
                  </div>
                  {idx < dailyTransactions.length - 1 && (
                    <div style={{ borderBottom: '1px dashed #000', margin: '8px 0', fontSize: '0.8em' }}>--------------------------------</div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', margin: '10px 0', padding: '10px 0' }}>
              <div style={{ textAlign: 'center', fontSize: '0.9em', marginBottom: 5 }}>*** SUMMARY ***</div>
              <div style={{ fontSize: '0.85em' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span>Opening Cash:</span>
                  <span>₱{Number(cashOnHand || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span>Total Transactions:</span>
                  <span>{dailyTransactions.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span>Total Sales:</span>
                  <span>₱{Number(dailyTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dotted #000', paddingTop: 4, marginTop: 4 }}>
                  <span>Closing Cash:</span>
                  <span>₱{Number(closingCash || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.9em' }}>
              --- End of Report ---
            </div>
          </div>

          </div>
          <div className="modal-footer d-flex justify-content-between py-2">
            <button 
              className="btn btn-outline-secondary"
              onClick={handleCloseAndLogout}>
              Close & Logout
            </button>
            <button 
              className="btn btn-primary">
              <FontAwesomeIcon icon={solidIconMap.fileexport} className="me-2" />
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
