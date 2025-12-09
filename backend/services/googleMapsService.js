// Google Maps Service
// Handles interactions with Google Places API for finding suppliers

const axios = require('axios');

class GoogleMapsService {
    constructor() {
        this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
        if (!this.apiKey) {
            console.warn('⚠️ GOOGLE_MAPS_API_KEY is not set. Google Maps features will not work.');
        }
    }

    // Search for places using Text Search API
    async searchPlaces(keyword) {
        if (!this.apiKey) {
            throw new Error('GOOGLE_MAPS_API_KEY is not set');
        }

        try {
            console.log(`🗺️ Google Maps: Searching for "${keyword}"...`);

            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/place/textsearch/json`,
                {
                    params: {
                        query: keyword,
                        key: this.apiKey,
                        language: 'th',
                        region: 'th' // Prioritize results in Thailand
                    }
                }
            );

            if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
                throw new Error(`Google Maps API error: ${response.data.status} - ${response.data.error_message || 'Unknown error'}`);
            }

            const results = response.data.results || [];
            console.log(`✅ Found ${results.length} places for "${keyword}"`);

            // Transform to our format
            return results.map(place => this.formatPlace(place));
        } catch (error) {
            console.error('❌ Google Maps Search error:', error.message);
            throw error;
        }
    }

    // Format Google Place result to our Supplier structure
    formatPlace(place) {
        return {
            name: place.name,
            location: place.formatted_address,
            coords: {
                lat: place.geometry?.location?.lat,
                lng: place.geometry?.location?.lng
            },
            placeId: place.place_id,
            rating: place.rating,
            userRatingsTotal: place.user_ratings_total,
            types: place.types,
            openNow: place.opening_hours?.open_now
        };
    }

    // Get detailed info (like phone number, website) for a specific place
    async getPlaceDetails(placeId) {
        if (!this.apiKey) {
            throw new Error('GOOGLE_MAPS_API_KEY is not set');
        }

        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/place/details/json`,
                {
                    params: {
                        place_id: placeId,
                        fields: 'name,formatted_address,formatted_phone_number,international_phone_number,website,opening_hours,geometry,rating,user_ratings_total,reviews,types',
                        key: this.apiKey,
                        language: 'th'
                    }
                }
            );

            if (response.data.status !== 'OK') {
                throw new Error(`Google Maps Details error: ${response.data.status}`);
            }

            return response.data.result;
        } catch (error) {
            console.error(`❌ Google Maps Details error for ${placeId}:`, error.message);
            return null;
        }
    }
}

module.exports = new GoogleMapsService();
