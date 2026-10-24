import React, { useState } from 'react';
import Modal from './Modal';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess?: () => void;
}

export function ProModal({ isOpen, onClose, onUpgradeSuccess }: ProModalProps) {
  const [step, setStep] = useState<'plans' | 'checkout' | 'success'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<'month' | 'year'>('year');
  const [paymentMethod, setPaymentMethod] = useState<'click' | 'payme' | 'uzum'>('click');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const priceText = selectedPlan === 'year' ? '149 000' : '19 000';
  const planTitle = selectedPlan === 'year' ? '1 Yillik VIP Obuna' : '1 Oylik Standart Obuna';

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    // Format as 8600 0000 0000 0000
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = val.slice(0, 2) + '/' + val.slice(2, 4);
    }
    setCardExpiry(val);
  };

  const handleProceedToPayment = () => {
    setStep('checkout');
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
      if (onUpgradeSuccess) onUpgradeSuccess();
    }, 1500);
  };

  const handleResetAndClose = () => {
    setStep('plans');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleResetAndClose}>
      <div className="pro-modal-content">
        {/* STEP 1: Plan Selection */}
        {step === 'plans' && (
          <>
            <div className="pro-badge-header">
              <div className="pro-crown-circle">👑</div>
              <h2 className="pro-title">
                Yaqin<span className="pro-uz">uz</span> <span className="pro-tag">PRO</span>
              </h2>
              <p className="pro-subtitle">
                Investorlar va ilg'or foydalanuvchilar uchun eksklyuziv aqlli xizmatlar
              </p>
            </div>

            <div className="pro-features-grid">
              <div className="pro-feature-item">
                <span className="pro-feature-icon">⚡</span>
                <div>
                  <strong>Cheksiz Gemini AI Gid</strong>
                  <p>Shaxsiy sog'liq va eng yaqin arzon dorilar bo'yicha cheksiz maslahat</p>
                </div>
              </div>

              <div className="pro-feature-item">
                <span className="pro-feature-icon">💰</span>
                <div>
                  <strong>Narxlar Solishtiruvi</strong>
                  <p>Yaqin dorixona va do'konlardagi dori va mahsulot narxlarini taqqoslash</p>
                </div>
              </div>

              <div className="pro-feature-item">
                <span className="pro-feature-icon">🚨</span>
                <div>
                  <strong>SOS Oila Xavfsizligi</strong>
                  <p>Favqulodda vaziyatda qarindoshlarga avtomatik SMS lokatsiya yuborish</p>
                </div>
              </div>

              <div className="pro-feature-item">
                <span className="pro-feature-icon">🎁</span>
                <div>
                  <strong>Hamkorlardan Keshbek</strong>
                  <p>Yaqin klinika, kafe va dorixonalardan 15% gacha VIP keshbek</p>
                </div>
              </div>
            </div>

            <div className="pro-plans-selector">
              <div
                className={`pro-plan-card ${selectedPlan === 'year' ? 'active' : ''}`}
                onClick={() => setSelectedPlan('year')}
              >
                <div className="pro-save-badge">35% TEJASH</div>
                <div className="pro-plan-period">1 Yillik VIP</div>
                <div className="pro-plan-price">
                  <strong>149 000</strong> <span className="pro-currency">so'm/yil</span>
                </div>
                <div className="pro-plan-monthly-equiv">~12 400 so'm/oy</div>
              </div>

              <div
                className={`pro-plan-card ${selectedPlan === 'month' ? 'active' : ''}`}
                onClick={() => setSelectedPlan('month')}
              >
                <div className="pro-plan-period">Oylik Reja</div>
                <div className="pro-plan-price">
                  <strong>19 000</strong> <span className="pro-currency">so'm/oy</span>
                </div>
                <div className="pro-plan-monthly-equiv">Istalgan payt bekor qilish</div>
              </div>
            </div>

            <button
              type="button"
              className="pro-activate-btn"
              onClick={handleProceedToPayment}
            >
              💳 To‘lovga o‘tish ({priceText} so‘m)
            </button>

            <div className="pro-guarantee-note">
              🔒 7 kunlik bepul sinov davri. Hech qanday yashirin komissiyalarsiz.
            </div>
          </>
        )}

        {/* STEP 2: Checkout Screen */}
        {step === 'checkout' && (
          <div className="checkout-step-container">
            <div className="checkout-header">
              <button
                type="button"
                className="checkout-back-link"
                onClick={() => setStep('plans')}
              >
                ← Tariflarga qaytish
              </button>
              <h3 className="checkout-title">To‘lov tizimini tanlang</h3>
              <p className="checkout-plan-info">
                Tanlangan: <strong>{planTitle}</strong> ({priceText} so'm)
              </p>
            </div>

            {/* Payment Method Tabs */}
            <div className="payment-gateway-tabs">
              <button
                type="button"
                className={`gateway-tab ${paymentMethod === 'click' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('click')}
              >
                <span className="gateway-logo click-logo">Click Up</span>
              </button>
              <button
                type="button"
                className={`gateway-tab ${paymentMethod === 'payme' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('payme')}
              >
                <span className="gateway-logo payme-logo">Payme</span>
              </button>
              <button
                type="button"
                className={`gateway-tab ${paymentMethod === 'uzum' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('uzum')}
              >
                <span className="gateway-logo uzum-logo">Uzum Bank</span>
              </button>
            </div>

            {/* Card Payment Form */}
            <form onSubmit={handlePay} className="card-payment-form">
              <div className="form-group-checkout">
                <label>Karta raqami (Uzcard / Humo / Visa)</label>
                <div className="input-card-box">
                  <span className="card-icon-preview">💳</span>
                  <input
                    type="text"
                    required
                    placeholder="8600 0000 0000 0000"
                    value={cardNumber}
                    onChange={handleCardChange}
                    maxLength={19}
                    className="checkout-input"
                  />
                </div>
              </div>

              <div className="form-group-checkout">
                <label>Amal qilish muddati (MM/YY)</label>
                <input
                  type="text"
                  required
                  placeholder="12/28"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  maxLength={5}
                  className="checkout-input"
                />
              </div>

              <div className="checkout-summary-box">
                <div className="summary-row">
                  <span>To‘lov summasi:</span>
                  <strong>{priceText} UZS</strong>
                </div>
                <div className="summary-row small">
                  <span>Komissiya:</span>
                  <span className="free-tag">0% (Bepul)</span>
                </div>
              </div>

              <button
                type="submit"
                className="pro-activate-btn pay-now-btn"
                disabled={isProcessing}
              >
                {isProcessing ? '⏳ Tranzaksiya bajarilmoqda...' : `✅ ${priceText} so‘m to‘lash`}
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: Success Screen */}
        {step === 'success' && (
          <div className="checkout-success-view">
            <div className="success-anim-circle">🎉</div>
            <h3 className="success-title">To‘lov Muvaffaqiyatli Bajarildi!</h3>
            <p className="success-desc">
              Sizning <strong>Yaqinuz PRO VIP</strong> obunangiz faollashtirildi. Barcha imkoniyatlar siz uchun ochiq!
            </p>

            <div className="receipt-box">
              <div className="receipt-row">
                <span>Tarif:</span>
                <strong>{planTitle}</strong>
              </div>
              <div className="receipt-row">
                <span>To‘langan summa:</span>
                <strong>{priceText} so'm</strong>
              </div>
              <div className="receipt-row">
                <span>To‘lov turi:</span>
                <strong>{paymentMethod.toUpperCase()}</strong>
              </div>
              <div className="receipt-row">
                <span>Tranzaksiya ID:</span>
                <code>YQZ-{Math.floor(100000 + Math.random() * 900000)}</code>
              </div>
            </div>

            <button
              type="button"
              className="pro-activate-btn"
              onClick={handleResetAndClose}
            >
              Foydalanishni davom ettirish 🚀
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
