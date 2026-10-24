import React, { useState } from 'react';

export interface Category {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  desc?: string;
}

const CATEGORIES: Category[] = [
  { id: 'pharmacy', label: 'Dorixona', icon: '💊', badge: '24/7 Ochiq', desc: 'Dori va tibbiy buyumlar' },
  { id: 'hospital', label: 'Shifoxona', icon: '🏥', badge: 'Shoshilinch', desc: 'Klinika va tez yordam' },
  { id: 'shop', label: 'Supermarket', icon: '🛒', badge: 'Yaqin 150m', desc: 'Oziq-ovqat va bozorlar' },
  { id: 'cafe', label: 'Kafe & Taom', icon: '☕', badge: 'Tez yetkazish', desc: 'Restoran, milliy taomlar' },
  { id: 'fuel', label: 'Yoqilg‘i & Zaryad', icon: '⛽', badge: 'Metan / EV', desc: 'Benzin, gaz, elektr quvvat' },
  { id: 'mosque', label: 'Masjid', icon: '🕌', badge: 'Tohoratxona', desc: 'Namozgoh va jome masjidlar' },
  { id: 'bank', label: 'Bank / Bankomat', icon: '🏦', badge: 'Naqd pul', desc: 'Valyuta, karta naqdlashtirish' },
  { id: 'service', label: 'Avto / Usta', icon: '🔧', badge: 'Evakuator', desc: 'Vulkanizatsiya, ustaxonalar' },
];

interface CategorySelectorProps {
  onSelectCategory: (category: Category) => void;
  onOpenSos: () => void;
  onOpenPro: () => void;
  isProUser?: boolean;
}

export function CategorySelector({
  onSelectCategory,
  onOpenSos,
  onOpenPro,
  isProUser,
}: CategorySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHint, setSearchHint] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.toLowerCase().trim();
    if (!q) return;

    // AI Intent Mapping
    if (q.includes('dori') || q.includes('bosh') || q.includes('harorat') || q.includes('ogriq') || q.includes('analgin')) {
      setSearchHint('💊 Dori yoki tibbiy yordam aniqlandi → Dorixonalar ochilmoqda...');
      setTimeout(() => {
        onSelectCategory(CATEGORIES[0]);
      }, 700);
      return;
    }
    if (q.includes('shifoxona') || q.includes('vrach') || q.includes('doktor') || q.includes('klinika')) {
      setSearchHint('🏥 Tibbiy markaz aniqlandi → Shifoxonalar ochilmoqda...');
      setTimeout(() => {
        onSelectCategory(CATEGORIES[1]);
      }, 700);
      return;
    }
    if (q.includes('ovqat') || q.includes('osh') || q.includes('choy') || q.includes('kafe') || q.includes('lavash') || q.includes('shashlik')) {
      setSearchHint('☕ Taomlanish joylari aniqlandi → Kafelar ochilmoqda...');
      setTimeout(() => {
        onSelectCategory(CATEGORIES[3]);
      }, 700);
      return;
    }
    if (q.includes('benzin') || q.includes('gaz') || q.includes('metan') || q.includes('zapravka') || q.includes('prop')) {
      setSearchHint('⛽ Yoqilg‘i shoxobchasi aniqlandi → Zapravkalar ochilmoqda...');
      setTimeout(() => {
        onSelectCategory(CATEGORIES[4]);
      }, 700);
      return;
    }
    if (q.includes('masjid') || q.includes('namoz') || q.includes('juma')) {
      setSearchHint('🕌 Masjid aniqlandi → Yaqin masjidlar ochilmoqda...');
      setTimeout(() => {
        onSelectCategory(CATEGORIES[5]);
      }, 700);
      return;
    }
    if (q.includes('pul') || q.includes('bank') || q.includes('bankomat') || q.includes('dollar') || q.includes('karta')) {
      setSearchHint('🏦 Bank xizmati aniqlandi → Bankomatlar ochilmoqda...');
      setTimeout(() => {
        onSelectCategory(CATEGORIES[6]);
      }, 700);
      return;
    }

    // Default to Supermarket
    setSearchHint(`🔍 "${searchQuery}" bo‘yicha eng yaqin joylar qidirilmoqda...`);
    setTimeout(() => {
      onSelectCategory(CATEGORIES[2]);
    }, 700);
  };

  return (
    <div className="home-container">
      {/* Live Impact Bar */}
      <div className="impact-live-bar">
        <span className="live-dot-pulse"></span>
        <span className="impact-text">
          ⚡ <strong>Bugun:</strong> 1,420 ta qidiruv | ⏱️ <strong>O‘rtacha topish:</strong> 15 soniya
        </span>
        {!isProUser && (
          <button type="button" className="impact-pro-pill" onClick={onOpenPro}>
            👑 PRO Reja
          </button>
        )}
      </div>

      {/* Main Brand & Pitch Headline */}
      <div className="home-header">
        <h1 className="brand-logo">
          <span className="logo-yaqin">Yaqin</span>
          <span className="logo-uz">uz</span>
          {isProUser && <span className="pro-inline-badge">PRO</span>}
        </h1>
        <p className="hero-tagline">
          Shahar ichida sizga eng kerakli nuqtalarni 1 soniyada toping va tejab yuring
        </p>
      </div>

      {/* SOS Rapid Action Banner */}
      <div className="sos-rapid-banner" onClick={onOpenSos}>
        <div className="sos-rapid-left">
          <span className="sos-beacon">🚨</span>
          <div>
            <strong>Shoshilinch vaziyatmi? (SOS)</strong>
            <p>24/7 navbatchi dorixonalar, tez tibbiy yordam (103) va shifoxonalar</p>
          </div>
        </div>
        <button type="button" className="sos-rapid-btn">
          Yordam Olish ⚡
        </button>
      </div>

      {/* AI Smart Natural Language Search Bar */}
      <form onSubmit={handleSearchSubmit} className="ai-search-box">
        <span className="ai-search-icon">✨</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Qayerga shoshilyapsiz? (Masalan: 'boshim og'riyapti', 'metan gaz', 'lavash')..."
          className="ai-search-input"
        />
        <button type="submit" className="ai-search-submit-btn" title="AI Qidiruv">
          Topish ↵
        </button>
      </form>

      {/* Hint animation if searching */}
      {searchHint && <div className="search-intent-hint">{searchHint}</div>}

      {/* Grid of Categories */}
      <div className="category-section-label">
        <span>Yoki toifani tanlang:</span>
      </div>

      <div className="category-grid">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className="category-card"
            onClick={() => onSelectCategory(cat)}
          >
            {cat.badge && <span className="cat-badge-top">{cat.badge}</span>}
            <span className="cat-icon">{cat.icon}</span>
            <div className="cat-meta">
              <span className="cat-label">{cat.label}</span>
              {cat.desc && <span className="cat-subdesc">{cat.desc}</span>}
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Pitch Value Proposition */}
      <div className="pitch-usp-row">
        <div className="usp-pill">
          <span>🚶 Piyoda Marshrut</span>
        </div>
        <div className="usp-pill">
          <span>⚡ Real-Vaqt Masofa</span>
        </div>
        <div className="usp-pill">
          <span>🤖 Gemini AI Gid</span>
        </div>
      </div>
    </div>
  );
}
