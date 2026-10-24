import React, { useState } from 'react';
import { PlaceData } from '../App';

interface SmartNavigatorProps {
  place: PlaceData;
  categoryIcon: string;
  categoryLabel: string;
  routeMode: 'walk' | 'drive';
  onModeChange: (mode: 'walk' | 'drive') => void;
  isPro?: boolean;
  onOpenPro?: () => void;
}

export function SmartNavigator({
  place,
  categoryIcon,
  categoryLabel,
  routeMode,
  onModeChange,
  isPro,
  onOpenPro,
}: SmartNavigatorProps) {
  const [activeTab, setActiveTab] = useState<'radar' | 'steps' | 'eco'>('radar');

  const oneWayDist = place.dist;
  const roundTripDist =
    place.distMeters * 2 >= 1000
      ? `${((place.distMeters * 2) / 1000).toFixed(1)} km`
      : `${place.distMeters * 2} m`;

  const oneWayTime =
    routeMode === 'drive' ? `${place.driveMinutes} daqiqa` : `${place.walkMinutes} daqiqa`;
  const roundTripTime =
    routeMode === 'drive'
      ? `${place.driveMinutes * 2} daqiqa`
      : `${place.walkMinutes * 2} daqiqa`;

  // Realistic Guliston turn-by-turn route steps
  const steps = [
    { icon: '📍', title: 'Boshlang‘ich nuqta', desc: 'Siz turgan joy (Guliston shahar markazi)', dist: '0 m' },
    { icon: '🚶', title: 'O‘zbekiston shoh ko‘chasi bo‘ylab yuring', desc: 'To‘g‘ri yo‘nalishda piyodalar yo‘lagidan yuring', dist: `${Math.round(place.distMeters * 0.4)} m` },
    { icon: '↗️', title: `${place.address} tomon buriling`, desc: 'Svetofordan o‘tib, o‘ng tomonga buriling', dist: `${Math.round(place.distMeters * 0.5)} m` },
    { icon: '🎯', title: `${place.name} ga yetib keldingiz`, desc: `${place.isOpen247 ? 'Hozir ochiq (24/7)' : 'Ish vaqti: 08:00 - 22:00'}`, dist: `${place.dist}` },
  ];

  return (
    <div className="smart-navigator-pane">
      {/* Top Header Card */}
      <div className="navigator-header-card">
        <div className="nav-place-badge-row">
          <span className="nav-cat-tag">
            {categoryIcon} {categoryLabel}
          </span>
          {place.isOpen247 ? (
            <span className="nav-open-tag">🟢 24/7 Ochiq</span>
          ) : (
            <span className="nav-closed-tag">🟡 Ochiq</span>
          )}
          <span className="nav-star-tag">⭐ {place.rating}</span>
        </div>

        <h2 className="navigator-place-name">{place.name}</h2>
        <p className="navigator-place-address">📍 {place.address}</p>

        {/* Mode Switcher: Walk vs Drive */}
        <div className="nav-mode-pills">
          <button
            type="button"
            className={`nav-mode-pill ${routeMode === 'walk' ? 'active' : ''}`}
            onClick={() => onModeChange('walk')}
          >
            🚶 Piyoda ({place.walkMinutes} daq)
          </button>
          <button
            type="button"
            className={`nav-mode-pill ${routeMode === 'drive' ? 'active' : ''}`}
            onClick={() => onModeChange('drive')}
          >
            🚗 Avtomobil ({place.driveMinutes} daq)
          </button>
        </div>
      </div>

      {/* Primary Metrics: Roundtrip & Single Way */}
      <div className="navigator-metrics-grid">
        <div className="nav-metric-tile">
          <span className="tile-label">Bir tomonlama</span>
          <strong className="tile-value cyan">{oneWayDist}</strong>
          <span className="tile-sub">{oneWayTime}</span>
        </div>

        <div className="nav-metric-tile highlight">
          <span className="tile-label">🔄 Borib-kelish (jami)</span>
          <strong className="tile-value gold">{roundTripDist}</strong>
          <span className="tile-sub">{roundTripTime}</span>
        </div>

        <div className="nav-metric-tile">
          <span className="tile-label">Tejalgan vaqt</span>
          <strong className="tile-value green">~{place.walkMinutes * 3} daq</strong>
          <span className="tile-sub">Yaqinuz yo‘li orqali</span>
        </div>
      </div>

      {/* Tabs: Radar Map vs Steps vs Eco */}
      <div className="navigator-tab-bar">
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'radar' ? 'active' : ''}`}
          onClick={() => setActiveTab('radar')}
        >
          📡 Yaqinlik Radari
        </button>
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'steps' ? 'active' : ''}`}
          onClick={() => setActiveTab('steps')}
        >
          👣 Qadam-baqadam yo‘l
        </button>
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'eco' ? 'active' : ''}`}
          onClick={() => setActiveTab('eco')}
        >
          🌿 Smart Tejov
        </button>
      </div>

      {/* TAB 1: Proprietary Animated Radar View */}
      {activeTab === 'radar' && (
        <div className="radar-view-box">
          <div className="radar-grid-bg">
            {/* Concentric distance rings */}
            <div className="radar-ring ring-1">
              <span className="ring-label">100m</span>
            </div>
            <div className="radar-ring ring-2">
              <span className="ring-label">250m</span>
            </div>
            <div className="radar-ring ring-3">
              <span className="ring-label">500m</span>
            </div>

            {/* Sweep radar beam */}
            <div className="radar-sweep-beam"></div>

            {/* Center Origin: User */}
            <div className="radar-user-point">
              <div className="user-glow-pulse"></div>
              <span className="user-point-icon">🧍</span>
              <div className="user-tooltip">Siz (Guliston)</div>
            </div>

            {/* Destination Target Point */}
            <div className="radar-dest-point">
              <div className="dest-glow-pulse"></div>
              <span className="dest-point-icon">{categoryIcon}</span>
              <div className="dest-tooltip">
                <strong>{place.name}</strong>
                <span>{place.dist} • {oneWayTime}</span>
              </div>
            </div>

            {/* SVG Connecting Glowing Route Line */}
            <svg className="radar-svg-route" viewBox="0 0 400 240">
              <defs>
                <linearGradient id="routeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <path
                d="M 120 180 Q 200 160 220 120 T 310 70"
                fill="none"
                stroke="url(#routeGrad)"
                strokeWidth="4"
                strokeDasharray="6 4"
                className="animated-route-line"
              />
            </svg>
          </div>

          <div className="radar-footer-caption">
            <span>📍 Real-vaqt yo‘nalishi: <strong>{place.address}</strong></span>
            <span className="radar-live-badge">● Jonli GPS</span>
          </div>
        </div>
      )}

      {/* TAB 2: Turn-by-Turn Steps */}
      {activeTab === 'steps' && (
        <div className="nav-steps-list">
          {steps.map((st, i) => (
            <div key={i} className="nav-step-item">
              <div className="step-icon-circle">{st.icon}</div>
              <div className="step-content">
                <strong>{st.title}</strong>
                <p>{st.desc}</p>
              </div>
              <span className="step-dist-badge">{st.dist}</span>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Smart Eco & Savings */}
      {activeTab === 'eco' && (
        <div className="nav-eco-box">
          <div className="eco-card">
            <span className="eco-icon">🏃‍♂️</span>
            <div>
              <strong>Salomatlik & Kaloriya</strong>
              <p>Piyoda borib kelganda ~{Math.round(place.distMeters * 0.12)} kkal yoqiladi</p>
            </div>
          </div>
          <div className="eco-card">
            <span className="eco-icon">🌿</span>
            <div>
              <strong>Ekologik toza</strong>
              <p>0 gramm karbonat angidrid (CO2). Havoga zarar yetmaydi</p>
            </div>
          </div>
          <div className="eco-card">
            <span className="eco-icon">💰</span>
            <div>
              <strong>Yoqilg‘i tejalishi</strong>
              <p>Taksi yoki benzindan ~8 000 so‘m tejaldi</p>
            </div>
          </div>
        </div>
      )}

      {/* PRO Discount Callout */}
      {place.proDiscount && (
        <div
          className="navigator-pro-offer"
          onClick={onOpenPro}
          style={{ cursor: 'pointer' }}
        >
          <div className="pro-offer-left">
            <span className="pro-offer-crown">👑</span>
            <div>
              <strong>{place.proDiscount}</strong>
              <p>Yaqinuz PRO a'zolari ushbu nuqtadan maxsus chegirma oladilar</p>
            </div>
          </div>
          <button type="button" className="pro-offer-btn">
            {isPro ? 'VIP Faol ✓' : 'Faollashtirish'}
          </button>
        </div>
      )}

      {/* External Navigation Shortcuts */}
      <div className="navigator-action-buttons">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            place.name + ', ' + place.address + ', Guliston'
          )}&travelmode=${routeMode === 'drive' ? 'driving' : 'walking'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="external-map-link-btn google"
        >
          🗺️ Google Maps ilovasida ochish
        </a>

        <a
          href={`https://yandex.com/maps/?rtext=~${encodeURIComponent(
            place.name + ' Guliston'
          )}&rtt=${routeMode === 'drive' ? 'auto' : 'pd'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="external-map-link-btn yandex"
        >
          🟡 Yandex Xaritalarda ochish
        </a>

        <a href={`tel:${place.phone}`} className="external-map-link-btn call">
          📞 Qo‘ng‘iroq qilish
        </a>
      </div>
    </div>
  );
}
