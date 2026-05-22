import React, { useState, useEffect } from 'react';
import { useOrderContext } from '../context/OrderContext';
import { Save, Plus, Trash2, MapPin, Settings, Globe } from 'lucide-react';

const ConfigurationForm = () => {
    const { config, setConfig } = useOrderContext();
    const [localConfig, setLocalConfig] = useState(config);

    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    const handleWarehouseChange = (index, value) => {
        const newWarehouses = [...localConfig.warehouses];
        newWarehouses[index] = value;
        setLocalConfig({ ...localConfig, warehouses: newWarehouses });
    };

    const addWarehouse = () => {
        if (localConfig.warehouses.length < 5) {
            setLocalConfig({ ...localConfig, warehouses: [...localConfig.warehouses, ''] });
        }
    };

    const removeWarehouse = (index) => {
        const newWarehouses = localConfig.warehouses.filter((_, i) => i !== index);
        setLocalConfig({ ...localConfig, warehouses: newWarehouses });
    };

    const handleSave = () => {
        setConfig(localConfig);
        alert('Configuration saved successfully!');
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-main)]">Configuration</h1>
                    <p className="text-[var(--text-muted)] mt-1">Manage your delivery settings and API keys.</p>
                </div>
                <button onClick={handleSave} className="btn-primary">
                    <Save size={18} />
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Map Configuration */}
                <div className="card p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--text-main)]">
                        <Globe className="text-[var(--primary)]" size={20} />
                        Map Settings
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-main)] mb-1">Track Asia API Key</label>
                            <input
                                type="text"
                                className="input-field"
                                value={localConfig.trackAsiaApiKey || ''}
                                onChange={(e) => setLocalConfig({ ...localConfig, trackAsiaApiKey: e.target.value })}
                                placeholder="Enter your Track Asia API Key"
                            />
                            <p className="text-xs text-[var(--text-muted)] mt-2">
                                Required for Geocoding and Route Optimization.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Warehouse Locations */}
                    <div className="card p-6 h-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-[var(--text-main)]">
                                <MapPin className="text-[var(--primary)]" size={20} />
                                Pickup Locations
                            </h3>
                            <span className="text-xs text-[var(--text-muted)] bg-gray-100 px-2 py-1 rounded-full">
                                {localConfig.warehouses.length}/5
                            </span>
                        </div>

                        <div className="space-y-3">
                            {localConfig.warehouses.map((warehouse, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder={`Warehouse Address #${index + 1}`}
                                        className="input-field"
                                        value={warehouse}
                                        onChange={(e) => handleWarehouseChange(index, e.target.value)}
                                    />
                                    <button
                                        onClick={() => removeWarehouse(index)}
                                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}

                            {localConfig.warehouses.length < 5 && (
                                <button
                                    onClick={addWarehouse}
                                    className="w-full py-3 border border-dashed border-[var(--border)] rounded-lg text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all flex items-center justify-center gap-2 text-sm font-medium"
                                >
                                    <Plus size={18} />
                                    Add Location
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Constraints */}
                    <div className="card p-6 h-full">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--text-main)]">
                            <Settings className="text-[var(--secondary)]" size={20} />
                            Route Constraints
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-main)] mb-1">Max Orders per Shipper</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={localConfig.maxOrdersPerShipper}
                                    onChange={(e) => setLocalConfig({ ...localConfig, maxOrdersPerShipper: e.target.value })}
                                    placeholder="e.g. 20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-main)] mb-1">Max Clusters (Desired)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={localConfig.maxClusters}
                                    onChange={(e) => setLocalConfig({ ...localConfig, maxClusters: e.target.value })}
                                    placeholder="e.g. 5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-main)] mb-1">Cost per KM</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        className="input-field flex-1"
                                        value={localConfig.costPerKm}
                                        onChange={(e) => setLocalConfig({ ...localConfig, costPerKm: e.target.value })}
                                        placeholder="e.g. 5000"
                                    />
                                    <select
                                        className="input-field w-24"
                                        value={localConfig.currency}
                                        onChange={(e) => setLocalConfig({ ...localConfig, currency: e.target.value })}
                                    >
                                        <option value="VND">VND</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-main)] mb-1">Max KM per Shipper</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={localConfig.maxKmPerShipper}
                                    onChange={(e) => setLocalConfig({ ...localConfig, maxKmPerShipper: e.target.value })}
                                    placeholder="e.g. 50"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfigurationForm;
