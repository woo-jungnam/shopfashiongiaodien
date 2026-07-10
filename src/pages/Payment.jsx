import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { CheckCircle, QrCode, CreditCard, RefreshCw, Smartphone } from 'lucide-react';

export default function Payment({ order, setTab }) {
  const [paymentStatus, setPaymentStatus] = useState('UNPAID');
  const [polling, setPolling] = useState(true);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationMessage, setSimulationMessage] = useState('');

  const merchantBankId = 'MB'; // Military Bank (MB Bank)
  const merchantAccountNo = '0987654321';
  const merchantAccountName = 'NGUYEN THANH NAM';
  const transferContent = `Thanh toan ${order.orderCode}`; // Matches standard backend matching string

  // Dynamic VietQR code URL
  const vietQrUrl = `https://img.vietqr.io/image/${merchantBankId}-${merchantAccountNo}-qr_only.png?amount=${order.totalAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(merchantAccountName)}`;

  // Polling backend status every 3 seconds
  useEffect(() => {
    if (!polling) return;

    const checkStatus = async () => {
      try {
        const orderDetails = await api.getOrder(order.id);
        if (orderDetails.paymentStatus === 'PAID' || orderDetails.status === 'APPROVED') {
          setPaymentStatus('PAID');
          setPolling(false);
        }
      } catch (err) {
        console.error('Error polling order status', err);
      }
    };

    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [order.id, polling]);

  // SePay Webhook Simulation trigger
  const handleSimulateWebhook = async () => {
    setSimulationLoading(true);
    setSimulationMessage('');
    try {
      await api.simulateSePayPayment(order.orderCode, order.totalAmount);
      setSimulationMessage('Đã giả lập giao dịch thành công. Đang chờ hệ thống đồng bộ (2-3 giây)...');
    } catch (err) {
      setSimulationMessage('Gửi giả lập thất bại: ' + (err.message || 'Lỗi kết nối.'));
    } finally {
      setSimulationLoading(false);
    }
  };

  if (paymentStatus === 'PAID') {
    return (
      <div className="glass-panel fade-in" style={styles.successContainer}>
        <CheckCircle size={64} color="#10b981" />
        <h2 style={{ color: '#34d399', marginTop: '1rem' }}>Thanh Toán Thành Công!</h2>
        <p style={{ color: '#9ca3af', maxWidth: '400px', margin: '0.5rem auto 1.5rem auto' }}>
          Đơn hàng <strong>{order.orderCode}</strong> đã được thanh toán tự động qua cổng SePay. Chúng tôi sẽ bắt đầu chuẩn bị vận chuyển cho bạn.
        </p>
        <div style={styles.successDetails}>
          <div style={styles.successRow}><span>Mã đơn hàng:</span><strong>{order.orderCode}</strong></div>
          <div style={styles.successRow}><span>Số tiền:</span><strong>{order.totalAmount.toLocaleString()}đ</strong></div>
          <div style={styles.successRow}><span>Trạng thái:</span><span className="badge badge-success">Đã thanh toán</span></div>
        </div>
        <button className="btn btn-primary" onClick={() => setTab('products')} style={{ marginTop: '2rem' }}>
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h2 style={styles.title}>Thanh Toán Đơn Hàng</h2>

      <div style={styles.layout}>
        {/* QR Code and bank details */}
        <div className="glass-panel" style={styles.qrCard}>
          <h3>Quét mã VietQR để thanh toán</h3>
          
          <div style={styles.qrWrapper}>
            <img src={vietQrUrl} alt="VietQR Code" style={styles.qrImage} />
            <div style={styles.qrOverlayText}>
              <Smartphone size={16} /> <span>Mở app ngân hàng quét mã</span>
            </div>
          </div>

          <div style={styles.statusIndicator}>
            <RefreshCw className="spin" size={16} color="#6366f1" />
            <span style={{color: '#c7d2fe', fontSize: '0.85rem'}}>Đang chờ hệ thống tự động xác nhận qua SePay...</span>
          </div>
        </div>

        {/* Transfer instructions and Simulator */}
        <div style={styles.rightCol}>
          {/* Transfer Info */}
          <div className="glass-panel" style={styles.infoCard}>
            <h3>Thông tin chuyển khoản</h3>
            
            <div style={styles.infoTable}>
              <div style={styles.infoRow}>
                <span>Ngân hàng:</span>
                <strong>MB Bank (Ngân hàng Quân Đội)</strong>
              </div>
              <div style={styles.infoRow}>
                <span>Số tài khoản:</span>
                <strong style={{color: '#6366f1', fontSize: '1.1rem'}}>{merchantAccountNo}</strong>
              </div>
              <div style={styles.infoRow}>
                <span>Chủ tài khoản:</span>
                <strong>{merchantAccountName}</strong>
              </div>
              <div style={styles.infoRow}>
                <span>Số tiền chuyển:</span>
                <strong style={{color: '#a855f7', fontSize: '1.1rem'}}>{order.totalAmount.toLocaleString()}đ</strong>
              </div>
              <div style={styles.infoRow}>
                <span>Nội dung bắt buộc:</span>
                <strong style={styles.highlightContent}>{transferContent}</strong>
              </div>
            </div>

            <div style={styles.notice}>
              <strong>* Lưu ý quan trọng:</strong> Nội dung chuyển khoản phải ghi chính xác để SePay tự động khớp đơn hàng ngay lập tức.
            </div>
          </div>

          {/* Webhook Simulator Panel */}
          <div className="glass-panel" style={styles.simulatorCard}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
              <CreditCard size={18} color="#a855f7" />
              <h4 style={{margin: 0}}>Cổng giả lập thanh toán SePay</h4>
            </div>
            <p style={{fontSize: '0.8rem', color: '#9ca3af', marginBottom: '1rem'}}>
              Dành cho môi trường phát triển (Local). Nhấp vào nút bên dưới để gửi webhook ảo đến backend giống như khi chuyển khoản thực tế.
            </p>
            
            <button 
              className="btn btn-secondary" 
              style={styles.simulateBtn}
              onClick={handleSimulateWebhook}
              disabled={simulationLoading}
            >
              {simulationLoading ? 'Đang gửi giao dịch...' : 'Giả lập Thanh toán (SePay Webhook)'}
            </button>

            {simulationMessage && (
              <div style={styles.simulationText}>
                {simulationMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  title: {
    marginBottom: '2rem',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '0.9fr 1.1fr',
    gap: '2rem',
  },
  qrCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '2rem',
  },
  qrWrapper: {
    background: '#ffffff',
    padding: '1.25rem',
    borderRadius: '16px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
    margin: '1.5rem 0',
    display: 'inline-block',
  },
  qrImage: {
    width: '240px',
    height: '240px',
    display: 'block',
  },
  qrOverlayText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    fontSize: '0.8rem',
    color: '#374151',
    marginTop: '0.75rem',
    fontWeight: '600',
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    padding: '0.6rem 1rem',
    borderRadius: '30px',
    marginTop: '1rem',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  infoCard: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1rem',
    marginBottom: '1rem',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.75rem',
  },
  highlightContent: {
    background: 'rgba(245, 158, 11, 0.15)',
    color: '#fbbf24',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
    fontSize: '1.05rem',
  },
  notice: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '0.75rem',
    borderRadius: '8px',
    borderLeft: '3px solid #fbbf24',
  },
  simulatorCard: {
    border: '1px solid rgba(168, 85, 247, 0.2)',
    background: 'rgba(168, 85, 247, 0.03)',
  },
  simulateBtn: {
    width: '100%',
    borderColor: 'rgba(168, 85, 247, 0.4)',
    background: 'rgba(168, 85, 247, 0.08)',
    color: '#c084fc',
    fontSize: '0.85rem',
  },
  simulationText: {
    marginTop: '0.75rem',
    fontSize: '0.8rem',
    color: '#34d399',
    textAlign: 'center',
    fontWeight: '500',
  },
  successContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '4rem 2rem',
    maxWidth: '600px',
    margin: '3rem auto',
  },
  successDetails: {
    width: '100%',
    maxWidth: '360px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  successRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
  },
};
