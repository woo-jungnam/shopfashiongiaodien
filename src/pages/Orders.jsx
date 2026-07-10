import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { CreditCard, Calendar, Package } from 'lucide-react';

export default function Orders({ setTab, setPaymentOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = 4; // Mock user

  const fetchOrders = async () => {
    try {
      const data = await api.getOrderHistory(userId, 0, 20);
      setOrders(data.content || []);
    } catch (err) {
      setError('Không thể tải lịch sử đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePayNow = (order) => {
    setPaymentOrder(order);
    setTab('payment');
  };

  const getOrderStatusBadgeClass = (status) => {
    switch (status) {
      case 'DELIVERED': return 'badge-success';
      case 'SHIPPING': return 'badge-info';
      case 'APPROVED': return 'badge-info';
      case 'PENDING': return 'badge-warning';
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case 'PAID': return 'badge-success';
      case 'UNPAID': return 'badge-warning';
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  if (loading) return <div style={styles.center}>Đang tải lịch sử đơn hàng...</div>;
  if (error) return <div style={{...styles.center, color: '#ef4444'}}>{error}</div>;

  return (
    <div className="fade-in">
      <h2 style={styles.title}>Lịch Sử Đơn Hàng</h2>

      {orders.length === 0 ? (
        <div className="glass-panel" style={styles.empty}>
          <Package size={48} color="#6b7280" />
          <p style={{marginTop: '1rem', color: '#9ca3af'}}>Bạn chưa thực hiện đơn hàng nào.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {orders.map(order => (
            <div key={order.id} className="glass-panel" style={styles.orderCard}>
              {/* Header */}
              <div style={styles.cardHeader}>
                <div>
                  <h4 style={{color: '#ffffff'}}>Đơn hàng: {order.orderCode}</h4>
                  <span style={styles.date}>
                    <Calendar size={14} /> 10/07/2026 {/* Mock date or parse standard dates */}
                  </span>
                </div>

                <div style={styles.badges}>
                  <span className={`badge ${getOrderStatusBadgeClass(order.status)}`}>
                    Trạng thái: {order.status}
                  </span>
                  <span className={`badge ${getPaymentStatusBadgeClass(order.paymentStatus)}`}>
                    Thanh toán: {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div style={styles.itemsList}>
                {order.items && order.items.map(item => (
                  <div key={item.id} style={styles.itemRow}>
                    <span>{item.productName} (SL: {item.quantity})</span>
                    <span>{item.priceAtPurchase.toLocaleString()}đ</span>
                  </div>
                ))}
              </div>

              <div style={styles.divider}></div>

              {/* Footer */}
              <div style={styles.cardFooter}>
                <div>
                  <span style={{fontSize: '0.85rem', color: '#9ca3af'}}>Tổng cộng:</span>
                  <span style={styles.amount}> {order.totalAmount.toLocaleString()}đ</span>
                </div>

                {order.paymentStatus === 'UNPAID' && order.status !== 'CANCELLED' && (
                  <button 
                    className="btn btn-primary" 
                    style={styles.payBtn}
                    onClick={() => handlePayNow(order)}
                  >
                    <CreditCard size={14} /> Thanh toán ngay (SePay QR)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '300px',
    color: '#9ca3af',
  },
  title: {
    marginBottom: '2rem',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  orderCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    padding: '1.5rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.75rem',
  },
  date: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.8rem',
    color: '#9ca3af',
    marginTop: '0.25rem',
  },
  badges: {
    display: 'flex',
    gap: '0.5rem',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: '#d1d5db',
  },
  divider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#a855f7',
  },
  payBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
  },
};
