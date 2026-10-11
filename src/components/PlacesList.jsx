import React from 'react';

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
}) {
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
          <span>Bosh sahifa</span>
        </button>
      </div>

      {/* Route Info Banner (if route is active) */}
      {routeData && (
        <div className="route-info-box">
          <div className="route-info-details">
            <div className="route-stat">
              <span className="route-stat-label">Yo‘l masofasi:</span>
              <span className="route-stat-value">{routeData.formattedDistance}</span>
            </div>
            <div className="route-stat">
              <span className="route-stat-label">Taxminiy vaqt:</span>
              <span className="route-stat-value">{routeData.formattedDuration}</span>
            </div>
          </div>
          <button type="button" className="clear-route-btn" onClick={onClearRoute}>
            Marshrutni yopish
          </button>
        </div>
      )}

      {/* Selected Place Action Area */}
      {selectedPlace && (
        <div className="selected-place-banner">
          <div className="selected-place-details">
            <h3 className="selected-name">{selectedPlace.name}</h3>
            <span className="selected-dist">{selectedPlace.formattedDistance}</span>
          </div>

          <div className="action-buttons-group">
            <button
              type="button"
              className="show-route-btn"
              disabled={loadingRoute}
              onClick={() => onShowRoute(selectedPlace)}
            >
              {loadingRoute ? 'Yo‘l hisoblanmoqda...' : '📍 Xaritada ko‘rish'}
            </button>

            {/* Google Maps Piyoda navigatsiyasi */}
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
            </div>
          </div>
        </div>
      )}

      {/* Places List Title */}
      <div className="list-title-row">
        <h3 className="list-title">Eng yaqin joylar</h3>
        <span className="list-count">{places.length} ta topildi</span>
      </div>

      {/* List of Places */}
      <div className="places-scroll-list">
        {places.length === 0 ? (
          <div className="empty-state">
            <p>Atrofingizda ushbu turdagi joylar topilmadi.</p>
          </div>
        ) : (
          places.map((place, index) => {
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
                  </div>
                </div>

                <div className="place-item-right">
                  <span className="place-dist-badge">{place.formattedDistance}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
