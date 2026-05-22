import React, { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

export const useOrderContext = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const [rawHeaders, setRawHeaders] = useState([]);
    const [columnMapping, setColumnMapping] = useState({
        name: '',
        phone: '',
        address: '',
        note: '',
        cod: ''
    });

    const [shippers, setShippers] = useState([]);
    const [config, setConfig] = useState({
        warehouses: [],
        maxOrdersPerShipper: '',
        maxClusters: '',
        costPerKm: '',
        maxKmPerShipper: '',
        currency: 'VND',
        trackAsiaApiKey: ''
    });

    const [clusters, setClusters] = useState([]);
    const [history, setHistory] = useState([]);

    const value = {
        orders, setOrders,
        rawHeaders, setRawHeaders,
        columnMapping, setColumnMapping,
        shippers, setShippers,
        config, setConfig,
        clusters, setClusters,
        history, setHistory
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};
