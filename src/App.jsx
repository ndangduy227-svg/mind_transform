import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ModalProvider, useModal } from './context/ModalContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import MindAI from './pages/MindAI';
import LeadForm from './components/LeadForm';

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
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/mind-ai" element={<MindAI />} />
                </Routes>
            </Layout>
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
