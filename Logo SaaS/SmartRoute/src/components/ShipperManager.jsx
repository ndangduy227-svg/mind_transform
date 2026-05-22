import React, { useState } from 'react';
import { useOrderContext } from '../context/OrderContext';
import { UserPlus, Trash2, Edit2, Save, X, Phone, Truck, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ShipperManager = () => {
    const { shippers, setShippers } = useOrderContext();
    const [isEditing, setIsEditing] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', phone: '', license: '', note: '' });

    const handleAdd = () => {
        const newShipper = {
            id: Date.now(),
            name: 'New Shipper',
            phone: '',
            license: '',
            note: ''
        };
        setShippers([...shippers, newShipper]);
        startEdit(newShipper);
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this shipper profile?')) {
            setShippers(shippers.filter(s => s.id !== id));
        }
    };

    const startEdit = (shipper) => {
        setIsEditing(shipper.id);
        setEditForm(shipper);
    };

    const saveEdit = () => {
        setShippers(shippers.map(s => s.id === isEditing ? editForm : s));
        setIsEditing(null);
    };

    const cancelEdit = () => {
        // If it was a new empty shipper (just created), maybe delete it? 
        // For simplicity, just revert changes.
        setIsEditing(null);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
                        Shipper Profiles
                    </h1>
                    <p className="text-[var(--text-gray)] mt-1">Manage your fleet and drivers</p>
                </div>
                <button onClick={handleAdd} className="btn-primary">
                    <UserPlus size={18} />
                    Add Shipper
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {shippers.map((shipper) => (
                        <motion.div
                            key={shipper.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            layout
                            className={`glass-panel p-6 relative group ${isEditing === shipper.id ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]' : ''}`}
                        >
                            {isEditing === shipper.id ? (
                                <div className="space-y-4">
                                    <input
                                        className="input-field font-bold text-lg"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        placeholder="Shipper Name"
                                        autoFocus
                                    />
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-[var(--text-gray)]" />
                                        <input
                                            className="input-field text-sm"
                                            value={editForm.phone}
                                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                            placeholder="Phone Number"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Truck size={16} className="text-[var(--text-gray)]" />
                                        <input
                                            className="input-field text-sm"
                                            value={editForm.license}
                                            onChange={(e) => setEditForm({ ...editForm, license: e.target.value })}
                                            placeholder="License Plate"
                                        />
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <FileText size={16} className="text-[var(--text-gray)] mt-2" />
                                        <textarea
                                            className="input-field text-sm resize-none"
                                            value={editForm.note}
                                            onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                                            placeholder="Notes"
                                            rows={2}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button onClick={cancelEdit} className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-lg">
                                            <X size={18} />
                                        </button>
                                        <button onClick={saveEdit} className="p-2 bg-[var(--primary)] text-black rounded-lg">
                                            <Save size={18} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-bold">{shipper.name}</h3>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(shipper)} className="p-2 hover:text-[var(--primary)]">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(shipper.id)} className="p-2 hover:text-[var(--error)]">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-sm text-[var(--text-gray)]">
                                        <div className="flex items-center gap-3">
                                            <Phone size={16} />
                                            <span>{shipper.phone || 'No phone'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Truck size={16} />
                                            <span>{shipper.license || 'No license plate'}</span>
                                        </div>
                                        {shipper.note && (
                                            <div className="flex items-start gap-3">
                                                <FileText size={16} className="mt-0.5" />
                                                <p className="line-clamp-2">{shipper.note}</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {shippers.length === 0 && (
                    <div className="col-span-full text-center py-12 text-[var(--text-gray)] border-2 border-dashed border-[var(--glass-border)] rounded-2xl">
                        <p>No shippers added yet.</p>
                        <button onClick={handleAdd} className="text-[var(--primary)] font-semibold mt-2 hover:underline">
                            Add your first shipper
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShipperManager;
