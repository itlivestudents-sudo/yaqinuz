import React, { useState } from 'react';
import { CategorySelector } from './components/CategorySelector';
import { MapView } from './components/MapView';
import { PlacesList } from './components/PlacesList';
import { fetchRealPlaces, fetchRealRoute } from './services/api';
import './App.css';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [error, setError] = useState(null);

  // Category Tanlanganda: Joylashuv olish -> Real joylarni qidirish
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setSelectedPlace(null);
    setRouteData(null);
    setError(null);
    setPlaces([]);

    if (!navigator.geolocation) {
      setError('Brauzeringiz Geolocation xizmatini qo‘llab-quvvatlamaydi.');
      return;
    }

    setLoading(true);
    setLoadingMessage('Joylashuvingiz aniqlanmoqda...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setLoadingMessage('Eng yaqin haqiqiy joylar qidirilmoqda...');

        try {
          const fetchedPlaces = await fetchRealPlaces(category.id, coords.lat, coords.lng);
          setPlaces(fetchedPlaces);
          if (fetchedPlaces.length > 0) {
            setSelectedPlace(fetchedPlaces[0]);
          }
        } catch (err) {
          setError(err.message || 'Joylar ro‘yxatini yuklashda xatolik yuz berdi.');
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        setLoading(false);
        if (geoError.code === 1) {
          setError('Iltimos, joylashuvga (GPS) ruxsat bering.');
        } else if (geoError.code === 2) {
          setError('Joylashuvingizni aniqlab bo‘lmadi.');
        } else {
          setError('Joylashuvni aniqlash vaqti tugadi.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Yo'lni ko'rsatish
  const handleShowRoute = async (place) => {
    if (!userLocation || !place) return;

    setLoadingRoute(true);
    setError(null);

    try {
      const route = await fetchRealRoute(
        userLocation.lat,
        userLocation.lng,
        place.lat,
        place.lon
      );
      setRouteData(route);
    } catch (err) {
      setError(err.message || 'Haqiqiy yo‘nalishni hisoblab bo‘lmadi.');
    } finally {
      setLoadingRoute(false);
    }
  };

  // Joy tanlanganda
  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
    // Agar oldingi marshrut mavjud bo'lsa, tozalaymiz
    if (routeData) {
      setRouteData(null);
    }
  };

  // Marshrutni tozalash
  const handleClearRoute = () => {
    setRouteData(null);
  };

  // Bosh sahifaga qaytish
  const handleBackToHome = () => {
    setSelectedCategory(null);
    setPlaces([]);
    setSelectedPlace(null);
    setRouteData(null);
    setError(null);
  };

  return (
    <div className="app-layout">
      {/* 1-bosqich: Bosh sahifa (Faqat "Sizga nima kerak?" va 4 ta kategoriya) */}
      {!selectedCategory && (
        <main className="main-center">
          <CategorySelector onSelectCategory={handleSelectCategory} />
        </main>
      )}

      {/* Yuklanish / Aniqlanish jarayoni */}
      {loading && (
        <div className="status-overlay">
          <div className="status-card">
            <div className="spinner"></div>
            <p className="status-text">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* Xatolik xabari */}
      {error && !loading && (
        <div className="error-toast">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            className="error-dismiss-btn"
            onClick={() => setError(null)}
          >
            Tushundim
          </button>
        </div>
      )}

      {/* 2-bosqich: Xarita va Joylar ko'rinishi */}
      {selectedCategory && !loading && (
        <div className="map-screen">
          {/* Chap / Pastki Panel */}
          <PlacesList
            category={selectedCategory}
            places={places}
            selectedPlace={selectedPlace}
            routeData={routeData}
            loadingRoute={loadingRoute}
            onSelectPlace={handleSelectPlace}
            onShowRoute={handleShowRoute}
            onBack={handleBackToHome}
            onClearRoute={handleClearRoute}
          />

          {/* O'ng / Asosiy Xarita */}
          <div className="map-area">
            <MapView
              userLocation={userLocation}
              places={places}
              selectedPlace={selectedPlace}
              routeData={routeData}
              category={selectedCategory}
              onSelectPlace={handleSelectPlace}
            />
          </div>
        </div>
      )}
    </div>
  );
}
