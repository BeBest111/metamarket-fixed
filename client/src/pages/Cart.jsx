import React from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { Trash2 } from 'lucide-react';

const currencyFormat = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);

export default function Cart() {
  const { user } = useAuthStore();
  const { cartItems, cartTotalMoney, updateQuantity, remove, clear, loading } = useCartStore();

  if (!user) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Vui lòng đăng nhập để xem giỏ hàng.</div>;
  }

  if (loading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Đang tải...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--primary-dark)', marginBottom: '1.5rem' }}>Giỏ hàng chưa có sản phẩm</h2>
        <Link to="/" className="btn btn-primary">Tiếp tục mua sắm</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 style={{ color: 'var(--primary-dark)', marginBottom: '2rem' }}>Giỏ hàng của bạn</h2>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 600px' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 600 }}>Sản phẩm</span>
              <button onClick={() => clear(user.userId)} className="text-danger d-flex align-center" style={{ gap: '0.5rem', fontSize: '0.875rem' }}>
                <Trash2 size={16} />
                Xóa tất cả
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {cartItems.map(item => {
                const p = item.productDetails || {};
                return (
                  <div key={item.productId} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: 80, height: 80, backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '2rem' }}>🍎</span>
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <Link to={`/product/${item.productId}`} style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>{p.name || `Product ID: ${item.productId}`}</Link>
                      <button onClick={() => remove(user.userId, item.productId)} className="text-danger" style={{ fontSize: '0.875rem' }}>Xóa khỏi giỏ hàng</button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{currencyFormat(item.currentPrice)}</div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                        <button 
                          onClick={() => updateQuantity(user.userId, item.productId, Math.max(1, item.quantity - 1))}
                          style={{ padding: '0.25rem 0.75rem', borderRight: '1px solid var(--border-color)' }}
                        >-</button>
                        <input 
                          type="number" 
                          value={item.quantity} 
                          readOnly
                          style={{ width: '40px', textAlign: 'center', border: 'none', outline: 'none' }}
                        />
                        <button 
                          onClick={() => updateQuantity(user.userId, item.productId, item.quantity + 1)}
                          style={{ padding: '0.25rem 0.75rem', borderLeft: '1px solid var(--border-color)' }}
                        >+</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        
        <div style={{ flex: '1 1 300px' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Tổng cộng</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tạm tính:</span>
              <span style={{ fontWeight: 600 }}>{currencyFormat(cartTotalMoney)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Phí vận chuyển:</span>
              <span style={{ fontWeight: 600 }}>Chưa tính</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <span style={{ fontWeight: 600 }}>Thành tiền:</span>
              <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '1.25rem' }}>{currencyFormat(cartTotalMoney)}</span>
            </div>
            
            <Link to="/checkout" className="btn btn-accent" style={{ width: '100%', padding: '1rem' }}>Tiến hành đặt hàng</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
