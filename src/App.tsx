import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CategorySelector, Category } from './components/CategorySelector';
import { LoginModal, UserData } from './components/LoginModal';
import { ProModal } from './components/ProModal';
import { SosModal } from './components/SosModal';
import ChatBot from './components/ChatBot';
import './App.css';

// ─── Guliston, Sirdaryo Real GPS Manzillar ───────────────────────
export interface PlaceData {
  id: string;
  name: string;
  distMeters: number;
  dist: string;
  walkMinutes: number;
  driveMinutes: number;
  rating: number;
  isOpen247: boolean;
  phone: string;
  address: string;
  lat: number;
  lng: number;
  proDiscount?: string;
}

const GULISTON_CENTER = { lat: 40.4905, lng: 68.7835 }; // Guliston markaz (O‘zbekiston shoh ko‘chasi)

export const GULISTON_PRESETS = [
  { name: '📍 Guliston Markaz (Shoh ko‘cha)', lat: 40.4905, lng: 68.7835 },
  { name: '🛒 Guliston Dehqon Bozori', lat: 40.4925, lng: 68.7855 },
  { name: '🚆 Guliston Vokzali', lat: 40.4975, lng: 68.7865 },
  { name: '🏢 Sayxun ko‘chasi', lat: 40.4938, lng: 68.7820 },
  { name: '🎓 Guliston Davlat Universiteti (GulDU)', lat: 40.4855, lng: 68.7750 },
  { name: '🏥 Viloyat Shifoxonasi hududi', lat: 40.4965, lng: 68.7825 },
];

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

const CATEGORY_DATA: Record<
  string,
  {
    prefix: string;
    items: PlaceData[];
  }
