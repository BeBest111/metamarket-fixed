import React from 'react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'white', borderTop: '1px solid var(--border-color)', padding: '3rem 0', marginTop: 'auto' }}>
      <div className="container">
        <div className="d-flex justify-between" style={{ flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ flex: '1 1 300px' }}>
            <h3 style={{ color: 'var(--primary-dark)', marginBottom: '1rem' }}>Chợ Việt</h3>
            <p style={{ color: 'var(--text-muted)' }}>Nền tảng mua sắm trực tuyến hàng đầu Việt Nam, mang đến trải nghiệm tuyệt vời và sản phẩm chất lượng nhất.</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Về chúng tôi</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <li><a href="#">Giới thiệu</a></li>
              <li><a href="#">Chính sách bảo mật</a></li>
              <li><a href="#">Điều khoản sử dụng</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Hỗ trợ khách hàng</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <li><a href="#">Trung tâm trợ giúp</a></li>
              <li><a href="#">Hướng dẫn mua hàng</a></li>
              <li><a href="#">Thanh toán an toàn</a></li>
            </ul>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          &copy; 2026 Chợ Việt. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
