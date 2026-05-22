import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { MapPin, Store, CheckCircle } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';
import { useOrderContext } from '../context/OrderContext';

// --- Leaflet Setup ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createLeafletIcon = (iconComponent, color) => {
    const html = ReactDOMServer.renderToString(
        <div style={{ color: color, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
            {iconComponent}
        </div>
    );
    return new L.DivIcon({
        html: html,
        className: 'custom-leaflet-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

const warehouseIconLeaflet = createLeafletIcon(<Store size={32} fill="#4F46E5" />, '#4F46E5');
const orderIconLeaflet = createLeafletIcon(<MapPin size={32} fill="#10B981" />, '#10B981');

const LeafletRouting = ({ clusters }) => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const container = map.getContainer();
        const routingControls = container.querySelectorAll('.leaflet-routing-container');
        routingControls.forEach(c => c.remove());

        if (clusters.length > 0) {
            const cluster = clusters[0]; // Visualize first cluster
            const waypoints = [];

            // Mock start if no coords
            const startLat = 10.762622;
            const startLng = 106.660172;
            waypoints.push(L.latLng(startLat, startLng));

            cluster.orders.forEach(order => {
                // Use order coords if available (from Track Asia optimization), else mock
                const lat = order.lat || (startLat + (parseInt(order.id) % 100) * 0.001 - 0.05);
                const lng = order.lng || (startLng + (parseInt(order.id) % 100) * 0.001 + 0.05);
                waypoints.push(L.latLng(lat, lng));
            });

            const routingControl = L.Routing.control({
                waypoints: waypoints,
                lineOptions: { styles: [{ color: '#4F46E5', weight: 4 }] },
                show: false,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: true,
                createMarker: function () { return null; } // We use our own markers
            }).addTo(map);

            return () => {
                try { map.removeControl(routingControl); } catch (e) { }
            };
        }
    }, [map, clusters]);

    return null;
};

const MapView = ({ clusters, warehouses }) => {
    const { config } = useOrderContext();
    const hasTrackAsiaKey = !!config.trackAsiaApiKey;

    return (
        <div className="w-full h-full rounded-xl overflow-hidden border border-[var(--border)] shadow-sm relative z-0">
            <MapContainer center={[10.762622, 106.660172]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LeafletRouting clusters={clusters} />

                {warehouses.map((w, i) => (
                    <Marker key={`w-${i}`} position={[10.762622, 106.660172]} icon={warehouseIconLeaflet}>
                        <Popup>{w.address || 'Warehouse'}</Popup>
                    </Marker>
                ))}

                {/* Draw markers for orders if they have coords */}
                {clusters.flatMap(c => c.orders).map(order => {
                    if (order.lat && order.lng) {
                        return (
                            <Marker key={order.id} position={[order.lat, order.lng]} icon={orderIconLeaflet}>
                                <Popup>{order.address}</Popup>
                            </Marker>
                        )
                    }
                    return null;
                })}
            </MapContainer>

            <div className="absolute bottom-4 left-4 z-[1000] bg-white p-3 rounded-lg shadow-lg text-xs">
                <div className="flex items-center gap-2 mb-1">
                    {hasTrackAsiaKey ? (
                        <>
                            <CheckCircle size={14} className="text-green-500" />
                            <span className="font-bold text-green-700">Track Asia Connected</span>
                        </>
                    ) : (
                        <>
                            <MapPin size={14} className="text-gray-400" />
                            <span className="font-bold text-gray-600">Map View</span>
                        </>
                    )}
                </div>
                <p className="text-gray-500">
                    {hasTrackAsiaKey ? 'Using Track Asia for Optimization' : 'Configure Track Asia API Key'}
                </p>
            </div>
        </div>
    );
};

export default MapView;
