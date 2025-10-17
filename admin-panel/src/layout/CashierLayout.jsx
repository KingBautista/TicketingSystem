import { useState, useRef, useEffect } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import ToastMessage from '../components/ToastMessage.jsx';
import { useStateContext } from '../contexts/AuthProvider.jsx';
import axiosClient from '../axios-client.js';
import OpenCashModal from '../pages/cashier/OpenCashModal.jsx';
import PrintOpenCashModal from '../pages/cashier/PrintOpenCashModal.jsx';
import TransactionCard from '../pages/cashier/TransactionCard.jsx';
import ReceiptPreview from '../pages/cashier/ReceiptPreview.jsx';
import CloseCashModal from '../pages/cashier/CloseCashModal.jsx';
import PrintCloseCashModal from '../pages/cashier/PrintCloseCashModal.jsx';
import CashierSidebar from '../pages/cashier/CashierSidebar.jsx';
import TransactionList from '../pages/cashier/TransactionList.jsx';
import { clientDisplay } from '../utils/displayUtils.js';
import { printerConnectionDebugger } from '../utils/debug-printer-connection.js';

export default function CashierLayout() {
  // Check for cashier session token in localStorage to persist session
  const [showOpenCash, setShowOpenCash] = useState(() => !localStorage.getItem('cashier_session_token'));
  const [showTransaction, setShowTransaction] = useState(() => !!localStorage.getItem('cashier_session_token'));
  const [showCloseCash, setShowCloseCash] = useState(false);
  const [cashOnHand, setCashOnHand] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [sessionOpen, setSessionOpen] = useState(() => !!localStorage.getItem('cashier_session_token'));
  const [sessionClosed, setSessionClosed] = useState(false);
  const [showPrintOpen, setShowPrintOpen] = useState(false);
  const [showPrintClose, setShowPrintClose] = useState(false);
  const [appliedDiscounts, setAppliedDiscounts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [rateId, setRateId] = useState('');

  const toastRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, setToken } = useStateContext();

  const handleLogout = () => {
    localStorage.removeItem('cashier_session_token');
    localStorage.removeItem('opening_cash');
    setToken(null);
    setUser({});
    navigate('/login');
  };

  // Frontend printing handler
  const handleFrontendPrinting = async (printData) => {
    try {
      console.log('🖨️ Starting frontend printing with data:', printData);
      
      // Import the client printer utility
      const { clientPrinter } = await import('../utils/printerUtils.js');
      console.log('📦 Client printer utility imported successfully');
      
      // Print the transaction using client printer service
      console.log('🔄 Calling clientPrinter.printTransaction...');
      const printSuccess = await clientPrinter.printTransaction(printData);
      console.log('📊 Print result:', printSuccess);
      
      if (printSuccess) {
        console.log('✅ Transaction printed successfully via client printer service');
      } else {
        console.error('❌ Failed to print transaction via client printer service');
        toastRef.current.showToast('Transaction saved but printing failed.', 'warning');
      }
    } catch (error) {
      console.error('❌ Error during frontend printing:', error);
      toastRef.current.showToast('Transaction saved but printing failed.', 'warning');
    }
  };

  // State for backend data
  const [rates, setRates] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [promoter, setPromoter] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Load session data and setup initial state
  useEffect(() => {
    const sessionToken = localStorage.getItem('cashier_session_token');
    const openingCash = localStorage.getItem('opening_cash');
    if (sessionToken) {
      setSessionId(sessionToken);
      setSessionOpen(true);
      if (openingCash) {
        setCashOnHand(openingCash);
      }
      setShowTransaction(true);
      setShowOpenCash(false);
    }
  }, []);

    // execute once component is loaded
  useEffect(() => {
    axiosClient.get('/user')
		.then(({data}) => {
      const user = data; 
      setUser(user);
		})
    .catch((errors) => {
      toastAction.current.showError(errors.response);
		});
  }, []); // empty array means 'run once'

  // Fetch rates, discounts, and promoter of the day on mount
  useEffect(() => {
    axiosClient.get('/rate-management/rates/dropdown')
      .then(({ data }) => {
        setRates(data.rates || []);
        setDiscounts(data.discounts || []);
        // Don't auto-select first rate - let user choose
      });
    axiosClient.get('/promoter-management/promoters/of-the-day')
      .then(({ data }) => {
        setPromoter(data?.data || data); // handle both resource and plain data
      });
  }, []);

  // Transaction logic
  const rate = rates.find(r => r.id === rateId) || null;
  const baseTotal = rate ? Number(rate.price || 0) * Number(quantity || 0) : 0;
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

  useEffect(() => {
    if (total === 0 || !promoter?.name || !rateId) return;
    console.log(total, promoter);
    const timeout = setTimeout(() => {
      // Use frontend display utilities instead of Laravel backend
      clientDisplay.showCustomMessage(
        `Promoter: ${promoter.name}`.substring(0, 20),
        `Total: ₱${total.toFixed(2)}`.substring(0, 20)
      ).catch(err => {
        console.error('PD-300 display error:', err);
      });
    }, 400);
  
    return () => clearTimeout(timeout);
  }, [total, promoter, rateId]);

  // Open Cash Handlers
  // Integrate handleOpenCash with backend
  const handleOpenCash = async (e) => {
    e && e.preventDefault();
    if (!cashOnHand) {
      toastRef.current.showToast('Please enter cash on hand amount.', 'warning');
      return;
    }
    // Open cashier session
    try {
      const cashierId = user?.id || user?.user_id || null;
      if (!cashierId) {
        toastRef.current.showToast('User ID not found. Please re-login.', 'danger');
        return;
      }
      const openingCash = parseFloat(cashOnHand);
      const payload = { cashier_id: cashierId, cash_on_hand: openingCash };
      const { data } = await axiosClient.post('/cashier/open-session', payload);
      // Save session token and opening cash to localStorage
      localStorage.setItem('cashier_session_token', data?.data?.id || data?.id || '1');
      localStorage.setItem('opening_cash', openingCash.toString());
      setSessionId(data?.data?.id || data?.id || null);
      setCashOnHand(openingCash.toString());
      setSessionOpen(true);
      setShowPrintOpen(true);
      setShowOpenCash(false);
      toastRef.current.showToast('Cash session opened successfully!', 'success');
    } catch (err) {
      console.error('Open cash session error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to open cash session.';
      toastRef.current.showToast(errorMessage, 'danger');
    }
  };
  const handlePrintOpenClose = () => {
    setShowPrintOpen(false);
    setShowOpenCash(false);
    setShowTransaction(true);
    //navigate('/cashier');
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
    if (!rateId) {
      toastRef.current.showToast('Please select a rate.', 'warning');
      return;
    }
    if (!paidAmount || paidAmount < total) {
      toastRef.current.showToast('Paid amount is less than total.', 'warning');
      return;
    }
    const cashierId = user?.id || user?.user_id || null;
    if (!cashierId) {
      toastRef.current.showToast('User ID not found. Please re-login.', 'danger');
      return;
    }
    const payload = {
      cashier_id: cashierId,
      promoter_id: promoter?.id || null,
      rate_id: rateId,
      quantity,
      total,
      paid_amount: paidAmount,
      change: changeDue,
      session_id: sessionId,
      discounts: appliedDiscounts.map(d => ({
        discount_id: d.id,
        discount_value: d.discount_value,
      })),
    };
    axiosClient.post('/cashier/transactions', payload)
      .then(({ data }) => {
        console.log('📄 Transaction response:', data);
        
        // Reset all form fields
        setPaidAmount('');
        setQuantity(1);
        setAppliedDiscounts([]);
        setRateId(''); // Reset to empty to show "Select Rate"

        // Handle frontend printing if printData is available
        if (data.printData) {
          console.log('🖨️ Print data received:', data.printData);
          handleFrontendPrinting(data.printData);
          toastRef.current.showToast('Transaction saved and printed!', 'success');
        } else {
          console.log('❌ No print data received');
          toastRef.current.showToast('Transaction saved but no print data received!', 'warning');
        }
      })
      .catch(() => {
        toastRef.current.showToast('Failed to save transaction.', 'danger');
      });
  };

  // Close Cash Handlers
  const handleShowCloseCash = () => {
    setShowCloseCash(true);
  };
  const [dailyTransactions, setDailyTransactions] = useState([]);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [closingCash, setClosingCash] = useState('');

  const handleCloseCash = async (e) => {
    e && e.preventDefault();
    if (!cashOnHand) {
      toastRef.current.showToast('Please enter cash on hand amount.', 'warning');
      return;
    }

    try {
      const sessionToken = localStorage.getItem('cashier_session_token');
      
      // Get daily transactions for current session
      const { data: transactionsData } = await axiosClient.get('/cashier/transactions/daily', {
        params: { session_id: sessionToken }
      });
      
      // Close the session and get the session data
      const response = await axiosClient.post('/cashier/close-session', {
        session_id: sessionToken,
        closing_cash: cashOnHand
      });
      
      const sessionData = response.data.data;  // Access the nested data object
      
      setDailyTransactions(transactionsData.transactions || []);
      setDailyTotal(transactionsData.total || 0);
      setCashOnHand(sessionData.cash_on_hand);
      setClosingCash(sessionData.closing_cash);

      setSessionClosed(true);
      setShowPrintClose(true);
      toastRef.current.showToast('Cash session closed successfully!', 'success');
      localStorage.removeItem('cashier_session_token');
    } catch (err) {
      console.error('Close cash session error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to close cash session.';
      toastRef.current.showToast(errorMessage, 'danger');
    }
  };

  const now = new Date().toISOString();
  const tickets = Array.from({ length: quantity }).map((_, i) => ({
    promoter: promoter?.name || 'Default Promoter',
    date: now,
    note: 'Single use only',
    rate: rate?.name || 'No Rate Selected',
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
    background: '#059669',
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
    <div className="wrapper d-flex" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9fa 60%, #e6e9ff 100%)' }}>
      <CashierSidebar />
      <div className="wrapper-content flex-grow-1" style={{ marginLeft: '250px' }}>
        <div className="container-fluid p-1">
          <style>{printStyles}</style>
          <ToastMessage ref={toastRef} />
          
          {/* Open Cash Modal */}
          <OpenCashModal
            show={showOpenCash}
            cashOnHand={cashOnHand}
            setCashOnHand={setCashOnHand}
            handleOpenCash={handleOpenCash}
            PROMOTER_NAME={promoter?.name || 'N/A'}
            headerStyle={headerStyle}
            modalStyle={modalStyle}
            cashierName={user?.user_login || 'N/A'}
            sessionId={sessionId ? String(sessionId) : 'N/A'}
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
            cashierName={user?.user_login || 'N/A'}
            sessionId={sessionId ? String(sessionId) : 'N/A'}
          />
          
          {/* Main Content Area */}
          {location.pathname === '/cashier' && showTransaction && !showCloseCash ? (
            <div className="d-flex flex-row gap-0 w-100 justify-content-center align-items-start" style={{ maxWidth: 1000, margin: '0 auto' }}>
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
                user={user}
                sessionId={sessionId}
                paidAmount={paidAmount}
                changeDue={changeDue}
              />
            </div>
          ) : location.pathname === '/cashier/transactions' ? (
            <TransactionList />
          ) : null}
          
          {/* Close Cash Modal */}
          <CloseCashModal
            show={showCloseCash}
            cashOnHand={cashOnHand}
            setCashOnHand={setCashOnHand}
            handleCloseCash={handleCloseCash}
            PROMOTER_NAME={promoter?.name || 'N/A'}
            headerStyle={headerStyle}
            modalStyle={modalStyle}
          />
          
          {/* Print Modal for Close Cash */}
          <PrintCloseCashModal
            show={showPrintClose}
            cashOnHand={cashOnHand}
            closingCash={closingCash}
            dailyTransactions={dailyTransactions}
            dailyTotal={dailyTotal}
            handleCloseAndLogout={handleLogout}
            promoterName={promoter?.name || 'N/A'}
            headerStyle={headerStyle}
            modalStyle={modalStyle}
            divider={divider}
            cashierName={user?.user_login || 'N/A'}
            sessionId={sessionId ? String(sessionId) : 'N/A'}
            thermalPrintStyles={thermalPrintStyles}
          />
        </div>
      </div>
    </div>
  );
} 