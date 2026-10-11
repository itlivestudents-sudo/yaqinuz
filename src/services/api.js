export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
 }

export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds) {
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return '1 daqiqadan kam';
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remMinutes = minutes % 60;
    return `${hours} soat ${remMinutes > 0 ? remMinutes + ' daqiqa' : ''}`;
  }
  return `${minutes} daqiqa`;
}
function getDefaultCategoryName(category) {
  switch (category) {
    case 'shop':
      return 'Do‘kon';
    case 'pharmacy':
      return 'Dorixona';
    case 'cafe':
      return 'Kafe';
    case 'fuel':
      return 'Yoqilg‘i shoxobchasi';
    case 'mosque':
      return 'Masjid';
    case 'bank':
      return 'Bank';
    default:
      return 'Joy';
  }
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

async function runOverpassQuery(query) {
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(endpoint, {
        method: 'POST',
        body: query,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Continue to next endpoint or fallback
    }
  }
  return null;
}

// Nominatim OpenStreetMap fallback
async function fetchNominatimPlaces(category, lat, lng, delta = 0.08) {
  const queryParams = {
    shop: 'q=supermarket',
    pharmacy: 'amenity=pharmacy',
    cafe: 'amenity=cafe',
    fuel: 'amenity=fuel',
    mosque: 'amenity=place_of_worship',
    bank: 'amenity=bank'
  };

  const param = queryParams[category] || 'q=' + encodeURIComponent(category);
  const left = lng - delta;
  const right = lng + delta;
  const top = lat + delta;
  const bottom = lat - delta;

  const url = `https://nominatim.openstreetmap.org/search?format=json&${param}&limit=35&viewbox=${left},${top},${right},${bottom}&bounded=1`;

  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item, index) => {
      const pLat = parseFloat(item.lat);
      const pLon = parseFloat(item.lon);
      const rawName = item.name || (item.display_name ? item.display_name.split(',')[0].trim() : getDefaultCategoryName(category));

      return {
        id: item.place_id || `nom_${index}`,
        name: rawName || getDefaultCategoryName(category),
        lat: pLat,
        lon: pLon,
        category
      };
    });
  } catch {
    return [];
  }
}

export async function fetchRealPlaces(category, lat, lng, radius = 4000) {
  let places = [];
  const seenCoords = new Set();

  // 1-urinish: Overpass API
  let tagQuery = '';
  if (category === 'shop') {
    tagQuery = `
      node["shop"~"supermarket|convenience|grocery|department_store|general"](around:${radius}, ${lat}, ${lng});
      way["shop"~"supermarket|convenience|grocery|department_store|general"](around:${radius}, ${lat}, ${lng});
    `;
  } else if (category === 'pharmacy') {
    tagQuery = `
      node["amenity"="pharmacy"](around:${radius}, ${lat}, ${lng});
      way["amenity"="pharmacy"](around:${radius}, ${lat}, ${lng});
    `;
  } else if (category === 'cafe') {
    tagQuery = `
      node["amenity"="cafe"](around:${radius}, ${lat}, ${lng});
      way["amenity"="cafe"](around:${radius}, ${lat}, ${lng});
    `;
  } else if (category === 'fuel') {
    tagQuery = `
      node["amenity"="fuel"](around:${radius}, ${lat}, ${lng});
      way["amenity"="fuel"](around:${radius}, ${lat}, ${lng});
    `;
  } else if (category === 'mosque') {
    tagQuery = `
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius}, ${lat}, ${lng});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius}, ${lat}, ${lng});
      node["amenity"="place_of_worship"](around:${radius}, ${lat}, ${lng});
      way["amenity"="place_of_worship"](around:${radius}, ${lat}, ${lng});
    `;
  } else if (category === 'bank') {
    tagQuery = `
      node["amenity"~"bank|atm"](around:${radius}, ${lat}, ${lng});
      way["amenity"~"bank|atm"](around:${radius}, ${lat}, ${lng});
    `;
  }

  const query = `[out:json][timeout:15];(${tagQuery});out center 35;`;

  try {
    const data = await runOverpassQuery(query);
    const elements = data?.elements || [];

    for (const el of elements) {
      const pLat = el.lat || el.center?.lat;
      const pLon = el.lon || el.center?.lon;
      if (!pLat || !pLon) continue;

      const coordKey = `${pLat.toFixed(4)},${pLon.toFixed(4)}`;
      if (seenCoords.has(coordKey)) continue;
      seenCoords.add(coordKey);

      const dist = calculateDistance(lat, lng, pLat, pLon);
      const tags = el.tags || {};
      const name =
        tags['name:uz'] ||
        tags.name ||
        tags['name:ru'] ||
        tags['name:en'] ||
        tags.brand ||
        tags.operator ||
        getDefaultCategoryName(category);

      places.push({
        id: el.id,
        name,
        lat: pLat,
        lon: pLon,
        distanceMeters: dist,
        formattedDistance: formatDistance(dist),
        category
      });
    }
  } catch {
    // Agar Overpass ishlamasa, pastda Nominatim orqali davom etadi
  }

  // 2-urinish: Agar Overpass natija bermasa, Nominatim orqali qidirish
  if (places.length === 0) {
    let nomPlaces = await fetchNominatimPlaces(category, lat, lng, 0.07);
    if (nomPlaces.length === 0) {
      nomPlaces = await fetchNominatimPlaces(category, lat, lng, 0.15); // Katta radiusda
    }

    for (const p of nomPlaces) {
      const coordKey = `${p.lat.toFixed(4)},${p.lon.toFixed(4)}`;
      if (seenCoords.has(coordKey)) continue;
      seenCoords.add(coordKey);

      const dist = calculateDistance(lat, lng, p.lat, p.lon);
      places.push({
        ...p,
        distanceMeters: dist,
        formattedDistance: formatDistance(dist)
      });
    }
  }

  // Masofa bo'yicha saralash
  places.sort((a, b) => a.distanceMeters - b.distanceMeters);
  return places;
}

export async function fetchRealRoute(startLat, startLng, destLat, destLng) {
  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Marshrutni olishda xatolik yuz berdi');
  }
  const data = await response.json();
  if (!data.routes || data.routes.length === 0) {
    throw new Error('Tanlangan joygacha yo‘l topilmadi');
  }
  const route = data.routes[0];
  const polyline = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

  return {
    polyline,
    distanceMeters: route.distance,
    formattedDistance: formatDistance(route.distance),
    durationSeconds: route.duration,
    formattedDuration: formatDuration(route.duration)
  };
}