> = {
  shop: {
    prefix: '🛒',
    items: [
      { id: 's-1', name: 'Korzinka Supermarket (Guliston)', distMeters: 180, dist: '180 m', walkMinutes: 2, driveMinutes: 1, rating: 4.9, isOpen247: true, phone: '+998781401414', address: 'O‘zbekiston shoh ko‘chasi, Guliston', lat: 40.4912, lng: 68.7831, proDiscount: '-5% PRO keshbek' },
      { id: 's-2', name: 'Havas Discounter Market', distMeters: 290, dist: '290 m', walkMinutes: 3, driveMinutes: 1, rating: 4.7, isOpen247: false, phone: '+998712050505', address: 'Guliston Dehqon Bozori yonida', lat: 40.4925, lng: 68.7855 },
      { id: 's-3', name: 'Makro Express 24/7 Guliston', distMeters: 420, dist: '420 m', walkMinutes: 5, driveMinutes: 2, rating: 4.8, isOpen247: true, phone: '+998712051234', address: 'Sayxun ko‘chasi, Guliston', lat: 40.4938, lng: 68.7820, proDiscount: '-8% PRO chegirma' },
      { id: 's-4', name: 'Baraka Market Guliston', distMeters: 560, dist: '560 m', walkMinutes: 7, driveMinutes: 2, rating: 4.6, isOpen247: false, phone: '+998672251122', address: 'Mustaqillik ko‘chasi, 12, Guliston', lat: 40.4865, lng: 68.7860 },
      { id: 's-5', name: 'Asia.uz Katta Supermarket', distMeters: 710, dist: '710 m', walkMinutes: 9, driveMinutes: 3, rating: 4.8, isOpen247: true, phone: '+998672253344', address: 'Taraqqiyot ko‘chasi, Guliston', lat: 40.4850, lng: 68.7810, proDiscount: '-7% PRO bonus' },
      { id: 's-6', name: 'Bi1 Supermarket (Guliston 3-mavze)', distMeters: 850, dist: '850 m', walkMinutes: 11, driveMinutes: 3, rating: 4.7, isOpen247: false, phone: '+998672254455', address: 'Guliston 3-mavze, 5-uy', lat: 40.4960, lng: 68.7880 },
      { id: 's-7', name: 'The Mart Oziq-ovqat Do‘koni', distMeters: 990, dist: '990 m', walkMinutes: 13, driveMinutes: 4, rating: 4.9, isOpen247: true, phone: '+998672255566', address: 'Istiqlol ko‘chasi, Guliston', lat: 40.4830, lng: 68.7790, proDiscount: '-10% PRO VIP' },
    ],
  },
  pharmacy: {
    prefix: '💊',
    items: [
      { id: 'ph-1', name: 'Grand Pharm 24/7 (Guliston)', distMeters: 160, dist: '160 m', walkMinutes: 2, driveMinutes: 1, rating: 4.9, isOpen247: true, phone: '+998712000000', address: 'Markaziy Poliklinika ro‘parasida, Guliston', lat: 40.4910, lng: 68.7850, proDiscount: '-12% PRO dori keshbek' },
      { id: 'ph-2', name: 'Oximed Dorixonasi Guliston', distMeters: 310, dist: '310 m', walkMinutes: 4, driveMinutes: 1, rating: 4.8, isOpen247: true, phone: '+998712000001', address: 'O‘zbekiston shoh ko‘chasi, Guliston', lat: 40.4922, lng: 68.7830 },
      { id: 'ph-3', name: 'Arshan Buloq Shifo Med Farm 24/7', distMeters: 480, dist: '480 m', walkMinutes: 6, driveMinutes: 2, rating: 5.0, isOpen247: true, phone: '+998672250002', address: 'Sayxun ko‘chasi, 24-uy, Guliston', lat: 40.4942, lng: 68.7875, proDiscount: '-15% PRO keshbek' },
      { id: 'ph-4', name: '999 Dorixona 24/7 Tezkor', distMeters: 620, dist: '620 m', walkMinutes: 8, driveMinutes: 2, rating: 4.8, isOpen247: true, phone: '+998672259999', address: 'Guliston Dehqon Bozori kirishida', lat: 40.4870, lng: 68.7880 },
      { id: 'ph-5', name: 'Arzon Dori-Darmon Markazi', distMeters: 750, dist: '750 m', walkMinutes: 10, driveMinutes: 3, rating: 4.7, isOpen247: true, phone: '+998672250003', address: 'Mustaqillik ko‘chasi, Guliston', lat: 40.4855, lng: 68.7805, proDiscount: '-10% PRO keshbek' },
      { id: 'ph-6', name: 'Tabib Dorixonasi 24/7', distMeters: 920, dist: '920 m', walkMinutes: 12, driveMinutes: 3, rating: 4.9, isOpen247: true, phone: '+998672257777', address: 'Viloyat Shifoxonasi yonida, Guliston', lat: 40.4965, lng: 68.7825, proDiscount: '-8% PRO keshbek' },
      { id: 'ph-7', name: 'Best Pharm N1 Guliston', distMeters: 1100, dist: '1.1 km', walkMinutes: 14, driveMinutes: 4, rating: 4.6, isOpen247: false, phone: '+998672250004', address: 'Taraqqiyot ko‘chasi, Guliston', lat: 40.4835, lng: 68.7890 },
    ],
  },
  hospital: {
    prefix: '🏥',
    items: [
      { id: 'h-1', name: 'Sirdaryo Viloyat Ko‘p Tarmoqli Shifoxonasi', distMeters: 450, dist: '450 m', walkMinutes: 5, driveMinutes: 2, rating: 4.9, isOpen247: true, phone: '103', address: 'Guliston shahar markazi', lat: 40.4940, lng: 68.7820, proDiscount: 'Navbatsiz qabul' },
      { id: 'h-2', name: 'Guliston Shahar Tez Tibbiy Yordam (103)', distMeters: 650, dist: '650 m', walkMinutes: 8, driveMinutes: 2, rating: 4.8, isOpen247: true, phone: '103', address: 'Sayxun ko‘chasi, Guliston', lat: 40.4865, lng: 68.7850 },
      { id: 'h-3', name: 'Medion Guliston Xususiy Klinikasi', distMeters: 890, dist: '890 m', walkMinutes: 11, driveMinutes: 3, rating: 4.9, isOpen247: false, phone: '+998672251020', address: 'O‘zbekiston ko‘chasi, Guliston', lat: 40.4965, lng: 68.7870, proDiscount: '-10% PRO chegirma' },
      { id: 'h-4', name: 'Guliston Shahar Bolalar Shifoxonasi', distMeters: 1200, dist: '1.2 km', walkMinutes: 15, driveMinutes: 4, rating: 4.8, isOpen247: true, phone: '+998672253003', address: 'Taraqqiyot ko‘chasi, Guliston', lat: 40.4820, lng: 68.7800 },
    ],
  },
  cafe: {
    prefix: '☕',
    items: [
      { id: 'c-1', name: 'Rayhon Milliy Taomlar (Guliston)', distMeters: 190, dist: '190 m', walkMinutes: 2, driveMinutes: 1, rating: 4.9, isOpen247: true, phone: '+998672258888', address: 'Sayxun ko‘chasi, Guliston', lat: 40.4915, lng: 68.7855, proDiscount: '-10% PRO keshbek' },
      { id: 'c-2', name: 'Evos Fast Food Guliston', distMeters: 310, dist: '310 m', walkMinutes: 4, driveMinutes: 1, rating: 4.8, isOpen247: true, phone: '+998712031212', address: 'O‘zbekiston shoh ko‘chasi, Guliston', lat: 40.4925, lng: 68.7835 },
      { id: 'c-3', name: 'Safia Bakery & Qahvaxona', distMeters: 450, dist: '450 m', walkMinutes: 5, driveMinutes: 2, rating: 4.9, isOpen247: false, phone: '+998781134040', address: 'Istiqlol ko‘chasi, Guliston', lat: 40.4945, lng: 68.7865 },
      { id: 'c-4', name: 'Oqtepa Lavash Guliston', distMeters: 590, dist: '590 m', walkMinutes: 7, driveMinutes: 2, rating: 4.7, isOpen247: true, phone: '+998781500030', address: 'Mustaqillik ko‘chasi, Guliston', lat: 40.4860, lng: 68.7865 },
      { id: 'c-5', name: 'Guliston Choyxonasi (Markaziy Osh)', distMeters: 740, dist: '740 m', walkMinutes: 9, driveMinutes: 3, rating: 4.9, isOpen247: false, phone: '+998672250101', address: 'Markaziy Istirohat Bog‘i yonida, Guliston', lat: 40.4850, lng: 68.7820, proDiscount: '-15% PRO keshbek' },
    ],
  },
  fuel: {
    prefix: '⛽',
    items: [
      { id: 'f-1', name: 'UNG Petro Guliston (AI-92 / AI-95)', distMeters: 350, dist: '350 m', walkMinutes: 4, driveMinutes: 1, rating: 4.8, isOpen247: true, phone: '+998672251122', address: 'Toshkent-Guliston trassasi', lat: 40.4930, lng: 68.7895 },
      { id: 'f-2', name: 'Guliston Metan Gaz & EV Zaryad', distMeters: 580, dist: '580 m', walkMinutes: 7, driveMinutes: 2, rating: 4.9, isOpen247: true, phone: '+998672253344', address: 'Aylanma yo‘l, Guliston', lat: 40.4855, lng: 68.7885, proDiscount: '-500 so‘m/kub PRO' },
      { id: 'f-3', name: 'Lukoil Guliston Yevro Zapravka', distMeters: 850, dist: '850 m', walkMinutes: 10, driveMinutes: 3, rating: 4.8, isOpen247: true, phone: '+998672255566', address: 'Sayxun yo‘li, Guliston', lat: 40.4975, lng: 68.7815 },
    ],
  },
  mosque: {
    prefix: '🕌',
    items: [
      { id: 'm-1', name: 'Guliston Jome Masjidi', distMeters: 400, dist: '400 m', walkMinutes: 5, driveMinutes: 2, rating: 5.0, isOpen247: true, phone: '+998672250000', address: 'O‘zbekiston ko‘chasi, Guliston', lat: 40.4935, lng: 68.7825 },
      { id: 'm-2', name: 'Hazrati Ali Jome Masjidi', distMeters: 850, dist: '850 m', walkMinutes: 10, driveMinutes: 3, rating: 5.0, isOpen247: true, phone: '+998672250001', address: 'Sayxun tumani yo‘li, Guliston', lat: 40.4850, lng: 68.7850 },
    ],
  },
  bank: {
    prefix: '🏦',
    items: [
      { id: 'b-1', name: 'Ipak Yo‘li Bankomat 24/7 (Humo / Uzcard / Visa)', distMeters: 120, dist: '120 m', walkMinutes: 1, driveMinutes: 1, rating: 4.9, isOpen247: true, phone: '+998781406900', address: 'Markaziy Bank binosi, Guliston', lat: 40.4908, lng: 68.7840, proDiscount: '0% komissiya' },
      { id: 'b-2', name: 'Kapitalbank Valyuta Ayirboshlash 24/7', distMeters: 270, dist: '270 m', walkMinutes: 3, driveMinutes: 1, rating: 4.8, isOpen247: true, phone: '+998672251515', address: 'Sayxun ko‘chasi, Guliston', lat: 40.4920, lng: 68.7855 },
      { id: 'b-3', name: 'Agrobank Sirdaryo Viloyat Boshqarmasi 24/7', distMeters: 490, dist: '490 m', walkMinutes: 6, driveMinutes: 2, rating: 4.7, isOpen247: true, phone: '+998672258888', address: 'Mustaqillik ko‘chasi, Guliston', lat: 40.4875, lng: 68.7830 },
    ],
  },
  service: {
    prefix: '🔧',
    items: [
      { id: 'sv-1', name: '24/7 Avto Usta & Tezkor Vulkanizatsiya Guliston', distMeters: 230, dist: '230 m', walkMinutes: 3, driveMinutes: 1, rating: 4.8, isOpen247: true, phone: '+998901234567', address: 'Guliston aylanma yo‘li', lat: 40.4920, lng: 68.7870, proDiscount: '-15% PRO servis' },
      { id: 'sv-2', name: 'Tezkor Evakuator Sirdaryo / Guliston 24/7', distMeters: 450, dist: '450 m', walkMinutes: 5, driveMinutes: 2, rating: 4.9, isOpen247: true, phone: '+998991234567', address: 'Guliston shahar bo‘ylab', lat: 40.4880, lng: 68.7820 },
    ],
  },
};

