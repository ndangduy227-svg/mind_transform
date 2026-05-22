import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { OrderProvider } from './context/OrderContext';
import UploadPage from './pages/UploadPage';
import ConfigPage from './pages/ConfigPage';
import ShippersPage from './pages/ShippersPage';
import RouteDashboard from './components/RouteDashboard';
import HistoryPage from './pages/HistoryPage';

// Placeholder Pages
// RouteDashboard imported
// UploadPage imported
// ConfigPage imported
// ShippersPage imported
// HistoryPage imported

function App() {
  return (
    <OrderProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<RouteDashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/config" element={<ConfigPage />} />
            <Route path="/shippers" element={<ShippersPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </OrderProvider>
  );
}

export default App;
