import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Shirt } from 'lucide-react';

export default function Products({ setTab, setSelectedProductId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.getProducts(0, 24);
        // Spring Boot Page structure contains 'content'
        setProducts(data.content || []);
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (id) => {
    setSelectedProductId(id);
    setTab('product-detail');
  };

  if (loading) {
    return <div style={styles.center}>Đang tải danh sách sản phẩm...</div>;
  }

  if (error) {
    return <div style={{...styles.center, color: '#ef4444'}}>{error}</div>;
  }

  return (
    <div className="fade-in">
      <div style={styles.header}>
        <h2>Bộ Sưu Tập Thời Trang</h2>
        <p style={{color: '#9ca3af'}}>Khám phá các sản phẩm thiết kế cao cấp độc quyền từ Thaddeus</p>
      </div>

      {products.length === 0 ? (
        <div style={styles.center}>Chưa có sản phẩm nào được đăng bán.</div>
      ) : (
        <div className="grid-cols-4">
          {products.map((product) => {
            const displayImage = product.imageUrl || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80';
            
            return (
              <div 
                key={product.id} 
                className="glass-panel" 
                style={styles.card}
                onClick={() => handleProductClick(product.id)}
              >
                <div style={styles.imgWrapper}>
                  <img 
                    src={displayImage} 
                    alt={product.name} 
                    style={styles.img} 
                  />
                  <div style={styles.categoryBadge}>
                    {product.categoryName || 'Thời trang'}
                  </div>
                </div>

                <div style={styles.cardContent}>
                  <h3 style={styles.title}>{product.name}</h3>
                  <div style={styles.meta}>
                    <span style={styles.sku}>SKU: {product.parentSku}</span>
                    {product.material && (
                      <span style={styles.material}>
                        <Shirt size={12} /> {product.material}
                      </span>
                    )}
                  </div>
                  <div style={styles.priceRow}>
                    <span style={styles.priceLabel}>Xem chi tiết & chọn Size</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    marginBottom: '2.5rem',
    textAlign: 'center',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    fontSize: '1.1rem',
    color: '#9ca3af',
  },
  card: {
    padding: '0',
    overflow: 'hidden',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  imgWrapper: {
    position: 'relative',
    height: '240px',
    width: '100%',
    background: '#111827',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    background: 'rgba(17, 24, 39, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(4px)',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '0.25rem 0.6rem',
    borderRadius: '6px',
  },
  cardContent: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  title: {
    fontSize: '1rem',
    lineHeight: '1.4',
    height: '2.8rem',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    marginBottom: '0.75rem',
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.8rem',
    color: '#6b7280',
    marginBottom: '1rem',
  },
  sku: {
    fontFamily: 'monospace',
  },
  material: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  priceRow: {
    marginTop: 'auto',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '0.75rem',
    textAlign: 'center',
  },
  priceLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#a855f7',
  },
};
