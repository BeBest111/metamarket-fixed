import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API } from '../services/api';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

const currencyFormat = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);

export default function Catalog() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/v1/products/list/catalog/${id}`);
        const data = await res.json();
        setProducts(data?.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

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

  return (
    <div className="container">
      <h2 style={{ marginBottom: '2rem', color: 'var(--primary-dark)' }}>Sản phẩm thuộc danh mục</h2>
      
      {loading ? (
        <div style={{ padding: '4rem 0', textAlign: 'center' }}>Đang tải dữ liệu...</div>
      ) : products.length === 0 ? (
        <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có sản phẩm nào trong danh mục này.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
          {products.map(product => {
            const currentPrice = product.price * (100 - (product.discount || 0)) / 100;
            return (
              <div key={product._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ backgroundColor: 'var(--bg-secondary)', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
      )}
    </div>
  );
}
