import React, { useState } from 'react';
import { useOrderContext } from '../context/OrderContext';
import { Search, Filter, CheckSquare, Square } from 'lucide-react';

const OrderTable = () => {
    const { orders, setOrders } = useOrderContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSelected, setFilterSelected] = useState('all'); // all, selected, unselected

    const handleToggleSelect = (id) => {
        setOrders(orders.map(o => o.id === id ? { ...o, selected: !o.selected } : o));
    };

    const handleToggleAll = () => {
        const allSelected = orders.every(o => o.selected);
        setOrders(orders.map(o => ({ ...o, selected: !allSelected })));
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.phone.includes(searchTerm) ||
            order.address.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterSelected === 'selected') return matchesSearch && order.selected;
        if (filterSelected === 'unselected') return matchesSearch && !order.selected;
        return matchesSearch;
    });

    const selectedCount = orders.filter(o => o.selected).length;

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="input-field pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm text-[var(--text-secondary)]">
                        Selected: <span className="text-[var(--primary)] font-bold">{selectedCount}</span> / {orders.length}
                    </div>
                    <select
                        className="input-field w-auto"
                        value={filterSelected}
                        onChange={(e) => setFilterSelected(e.target.value)}
                    >
                        <option value="all">All Orders</option>
                        <option value="selected">Selected Only</option>
                        <option value="unselected">Unselected Only</option>
                    </select>
                </div>
            </div>

            <div className="glass-panel overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-[var(--text-secondary)] font-medium border-b border-[var(--border)]">
                            <tr>
                                <th className="p-4 w-12">
                                    <button onClick={handleToggleAll} className="hover:text-[var(--primary)]">
                                        {orders.length > 0 && orders.every(o => o.selected) ? <CheckSquare size={18} /> : <Square size={18} />}
                                    </button>
                                </th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Phone</th>
                                <th className="p-4">Address</th>
                                <th className="p-4">COD</th>
                                <th className="p-4">Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className={`border-b border-[var(--border)] last:border-0 transition-colors ${order.selected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <td className="p-4">
                                            <button onClick={() => handleToggleSelect(order.id)} className={order.selected ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}>
                                                {order.selected ? <CheckSquare size={18} /> : <Square size={18} />}
                                            </button>
                                        </td>
                                        <td className="p-4 font-medium text-[var(--text-main)]">{order.name}</td>
                                        <td className="p-4 text-[var(--text-main)]">{order.phone}</td>
                                        <td className="p-4 max-w-xs truncate text-[var(--text-main)]" title={order.address}>{order.address}</td>
                                        <td className="p-4 font-mono text-[var(--primary)] font-semibold">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.cod)}
                                        </td>
                                        <td className="p-4 text-[var(--text-secondary)] max-w-xs truncate">{order.note}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-[var(--text-secondary)]">
                                        No orders found matching your search.
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

export default OrderTable;
