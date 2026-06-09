import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API } from '../services/api';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

const currencyFormat = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await API.products.getDetails(id);
        setProduct(res?.data || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }
    
    const shopRes = await API.products.getShop(product.product._id);
    const shopId = shopRes?.data;
    
    const success = await addToCart(user.userId, {
      productId: product.product._id,
      quantity: quantity,
      shopId: shopId
    });
    
    if (success) {
      alert('Đã thêm vào giỏ hàng!');
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Đang tải dữ liệu...</div>;
  }

  if (!product || !product.product) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Sản phẩm không tồn tại</div>;
  }

  const p = product.product;
  const currentPrice = p.price * (100 - (p.discount || 0)) / 100;

  return (
    <div className="container">
      <div className="card" style={{ padding: '2rem', display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '5rem' }}>🍎</span>
        </div>
        
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--primary-dark)', marginBottom: '1rem' }}>{p.name}</h1>
          <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <span>Đã bán: {p.purchaseTotal}</span>
            <span>Kho: {p.stock}</span>
          </div>
          
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
            <div style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '2rem' }}>{currencyFormat(currentPrice)}</div>
            {p.discount > 0 && (
              <div style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>Giá gốc: {currencyFormat(p.price)}</div>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <span style={{ fontWeight: 500 }}>Số lượng:</span>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                style={{ padding: '0.5rem 1rem', borderRight: '1px solid var(--border-color)' }}
              >-</button>
              <input 
                type="number" 
                value={quantity} 
                onChange={e => setQuantity(Math.max(1, Math.min(p.stock, parseInt(e.target.value) || 1)))}
                style={{ width: '60px', textAlign: 'center', border: 'none', outline: 'none' }}
              />
              <button 
                onClick={() => setQuantity(q => Math.min(p.stock, q + 1))}
                style={{ padding: '0.5rem 1rem', borderLeft: '1px solid var(--border-color)' }}
              >+</button>
            </div>
          </div>
          
          <button onClick={handleAddToCart} className="btn btn-accent" style={{ padding: '1rem', fontSize: '1.125rem' }}>
            <ShoppingCart size={24} />
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
      
      <div className="card" style={{ padding: '2rem', marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-dark)' }}>Mô tả sản phẩm</h3>
        <div style={{ color: 'var(--text-main)', lineHeight: 1.8 }}>
          {p.desc || 'Đang cập nhật mô tả...'}
        </div>
      </div>
    </div>
  );
}
