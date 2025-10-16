import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStateContext } from "../../contexts/AuthProvider.jsx";
import { printerConnectionDebugger } from "../../utils/debug-printer-connection.js";

export default function CashierSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser, setToken } = useStateContext();

  const isPathActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('cashier_session_token');
    localStorage.removeItem('opening_cash');
    setToken(null);
    setUser({});
    navigate('/login');
  };

  const handleDebugPrinter = async () => {
    console.log('🔍 Starting printer connection debug...');
    try {
      const results = await printerConnectionDebugger.runAllTests();
      if (results.errors.length === 0) {
        alert('✅ All printer tests passed! Check console for details.');
      } else {
        alert(`❌ Printer tests failed. Check console for details.\n\nErrors:\n${results.errors.join('\n')}`);
      }
    } catch (error) {
      console.error('❌ Debug test error:', error);
      alert('❌ Debug test failed. Check console for details.');
    }
  };

  const navLinks = [
    {
      name: "POS",
      path: "/cashier",
      icon: "fi-br-calculator",
      active: isPathActive('/cashier')
    },
    {
      name: "All Transactions",
      path: "/cashier/transactions",
      icon: "fi-br-list",
      active: isPathActive('/cashier/transactions')
    }
  ];

  return (
    <div className="sidebar sidebar-modern" id="sidebar" style={{ width: '250px', minWidth: '250px' }}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="7" rx="1" fill="#059669"/>
              <rect x="14" y="3" width="7" height="7" rx="1" fill="#059669"/>
              <rect x="3" y="14" width="7" height="7" rx="1" fill="#059669"/>
              <rect x="14" y="14" width="7" height="7" rx="1" fill="#059669"/>
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">CASHIER</span>
            <span className="brand-subtitle">POS</span>
          </div>
        </div>
      </div>
      <div className="sidebar-content">
        <ul className="sidebar-nav">
          {navLinks.map((navItem, idx) => (
            <li className="nav-item" key={idx}>
              <Link to={navItem.path} className={`nav-link ${navItem.active ? "active" : ""}`}>
                <div className="nav-icon">
                  <svg className="nav-icon-svg">
                    <use xlinkHref={`/assets/new-icons/icons-bold/${navItem.icon}.svg`} />
                  </svg>
                </div>
                <span className="nav-text">{navItem.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        
        {/* Debug Section */}
        <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '1rem' }}>
          <ul className="sidebar-nav">
            <li className="nav-item">
              <button 
                onClick={handleDebugPrinter}
                className="nav-link"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  width: '100%', 
                  textAlign: 'left',
                  color: '#ffc107',
                  cursor: 'pointer',
                  marginBottom: '0.5rem'
                }}
              >
                <div className="nav-icon">
                  <svg className="nav-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                  </svg>
                </div>
                <span className="nav-text">Debug Printer</span>
              </button>
            </li>
            <li className="nav-item">
              <button 
                onClick={handleLogout}
                className="nav-link"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  width: '100%', 
                  textAlign: 'left',
                  color: '#dc3545',
                  cursor: 'pointer'
                }}
              >
                <div className="nav-icon">
                  <svg className="nav-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.59L17 17L22 12L17 7Z" fill="currentColor"/>
                    <path d="M4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor"/>
                  </svg>
                </div>
                <span className="nav-text">Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
