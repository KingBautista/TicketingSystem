import { Link, useLocation } from "react-router-dom";

export default function CashierSidebar() {
  const location = useLocation();

  const isPathActive = (path) => location.pathname === path;

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
      </div>
    </div>
  );
}
