import React, { useState } from 'react';

export function LoginModal({ onLogin }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const user = { name: name.trim(), phone: phone.trim() };
    localStorage.setItem('yaqin_user', JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-card">
        <div className="login-header">
          <div className="login-brand">
            <span className="logo-yaqin">Yaqin</span>
            <span className="logo-uz">uz</span>
          </div>
          <p className="login-subtitle">Xush kelibsiz! Tizimdan foydalanish uchun ma'lumotlaringizni kiriting</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="name-input">Ismingiz *</label>
            <input
              id="name-input"
              type="text"
              required
              placeholder="Masalan: Sardor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="login-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone-input">Telefon raqam (ixtiyoriy)</label>
            <input
              id="phone-input"
              type="tel"
              placeholder="+998 90 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="login-input"
            />
          </div>

          <button type="submit" className="login-btn">
            Kirish va Boshlash 🚀
          </button>
        </form>
      </div>
    </div>
  );
}
