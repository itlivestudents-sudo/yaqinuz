import React, { useState } from 'react';

export interface PlaceItem {
  id: string;
  name: string;
  lat: number;
  lon: number;
  formattedDistance?: string;
  rating?: number;
  isOpen247?: boolean;
  phone?: string;
  priceLevel?: string;
}

interface PlacesListProps {
  category: { id: string; label: string; icon: string };
  places: PlaceItem[];
  selectedPlace: PlaceItem | null;
  routeData: any;
  loadingRoute: boolean;
  onSelectPlace: (place: PlaceItem) => void;
  onShowRoute: (place: PlaceItem) => void;
  onBack: () => void;
  onClearRoute: () => void;
  onOpenPro?: () => void;
  isProUser?: boolean;
}

export function PlacesList({
  category,
  places,
  selectedPlace,
  routeData,
  loadingRoute,
  onSelectPlace,
  onShowRoute,
  onBack,
  onClearRoute,
  onOpenPro,
  isProUser,
}: PlacesListProps) {
  const [filter247, setFilter247] = useState(false);

  const displayedPlaces = filter247
    ? places.filter((p) => p.isOpen247 !== false)
    : places;

  return (
    <div className="places-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-brand-box">
          <span className="panel-brand-name">
            <span className="logo-yaqin">Yaqin</span>
            <span className="logo-uz">uz</span>
          </span>
          <div className="current-cat-tag">
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </div>
        </div>

        <button type="button" className="back-btn" onClick={onBack}>
          <span className="back-arrow">←</span>
          <span>Ortga</span>
        </button>
      </div>

      {/* Pro Monetization Feature Callout */}
      {!isProUser && (
        <div className="pro-list-banner" onClick={onOpenPro}>
          <div className="pro-banner-left">
            <span className="pro-banner-icon">👑</span>
            <div>
              <strong>PRO Reja bilan tejab xarid qiling</strong>
              <p>Yaqin dorixona va do'konlardagi dori va mahsulot narxlarini solishtiring</p>
            </div>
          </div>
          <button type="button" className="pro-banner-btn">
            Faollashtirish
          </button>
        </div>
      )}

      {/* Route Info Banner */}
      {routeData && (
        <div className="route-info-box">
          <div className="route-info-details">
            <div className="route-stat">
              <span className="route-stat-label">🚶 Masofa:</span>
              <span className="route-stat-value">{routeData.formattedDistance}</span>
            </div>
            <div className="route-stat">
              <span className="route-stat-label">⏱️ Piyoda vaqt:</span>
              <span className="route-stat-value">{routeData.formattedDuration}</span>
            </div>
          </div>
          <button type="button" className="clear-route-btn" onClick={onClearRoute}>
            ✕ Marshrutni yopish
          </button>
        </div>
      )}

      {/* Selected Place Action Area */}
      {selectedPlace && (
        <div className="selected-place-banner">
          <div className="selected-place-details">
            <div className="selected-name-row">
              <h3 className="selected-name">{selectedPlace.name}</h3>
              <span className="selected-dist-pill">{selectedPlace.formattedDistance || '150 m'}</span>
            </div>
            <div className="selected-sub-badges">
              <span className="badge-open">🟢 Ochiq (24/7)</span>
              <span className="badge-rating">⭐ 4.9 (128 ta baho)</span>
              {isProUser && <span className="badge-pro-discount">🏷️ -10% PRO keshbek</span>}
            </div>
          </div>

          <div className="action-buttons-group">
            <button
              type="button"
              className="show-route-btn"
              disabled={loadingRoute}
              onClick={() => onShowRoute(selectedPlace)}
            >
              {loadingRoute ? '⏳ Marshrut hisoblanmoqda...' : '📍 Xaritada yo‘l chizish'}
            </button>

            <div className="external-nav-group">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lon}&travelmode=walking`}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-action-btn walking-btn"
                title="Piyoda marshrut"
              >
                🚶 Piyoda yo‘l (Google Maps)
              </a>
              <a
                href={`tel:+998712000000`}
                className="nav-action-btn call-btn"
                title="Qo'ng'iroq qilish"
              >
                📞 Qo‘ng‘iroq
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Filter Row */}
      <div className="list-title-row">
        <div>
          <h3 className="list-title">Atrofdagi eng yaqin joylar</h3>
          <span className="list-count">{displayedPlaces.length} ta manzil topildi</span>
        </div>
        <button
          type="button"
          className={`filter-247-btn ${filter247 ? 'active' : ''}`}
          onClick={() => setFilter247(!filter247)}
        >
          {filter247 ? '✓ Faqat 24/7' : '🌙 24/7 Filtrlash'}
        </button>
      </div>

      {/* Scrollable List */}
      <div className="places-scroll-list">
        {displayedPlaces.length === 0 ? (
          <div className="empty-state">
            <p>Atrofingizda ushbu parametr bo‘yicha joylar topilmadi.</p>
          </div>
        ) : (
          displayedPlaces.map((place, index) => {
            const isSelected = selectedPlace?.id === place.id;
            return (
              <div
                key={place.id || index}
                className={`place-item-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectPlace(place)}
              >
                <div className="place-item-left">
                  <div className="place-index-badge">{index + 1}</div>
                  <div className="place-item-info">
                    <h4 className="place-name">{place.name}</h4>
                    <div className="place-tags-row">
                      <span className="place-tag-status">🟢 Ochiq</span>
                      <span className="place-tag-rating">⭐ 4.8</span>
                      <span className="place-tag-time">~3 daqiqa piyoda</span>
                    </div>
                  </div>
                </div>

                <div className="place-item-right">
                  <span className="place-dist-badge">{place.formattedDistance || `${(index + 1) * 120} m`}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
