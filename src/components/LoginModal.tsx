import React, { useState } from 'react';

const VALID_OPERATORS = ['90', '91', '93', '94', '95', '97', '98', '99', '88', '33', '77', '20'];

export interface UserData {
  name: string;
  phone?: string;
  email?: string;
  method: 'phone' | 'google';
  avatar: string;
  isPro?: boolean;
}

interface LoginModalProps {
  onLogin: (userData: UserData) => void;
}

export function LoginModal({ onLogin }: LoginModalProps) {
  const [authMethod, setAuthMethod] = useState<'phone' | 'google'>('phone');
  const [name, setName] = useState('');
  const [rawPhone, setRawPhone] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [error, setError] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputVal = e.target.value.replace(/\D/g, '');
    if (inputVal.startsWith('998')) inputVal = inputVal.slice(3);
    if (inputVal.length > 9) inputVal = inputVal.slice(0, 9);
    setRawPhone(inputVal);
    if (error) setError('');
  };

  const getFormattedPhone = () => {
    let res = '+998';
    if (rawPhone.length > 0) res += ' ' + rawPhone.slice(0, 2);
    if (rawPhone.length > 2) res += ' ' + rawPhone.slice(2, 5);
    if (rawPhone.length > 5) res += ' ' + rawPhone.slice(5, 7);
    if (rawPhone.length > 7) res += ' ' + rawPhone.slice(7, 9);
    return res;
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 3) {
      setError('Iltimos, ismingizni to‘liq kiriting (kamida 3 ta harf).');
      return;
    }
    if (rawPhone.length !== 9) {
      setError('Telefon raqam to‘liq emas. 9 ta raqam kiriting.');
      return;
    }
    const opCode = rawPhone.slice(0, 2);
    if (!VALID_OPERATORS.includes(opCode)) {
      setError(`Noma'lum operator (${opCode}). O‘zbekiston raqamini kiriting (masalan: 90, 91, 99...).`);
      return;
    }

    const user: UserData = {
      name: name.trim(),
      phone: getFormattedPhone(),
      method: 'phone',
      avatar: '📱',
      isPro: false,
    };
    localStorage.setItem('yaqin_user', JSON.stringify(user));
    onLogin(user);
  };

  const handleGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = googleEmail.trim().toLowerCase();
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!cleanEmail || !gmailRegex.test(cleanEmail)) {
      setError('Iltimos, to‘g‘ri Gmail manzilini kiriting (masalan: ismingiz@gmail.com).');
      return;
    }

    const usernamePart = cleanEmail.split('@')[0];
    const formattedName = usernamePart
      .replace(/[._]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const user: UserData = {
      name: formattedName || 'Foydalanuvchi',
      email: cleanEmail,
      method: 'google',
      avatar: '🌐',
      isPro: false,
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
          <p className="login-subtitle">Eng yaqin xizmatlardan foydalanish uchun tizimga kiring</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${authMethod === 'phone' ? 'active' : ''}`}
            onClick={() => {
              setAuthMethod('phone');
              setError('');
            }}
          >
            📱 Telefon raqam
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authMethod === 'google' ? 'active' : ''}`}
            onClick={() => {
              setAuthMethod('google');
              setError('');
            }}
          >
            Google (Gmail)
          </button>
        </div>

        {error && <div className="login-error-badge">⚠️ {error}</div>}

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
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
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
                onChange={(e) => {
                  setGoogleEmail(e.target.value);
                  setError('');
                }}
                className="login-input"
              />
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
