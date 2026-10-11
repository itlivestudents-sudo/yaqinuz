import React from 'react';

const CATEGORIES = [
  { id: 'shop', label: 'Do‘kon', icon: '🛒' },
  { id: 'pharmacy', label: 'Dorixona', icon: '💊' },
  { id: 'cafe', label: 'Kafe', icon: '☕' },
  { id: 'fuel', label: 'Yoqilg‘i', icon: '⛽' },
  { id: 'mosque', label: 'Masjid', icon: '🕌' },
  { id: 'bank', label: 'Bank / Bankomat', icon: '🏦' },
];

export function CategorySelector({ onSelectCategory }) {
  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="brand-logo">
          <span className="logo-yaqin">Yaqin</span>
          <span className="logo-uz">uz</span>
        </h1>
        <h2 className="hero-question">Sizga nima kerak?</h2>
      </div>

      <div className="category-grid">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className="category-card"
            onClick={() => onSelectCategory(cat)}
          >
            <span className="cat-icon">{cat.icon}</span>
            <span className="cat-label">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
