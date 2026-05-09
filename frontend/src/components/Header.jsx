import { useAuth } from '../hooks/useAuth';
import './Header.css';

export default function Header({ cartCount, onCartToggle }) {
  const { user, signout } = useAuth();

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="header-logo">
            <span className="logo-icon">📦</span>
            <div>
              <h1 className="logo-text">SafePack</h1>
              <p className="logo-tagline">Smart packing. Zero bruises.</p>
            </div>
          </div>
        </div>

        <nav className="header-actions">
          {user && (
            <>
              <span className="user-greeting">
                Hey, <strong>{user.name?.split(' ')[0]}</strong> 👋
              </span>
              <button className="cart-btn" onClick={onCartToggle} id="cart-toggle-btn">
                <span className="cart-icon">🛒</span>
                {cartCount > 0 && (
                  <span className="cart-badge" key={cartCount}>{cartCount}</span>
                )}
              </button>
              <button className="signout-btn" onClick={signout} id="signout-btn">
                Sign Out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
