/**
 * Helper functions for Track Asia API
 * Documentation: https://docs.track-asia.com/
 */

const BASE_URL = 'https://maps.track-asia.com';

/**
 * Geocode an address to coordinates
 * @param {string} address 
 * @param {string} apiKey 
 * @returns {Promise<{lat: number, lng: number}>}
 */
export const geocode = async (address, apiKey) => {
    try {
        // Using Search API v1
        const url = `${BASE_URL}/api/v1/search?text=${encodeURIComponent(address)}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].geometry.coordinates;
            return { lat, lng };
        }
        throw new Error('Address not found');
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
};

/**
 * Calculate optimal route using Track Asia VRP API
 * @param {Object} warehouse { address, lat, lng }
 * @param {Array} orders [{ id, address, lat, lng, ... }]
 * @param {string} apiKey 
 */
export const optimizeRoute = async (warehouse, orders, apiKey) => {
    try {
        // 1. Ensure all points have coordinates
        // If warehouse missing coords, geocode it
        let warehouseCoords = { lat: warehouse.lat, lng: warehouse.lng };
        if (!warehouseCoords.lat || !warehouseCoords.lng) {
            const coords = await geocode(warehouse.address, apiKey);
            if (coords) warehouseCoords = coords;
            else throw new Error('Could not geocode warehouse address');
        }

        // If orders missing coords, geocode them (in parallel)
        const ordersWithCoords = await Promise.all(orders.map(async (order) => {
            if (order.lat && order.lng) return order;
            const coords = await geocode(order.address, apiKey);
            return coords ? { ...order, ...coords } : order;
        }));

        const validOrders = ordersWithCoords.filter(o => o.lat && o.lng);

        if (validOrders.length === 0) return { sortedOrders: [], totalDistance: 0, totalDuration: 0 };

        // 2. Construct VRP Payload
        // Jobs (Orders)
        const jobs = validOrders.map(order => ({
            id: parseInt(order.id),
            location: [order.lng, order.lat],
            service: 300, // 5 mins service time per stop
        }));

        // Vehicle (Shipper) - Single vehicle for this cluster
        const vehicle = {
            id: 1,
            profile: 'car',
            start: [warehouseCoords.lng, warehouseCoords.lat],
            end: [warehouseCoords.lng, warehouseCoords.lat], // Return to warehouse
            capacity: [100], // Arbitrary high capacity
        };

        const payload = {
            jobs: jobs,
            vehicles: [vehicle],
            options: { g: true } // Return geometry?
        };

        // 3. Call VRP API
        const response = await fetch(`${BASE_URL}/api/v1/vrp?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];

            // Parse steps to sort orders
            // Steps include: start -> job -> job -> end
            const steps = route.steps;
            const sortedIds = steps
                .filter(step => step.type === 'job')
                .map(step => step.id);

            const sortedOrders = sortedIds.map(id => validOrders.find(o => parseInt(o.id) === id)).filter(Boolean);

            return {
                sortedOrders,
                totalDistance: (route.distance / 1000).toFixed(1), // meters -> km
                totalDuration: Math.round(route.duration / 60), // seconds -> minutes
                geometry: route.geometry // Encoded polyline usually
            };
        } else {
            throw new Error('No solution found');
        }

    } catch (error) {
        console.error('Track Asia VRP Error:', error);
        throw error;
    }
};

/**
 * Get Directions (Polyline) between two points
 * @param {Object} origin { lat, lng }
 * @param {Object} dest { lat, lng }
 * @param {string} apiKey 
 */
export const getDirections = async (origin, dest, apiKey) => {
    try {
        const url = `${BASE_URL}/route/v2/directions/json?origin=${origin.lat},${origin.lng}&destination=${dest.lat},${dest.lng}&mode=driving&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
            return data.routes[0].geometry; // Encoded polyline
        }
        return null;
    } catch (error) {
        console.error('Directions Error:', error);
        return null;
    }
};
