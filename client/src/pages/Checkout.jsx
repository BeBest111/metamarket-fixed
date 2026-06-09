import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { API } from '../services/api';

const currencyFormat = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);

export default function Checkout() {
  const { user } = useAuthStore();
  const { cartItems, cartTotalMoney, clear } = useCartStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    receiverName: user?.name || '',
    receiverPhone: '',
    provinceId: '',
    districtId: '',
    wardId: '',
    addrDetail: '',
    note: ''
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const SHIPPING_FEE = 30000;
  const totalAmount = cartTotalMoney + SHIPPING_FEE;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    // Fetch provinces
    API.user.getProvinces().then(res => setProvinces(res?.data || []));
  }, [user, cartItems, navigate]);

  useEffect(() => {
    if (formData.provinceId) {
      API.user.getDistricts(formData.provinceId).then(res => setDistricts(res?.data || []));
      setFormData(prev => ({ ...prev, districtId: '', wardId: '' }));
      setWards([]);
    }
  }, [formData.provinceId]);

  useEffect(() => {
    if (formData.districtId) {
      API.user.getWards(formData.districtId).then(res => setWards(res?.data || []));
      setFormData(prev => ({ ...prev, wardId: '' }));
    }
  }, [formData.districtId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!formData.receiverName || !formData.receiverPhone || !formData.wardId || !formData.addrDetail) {
      setError('Vui lòng điền đầy đủ thông tin giao hàng!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create products array for backend
      const productsForOrder = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        shopId: item.shopId,
        price: item.productDetails?.price || 0,
        discount: item.productDetails?.discount || 0
      }));

      const orderData = {
        userId: user.userId,
        orderCode: `ORD${Date.now()}`,
        receiverName: formData.receiverName,
        receiverPhone: formData.receiverPhone,
        isPayment: true, // Assuming COD or simulated payment success
        wardId: parseInt(formData.wardId),
        addrDetail: formData.addrDetail,
        products: productsForOrder,
        paymentMethod: 1, // 1 for COD, 2 for MoMo
        transportFee: SHIPPING_FEE,
        orderTotal: totalAmount,
        note: formData.note
      };

      const res = await API.order.create(orderData);
      
      if (res && res.statusCode === 200) {
        await clear(user.userId);
        alert('Đặt hàng thành công!');
        navigate('/');
      } else {
        setError('Có lỗi xảy ra khi đặt hàng');
      }
    } catch (err) {
      console.error(err);
      setError('Có lỗi xảy ra khi kết nối với máy chủ');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="container">
      <h2 style={{ color: 'var(--primary-dark)', marginBottom: '2rem' }}>Thanh toán</h2>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 600px' }}>
          <form className="card" onSubmit={handleCheckout} style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Thông tin giao hàng</h3>
            
            {error && (
              <div style={{ backgroundColor: '#FEE2E2', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Họ tên người nhận</label>
                <input required type="text" name="receiverName" value={formData.receiverName} onChange={handleChange} className="input-field" placeholder="Nhập họ tên" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Số điện thoại</label>
                <input required type="text" name="receiverPhone" value={formData.receiverPhone} onChange={handleChange} className="input-field" placeholder="Nhập SĐT" />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Tỉnh / Thành phố</label>
                <select required name="provinceId" value={formData.provinceId} onChange={handleChange} className="input-field">
                  <option value="">Chọn Tỉnh/Thành</option>
                  {provinces.map(p => <option key={p.provinceId} value={p.provinceId}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Quận / Huyện</label>
                <select required name="districtId" value={formData.districtId} onChange={handleChange} className="input-field" disabled={!formData.provinceId}>
                  <option value="">Chọn Quận/Huyện</option>
                  {districts.map(d => <option key={d.districtId} value={d.districtId}>{d.name}</option>)}
                </select>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phường / Xã</label>
              <select required name="wardId" value={formData.wardId} onChange={handleChange} className="input-field" disabled={!formData.districtId}>
                <option value="">Chọn Phường/Xã</option>
                {wards.map(w => <option key={w.wardId} value={w.wardId}>{w.name}</option>)}
              </select>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Địa chỉ chi tiết (Số nhà, đường)</label>
              <input required type="text" name="addrDetail" value={formData.addrDetail} onChange={handleChange} className="input-field" placeholder="Nhập địa chỉ chi tiết" />
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Ghi chú đơn hàng (Tùy chọn)</label>
              <textarea name="note" value={formData.note} onChange={handleChange} className="input-field" rows="3" placeholder="Ghi chú thêm cho người giao hàng..."></textarea>
            </div>

            <button type="submit" disabled={loading} className="btn btn-accent" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}>
              {loading ? 'Đang xử lý...' : 'Xác nhận Đặt hàng (Thanh toán khi nhận hàng)'}
            </button>
          </form>
        </div>
        
        <div style={{ flex: '1 1 300px' }}>
          <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Đơn hàng của bạn</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {cartItems.map(item => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{item.quantity}x {item.productDetails?.name || `Product ${item.productId}`}</span>
                  <span style={{ fontWeight: 500 }}>{currencyFormat(item.currentPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tạm tính:</span>
                <span>{currencyFormat(cartTotalMoney)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Phí vận chuyển:</span>
                <span>{currencyFormat(SHIPPING_FEE)}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <span style={{ fontWeight: 600 }}>Tổng thanh toán:</span>
                <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '1.25rem' }}>{currencyFormat(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