export default function App() {
  const [user, setUser] = useState<UserData | null>(() => {
    try {
      const saved = localStorage.getItem('yaqin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Odatiy holatda PRO ochiq emas — faqat sotib olinganda ochiladi!
  const [isPro, setIsPro] = useState<boolean>(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceData | null>(null);
  const [filter247, setFilter247] = useState(false);
  const [routeMode, setRouteMode] = useState<'walk' | 'drive'>('walk');
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);

  // Joylashuv: GPS yoki Guliston tanlangan nuqtasi
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; name: string }>({
    lat: GULISTON_CENTER.lat,
    lng: GULISTON_CENTER.lng,
    name: '📍 Guliston Markaz',
  });
  const [gpsLoading, setGpsLoading] = useState(false);

  const requestLiveGps = () => {
    if (!navigator.geolocation) {
      alert('Brauzeringizda GPS geolokatsiya qo‘llab-quvvatlanmaydi.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: '🎯 Jonli GPS Joylashuv',
        });
        setGpsLoading(false);
      },
      (err) => {
        console.warn('GPS olishda xato:', err.message);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    // Sahifa ochilganda foydalanuvchining haqiqiy GPS koordinatalarini olish
    requestLiveGps();
  }, []);

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setFilter247(false);
    const data = CATEGORY_DATA[category.id];
    if (data && data.items.length > 0) {
      setSelectedPlace(data.items[0]);
    }
  };

  const handleBackToHome = () => {
    setSelectedCategory(null);
    setSelectedPlace(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('yaqin_user');
    setUser(null);
  };

  const handleLogin = (userData: UserData) => {
    setUser(userData);
  };

  const handleUpgradeSuccess = () => {
    setIsPro(true);
  };

  const handleEmergencyCategory = (type: 'pharmacy' | 'hospital') => {
    const cat: Category =
      type === 'pharmacy'
        ? { id: 'pharmacy', label: '24/7 Dorixonalar', icon: '💊' }
        : { id: 'hospital', label: 'Shifoxonalar (Shoshilinch)', icon: '🏥' };
    handleSelectCategory(cat);
  };

  const categoryData = selectedCategory ? CATEGORY_DATA[selectedCategory.id] : null;
  const rawItems = categoryData ? categoryData.items : [];
  const items = filter247 ? rawItems.filter((it) => it.isOpen247) : rawItems;

  const activePlace = selectedPlace || (items.length > 0 ? items[0] : null);

  // ─── Real GPS Coordinates Direction URL (Guliston Street Level) ──
  const userLat = userLocation.lat;
  const userLng = userLocation.lng;

  // ─── Professional OpenStreetMap (Leaflet) Xaritasi ───────────────
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [userLat, userLng],
      zoom: activePlace ? 15 : 14,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Rasmiy OpenStreetMap (100% bepul, barqaror, hech qachon bloklanmaydi)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Foydalanuvchi joylashuvi: Pulsatsiyali ko'k doira
    L.marker([userLat, userLng], {
      icon: L.divIcon({
        className: 'leaflet-user-pulse-marker',
        html: `<div class="user-pulse-ring"></div><div class="user-pulse-dot"></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      }),
    })
      .addTo(map)
      .bindPopup(`<div style="font-weight:700;font-size:13px;color:#1e293b;">📍 ${userLocation.name} (Siz shu yerdasiz)</div>`);

    if (activePlace) {
      // Manzil markeri: Chiroyli qizil pin + toifa belgisi
      L.marker([activePlace.lat, activePlace.lng], {
        icon: L.divIcon({
          className: 'leaflet-dest-marker',
          html: `<div class="dest-marker-pin">
            <div class="dest-marker-icon">${selectedCategory?.icon || '📍'}</div>
          </div>
          <div class="dest-marker-shadow"></div>`,
          iconSize: [44, 52],
          iconAnchor: [22, 52],
        }),
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-weight:700;font-size:13px;color:#1e293b;">${activePlace.name}</div>
           <div style="color:#64748b;font-size:12px;margin-top:2px;">📍 ${activePlace.address}</div>`
        );

      // OSRM orqali haqiqiy ko'cha marshruti (Professional ko'k chiziq)
      const profile = routeMode === 'drive' ? 'car' : 'foot';
      fetch(
        `https://router.project-osrm.org/route/v1/${profile}/${userLng},${userLat};${activePlace.lng},${activePlace.lat}?overview=full&geometries=geojson`
      )
        .then((r) => r.json())
        .then((data) => {
          if (data.routes && data.routes[0]) {
            const coords = data.routes[0].geometry.coordinates.map(
              (c: [number, number]) => [c[1], c[0]] as [number, number]
            );

            // Tashqi glow chiziq
            L.polyline(coords, {
              color: '#3b82f6',
              weight: 9,
              opacity: 0.35,
              lineJoin: 'round',
              lineCap: 'round',
            }).addTo(map);

            // Asosiy to'q ko'k marshrut chizig'i
            L.polyline(coords, {
              color: '#1d4ed8',
              weight: 5,
              opacity: 0.95,
              lineJoin: 'round',
              lineCap: 'round',
            }).addTo(map);

            map.fitBounds(L.latLngBounds(coords), { padding: [60, 60] });
          }
        })
        .catch(() => {
          // Fallback to'g'ri chiziq
          L.polyline(
            [
              [userLat, userLng],
              [activePlace.lat, activePlace.lng],
            ],
            { color: '#1d4ed8', weight: 4, opacity: 0.85, dashArray: '8 6' }
          ).addTo(map);

          map.fitBounds(
            [
              [userLat, userLng],
              [activePlace.lat, activePlace.lng],
            ],
            { padding: [60, 60] }
          );
        });
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLat, userLng, activePlace?.id, routeMode]);

  // ─── Calculated Trip Details (Foydalanuvchi joylashuvidan dinamik hisoblash) ──
  const calculatedMeters = activePlace ? calculateDistance(userLat, userLng, activePlace.lat, activePlace.lng) : 250;
  const oneWayDistStr = calculatedMeters >= 1000 ? `${(calculatedMeters / 1000).toFixed(1)} km` : `${calculatedMeters} m`;
  const roundTripMeters = calculatedMeters * 2;
  const roundTripDistStr =
    roundTripMeters >= 1000 ? `${((roundTripMeters) / 1000).toFixed(1)} km` : `${roundTripMeters} m`;

  const calcWalkMin = Math.max(1, Math.round(calculatedMeters / 80));
  const calcDriveMin = Math.max(1, Math.round(calculatedMeters / 350));

  const oneWayWalkTime = `${calcWalkMin} daqiqa`;
  const roundTripWalkTime = `${calcWalkMin * 2} daqiqa`;

  const oneWayDriveTime = `${calcDriveMin} daqiqa`;
  const roundTripDriveTime = `${calcDriveMin * 2} daqiqa`;

  return (
    <div className="app-layout">
      {/* Login Screen */}
      {!user && <LoginModal onLogin={handleLogin} />}

      {/* Top Header Bar */}
      {user && (
        <header className="top-user-bar">
          <div className="top-bar-left">
            <span className="user-icon">{user.avatar || '👤'}</span>
            <div className="user-greeting">
              <span className="user-name-text">
                Salom, <strong>{user.name}</strong>
              </span>
              {isPro ? (
                <span className="user-pro-badge">👑 PRO</span>
              ) : (
                <span className="user-free-badge">Oddiy Reja</span>
              )}
            </div>
          </div>

          {/* Markaziy: Foydalanuvchi joylashuvini ko'rsatish va aniq GPS ni sozlash */}
          <div className="top-bar-location-badge">
            <span className="location-pin-icon">📍</span>
            <select
              className="top-location-dropdown"
              value={userLocation.name}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'gps') {
                  requestLiveGps();
                } else {
                  const found = GULISTON_PRESETS.find((p) => p.name === val);
                  if (found) setUserLocation(found);
                }
              }}
            >
              <option value={userLocation.name.startsWith('🎯') ? userLocation.name : 'gps'}>
                {userLocation.name.startsWith('🎯') ? userLocation.name : '🎯 Jonli GPS joylashuvim'}
              </option>
              {GULISTON_PRESETS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="top-gps-refresh-btn"
              onClick={requestLiveGps}
              disabled={gpsLoading}
              title="Jonli GPS ni qayta aniqlash"
            >
              {gpsLoading ? '⏳ Aniqlanmoqda...' : '🎯 Jonli GPS'}
            </button>
          </div>

          <div className="top-bar-actions">
            {/* SOS Emergency button */}
            <button
              type="button"
              className="top-sos-btn"
              onClick={() => setIsSosModalOpen(true)}
              title="Favqulodda yordam"
            >
              🚨 <span className="top-sos-text">SOS 24/7</span>
            </button>

            {/* PRO Upgrade button - Faqat sotib olinsa ochiladi */}
            {!isPro ? (
              <button
                type="button"
                className="top-pro-upgrade-btn"
                style={{ cursor: 'pointer', border: 'none' }}
                onClick={() => setIsProModalOpen(true)}
                title="PRO Rejani xarid qilish"
              >
                👑 <span className="top-pro-text">PRO ga o'tish</span>
              </button>
            ) : (
              <button
                type="button"
                className="top-pro-active-pill"
                style={{ cursor: 'pointer', border: 'none' }}
                onClick={() => setIsProModalOpen(true)}
                title="PRO Reja Faol"
              >
                👑 <span className="top-pro-text">VIP Faol</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="logout-btn"
              title="Tizimdan chiqish"
            >
              🚪
            </button>
          </div>
        </header>
      )}

      {/* 1-Bosqich: Bosh sahifa */}
      {!selectedCategory && (
        <main className="main-center">
          <CategorySelector
            onSelectCategory={handleSelectCategory}
            onOpenSos={() => setIsSosModalOpen(true)}
            onOpenPro={() => setIsProModalOpen(true)}
            isProUser={isPro}
          />
        </main>
      )}

      {/* 2-Bosqich: Haqiqiy Google Xarita + Guliston Marshruti (Split Screen) */}
      {selectedCategory && (
        <div className="embedded-map-screen">
          {/* Chap Panel: Joylar Ro'yxati */}
          <div className="embedded-places-sidebar">
            <div className="sidebar-header-box">
              <button type="button" className="sidebar-back-btn" onClick={handleBackToHome}>
                ← Ortga
              </button>
              <div className="sidebar-cat-pill">
                <span>{selectedCategory.icon}</span>
                <strong>{selectedCategory.label}</strong>
              </div>
            </div>

            <div className="sidebar-filter-row">
              <span className="sidebar-count">{items.length} ta joy (Guliston)</span>
              <button
                type="button"
                className={`sidebar-filter-btn ${filter247 ? 'active' : ''}`}
                onClick={() => setFilter247(!filter247)}
              >
                {filter247 ? '✓ 24/7' : '🌙 24/7'}
              </button>
            </div>

            {/* Scrollable list */}
            <div className="sidebar-items-list">
              {items.map((place) => {
                const isSelected = activePlace?.id === place.id;
                const rTrip =
                  place.distMeters * 2 >= 1000
                    ? `${((place.distMeters * 2) / 1000).toFixed(1)} km`
                    : `${place.distMeters * 2} m`;

                return (
                  <div
                    key={place.id}
                    className={`sidebar-place-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedPlace(place)}
                  >
                    <div className="card-header-line">
                      <h4 className="card-name">{place.name}</h4>
                      <span className="card-dist-badge">{place.dist}</span>
                    </div>

                    <p className="card-address">📍 {place.address}</p>

                    {/* Marshrut hisobi: borish va borib-kelish vaqti */}
                    <div className="card-route-stats-pill">
                      <span>🚶 <strong>{place.walkMinutes} daq</strong> (borish)</span>
                      <span className="route-stat-dot">•</span>
                      <span>🔄 <strong>{place.walkMinutes * 2} daq</strong> (borib-kelish: {rTrip})</span>
                    </div>

                    <div className="card-sub-info">
                      {place.isOpen247 ? (
                        <span className="badge-247">🟢 24/7 Ochiq</span>
                      ) : (
                        <span className="badge-closed">🟡 08:00 - 22:00</span>
                      )}
                      <span className="badge-star">⭐ {place.rating}</span>
                    </div>

                    {place.proDiscount && (
                      <div
                        className="card-pro-banner"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsProModalOpen(true);
                        }}
                      >
                        <span>🏷️ {place.proDiscount}</span>
                        {!isPro && <span className="unlock-pro-tag">PRO</span>}
                      </div>
                    )}

                    <div className="card-buttons-line">
                      <button
                        type="button"
                        className={`select-map-btn ${isSelected ? 'active' : ''}`}
                      >
                        {isSelected ? '✓ Yo‘l chizildi' : '🗺️ Yo‘l chizish'}
                      </button>
                      <a
                        href={`tel:${place.phone}`}
                        className="call-icon-btn"
                        onClick={(e) => e.stopPropagation()}
                        title="Qo‘ng‘iroq qilish"
                      >
                        📞
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* O'ng Panel: Haqiqiy Google Xaritasi (Guliston Ko'chalari) */}
          <div className="embedded-map-container">
            {activePlace && (
              <div className="map-floating-route-dashboard">
                {/* Tepada joy nomi va aniq manzili */}
                <div className="route-dashboard-top">
                  <div className="route-dest-info">
                    <span className="route-dest-icon">{selectedCategory.icon}</span>
                    <div>
                      <h3 className="route-dest-name">{activePlace.name}</h3>
                      <p className="route-dest-address">
                        📍 {activePlace.address} • <span style={{ color: '#38bdf8' }}>Boshlanish: {userLocation.name}</span>
                      </p>
                    </div>
                  </div>

                  {/* Mode switcher: Piyoda vs Avtomobil */}
                  <div className="route-mode-switch">
                    <button
                      type="button"
                      className={`mode-btn ${routeMode === 'walk' ? 'active' : ''}`}
                      onClick={() => setRouteMode('walk')}
                    >
                      🚶 Piyoda ({calcWalkMin} daq)
                    </button>
                    <button
                      type="button"
                      className={`mode-btn ${routeMode === 'drive' ? 'active' : ''}`}
                      onClick={() => setRouteMode('drive')}
                    >
                      🚗 Avtomobil ({calcDriveMin} daq)
                    </button>
                  </div>
                </div>

                {/* Jonli Yo'l Hisobi: Masofa, Vaqt va Borib-kelish */}
                <div className="route-metrics-bar">
                  <div className="metric-box">
                    <span className="metric-label">Bir tomonlama:</span>
                    <strong className="metric-value">{oneWayDistStr}</strong>
                  </div>

                  <div className="metric-box">
                    <span className="metric-label">
                      {routeMode === 'drive' ? '🚗 Avtoda borish:' : '🚶 Piyoda borish:'}
                    </span>
                    <strong className="metric-value green">
                      {routeMode === 'drive' ? oneWayDriveTime : oneWayWalkTime}
                    </strong>
                  </div>

                  <div className="metric-box highlight">
                    <span className="metric-label">🔄 Borib-kelish (jami yo‘l):</span>
                    <strong className="metric-value yellow">
                      {roundTripDistStr} • {routeMode === 'drive' ? roundTripDriveTime : roundTripWalkTime}
                    </strong>
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${activePlace.lat},${activePlace.lng}&travelmode=${routeMode === 'drive' ? 'driving' : 'walking'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="floating-direct-nav-btn"
                  >
                    🚀 Jonli Navigatsiya
                  </a>
                </div>
              </div>
            )}

            {/* Professional Leaflet OpenStreetMap Xaritasi */}
            <div
              ref={mapContainerRef}
              className="google-map-iframe"
              style={{ border: 'none', width: '100%', height: '100%', zIndex: 1 }}
            />
          </div>
        </div>
      )}

      {/* PRO Obuna va To'lov Modali (Click, Payme, Uzum) */}
      <ProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        onUpgradeSuccess={handleUpgradeSuccess}
      />

      {/* SOS Favqulodda Yordam Modali */}
      <SosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        onSelectEmergencyCategory={handleEmergencyCategory}
      />

      {/* AI Floating ChatBot (Gemini 100% tegmasdan ishlashda davom etmoqda) */}
      <ChatBot />
    </div>
  );
}
