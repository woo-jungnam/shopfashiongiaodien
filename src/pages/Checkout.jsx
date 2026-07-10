import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { ClipboardCheck } from 'lucide-react';

export default function Checkout({ setTab, onCheckoutSuccess }) {
  const [cart, setCart] = useState(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [warehouseId, setWarehouseId] = useState('1'); // Default to first warehouse
  const [shipperId, setShipperId] = useState('1');     // Default to GHTK
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const userId = 4; // Mock user

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await api.getCart(userId);
        setCart(data);
      } catch (err) {
        setError('Không thể tải giỏ hàng để thanh toán.');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setError('Vui lòng nhập địa chỉ giao hàng.');
      return;
    }

    if (!cart || cart.items.length === 0) {
      setError('Giỏ hàng trống, không thể tạo đơn.');
      return;
    }

    setActionLoading(true);
    setError('');

    // Map cart items into OrderItemRequestDtos
    const items = cart.items.map(item => ({
      productVariantId: item.productVariantId,
      quantity: item.quantity
    }));

    try {
      const order = await api.createOrder(
        userId,
        shippingAddress,
        parseInt(warehouseId),
        parseInt(shipperId),
        items,
        couponCode || null
      );

      // Clear the local cart on success
      try {
        await api.clearCart(userId);
      } catch (e) {
        // Silently fail if cart clear has minor issues
      }

      // Notify parent to switch to payment screen
      onCheckoutSuccess(order);
    } catch (err) {
      setError(err.message || 'Lỗi đặt hàng. Vui lòng kiểm tra lại tồn kho.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div style={styles.center}>Đang tải thông tin đặt hàng...</div>;
  if (error && !cart) return <div style={{ ...styles.center, color: '#ef4444' }}>{error}</div>;

  const items = cart ? cart.items : [];
  const subtotal = items.reduce((sum, item) => {
    const finalPrice = item.salePrice || item.price;
    return sum + (finalPrice * item.quantity);
  }, 0);

  return (
    <div className="fade-in">
      <h2 style={styles.title}>Đặt Hàng</h2>

      <div style={styles.layout}>
        {/* Form Column */}
        <form onSubmit={handlePlaceOrder} style={styles.formCol}>
          <div className="glass-panel" style={styles.sectionCard}>
            <h3>Thông tin vận chuyển</h3>

            {error && <div style={styles.alertError}>{error}</div>}

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Địa chỉ nhận hàng đầy đủ</label>
              <textarea
                className="form-control"
                style={{ height: '100px', resize: 'vertical' }}
                value={shippingAddress}
                onChange={e => setShippingAddress(e.target.value)}
                placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
                required
              />
            </div>

            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Kho hàng xuất phát</label>
                <select
                  className="form-control"
                  value={warehouseId}
                  onChange={e => setWarehouseId(e.target.value)}
                >
                  <option value="1">Kho trung tâm HN (Cầu Giấy)</option>
                  <option value="2">Kho Chi Nhánh HCM (Quận 1)</option>
                  <option value="3">Kho Đà Nẵng (Hải Châu)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Đơn vị vận chuyển</label>
                <select
                  className="form-control"
                  value={shipperId}
                  onChange={e => setShipperId(e.target.value)}
                >
                  <option value="1">Giao Hàng Tiết Kiệm (GHTK) - 30,000đ</option>
                  <option value="2">Giao Hàng Nhanh (GHN) - 30,000đ</option>
                  <option value="3">Viettel Post - 30,000đ</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mã giảm giá (Coupon Code)</label>
              <input
                type="text"
                className="form-control"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                placeholder="Ví dụ: HELLO2026, FREESHIP"
              />
            </div>
          </div>
        </form>

        {/* Invoice Summary */}
        <div className="glass-panel" style={styles.invoiceCol}>
          <h3>Đơn hàng của bạn</h3>

          <div style={styles.itemsScroll}>
            {items.map(item => (
              <div key={item.id} style={styles.itemRow}>
                <div>
                  <span style={styles.itemName}>{item.productName}</span>
                  <span style={styles.itemMeta}>SL: {item.quantity} × {(item.salePrice || item.price).toLocaleString()}đ</span>
                </div>
                <span style={styles.itemTotal}>
                  {((item.salePrice || item.price) * item.quantity).toLocaleString()}đ
                </span>
              </div>
            ))}
          </div>

          <div style={styles.divider}></div>

          <div style={styles.row}>
            <span>Tạm tính:</span>
            <span>{subtotal.toLocaleString()}đ</span>
          </div>
          <div style={styles.row}>
            <span>Phí vận chuyển:</span>
            <span>30,000đ</span>
          </div>

          <div style={styles.divider}></div>

          <div style={{ ...styles.row, fontWeight: '700', fontSize: '1.1rem' }}>
            <span>Tổng số tiền:</span>
            <span style={{ color: '#a855f7' }}>{(subtotal + 30000).toLocaleString()}đ</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.orderBtn}
            onClick={handlePlaceOrder}
            disabled={actionLoading || items.length === 0}
          >
            <ClipboardCheck size={18} />
            {actionLoading ? 'Đang tạo đơn hàng...' : 'Xác nhận đặt hàng'}
          </button>
        </div>
      </div>
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
  layout: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '2rem',
  },
  formCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sectionCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  invoiceCol: {
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  itemsScroll: {
    maxHeight: '200px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    paddingRight: '0.5rem',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: '#e5e7eb',
  },
  itemName: {
    display: 'block',
    fontWeight: '600',
  },
  itemMeta: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#9ca3af',
  },
  itemTotal: {
    fontWeight: '600',
    color: '#ffffff',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
    color: '#d1d5db',
  },
  divider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.08)',
  },
  orderBtn: {
    width: '100%',
    padding: '0.9rem',
    marginTop: '0.5rem',
  },
  alertError: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    marginTop: '0.5rem',
  },
};
