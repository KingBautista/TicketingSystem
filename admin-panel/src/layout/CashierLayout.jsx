import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ToastMessage from '../components/ToastMessage.jsx';
import { useStateContext } from '../contexts/AuthProvider.jsx';
import axiosClient from '../axios-client.js';
import OpenCashModal from '../pages/cashier/OpenCashModal.jsx';
import PrintOpenCashModal from '../pages/cashier/PrintOpenCashModal.jsx';
import TransactionCard from '../pages/cashier/TransactionCard.jsx';
import ReceiptPreview from '../pages/cashier/ReceiptPreview.jsx';
import CloseCashModal from '../pages/cashier/CloseCashModal.jsx';
import PrintCloseCashModal from '../pages/cashier/PrintCloseCashModal.jsx';

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
  const [sessionId, setSessionId] = useState(null);

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
      <OpenCashModal
        show={showOpenCash}
        cashOnHand={cashOnHand}
        password={password}
        setCashOnHand={setCashOnHand}
        setPassword={setPassword}
        handleOpenCash={handleOpenCash}
        PROMOTER_NAME={promoter?.name || 'N/A'}
        headerStyle={headerStyle}
        modalStyle={modalStyle}
      />
      {/* Print Modal for Open Cash */}
      <PrintOpenCashModal
        show={showPrintOpen}
        cashOnHand={cashOnHand}
        onClose={handlePrintOpenClose}
        promoterName={promoter?.name || 'N/A'}
        headerStyle={headerStyle}
        modalStyle={modalStyle}
        divider={divider}
        cashierName={'John Doe'}
        sessionId={sessionId ? String(sessionId) : 'N/A'}
      />
      {/* Transaction Page */}
      {showTransaction && !showCloseCash && (
        <div className="d-flex flex-row gap-4 w-100 justify-content-center align-items-start" style={{ maxWidth: 900 }}>
          <TransactionCard
            promoter={promoter}
            rates={rates}
            discounts={discounts}
            appliedDiscounts={appliedDiscounts}
            handleAddDiscount={handleAddDiscount}
            handleRemoveDiscount={handleRemoveDiscount}
            rateId={rateId}
            setRateId={setRateId}
            quantity={quantity}
            setQuantity={setQuantity}
            total={total}
            paidAmount={paidAmount}
            setPaidAmount={setPaidAmount}
            changeDue={changeDue}
            handleSaveTransaction={handleSaveTransaction}
            handleShowCloseCash={handleShowCloseCash}
            headerStyle={headerStyle}
          />
          <ReceiptPreview
            qrValues={qrValues}
            tickets={tickets}
            promoter={promoter}
            rate={rate}
            quantity={quantity}
            total={total}
            appliedDiscounts={appliedDiscounts}
            handleRemoveDiscount={handleRemoveDiscount}
            thermalPrintStyles={thermalPrintStyles}
          />
        </div>
      )}
      
      {/* Close Cash Modal */}
      <CloseCashModal
        show={showCloseCash}
        cashOnHand={cashOnHand}
        password={password}
        setCashOnHand={setCashOnHand}
        setPassword={setPassword}
        handleCloseCash={handleCloseCash}
        PROMOTER_NAME={promoter?.name || 'N/A'}
        headerStyle={headerStyle}
        modalStyle={modalStyle}
      />
      {/* Print Modal for Close Cash */}
      <PrintCloseCashModal
        show={showPrintClose}
        cashOnHand={cashOnHand}
        onClose={handlePrintClose}
        promoterName={promoter?.name || 'N/A'}
        headerStyle={headerStyle}
        modalStyle={modalStyle}
        divider={divider}
        cashierName={'John Doe'}
        sessionId={sessionId ? String(sessionId) : 'N/A'}
      />
    </div>
  );
} 