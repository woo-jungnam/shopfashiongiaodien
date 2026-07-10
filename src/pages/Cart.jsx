import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Trash2, ShoppingCart, ArrowRight } from 'lucide-react';

export default function Cart({ setTab, onCartChange }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Default to mock user ID = 4 (Nguyen Van A) for standard customer
  const userId = 4;

  const fetchCart = async () => {
    try {
      const data = await api.getCart(userId);
      setCart(data);
    } catch (err) {
      setError('Không thể tải thông tin giỏ hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQty = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      await api.updateCartItem(userId, itemId, newQty);
      fetchCart();
      onCartChange();
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật số lượng.');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await api.removeCartItem(userId, itemId);
      fetchCart();
      onCartChange();
    } catch (err) {
      alert(err.message || 'Lỗi xóa sản phẩm.');
    }
  };

  if (loading) return <div style={styles.center}>Đang tải giỏ hàng...</div>;
  if (error) return <div style={{...styles.center, color: '#ef4444'}}>{error}</div>;

  const items = cart ? cart.items : [];
  const subtotal = items.reduce((sum, item) => {
    const finalPrice = item.salePrice || item.price;
    return sum + (finalPrice * item.quantity);
  }, 0);

  return (
    <div className="fade-in">
      <h2 style={styles.title}>Giỏ Hàng Của Bạn</h2>

      {items.length === 0 ? (
        <div className="glass-panel" style={styles.emptyCart}>
          <ShoppingCart size={48} color="#6b7280" />
          <p style={{marginTop: '1rem', color: '#9ca3af'}}>Giỏ hàng của bạn đang trống.</p>
          <button 
            className="btn btn-primary" 
            style={{marginTop: '1.5rem'}}
            onClick={() => setTab('products')}
          >
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <div style={styles.layout}>
          {/* Items List */}
          <div style={styles.itemsList}>
            {items.map(item => {
              const displayPrice = item.salePrice || item.price;
              const hasSale = !!item.salePrice;
              
              return (
                <div key={item.id} className="glass-panel" style={styles.itemCard}>
                  <div style={styles.itemInfo}>
                    <h4 style={styles.itemName}>{item.productName}</h4>
                    <span style={styles.itemSku}>SKU: {item.sku}</span>
                  </div>

                  <div style={styles.itemControls}>
                    {/* Price */}
                    <div style={styles.priceCol}>
                      {hasSale ? (
                        <>
                          <span style={styles.salePrice}>{item.salePrice.toLocaleString()}đ</span>
                          <span style={styles.originalPrice}>{item.price.toLocaleString()}đ</span>
                        </>
                      ) : (
                        <span style={styles.salePrice}>{item.price.toLocaleString()}đ</span>
                      )}
                    </div>

                    {/* Quantity Picker */}
                    <div style={styles.quantityPicker}>
                      <button 
                        style={styles.qtyBtn}
                        onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                      >-</button>
                      <span style={styles.qtyVal}>{item.quantity}</span>
                      <button 
                        style={styles.qtyBtn}
                        onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                      >+</button>
                    </div>

                    {/* Total */}
                    <span style={styles.totalPrice}>
                      {(displayPrice * item.quantity).toLocaleString()}đ
                    </span>

                    {/* Delete */}
                    <button style={styles.deleteBtn} onClick={() => handleRemoveItem(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Column */}
          <div className="glass-panel" style={styles.summaryCard}>
            <h3>Tóm tắt đơn hàng</h3>
            <div style={styles.summaryRow}>
              <span>Tạm tính ({items.length} sản phẩm):</span>
              <span>{subtotal.toLocaleString()}đ</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Phí vận chuyển:</span>
              <span style={{color: '#9ca3af'}}>Tính ở bước sau</span>
            </div>
            
            <div style={styles.divider}></div>
            
            <div style={{...styles.summaryRow, fontWeight: '700', fontSize: '1.1rem'}}>
              <span>Tổng thanh toán:</span>
              <span style={{color: '#a855f7'}}>{subtotal.toLocaleString()}đ</span>
            </div>

            <button 
              className="btn btn-primary" 
              style={styles.checkoutBtn}
              onClick={() => setTab('checkout')}
            >
              Tiến hành đặt hàng <ArrowRight size={18} />
            </button>
          </div>
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
  emptyCart: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    textAlign: 'center',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 0.6fr',
    gap: '2rem',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  itemCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem',
    gap: '1.5rem',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: '0.975rem',
    fontWeight: '600',
    color: '#f3f4f6',
    marginBottom: '0.25rem',
  },
  itemSku: {
    fontSize: '0.8rem',
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  itemControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  priceCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: '100px',
  },
  salePrice: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  originalPrice: {
    fontSize: '0.8rem',
    color: '#6b7280',
    textDecoration: 'line-through',
  },
  quantityPicker: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '6px',
  },
  qtyBtn: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    padding: '0.25rem 0.6rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  qtyVal: {
    width: '30px',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#ffffff',
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#a855f7',
    width: '100px',
    textAlign: 'right',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
  },
  summaryCard: {
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
    color: '#d1d5db',
  },
  divider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.08)',
  },
  checkoutBtn: {
    width: '100%',
    padding: '0.9rem',
  },
};
