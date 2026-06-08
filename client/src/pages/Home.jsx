import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../services/api';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

const currencyFormat = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);

export default function Home() {
  const [catalogs, setCatalogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          API.products.getCatalogs(),
          API.products.getHomepage()
        ]);
        
        setCatalogs(catsRes?.data || []);
        setProducts(prodsRes?.data || []);
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleAddToCart = async (product) => {
    if (!user) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }
    
    const shopRes = await API.products.getShop(product._id);
    const shopId = shopRes?.data;
    
    const success = await addToCart(user.userId, {
      productId: product._id,
      quantity: 1,
      shopId: shopId
    });
    
    if (success) {
      alert('Đã thêm vào giỏ hàng!');
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Đang tải dữ liệu...</div>;
  }

  return (
    <div className="container">
      {/* Hero Banner */}
      <div style={{ backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-lg)', padding: '3rem', marginBottom: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, maxWidth: '500px' }}>
          <h1 style={{ color: 'var(--primary-dark)', fontSize: '2.5rem', marginBottom: '1rem' }}>Thực phẩm sạch, tươi ngon mỗi ngày</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.125rem' }}>Khám phá các sản phẩm nông sản, thực phẩm chất lượng cao từ các nhà cung cấp uy tín.</p>
          <button className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}>Mua sắm ngay</button>
        </div>
      </div>

      {/* Danh mục */}
      <div style={{ marginBottom: '4rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-dark)' }}>Danh mục sản phẩm</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1.5rem' }}>
          {catalogs.map(cat => (
            <Link to={`/catalog/${cat._id}`} key={cat._id} className="card" style={{ padding: '1.5rem', textAlign: 'center', textDecoration: 'none' }}>
              {/* <img src={cat.icon} alt={cat.name} style={{ width: 64, height: 64, marginBottom: '1rem' }} /> */}
              <div style={{ width: 64, height: 64, backgroundColor: 'var(--bg-secondary)', borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.5rem' }}>🏷️</span>
              </div>
              <div style={{ fontWeight: 600 }}>{cat.name}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Sản phẩm nổi bật */}
      <div>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-dark)' }}>Sản phẩm nổi bật</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
          {products.map(product => {
            const currentPrice = product.price * (100 - (product.discount || 0)) / 100;
            return (
              <div key={product._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Image placeholder */}
                <div style={{ backgroundColor: 'var(--bg-secondary)', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   {/* <img src={product.avt} alt={product.name} style={{ objectFit: 'cover', width: '100%', height: '100%' }} /> */}
                   <span style={{ fontSize: '3rem', color: 'var(--text-muted)' }}>🍎</span>
                </div>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Link to={`/product/${product._id}`} style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.name}
                  </Link>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    Đã bán: {product.purchaseTotal}
                  </div>
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '1.25rem' }}>{currencyFormat(currentPrice)}</div>
                      {product.discount > 0 && (
                        <div style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '0.875rem' }}>{currencyFormat(product.price)}</div>
                      )}
                    </div>
                    <button onClick={() => handleAddToCart(product)} className="btn btn-primary" style={{ padding: '0.5rem' }}>
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
