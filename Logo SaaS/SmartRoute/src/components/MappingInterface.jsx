import React, { useState, useEffect } from 'react';
import { useOrderContext } from '../context/OrderContext';
import { ArrowRight, Save, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const REQUIRED_FIELDS = [
    { key: 'name', label: 'Customer Name', required: true },
    { key: 'phone', label: 'Phone Number', required: true },
    { key: 'address', label: 'Address', required: true },
    { key: 'note', label: 'Note', required: false },
    { key: 'cod', label: 'COD Amount', required: false },
];

const MappingInterface = ({ onMappingComplete }) => {
    const { rawHeaders, columnMapping, setColumnMapping, orders, setOrders } = useOrderContext();
    const [localMapping, setLocalMapping] = useState(columnMapping);
    const [previewData, setPreviewData] = useState([]);

    useEffect(() => {
        // Auto-guess mapping based on headers
        const newMapping = { ...localMapping };
        rawHeaders.forEach(header => {
            const lowerHeader = header.toLowerCase();
            if (!newMapping.name && (lowerHeader.includes('name') || lowerHeader.includes('tên'))) newMapping.name = header;
            if (!newMapping.phone && (lowerHeader.includes('phone') || lowerHeader.includes('sđt') || lowerHeader.includes('mobile'))) newMapping.phone = header;
            if (!newMapping.address && (lowerHeader.includes('address') || lowerHeader.includes('địa chỉ'))) newMapping.address = header;
            if (!newMapping.note && (lowerHeader.includes('note') || lowerHeader.includes('ghi chú'))) newMapping.note = header;
            if (!newMapping.cod && (lowerHeader.includes('cod') || lowerHeader.includes('tiền') || lowerHeader.includes('amount'))) newMapping.cod = header;
        });
        setLocalMapping(newMapping);

        // Generate preview
        if (orders.length > 0) {
            setPreviewData(orders.slice(0, 3));
        }
    }, [rawHeaders, orders]);

    const handleSave = () => {
        // Validate required fields
        const missing = REQUIRED_FIELDS.filter(f => f.required && !localMapping[f.key]);
        if (missing.length > 0) {
            alert(`Please map all required fields: ${missing.map(f => f.label).join(', ')}`);
            return;
        }

        setColumnMapping(localMapping);

        // Transform orders to standardized format
        const standardizedOrders = orders.map((row, index) => ({
            id: index + 1,
            name: row[localMapping.name] || '',
            phone: row[localMapping.phone] || '',
            address: row[localMapping.address] || '',
            note: row[localMapping.note] || '',
            cod: parseFloat(row[localMapping.cod]) || 0,
            originalData: row,
            selected: true // Default selected
        }));

        setOrders(standardizedOrders);
        if (onMappingComplete) onMappingComplete();
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="glass-panel p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <SettingsIcon className="text-[var(--primary)]" />
                    Map Columns
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {REQUIRED_FIELDS.map((field) => (
                        <div key={field.key} className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-gray)]">
                                {field.label}
                                {field.required && <span className="text-[var(--error)]">*</span>}
                            </label>
                            <select
                                className="input-field bg-[rgba(0,0,0,0.3)]"
                                value={localMapping[field.key] || ''}
                                onChange={(e) => setLocalMapping({ ...localMapping, [field.key]: e.target.value })}
                            >
                                <option value="">Select Column...</option>
                                {rawHeaders.map((header) => (
                                    <option key={header} value={header}>{header}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-end">
                    <button onClick={handleSave} className="btn-primary">
                        <Save size={18} />
                        Save Mapping & Continue
                    </button>
                </div>
            </div>

            {/* Preview Section */}
            <div className="glass-panel p-6 overflow-x-auto">
                <h3 className="text-lg font-semibold mb-4">Data Preview (First 3 Rows)</h3>
                <table className="w-full text-sm text-left">
                    <thead className="text-[var(--text-gray)] border-b border-[var(--glass-border)]">
                        <tr>
                            {REQUIRED_FIELDS.map(f => <th key={f.key} className="p-3">{f.label}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {previewData.map((row, i) => (
                            <tr key={i} className="border-b border-[var(--glass-border)] last:border-0 hover:bg-[rgba(255,255,255,0.02)]">
                                {REQUIRED_FIELDS.map(f => (
                                    <td key={f.key} className="p-3">
                                        {localMapping[f.key] ? row[localMapping[f.key]] : <span className="text-[var(--text-gray)] italic">Not mapped</span>}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SettingsIcon = ({ className }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

export default MappingInterface;
