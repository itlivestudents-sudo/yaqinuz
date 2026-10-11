import React, { useState } from 'react';

const VALID_OPERATORS = ['90', '91', '93', '94', '95', '97', '98', '99', '88', '33', '77', '20'];

export function LoginModal({ onLogin }) {
  const [authMethod, setAuthMethod] = useState('phone'); // 'phone' | 'google'
  const [name, setName] = useState('');
  const [rawPhone, setRawPhone] = useState(''); // faqat 9 ta raqam
  const [googleEmail, setGoogleEmail] = useState('');
  const [error, setError] = useState('');

  // Telefon raqamni boshqarish: qat'iy 9 ta raqam
  const handlePhoneChange = (e) => {
    let inputVal = e.target.value.replace(/\D/g, ''); // faqat raqamlar
    
    // Agar foydalanuvchi 998 bilan yozsa, olib tashlaymiz
    if (inputVal.startsWith('998')) {
      inputVal = inputVal.slice(3);
    }

    // 9 ta raqamdan oshmasligi shart!
    if (inputVal.length > 9) {
      inputVal = inputVal.slice(0, 9);
    }

    setRawPhone(inputVal);
    if (error) setError('');
  };

  // Telefon raqamni chiroyli ko'rsatish
  const getFormattedPhone = () => {
    let res = '+998';
    if (rawPhone.length > 0) res += ' ' + rawPhone.slice(0, 2);
    if (rawPhone.length > 2) res += ' ' + rawPhone.slice(2, 5);
    if (rawPhone.length > 5) res += ' ' + rawPhone.slice(5, 7);
    if (rawPhone.length > 7) res += ' ' + rawPhone.slice(7, 9);
    return res;
  };

  // Telefon orqali kirish
  const handlePhoneSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || name.trim().length < 3) {
      setError('Iltimos, ismingizni to‘g‘ri kiriting (kamida 3 ta harf).');
      return;
    }

    if (rawPhone.length !== 9) {
      setError('Telefon raqam to‘liq emas. 9 ta raqam kiriting.');
      return;
    }

    const opCode = rawPhone.slice(0, 2);
    if (!VALID_OPERATORS.includes(opCode)) {
      setError(`Noma'lum operator kodi (${opCode}). O‘zbekiston raqamini kiriting (masalan: 90, 91, 99, 93, 88...).`);
      return;
    }

    const user = {
      name: name.trim(),
      phone: getFormattedPhone(),
      method: 'phone',
      avatar: '📱'
    };

    localStorage.setItem('yaqin_user', JSON.stringify(user));
    onLogin(user);
  };

  // Google / Gmail orqali kirish
  const handleGoogleSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = googleEmail.trim().toLowerCase();

    // Faqat haqiqiy gmail manzilini tekshirish
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!cleanEmail || !gmailRegex.test(cleanEmail)) {
      setError('Iltimos, haqiqiy Gmail manzilini kiriting (masalan: ismingiz@gmail.com).');
      return;
    }

    const usernamePart = cleanEmail.split('@')[0];
    if (usernamePart.length < 3) {
      setError('Gmail foydalanuvchi nomi juda qisqa.');
      return;
    }

    const formattedName = usernamePart
      .replace(/[._]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const user = {
      name: formattedName,
      email: cleanEmail,
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

        {/* Kirish usullari */}
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
            Google (Gmail)
          </button>
        </div>

        {error && <div className="login-error-badge">⚠️ {error}</div>}

        {/* Telefon shakli */}
        {authMethod === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="name-input">Ismingiz *</label>
              <input
                id="name-input"
                type="text"
                required
                maxLength={30}
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
                value={getFormattedPhone()}
                onChange={handlePhoneChange}
                maxLength={17}
                className="login-input"
              />
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                {rawPhone.length}/9 raqam kiritildi
              </span>
            </div>

            <button type="submit" className="login-btn">
              Kirish va Boshlash 🚀
            </button>
          </form>
        )}

        {/* Google / Gmail shakli */}
        {authMethod === 'google' && (
          <form onSubmit={handleGoogleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email-input">Gmail manzilingiz *</label>
              <input
                id="email-input"
                type="email"
                required
                placeholder="ismingiz@gmail.com"
                value={googleEmail}
                onChange={(e) => { setGoogleEmail(e.target.value); setError(''); }}
                className="login-input"
              />
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                Faqat rasmiy @gmail.com manzillari qabul qilinadi
              </span>
            </div>

            <button type="submit" className="login-btn google-submit-btn">
              Kirish 🚀
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
