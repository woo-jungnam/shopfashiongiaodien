import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { ArrowLeft, ShoppingCart, Ruler, Info } from 'lucide-react';

export default function ProductDetail({ productId, user, setTab, onAddToCart }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected attributes
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.getProduct(productId);
        setProduct(data);

        // Auto-select first available options if any
        if (data.variants && data.variants.length > 0) {
          const colors = getAvailableColors(data.variants);
          const sizes = getAvailableSizes(data.variants);
          if (colors.length > 0) setSelectedColor(colors[0]);
          if (sizes.length > 0) setSelectedSize(sizes[0]);
        }
      } catch (err) {
        setError('Không thể tải thông tin chi tiết sản phẩm.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Helper selectors
  const getAvailableColors = (variants) => {
    const colors = new Set();
    variants.forEach(v => {
      v.attributes.forEach(attr => {
        if (attr.startsWith('Color:')) {
          colors.add(attr.replace('Color: ', ''));
        }
      });
    });
    return Array.from(colors);
  };

  const getAvailableSizes = (variants) => {
    const sizes = new Set();
    variants.forEach(v => {
      v.attributes.forEach(attr => {
        if (attr.startsWith('Size:')) {
          sizes.add(attr.replace('Size: ', ''));
        }
      });
    });
    return Array.from(sizes);
  };

  // Find exact matching variant
  const getSelectedVariant = () => {
    if (!product || !product.variants) return null;
    return product.variants.find(v => {
      const hasColor = v.attributes.some(attr => attr === `Color: ${selectedColor}`);
      const hasSize = v.attributes.some(attr => attr === `Size: ${selectedSize}`);
      return hasColor && hasSize;
    });
  };

  const handleAddToCart = async () => {
    if (!user) {
      setTab('auth');
      return;
    }

    const variant = getSelectedVariant();
    if (!variant) {
      setMessage({ text: 'Biến thể này hiện không tồn tại.', type: 'error' });
      return;
    }

    setActionLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Mock user ID from token or context. The mock users start from 4 onwards.
      // We will default to userId = 4 (Nguyen Van A from seed data) if roles include customer.
      // In a real app we parse this from token, but for now we look up active userId = 4 as standard customer.
      const userId = 4;
      await api.addToCart(userId, variant.id, quantity);
      setMessage({ text: 'Thêm vào giỏ hàng thành công!', type: 'success' });
      onAddToCart(); // Refresh navbar cart count
    } catch (err) {
      setMessage({ text: err.message || 'Lỗi thêm sản phẩm vào giỏ.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div style={styles.center}>Đang tải chi tiết sản phẩm...</div>;
  if (error) return <div style={{ ...styles.center, color: '#ef4444' }}>{error}</div>;
  if (!product) return <div style={styles.center}>Không tìm thấy sản phẩm.</div>;

  const colors = getAvailableColors(product.variants);
  const sizes = getAvailableSizes(product.variants);
  const selectedVariant = getSelectedVariant();

  const price = selectedVariant ? selectedVariant.price : 0;
  const salePrice = selectedVariant ? selectedVariant.salePrice : null;

  return (
    <div className="fade-in">
      <button style={styles.backBtn} onClick={() => setTab('products')}>
        <ArrowLeft size={16} /> Quay lại danh sách
      </button>

      <div style={styles.layout}>
        {/* Images Column */}
        <div style={styles.imageCol}>
          <div className="glass-panel" style={styles.mainImageWrapper}>
            <img
              src={product.images && product.images.length > 0 ? product.images[0].imageUrl : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80'}
              alt={product.name}
              style={styles.mainImage}
            />
          </div>
        </div>

        {/* Info Column */}
        <div style={styles.infoCol}>
          <h2>{product.name}</h2>
          <div style={styles.skuRow}>Mã SKU gốc: <span style={{ fontFamily: 'monospace' }}>{product.parentSku}</span></div>

          {/* Pricing */}
          <div style={styles.priceContainer}>
            {salePrice ? (
              <>
                <span style={styles.salePrice}>{salePrice.toLocaleString()}đ</span>
                <span style={styles.originalPrice}>{price.toLocaleString()}đ</span>
                <span className="badge badge-danger">Giảm giá</span>
              </>
            ) : (
              <span style={styles.salePrice}>{price > 0 ? `${price.toLocaleString()}đ` : 'Liên hệ chọn size'}</span>
            )}
          </div>

          <div style={styles.divider}></div>

          {/* Attributes Selection */}
          {colors.length > 0 && (
            <div style={styles.selectorGroup}>
              <span style={styles.label}>Màu sắc:</span>
              <div style={styles.buttonGrid}>
                {colors.map(color => (
                  <button
                    key={color}
                    style={{ ...styles.optionBtn, ...(selectedColor === color ? styles.activeOption : {}) }}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div style={styles.selectorGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={styles.label}>Kích thước (Size):</span>
                <button style={styles.sizeGuideLink} onClick={() => setShowSizeGuide(true)}>
                  <Ruler size={14} /> Xem bảng Size
                </button>
              </div>
              <div style={styles.buttonGrid}>
                {sizes.map(size => (
                  <button
                    key={size}
                    style={{ ...styles.optionBtn, ...(selectedSize === size ? styles.activeOption : {}) }}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selection */}
          <div style={styles.quantityGroup}>
            <span style={styles.label}>Số lượng:</span>
            <div style={styles.quantityPicker}>
              <button
                style={styles.qtyBtn}
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >-</button>
              <span style={styles.qtyVal}>{quantity}</span>
              <button
                style={styles.qtyBtn}
                onClick={() => setQuantity(q => q + 1)}
              >+</button>
            </div>
          </div>

          {message.text && (
            <div style={{
              ...styles.alert,
              ...(message.type === 'success' ? styles.alertSuccess : styles.alertError)
            }}>
              {message.text}
            </div>
          )}

          <div style={styles.actions}>
            <button
              className="btn btn-primary"
              style={styles.addToCartBtn}
              onClick={handleAddToCart}
              disabled={actionLoading || (selectedVariant && selectedVariant.status === 'OUT_OF_STOCK')}
            >
              <ShoppingCart size={18} />
              {selectedVariant && selectedVariant.status === 'OUT_OF_STOCK' ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
            </button>
          </div>

          <div style={styles.divider}></div>

          {/* Detail Description */}
          <div style={styles.details}>
            <h4>Mô tả sản phẩm</h4>
            <p style={styles.descText}>{product.shortDescription || 'Sản phẩm thời trang cao cấp từ chất liệu tuyển chọn.'}</p>
            {product.material && <p style={styles.detailItem}><strong>Chất liệu:</strong> {product.material}</p>}
            {product.careInstructions && <p style={styles.detailItem}><strong>Hướng dẫn bảo quản:</strong> {product.careInstructions}</p>}
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div style={styles.modalOverlay} onClick={() => setShowSizeGuide(false)}>
          <div className="glass-panel" style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Hướng dẫn chọn kích cỡ (Size Guide)</h3>
              <button style={styles.closeModalBtn} onClick={() => setShowSizeGuide(false)}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.sizeTip}>
                <Info size={16} color="#6366f1" />
                <span>Nên chọn size theo bảng quy đổi chiều cao và cân nặng chuẩn bên dưới.</span>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tr}>
                    <th style={styles.th}>Kích thước</th>
                    <th style={styles.th}>Chiều cao</th>
                    <th style={styles.th}>Cân nặng</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={styles.tr}><td style={styles.td}>Size S</td><td style={styles.td}>150cm - 160cm</td><td style={styles.td}>45kg - 52kg</td></tr>
                  <tr style={styles.tr}><td style={styles.td}>Size M</td><td style={styles.td}>160cm - 168cm</td><td style={styles.td}>53kg - 60kg</td></tr>
                  <tr style={styles.tr}><td style={styles.td}>Size L</td><td style={styles.td}>168cm - 175cm</td><td style={styles.td}>61kg - 70kg</td></tr>
                  <tr style={styles.tr}><td style={styles.td}>Size XL</td><td style={styles.td}>175cm - 182cm</td><td style={styles.td}>71kg - 82kg</td></tr>
                </tbody>
              </table>
            </div>
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
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    gap: '2.5rem',
  },
  imageCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  mainImageWrapper: {
    padding: '1rem',
    borderRadius: '16px',
    height: '450px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    borderRadius: '8px',
  },
  infoCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  skuRow: {
    fontSize: '0.85rem',
    color: '#6b7280',
    marginBottom: '1.25rem',
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  salePrice: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#a855f7',
  },
  originalPrice: {
    fontSize: '1.25rem',
    color: '#6b7280',
    textDecoration: 'line-through',
  },
  divider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.08)',
    margin: '1.5rem 0',
  },
  selectorGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: '0.5rem',
    display: 'block',
  },
  buttonGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  optionBtn: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#d1d5db',
    padding: '0.5rem 1.25rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  activeOption: {
    borderColor: '#6366f1',
    background: 'rgba(99, 102, 241, 0.1)',
    color: '#ffffff',
    boxShadow: '0 0 10px rgba(99, 102, 241, 0.2)',
  },
  sizeGuideLink: {
    background: 'none',
    border: 'none',
    color: '#6366f1',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  quantityGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  quantityPicker: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
  },
  qtyBtn: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    padding: '0.4rem 1rem',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '700',
  },
  qtyVal: {
    width: '40px',
    textAlign: 'center',
    fontWeight: '600',
  },
  actions: {
    display: 'flex',
  },
  addToCartBtn: {
    flex: 1,
    padding: '0.9rem',
    fontSize: '1rem',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  descText: {
    color: '#9ca3af',
    fontSize: '0.95rem',
    lineHeight: '1.6',
  },
  detailItem: {
    fontSize: '0.9rem',
    color: '#d1d5db',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  modalContent: {
    width: '90%',
    maxWidth: '500px',
    padding: '2rem',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  closeModalBtn: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '1.25rem',
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sizeTip: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(99, 102, 241, 0.08)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    color: '#c7d2fe',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  th: {
    textAlign: 'left',
    padding: '0.75rem',
    color: '#9ca3af',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  td: {
    padding: '0.75rem',
    fontSize: '0.9rem',
    color: '#e5e7eb',
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
