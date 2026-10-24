import React from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';

type MapViewProps = {
  userLocation?: { lat: number; lng: number };
  places: Array<{ id: string; lat: number; lng: number; name: string }>;
  selectedPlace?: { lat: number; lng: number } | null;
};

export default function MapView({ userLocation, places, selectedPlace }: MapViewProps) {
  const center = selectedPlace
    ? [selectedPlace.lat, selectedPlace.lng]
    : userLocation
    ? [userLocation.lat, userLocation.lng]
    : [41.311081, 69.240562];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <YMaps>
        <Map
          key={center.join(',')}
          defaultState={{
            center,
            zoom: 14,
            controls: ['zoomControl', 'fullscreenControl'],
          }}
          width="100%"
          height="100%"
          style={{ width: '100%', height: '100%' }}
        >
          {userLocation && (
            <Placemark
              geometry={[userLocation.lat, userLocation.lng]}
              properties={{
                hintContent: 'Sizning joylashuvingiz',
                balloonContent: '📍 Siz turgan joy',
              }}
              options={{ preset: 'islands#geolocationIcon' }}
            />
          )}

          {places.map((p) => {
            const isSelected =
              selectedPlace &&
              Math.abs(p.lat - selectedPlace.lat) < 0.0001 &&
              Math.abs(p.lng - selectedPlace.lng) < 0.0001;

            return (
              <Placemark
                key={p.id}
                geometry={[p.lat, p.lng]}
                properties={{
                  hintContent: p.name,
                  balloonContent: `<strong>${p.name}</strong><br/>⭐ 4.9 | 24/7 Ochiq`,
                }}
                options={{
                  preset: isSelected ? 'islands#redIcon' : 'islands#blueIcon',
                }}
              />
            );
          })}
        </Map>
      </YMaps>
    </div>
  );
}
