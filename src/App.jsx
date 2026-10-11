import React, { useState, useEffect } from 'react';
import { CategorySelector } from './components/CategorySelector';
import { MapView } from './components/MapView';
import { PlacesList } from './components/PlacesList';
import { LoginModal } from './components/LoginModal';
import { fetchRealPlaces, fetchRealRoute } from './services/api';
import './App.css';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('yaqin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
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

    const searchPlaces = async (coords) => {
      setLoading(true);
      setLoadingMessage('Eng yaqin joylar qidirilmoqda...');
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
    };

    // Agar foydalanuvchi joylashuvi avval aniqlangan bo'lsa, qayta kutib turmasdan darhol qidiradi
    if (userLocation) {
      searchPlaces(userLocation);
      return;
    }

    if (!navigator.geolocation) {
      setError('Brauzeringiz Geolocation xizmatini qo‘llab-quvvatlamaydi.');
      return;
    }

    setLoading(true);
    setLoadingMessage('Joylashuvingiz aniqlanmoqda...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        searchPlaces(coords);
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
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
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

  const handleLogout = () => {
    localStorage.removeItem('yaqin_user');
    setUser(null);
  };

  return (
    <div className="app-layout">
      {/* Agar foydalanuvchi tizimga kirmagan bo'lsa, Login oyna ko'rsatiladi */}
      {!user && <LoginModal onLogin={(userData) => setUser(userData)} />}

      {/* Foydalanuvchi profili va chiqish tugmasi */}
      {user && (
        <header className="top-user-bar">
          <div className="user-welcome">
            <span className="user-icon">👤</span>
            <span>Salom, <strong>{user.name}</strong></span>
          </div>

          <button type="button" onClick={handleLogout} className="logout-btn" title="Chiqish">
            Chiqish 🚪
          </button>
        </header>
      )}

      {/* 1-bosqich: Bosh sahifa (Faqat "Sizga nima kerak?" va kategoriyalar) */}
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
            routeData={routeData ? { ...routeData, userLat: userLocation?.lat, userLng: userLocation?.lng } : { userLat: userLocation?.lat, userLng: userLocation?.lng }}
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
