import React from 'react';
import { useOrderContext } from '../context/OrderContext';
import UploadModule from '../components/UploadModule';
import MappingInterface from '../components/MappingInterface';
import OrderTable from '../components/OrderTable';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UploadPage = () => {
    const { rawHeaders, orders, setRawHeaders, setOrders, setColumnMapping } = useOrderContext();
    const navigate = useNavigate();

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset? All uploaded data will be lost.')) {
            setRawHeaders([]);
            setOrders([]);
            setColumnMapping({ name: '', phone: '', address: '', note: '', cod: '' });
        }
    };

    // Determine current step
    // Step 1: No file uploaded (rawHeaders empty)
    // Step 2: File uploaded, mapping needed (rawHeaders exist, but orders might be raw or mapped? 
    // Wait, in UploadModule I setOrders to raw data. In MappingInterface I transform them.
    // How to distinguish? 
    // In MappingInterface, I map `orders` (which are raw objects) to `standardizedOrders` (which have `id`, `name`, etc.)
    // Let's check if the first order has 'id' property to know if it's mapped.

    const isMapped = orders.length > 0 && orders[0].hasOwnProperty('id');
    const hasFile = rawHeaders.length > 0;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
                        Upload Orders
                    </h1>
                    <p className="text-[var(--text-gray)] mt-1">Import and prepare your delivery list</p>
                </div>

                {hasFile && (
                    <button onClick={handleReset} className="btn-secondary flex items-center gap-2 text-sm">
                        <RefreshCw size={14} />
                        Reset Upload
                    </button>
                )}
            </div>

            {!hasFile && (
                <div className="mt-12">
                    <UploadModule />
                </div>
            )}

            {hasFile && !isMapped && (
                <div className="animate-fade-in">
                    <MappingInterface />
                </div>
            )}

            {isMapped && (
                <div className="animate-fade-in space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={() => navigate('/config')}
                            className="btn-primary"
                        >
                            Continue to Configuration
                            <ArrowRight size={18} />
                        </button>
                    </div>
                    <OrderTable />
                </div>
            )}
        </div>
    );
};

export default UploadPage;
