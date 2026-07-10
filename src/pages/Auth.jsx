import React, { useState } from 'react';
import { api } from '../api';

export default function Auth({ onLoginSuccess, setTab }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await api.login(email, password);
        onLoginSuccess(data);
      } else {
        await api.register(email, fullName, password, phoneNumber);
        setIsLogin(true);
        setError('Đăng ký thành công! Vui lòng đăng nhập.');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel fade-in" style={styles.card}>
        <div style={styles.tabContainer}>
          <button 
            style={{...styles.tab, ...(isLogin ? styles.activeTab : {})}} 
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Đăng nhập
          </button>
          <button 
            style={{...styles.tab, ...(!isLogin ? styles.activeTab : {})}} 
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Đăng ký
          </button>
        </div>

        {error && (
          <div style={{
            ...styles.alert, 
            ...(error.includes('thành công') ? styles.alertSuccess : styles.alertError)
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Họ và tên</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0901234567"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản')}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '4rem 1rem',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '2.5rem',
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    marginBottom: '2rem',
  },
  tab: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    fontSize: '1.05rem',
    fontWeight: '600',
    padding: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeTab: {
    color: '#a855f7',
    borderBottom: '2px solid #a855f7',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  submitBtn: {
    marginTop: '1.5rem',
    width: '100%',
  },
  alert: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
    fontWeight: '500',
  },
  alertError: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  alertSuccess: {
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
};
