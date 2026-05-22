import React, { useState } from 'react';
import { useOrderContext } from '../context/OrderContext';
import { Printer, CheckCircle, MapPin, Phone, User, ChevronDown, ChevronUp, Rocket, RefreshCw } from 'lucide-react';
import { optimizeRoute } from '../utils/trackAsiaHelper';

const ClusterCard = ({ cluster, shippers, onPrint, onComplete, config }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const { setClusters, clusters } = useOrderContext();

    const handleAssignShipper = (shipperId) => {
        setClusters(clusters.map(c =>
            c.id === cluster.id ? { ...c, shipperId: shipperId } : c
        ));
    };

    const handleOptimize = async (e) => {
        e.stopPropagation();
        if (!config.trackAsiaApiKey) {
            alert('Please configure Track Asia API Key first in the Configuration page!');
            return;
        }

        setIsOptimizing(true);
        try {
            // Use first warehouse or default
            const warehouse = config.warehouses[0] ? { address: config.warehouses[0] } : { address: 'Ho Chi Minh City' };

            const result = await optimizeRoute(warehouse, cluster.orders, config.trackAsiaApiKey);

            setClusters(clusters.map(c =>
                c.id === cluster.id ? {
                    ...c,
                    orders: result.sortedOrders,
                    totalKm: result.totalDistance,
                    // Update cost based on real KM (default 5000 VND/km if not set)
                    baseCost: parseFloat(result.totalDistance) * (parseFloat(config.costPerKm) || 5000)
                } : c
            ));
            alert(`Route optimized! New distance: ${result.totalDistance} km`);
        } catch (error) {
            console.error('Optimization failed:', error);
            alert('Optimization failed: ' + error);
        } finally {
            setIsOptimizing(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: config.currency || 'VND' }).format(amount);
    };

    const totalShipCost = cluster.baseCost + (cluster.extraCost || 0);
    const startPoint = config.warehouses[0] || 'Kho Tổng';

    return (
        <div className="card mb-4 hover:shadow-md transition-shadow duration-200 bg-white">
            {/* Header - Ahamove Style */}
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-start">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-[var(--primary)]">
                        <Rocket size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">Delivery Route #{cluster.id}</h3>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {cluster.orders.length} stops
                            </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                            {cluster.totalKm} km • {formatCurrency(totalShipCost)}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleOptimize}
                        className={`p-2 rounded-full hover:bg-gray-100 text-[var(--primary)] transition-colors ${isOptimizing ? 'animate-spin' : ''}`}
                        title="Optimize Route Sequence (Track Asia)"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-gray-600">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>
            </div>

            {/* Body - Timeline */}
            {isExpanded && (
                <div className="p-4 bg-white">
                    {/* Start Point */}
                    <div className="timeline-item">
                        <div className="timeline-line"></div>
                        <div className="timeline-dot start"></div>
                        <div className="text-sm">
                            <div className="font-semibold text-gray-900">{startPoint}</div>
                            <div className="text-xs text-gray-500">Warehouse / Pickup Point</div>
                        </div>
                    </div>

                    {/* Orders */}
                    {cluster.orders.map((order, index) => (
                        <div key={order.id} className="timeline-item">
                            <div className="timeline-line"></div>
                            <div className="timeline-dot end flex items-center justify-center text-[10px] text-white font-bold">
                                {index + 1}
                            </div>
                            <div className="text-sm group relative">
                                <div className="font-semibold text-gray-900">{order.address}</div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono">
                                        COD: {formatCurrency(order.cod)}
                                    </span>
                                    <span>• {order.name} - {order.phone}</span>
                                </div>
                                {order.note && (
                                    <div className="text-xs text-orange-600 mt-1 italic">
                                        Note: {order.note}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer - Actions */}
            <div className="p-3 bg-gray-50 border-t border-[var(--border)] flex justify-between items-center">
                <div className="w-1/2">
                    <select
                        className="input-field text-xs py-1.5"
                        value={cluster.shipperId || ''}
                        onChange={(e) => handleAssignShipper(e.target.value)}
                    >
                        <option value="">Assign Shipper...</option>
                        {shippers.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.license})</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onPrint(cluster)}
                        className="btn-secondary text-xs py-1.5 px-3"
                    >
                        <Printer size={14} className="mr-1" /> Print
                    </button>
                    <button
                        onClick={() => onComplete(cluster)}
                        className="btn-primary text-xs py-1.5 px-3 bg-green-600 hover:bg-green-700 border-none"
                    >
                        <CheckCircle size={14} className="mr-1" /> Complete
                    </button>
                </div>
            </div>
        </div>
    );
};

const ClusterList = ({ onPrint }) => {
    const { clusters, setClusters, shippers, config, history, setHistory } = useOrderContext();

    const handleComplete = (cluster) => {
        if (window.confirm(`Mark route "${cluster.name || '#' + cluster.id}" as completed?`)) {
            const completedCluster = {
                ...cluster,
                completedAt: new Date().toISOString(),
                shipperName: shippers.find(s => s.id.toString() === cluster.shipperId)?.name || 'Unknown'
            };
            setHistory([completedCluster, ...history]);
            setClusters(clusters.filter(c => c.id !== cluster.id));
        }
    };

    return (
        <div className="h-full overflow-y-auto pr-2 pb-20">
            {clusters.length === 0 ? (
                <div className="text-center p-10 text-gray-400">
                    <MapPin size={48} className="mx-auto mb-2 opacity-20" />
                    <p>No routes generated yet.</p>
                </div>
            ) : (
                clusters.map((cluster) => (
                    <ClusterCard
                        key={cluster.id}
                        cluster={cluster}
                        shippers={shippers}
                        onPrint={onPrint}
                        onComplete={handleComplete}
                        config={config}
                    />
                ))
            )}
        </div>
    );
};

export default ClusterList;
