import React, { useState } from 'react';

export function LoginModal({ onLogin }) {
  const [authMethod, setAuthMethod] = useState('phone'); // 'phone' | 'google'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [error, setError] = useState('');

  // Telefon raqamni formatlash (+998 90 123 45 67)
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // faqat raqamlar
    if (value.startsWith('998')) {
      value = value.slice(3);
    }
    value = value.slice(0, 9); // maksimal 9 ta raqam (90 123 45 67)

    let formatted = '+998';
    if (value.length > 0) formatted += ' ' + value.slice(0, 2);
    if (value.length > 2) formatted += ' ' + value.slice(2, 5);
    if (value.length > 5) formatted += ' ' + value.slice(5, 7);
    if (value.length > 7) formatted += ' ' + value.slice(7, 9);

    setPhone(formatted);
    if (error) setError('');
  };

  // Telefon orqali kirish
  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    const rawDigits = phone.replace(/\D/g, '');

    if (!name.trim() || name.trim().length < 3) {
      setError('Iltimos, haqiqiy ismingizni kiriting (kamida 3 ta harf).');
      return;
    }

    if (rawDigits.length !== 12) {
      setError('Telefon raqamni to‘liq kiriting (+998 XX XXX XX XX).');
      return;
    }

    const user = {
      name: name.trim(),
      phone: phone,
      method: 'phone',
      avatar: '📱'
    };

    localStorage.setItem('yaqin_user', JSON.stringify(user));
    onLogin(user);
  };

  // Google orqali kirish
  const handleGoogleSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!googleEmail || !emailRegex.test(googleEmail)) {
      setError('Haqiqiy Google / Gmail manzilini kiriting (masalan: user@gmail.com).');
      return;
    }

    const generatedName = googleEmail.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = generatedName.charAt(0).toUpperCase() + generatedName.slice(1);

    const user = {
      name: formattedName,
      email: googleEmail.trim().toLowerCase(),
      method: 'google',
      avatar: '🌐'
    };

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
          <p className="login-subtitle">Xizmatdan foydalanish uchun tizimga kiring</p>
        </div>

        {/* Kirish usulini tanlash (Tabs) */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${authMethod === 'phone' ? 'active' : ''}`}
            onClick={() => { setAuthMethod('phone'); setError(''); }}
          >
            📱 Telefon raqam
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authMethod === 'google' ? 'active' : ''}`}
            onClick={() => { setAuthMethod('google'); setError(''); }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Google
          </button>
        </div>

        {error && <div className="login-error-badge">⚠️ {error}</div>}

        {/* 1. Telefon orqali shakl */}
        {authMethod === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="name-input">Ismingiz *</label>
              <input
                id="name-input"
                type="text"
                required
                placeholder="Masalan: Sardor"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                className="login-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone-input">Telefon raqam *</label>
              <input
                id="phone-input"
                type="tel"
                required
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={handlePhoneChange}
                className="login-input"
              />
            </div>

            <button type="submit" className="login-btn">
              Kirish va Boshlash 🚀
            </button>
          </form>
        )}

        {/* 2. Google / Gmail orqali shakl */}
        {authMethod === 'google' && (
          <form onSubmit={handleGoogleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email-input">Google / Gmail manzilingiz *</label>
              <input
                id="email-input"
                type="email"
                required
                placeholder="ismingiz@gmail.com"
                value={googleEmail}
                onChange={(e) => { setGoogleEmail(e.target.value); setError(''); }}
                className="login-input"
              />
            </div>

            <button type="submit" className="login-btn google-submit-btn">
              Google orqali davom etish
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
