import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

// Function to generate random characters
const generateRandomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function ReceiptPreview({
  qrValues,
  tickets,
  promoter,
  rate,
  quantity,
  total,
  appliedDiscounts,
  handleRemoveDiscount,
  thermalPrintStyles,
  user,
  sessionId,
  paidAmount,
  changeDue
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
        {/* Section 1: Individual QR Receipts (matching printSingleQRReceipt) */}
        {qrValues.map((val, idx) => {
          const randomCode = generateRandomCode();
          return (
            <div key={idx} style={{ 
              marginBottom: '20px',
              padding: '12px'
            }}>
              {/* QR Code */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <QRCodeCanvas value={randomCode} size={128} />
              </div>
              
              {/* Promoter name (center aligned) */}
              <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '4px' }}>
                {promoter?.name || 'N/A'}
              </div>
              
              {/* Date and time */}
              <div style={{ textAlign: 'center', fontSize: '12px', marginBottom: '4px' }}>
                {new Date(tickets[idx]?.date || Date.now()).toLocaleString()}
              </div>
              
              {/* Code in text */}
              <div style={{ textAlign: 'center', fontSize: '12px', marginBottom: '4px' }}>
                Code: {randomCode}
              </div>
              
              {/* Single use only label */}
              <div style={{ textAlign: 'center', fontSize: '12px', fontStyle: 'italic' }}>
                Single use only
              </div>
              
              {/* Cut line (broken line) */}
              <div style={{ 
                borderTop: '1px dashed #000', 
                margin: '12px 0',
                height: '1px'
              }} />
            </div>
          );
        })}
        
        {/* Section 2: Main Receipt (matching printTransactionTickets main receipt) */}
        <div style={{ 
          padding: '12px',
          marginTop: '20px'
        }}>
          {/* Header - Bold and Double Size */}
          <div style={{ 
            textAlign: 'center', 
            fontWeight: 'bold', 
            fontSize: '18px',
            letterSpacing: 1, 
            marginBottom: '12px' 
          }}>
            RECEIPT
          </div>
          
          {/* Promoter (center aligned) */}
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            Promoter: {promoter?.name || 'N/A'}
          </div>
          
          {/* Date and time */}
          <div style={{ textAlign: 'center', marginBottom: '4px' }}>
            {new Date().toLocaleString()}
          </div>
          
          {/* Single use only */}
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            Single use only
          </div>
          
          {/* Separator */}
          <div style={{ borderTop: '1px dashed #000', margin: '12px 0' }} />
          
          {/* Details (left aligned) */}
          <div style={{ textAlign: 'left' }}>
            <div><span style={{ fontWeight: 'bold' }}>PROMOTER:</span> {promoter?.name || 'N/A'}</div>
            <div><span style={{ fontWeight: 'bold' }}>DATE:</span> {new Date().toLocaleString()}</div>
            <div><span style={{ fontWeight: 'bold' }}>RATE:</span> {rate?.name || 'No Rate Selected'}</div>
            <div><span style={{ fontWeight: 'bold' }}>QTY:</span> {quantity}</div>
            <div><span style={{ fontWeight: 'bold' }}>TOTAL:</span> ₱{total.toFixed(2)}</div>
            <div><span style={{ fontWeight: 'bold' }}>PAID:</span> ₱{paidAmount || total.toFixed(2)}</div>
            <div><span style={{ fontWeight: 'bold' }}>CHANGE:</span> ₱{changeDue || '0.00'}</div>
            <div><span style={{ fontWeight: 'bold' }}>CASHIER:</span> {user?.user_login || 'N/A'}</div>
            <div><span style={{ fontWeight: 'bold' }}>SESSION:</span> #{sessionId || 'N/A'}</div>
            <div><span style={{ fontWeight: 'bold' }}>TXN ID:</span> #{Math.floor(Math.random() * 10000)}</div>
            
            {/* Discounts Section */}
            <div style={{ fontWeight: 'bold', marginTop: '8px' }}>DISCOUNTS:</div>
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
          </div>
          
          {/* Separator */}
          <div style={{ borderTop: '1px dashed #000', margin: '12px 0' }} />
          
          {/* Footer (center align) */}
          <div style={{ textAlign: 'center', fontSize: '14px' }}>Thank you!</div>
        </div>
      </div>
    </div>
  );
}
