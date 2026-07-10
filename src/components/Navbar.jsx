import React from 'react';
import { ShoppingCart, LogOut, User, ClipboardList, ShoppingBag } from 'lucide-react';
import { api } from '../api';

export default function Navbar({ currentTab, setTab, user, onLogout, cartCount }) {
  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.brand} onClick={() => setTab('products')}>
          <ShoppingBag size={28} color="#a855f7" />
          <span style={styles.brandText}>THADDEUS</span>
        </div>

        <nav style={styles.nav}>
          <button 
            style={{...styles.navLink, ...(currentTab === 'products' ? styles.activeLink : {})}}
            onClick={() => setTab('products')}
          >
            Sản phẩm
          </button>
          
          {user && (
            <button 
              style={{...styles.navLink, ...(currentTab === 'orders' ? styles.activeLink : {})}}
              onClick={() => setTab('orders')}
            >
              <ClipboardList size={18} /> Lịch sử đơn
            </button>
          )}
        </nav>

        <div style={styles.actions}>
          {user ? (
            <>
              <div 
                style={{...styles.cartButton, ...(currentTab === 'cart' ? styles.activeCart : {})}}
                onClick={() => setTab('cart')}
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
              </div>

              <div style={styles.userInfo}>
                <User size={18} color="#9ca3af" />
                <span style={styles.userName}>{user.email.split('@')[0]}</span>
              </div>

              <button style={styles.logoutButton} onClick={onLogout} title="Đăng xuất">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <button style={styles.loginButton} onClick={() => setTab('auth')}>
              Đăng nhập / Đăng ký
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    background: 'rgba(17, 24, 39, 0.8)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(12px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  brandText: {
    fontSize: '1.4rem',
    fontWeight: '800',
    letterSpacing: '0.1em',
    background: 'linear-gradient(135deg, #ffffff 30%, #a855f7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  nav: {
    display: 'flex',
    gap: '1.5rem',
  },
  navLink: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'all 0.2s ease',
  },
  activeLink: {
    color: '#ffffff',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  cartButton: {
    position: 'relative',
    color: '#f3f4f6',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  activeCart: {
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#6366f1',
  },
  badge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#a855f7',
    color: 'white',
    fontSize: '0.7rem',
    fontWeight: '700',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  userName: {
    color: '#e5e7eb',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  logoutButton: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
  },
  loginButton: {
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(99,102,241,0.3)',
    transition: 'all 0.2s ease',
  },
};
