/* global google */

/**
 * Calculates the optimal route for a set of orders starting from a warehouse.
 * Uses the Google Maps Directions Service with 'optimizeWaypoints' enabled.
 * 
 * @param {Object} warehouse - The starting point { address: '...' }
 * @param {Array} orders - List of orders { id, address, ... }
 * @returns {Promise} - Resolves with { sortedOrders, totalDistance, totalDuration, routePolyline }
 */
export const calculateOptimalRoute = (warehouse, orders) => {
    return new Promise((resolve, reject) => {
        if (!window.google || !window.google.maps) {
            reject('Google Maps API not loaded');
            return;
        }

        if (!orders || orders.length === 0) {
            resolve({
                sortedOrders: [],
                totalDistance: 0,
                totalDuration: 0,
                routePolyline: []
            });
            return;
        }

        const directionsService = new google.maps.DirectionsService();

        // Convert orders to waypoints
        const waypoints = orders.map(order => ({
            location: order.address,
            stopover: true
        }));

        directionsService.route({
            origin: warehouse.address, // Start at Warehouse
            destination: warehouse.address, // Return to Warehouse (or last stop? Usually return is better for cost, but let's assume last stop for now if user wants. Standard logistics is round trip or A->Z. Let's do A->Z (last order is dest) for now, or better: Warehouse -> Orders -> Warehouse. Let's stick to Warehouse -> Orders (end at last).
            // Actually, standard VRP is often round trip. But for simple delivery, let's let Google optimize the order.
            // To optimize *all* stops, we set origin=Warehouse, destination=Warehouse, and all orders as waypoints.
            destination: warehouse.address,
            waypoints: waypoints,
            optimizeWaypoints: true, // THIS IS THE MAGIC KEY
            travelMode: google.maps.TravelMode.DRIVING,
        }, (response, status) => {
            if (status === 'OK') {
                const route = response.routes[0];
                const waypointOrder = route.waypoint_order;

                // Reorder the orders based on the optimized waypoint_order
                const sortedOrders = waypointOrder.map(index => orders[index]);

                // Calculate totals
                let totalDistance = 0; // in meters
                let totalDuration = 0; // in seconds

                route.legs.forEach(leg => {
                    totalDistance += leg.distance.value;
                    totalDuration += leg.duration.value;
                });

                resolve({
                    sortedOrders,
                    totalDistance: (totalDistance / 1000).toFixed(1), // km
                    totalDuration: Math.round(totalDuration / 60), // minutes
                    overviewPath: route.overview_path // For drawing on map if needed
                });
            } else {
                reject(`Directions request failed due to ${status}`);
            }
        });
    });
};
