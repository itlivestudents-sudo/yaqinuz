import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// SVG Marker Icons
function createUserIcon() {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div class="user-pin-wrapper">
        <div class="user-pin-pulse"></div>
        <div class="user-pin-core"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function createPlaceIcon(isSelected, category) {
  const iconMap = {
    shop: '🛒',
    pharmacy: '💊',
    cafe: '☕',
    fuel: '⛽',
  };
  const emoji = iconMap[category] || '📍';

  return L.divIcon({
    className: `custom-place-marker ${isSelected ? 'is-selected' : ''}`,
    html: `
      <div class="place-pin ${isSelected ? 'active-pin' : ''}">
        <span class="pin-emoji">${emoji}</span>
      </div>
    `,
    iconSize: isSelected ? [38, 46] : [32, 40],
    iconAnchor: isSelected ? [19, 44] : [16, 38],
    popupAnchor: [0, -38]
  });
}

export function MapView({ userLocation, places, selectedPlace, routeData, onSelectPlace, category }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routeLayerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = userLocation?.lat || 41.311081; // Default Tashkent fallback if none
      const initialLng = userLocation?.lng || 69.240562;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.featureGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers (User + Places)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const bounds = [];

    // Add User Marker
    if (userLocation) {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: createUserIcon(),
        zIndexOffset: 1000,
      });
      userMarker.bindPopup('<strong>Siz shu yerdasiz</strong>');
      markersLayer.addLayer(userMarker);
      bounds.push([userLocation.lat, userLocation.lng]);
    }

    // Add Places Markers
    if (places && places.length > 0) {
      places.forEach((place) => {
        const isSelected = selectedPlace?.id === place.id;
        const marker = L.marker([place.lat, place.lon], {
          icon: createPlaceIcon(isSelected, category?.id || place.category),
          zIndexOffset: isSelected ? 900 : 100,
        });

        marker.on('click', () => {
          onSelectPlace(place);
        });

        marker.bindPopup(`
          <div class="map-popup-card">
            <strong>${place.name}</strong>
            <div class="popup-distance">Masofa: ${place.formattedDistance}</div>
          </div>
        `);

        markersLayer.addLayer(marker);
        bounds.push([place.lat, place.lon]);
      });
    }

    // Adjust view if no active route
    if (!routeData && bounds.length > 0) {
      if (selectedPlace) {
        map.setView([selectedPlace.lat, selectedPlace.lon], 16, { animate: true });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 15);
      } else {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    }
  }, [userLocation, places, selectedPlace, category, onSelectPlace, routeData]);

  // Update Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !routeLayer) return;

    routeLayer.clearLayers();

    if (routeData && routeData.polyline && routeData.polyline.length > 0) {
      // Glow/Border layer
      const routeBorder = L.polyline(routeData.polyline, {
        color: '#1d4ed8',
        weight: 8,
        opacity: 0.5,
        lineCap: 'round',
        lineJoin: 'round',
      });

      // Main line
      const routeLine = L.polyline(routeData.polyline, {
        color: '#3b82f6',
        weight: 5,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
      });

      routeLayer.addLayer(routeBorder);
      routeLayer.addLayer(routeLine);

      // Fit route bounds nicely
      map.fitBounds(routeLine.getBounds(), { padding: [60, 60] });
    }
  }, [routeData]);

  return <div ref={mapContainerRef} className="map-view-container" />;
}
