import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons.js';

export default function OpenCashModal({
  show,
  cashOnHand,
  password,
  setCashOnHand,
  setPassword,
  handleOpenCash,
  PROMOTER_NAME,
  headerStyle,
  modalStyle
}) {
  if (!show) return null;
  return (
    <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(50,31,219,0.10)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }}>
        <div className="modal-content" style={modalStyle}>
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
  );
}
