import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Search } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

export default function Header() {
  const { user, logout } = useAuthStore();
  const { cartTotal, cartTotalMoney, fetchCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCart(user.userId);
    }
  }, [user, fetchCart]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currencyFormat = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);

  return (
    <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="container d-flex align-center justify-between" style={{ padding: '1rem' }}>
        <Link to="/" className="d-flex align-center" style={{ gap: '0.5rem' }}>
          {/* We will use the generated logo here. For now, a placeholder div */}
          <div style={{ width: 40, height: 40, backgroundColor: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            CV
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-dark)' }}>Chợ Việt</span>
        </Link>

        <div className="d-flex align-center" style={{ flex: 1, maxWidth: 400, margin: '0 2rem' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input type="text" className="input-field" placeholder="Tìm kiếm sản phẩm..." style={{ paddingRight: '2.5rem' }} />
            <Search size={20} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        <div className="d-flex align-center" style={{ gap: '1.5rem' }}>
          <Link to="/cart" className="d-flex align-center text-main" style={{ gap: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
              <ShoppingCart size={24} color="var(--primary)" />
              {cartTotal > 0 && (
                <span className="badge" style={{ position: 'absolute', top: -8, right: -12, backgroundColor: 'var(--accent)', color: 'white' }}>
                  {cartTotal}
                </span>
              )}
            </div>
            <div className="d-flex" style={{ flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Giỏ hàng</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{currencyFormat(cartTotalMoney)}</span>
            </div>
          </Link>

          {user ? (
            <div className="d-flex align-center" style={{ gap: '1rem' }}>
              <div className="d-flex align-center" style={{ gap: '0.5rem' }}>
                <User size={20} />
                <span>{user.name || 'User'}</span>
              </div>
              <button onClick={handleLogout} className="text-danger d-flex align-center" style={{ gap: '0.25rem' }}>
                <LogOut size={18} />
                <span style={{ fontSize: '0.875rem' }}>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-outline">
              <User size={18} />
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
