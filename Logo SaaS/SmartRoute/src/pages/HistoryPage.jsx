import React from 'react';
import { useOrderContext } from '../context/OrderContext';
import { Calendar, User, DollarSign, Package } from 'lucide-react';

const HistoryPage = () => {
    const { history, config } = useOrderContext();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: config.currency || 'VND' }).format(amount);
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString();
    };

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
                    Order History
                </h1>
                <p className="text-[var(--text-gray)] mt-1">View completed routes and financial summary</p>
            </div>

            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[rgba(255,255,255,0.05)] text-[var(--text-gray)] font-medium">
                            <tr>
                                <th className="p-4">Date Completed</th>
                                <th className="p-4">Cluster Name</th>
                                <th className="p-4">Shipper</th>
                                <th className="p-4 text-center">Orders</th>
                                <th className="p-4 text-right">Total COD</th>
                                <th className="p-4 text-right">Ship Cost</th>
                                <th className="p-4 text-right">Receivable</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length > 0 ? (
                                history.map((cluster) => {
                                    const totalShipCost = cluster.baseCost + (cluster.extraCost || 0);
                                    const receivable = cluster.totalCOD - totalShipCost;

                                    return (
                                        <tr
                                            key={cluster.id}
                                            className="border-b border-[var(--glass-border)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                                        >
                                            <td className="p-4 text-[var(--text-gray)]">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {formatDate(cluster.completedAt)}
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium text-[var(--primary)]">{cluster.name}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <User size={14} />
                                                    {cluster.shipperName}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="bg-[rgba(255,255,255,0.1)] px-2 py-1 rounded-full text-xs">
                                                    {cluster.orders.length}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-mono">{formatCurrency(cluster.totalCOD)}</td>
                                            <td className="p-4 text-right font-mono text-[var(--error)]">-{formatCurrency(totalShipCost)}</td>
                                            <td className={`p-4 text-right font-mono font-bold ${receivable >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                                                {formatCurrency(receivable)}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-[var(--text-gray)]">
                                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>No completed orders yet.</p>
                                        <p className="text-xs mt-2">Complete a cluster in the Dashboard to see it here.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;
