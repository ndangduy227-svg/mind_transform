import React, { useState } from 'react';
import { useOrderContext } from '../context/OrderContext';
import MapView from '../components/MapView';
import ClusterList from '../components/ClusterList';
import { Zap, Printer } from 'lucide-react';
import { printCluster } from '../utils/printHelper';

const RouteDashboard = () => {
    const { orders, config, clusters, setClusters, shippers } = useOrderContext();
    const [isOptimizing, setIsOptimizing] = useState(false);

    const handleOptimize = () => {
        setIsOptimizing(true);

        // Mock Optimization Logic
        setTimeout(() => {
            const selectedOrders = orders.filter(o => o.selected);
            if (selectedOrders.length === 0) {
                alert('No orders selected for optimization.');
                setIsOptimizing(false);
                return;
            }

            // Simple clustering: chunk orders based on maxOrdersPerShipper or default 5
            const chunkSize = parseInt(config.maxOrdersPerShipper) || 5;
            const newClusters = [];

            for (let i = 0; i < selectedOrders.length; i += chunkSize) {
                const chunk = selectedOrders.slice(i, i + chunkSize);
                const totalCOD = chunk.reduce((sum, o) => sum + o.cod, 0);

                // Mock distance: random between 5 and 50 km
                const totalKm = Math.floor(Math.random() * 45) + 5;
                const costPerKm = parseFloat(config.costPerKm) || 5000;
                const baseCost = totalKm * costPerKm;

                newClusters.push({
                    id: Date.now() + i,
                    name: `Cluster #${Math.floor(i / chunkSize) + 1}`,
                    orders: chunk,
                    totalCOD,
                    totalKm,
                    baseCost,
                    extraCost: 0,
                    shipperId: null
                });
            }

            setClusters(newClusters);
            setIsOptimizing(false);
        }, 1500);
    };

    const handlePrint = (cluster) => {
        const shipper = shippers.find(s => s.id.toString() === cluster.shipperId);
        printCluster(cluster, shipper);
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Route Dashboard</h1>
                    <p className="text-[var(--text-gray)] text-sm">Optimize and assign routes</p>
                </div>
                <button
                    onClick={handleOptimize}
                    disabled={isOptimizing}
                    className={`btn-primary ${isOptimizing ? 'opacity-75 cursor-wait' : ''}`}
                >
                    <Zap size={18} className={isOptimizing ? 'animate-pulse' : ''} />
                    {isOptimizing ? 'Optimizing...' : 'Optimize Routes'}
                </button>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                {/* Map Section */}
                <div className="lg:col-span-2 h-full min-h-[400px]">
                    <MapView clusters={clusters} warehouses={config.warehouses} />
                </div>

                {/* Sidebar / Cluster List */}
                <div className="h-full overflow-hidden flex flex-col">
                    <h2 className="font-bold mb-4 flex items-center gap-2">
                        Generated Clusters
                        <span className="text-xs bg-[var(--glass-border)] px-2 py-1 rounded-full text-[var(--text-gray)]">
                            {clusters.length}
                        </span>
                    </h2>
                    <ClusterList onPrint={handlePrint} />
                </div>
            </div>
        </div>
    );
};

export default RouteDashboard;
