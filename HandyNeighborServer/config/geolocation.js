const axios = require('axios');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GEOCODING_API_URL = `https://maps.googleapis.com/maps/api/geocode/json`;

async function getCoordinatesFromPostalCode(postalCode) {
    try {
        const response = await axios.get(GEOCODING_API_URL, {
            params: {
                address: postalCode,
                key: GOOGLE_MAPS_API_KEY,
            },
        });

        if (response.data.status !== 'OK') {
            throw new Error(`Geocoding API error: ${response.data.status}`);
        }

        const { lat, lng } = response.data.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
    } catch (error) {
        console.error('Error fetching coordinates:', error.message);
        return null;
    }
}

module.exports = { getCoordinatesFromPostalCode };
