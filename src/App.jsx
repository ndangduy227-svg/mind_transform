import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ModalProvider, useModal } from './context/ModalContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import MindAI from './pages/MindAI';
import TemplateLibrary from './pages/TemplateLibrary';
import TemplateDetail from './pages/TemplateDetail';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import PostEditor from './pages/admin/PostEditor';
import TemplateEditor from './pages/admin/TemplateEditor';
import LeadForm from './components/LeadForm';
import { isAuthenticated } from './services/cmsAdminService';

function ProtectedRoute({ children }) {
    if (!isAuthenticated()) {
        return <Navigate to="/admin/login" replace />;
    }
    return children;
}

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

function AppContent() {
    const { isFormOpen, closeForm } = useModal();

    return (
        <>
            <Routes>
                {/* Admin Routes without main Layout */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={
                    <ProtectedRoute>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/admin/post/:slug" element={
                    <ProtectedRoute>
                        <PostEditor />
                    </ProtectedRoute>
                } />
                <Route path="/admin/template/:slug" element={
                    <ProtectedRoute>
                        <TemplateEditor />
                    </ProtectedRoute>
                } />

                {/* Public Routes with Layout */}
                <Route path="/*" element={
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/blog" element={<Blog />} />
                            <Route path="/blog/:slug" element={<BlogPost />} />
                            <Route path="/templates" element={<TemplateLibrary />} />
                            <Route path="/templates/:slug" element={<TemplateDetail />} />
                            <Route path="/mind-ai" element={<MindAI />} />
                        </Routes>
                    </Layout>
                } />
            </Routes>
            <LeadForm isOpen={isFormOpen} onClose={closeForm} />
        </>
    );
}

export default function App() {
    return (
        <HelmetProvider>
            <ModalProvider>
                <Router>
                    <ScrollToTop />
                    <AppContent />
                </Router>
            </ModalProvider>
        </HelmetProvider>
    );
}
