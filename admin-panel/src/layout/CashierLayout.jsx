import { Link, Outlet, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../utils/solidIcons';

const navItems = [
  { to: '/cashier/open-cash', label: 'Open Cash', icon: solidIconMap.cashRegister },
  { to: '/cashier/close-cash', label: 'Close Cash', icon: solidIconMap.moneyBill },
  { to: '/cashier/transaction', label: 'Transaction', icon: solidIconMap.ticket },
  { to: '/logout', label: 'Logout', icon: solidIconMap.signOutAlt },
];

export default function CashierLayout() {
  const location = useLocation();
  return (
    <div className="cashier-portal d-flex" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <nav className="cashier-sidebar p-3" style={{ width: 220, background: '#321fdb', color: '#fff' }}>
        <h4 className="mb-4">Cashier Portal</h4>
        <ul className="nav flex-column">
          {navItems.map(item => (
            <li className="nav-item mb-2" key={item.to}>
              <Link
                to={item.to}
                className={`nav-link${location.pathname.startsWith(item.to) ? ' active' : ''}`}
                style={{ color: '#fff', fontWeight: location.pathname.startsWith(item.to) ? 'bold' : 'normal' }}
              >
                <FontAwesomeIcon icon={item.icon} className="me-2" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex-grow-1 p-4">
        <Outlet />
      </main>
    </div>
  );
} 