import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ModalProvider, useModal } from './context/ModalContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
const Products = lazy(() => import('./pages/Products'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const MindAI = lazy(() => import('./pages/MindAI'));
const HomeV2 = lazy(() => import('./pages/HomeV2'));
const MINDFramework = lazy(() => import('./pages/MINDFramework'));
const TemplateLibrary = lazy(() => import('./pages/TemplateLibrary'));
const TemplateDetail = lazy(() => import('./pages/TemplateDetail'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const PostEditor = lazy(() => import('./pages/admin/PostEditor'));
const TemplateEditor = lazy(() => import('./pages/admin/TemplateEditor'));
const BulkImport = lazy(() => import('./pages/admin/BulkImport'));
const SkillsList = lazy(() => import('./pages/admin/SkillsList'));
const SkillEditor = lazy(() => import('./pages/admin/SkillEditor'));
import LeadForm from './components/LeadForm';
import { isAuthenticated } from './services/cmsAdminService';
import { Loader2 } from 'lucide-react';
import PasswordRecoveryRedirect from './components/PasswordRecoveryRedirect';

function ProtectedRoute({ children }) {
    const [authState, setAuthState] = useState('loading'); // loading | authed | denied

    useEffect(() => {
        isAuthenticated().then(authed => {
            setAuthState(authed ? 'authed' : 'denied');
        }).catch(() => setAuthState('denied'));
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
                            <Route path="*" element={<NotFound />} />
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
                    <PasswordRecoveryRedirect />
                    <ScrollToTop />
                    <Suspense fallback={<div role="status" className="min-h-screen bg-slate-950 text-slate-300 grid place-items-center">Đang tải trang...</div>}>
                        <AppContent />
                    </Suspense>
                </Router>
            </ModalProvider>
        </HelmetProvider>
    );
}
