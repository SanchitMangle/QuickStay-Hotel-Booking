// A dictionary of default coordinate fallback values for popular cities
const FALLBACK_COORDINATES = {
    'new york': { lat: 40.7128, lng: -74.0060 },
    'london': { lat: 51.5074, lng: -0.1278 },
    'dubai': { lat: 25.2048, lng: 55.2708 },
    'singapore': { lat: 1.3521, lng: 103.8198 },
    'paris': { lat: 48.8566, lng: 2.3522 },
    'tokyo': { lat: 35.6762, lng: 139.6503 }
};

export const geocodeAddress = async (address, city) => {
    if (!address && !city) return null;

    const query = [address, city].filter(Boolean).join(', ');
    
    try {
        // Use OpenStreetMap Nominatim geocoding API
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
            {
                headers: {
                    'User-Agent': 'QuickStay-Hotel-Booking-App'
                }
            }
        );

        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
            }
        }
    } catch (error) {
        console.error('Geocoding error:', error);
    }

    // Fallback to city coordinates if the API fails or no result is found
    if (city) {
        const lowerCity = city.toLowerCase().trim();
        for (const [key, value] of Object.entries(FALLBACK_COORDINATES)) {
            if (lowerCity.includes(key) || key.includes(lowerCity)) {
                return value;
            }
        }
    }

    // Default to New York if everything else fails
    return FALLBACK_COORDINATES['new york'];
};
