import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ModalProvider, useModal } from './context/ModalContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import MindAI from './pages/MindAI';
import HomeV2 from './pages/HomeV2';
import MINDFramework from './pages/MINDFramework';
import TemplateLibrary from './pages/TemplateLibrary';
import TemplateDetail from './pages/TemplateDetail';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import PostEditor from './pages/admin/PostEditor';
import TemplateEditor from './pages/admin/TemplateEditor';
import BulkImport from './pages/admin/BulkImport';
import SkillsList from './pages/admin/SkillsList';
import SkillEditor from './pages/admin/SkillEditor';
import LeadForm from './components/LeadForm';
import { isAuthenticated } from './services/cmsAdminService';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }) {
    const [authState, setAuthState] = useState('loading'); // loading | authed | denied

    useEffect(() => {
        isAuthenticated().then(authed => {
            setAuthState(authed ? 'authed' : 'denied');
        });
    }, []);

    if (authState === 'loading') {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
        );
    }
    if (authState === 'denied') {
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
                <Route path="/admin/import" element={
                    <ProtectedRoute>
                        <BulkImport />
                    </ProtectedRoute>
                } />
                <Route path="/admin/skills" element={
                    <ProtectedRoute>
                        <SkillsList />
                    </ProtectedRoute>
                } />
                <Route path="/admin/skill/:slug" element={
                    <ProtectedRoute>
                        <SkillEditor />
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
                            <Route path="/v2" element={<HomeV2 />} />
                            <Route path="/mind-framework" element={<MINDFramework />} />
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
