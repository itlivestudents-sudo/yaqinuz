import React from 'react';
import Modal from './Modal';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmergencyCategory: (type: 'pharmacy' | 'hospital') => void;
}

export function SosModal({ isOpen, onClose, onSelectEmergencyCategory }: SosModalProps) {
  const emergencyNumbers = [
    { name: 'Tez Tibbiy Yordam', number: '103', icon: '🚑', color: '#ef4444' },
    { name: 'Favqulodda Vaziyatlar (FVV)', number: '101', icon: '🚒', color: '#f97316' },
    { name: 'Ichki Ishlar (Militsiya)', number: '102', icon: '👮', color: '#3b82f6' },
    { name: 'Gaz Avariya Xizmati', number: '104', icon: '⚠️', color: '#eab308' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="sos-modal-content">
        <div className="sos-header">
          <div className="sos-pulse-ring">
            <span className="sos-icon">🚨</span>
          </div>
          <h2 className="sos-title">24/7 Favqulodda Yordam (SOS)</h2>
          <p className="sos-subtitle">
            Kechiktirib bo'lmaydigan vaziyatlarda zudlik bilan eng yaqin yordamni toping
          </p>
        </div>

        {/* Quick Find Buttons */}
        <div className="sos-quick-actions">
          <button
            type="button"
            className="sos-action-btn pharmacy-btn"
            onClick={() => {
              onClose();
              onSelectEmergencyCategory('pharmacy');
            }}
          >
            <span className="sos-btn-icon">💊</span>
            <div className="sos-btn-text">
              <strong>24/7 Navbatchi Dorixonalar</strong>
              <span>Hozir ochiq, tungi dorixonalar</span>
            </div>
            <span className="sos-btn-arrow">→</span>
          </button>

          <button
            type="button"
            className="sos-action-btn hospital-btn"
            onClick={() => {
              onClose();
              onSelectEmergencyCategory('hospital');
            }}
          >
            <span className="sos-btn-icon">🏥</span>
            <div className="sos-btn-text">
              <strong>Shoshilinch Tibbiy Markazlar</strong>
              <span>Eng yaqin reanimatsiya va poliklinika</span>
            </div>
            <span className="sos-btn-arrow">→</span>
          </button>
        </div>

        {/* Emergency Call Numbers */}
        <div className="sos-hotlines-section">
          <h4 className="sos-hotlines-title">Respublika Qisqa Raqamlari:</h4>
          <div className="sos-numbers-grid">
            {emergencyNumbers.map((item) => (
              <a
                key={item.number}
                href={`tel:${item.number}`}
                className="sos-number-card"
                style={{ borderColor: item.color }}
              >
                <span className="sos-card-icon">{item.icon}</span>
                <span className="sos-card-number">{item.number}</span>
                <span className="sos-card-name">{item.name}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="sos-footer-note">
          📍 Joylashuvingiz orqali eng yaqin shoxobchalar avtomatik saralanadi.
        </div>
      </div>
    </Modal>
  );
}
