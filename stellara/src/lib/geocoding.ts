/**
 * Geocoding utility — converts location text to latitude/longitude
 * using the OpenStreetMap Nominatim API (free, no API key required).
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

/**
 * Geocode a location string to coordinates via Nominatim.
 * Falls back to 0,0 (Greenwich) if geocoding fails so chart generation
 * can still proceed with approximate results.
 */
export async function geocodeLocation(query: string): Promise<GeocodingResult> {
  if (!query.trim()) {
    return { latitude: 51.5074, longitude: -0.1278, displayName: 'London, UK' };
  }

  try {
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
      {
        headers: { 'User-Agent': 'Stellara/1.0 (https://stellera.co)' },
      },
    );

    if (!res.ok) {
      throw new Error(`Nominatim returned ${res.status}`);
    }

    const data = await res.json();

    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }

    // No results — fall back to London
    return { latitude: 51.5074, longitude: -0.1278, displayName: query };
  } catch {
    // Network error — fall back to London
    return { latitude: 51.5074, longitude: -0.1278, displayName: query };
  }
}
