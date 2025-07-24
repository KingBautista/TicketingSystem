import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function ReceiptPreview({
  qrValues,
  tickets,
  promoter,
  rate,
  quantity,
  total,
  appliedDiscounts,
  handleRemoveDiscount,
  thermalPrintStyles
}) {
  return (
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
      maxHeight: '98vh',
      overflowY: 'auto'
    }}>
      <style>{thermalPrintStyles}</style>
      <div style={{ padding: '12px 8px', fontSize: 15, lineHeight: 1.5 }}>
        <div style={{ textAlign: 'center', fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 }}>RECEIPT</div>
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
  );
}
