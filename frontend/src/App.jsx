import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import ToastContainer from './components/ToastContainer';
import AuthView from './components/AuthView';
import OtpView from './components/OtpView';
import ForgotPasswordView from './components/ForgotPasswordView';
import ResetPasswordView from './components/ResetPasswordView';
import ChoiceView from './components/ChoiceView';
import ScannerView from './components/ScannerView';
import ManualEntryView from './components/ManualEntryView';
import LoadingView from './components/LoadingView';
import ManualFallbackView from './components/ManualFallbackView';
import ResultsView from './components/ResultsView';
import HistoryFavoritesView from './components/HistoryFavoritesView';
import ProfileView from './components/ProfileView';
import LogoutModal from './components/Modals/LogoutModal';
import DeleteModal from './components/Modals/DeleteModal';

export default function App() {
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState(() => localStorage.getItem('nutriscan-theme') || 'light');
    const [currentView, setCurrentView] = useState(() => token ? 'choice-view' : 'auth-view');

    // Shared auth form state
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');

    // Active product results state
    const [currentBarcode, setCurrentBarcode] = useState('');
    const [productData, setProductData] = useState(null);
    const [analysis, setAnalysis] = useState(null);

    // Sidebar states
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Modal states
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Toast state
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, fading: false }]);

        setTimeout(() => {
            setToasts(prev => prev.map(t => t.id === id ? { ...t, fading: true } : t));
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 300);
        }, 3000);
    }, []);

    // Theme effect
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('nutriscan-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // User details effect
    useEffect(() => {
        if (!token) {
            setUser(null);
            return;
        }

        fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (data) {
                setUser(data);
            }
        })
        .catch(err => console.error("Me request failed", err));
    }, [token]);

    // Handle scan or barcode selection
    const handleProductScan = useCallback(async (barcodeText) => {
        setCurrentBarcode(barcodeText);
        setCurrentView('loading-view');

        try {
            const res = await fetch(`/api/products/scan/${barcodeText}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setProductData(data.product);
                setAnalysis(data.analysis);
                setCurrentView('results-view');
            } else if (res.status === 404) {
                setCurrentView('manual-fallback-view');
            } else if (res.status === 401 || res.status === 403) {
                showToast('Session expired. Please login again.', 'error');
                setToken(null);
                localStorage.removeItem('token');
                setCurrentView('auth-view');
            } else {
                const errData = await res.json().catch(() => ({}));
                showToast(errData.message || 'Error communicating with server.', 'error');
                setCurrentView('choice-view');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showToast('Network error or server is unreachable.', 'error');
            setCurrentView('choice-view');
        }
    }, [token, showToast]);

    const handleLogout = () => {
        setIsLogoutModalOpen(false);
        setToken(null);
        localStorage.removeItem('token');
        setUser(null);
        setAuthEmail('');
        setAuthPassword('');
        showToast('Logged out successfully.', 'info');
        setCurrentView('auth-view');
    };

    const handleAccountDeleted = () => {
        setIsDeleteModalOpen(false);
        setToken(null);
        localStorage.removeItem('token');
        setUser(null);
        setAuthEmail('');
        setAuthPassword('');
        setCurrentView('auth-view');
    };

    const isAuthMode = !token || ['auth-view', 'otp-view', 'forgot-password-view', 'reset-password-view'].includes(currentView);

    return (
        <div className={`dashboard ${isAuthMode ? 'auth-mode' : ''} ${isCollapsed ? 'is-collapsed' : ''}`}>
            {!isAuthMode && (
                <Sidebar
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    token={token}
                    user={user}
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                    isMobileOpen={isMobileOpen}
                    setIsMobileOpen={setIsMobileOpen}
                    onLogoutClick={() => setIsLogoutModalOpen(true)}
                />
            )}

            <main className="main-content">
                {!isAuthMode && (
                    <MobileHeader onMenuClick={() => setIsMobileOpen(true)} />
                )}

                {currentView === 'auth-view' && (
                    <AuthView
                        setCurrentView={setCurrentView}
                        setToken={setToken}
                        showToast={showToast}
                        authEmail={authEmail}
                        setAuthEmail={setAuthEmail}
                        authPassword={authPassword}
                        setAuthPassword={setAuthPassword}
                    />
                )}

                {currentView === 'otp-view' && (
                    <OtpView
                        setCurrentView={setCurrentView}
                        authEmail={authEmail}
                        authPassword={authPassword}
                        setToken={setToken}
                        showToast={showToast}
                    />
                )}

                {currentView === 'forgot-password-view' && (
                    <ForgotPasswordView
                        setCurrentView={setCurrentView}
                        authEmail={authEmail}
                        setAuthEmail={setAuthEmail}
                        showToast={showToast}
                    />
                )}

                {currentView === 'reset-password-view' && (
                    <ResetPasswordView
                        setCurrentView={setCurrentView}
                        authEmail={authEmail}
                        showToast={showToast}
                    />
                )}

                {currentView === 'choice-view' && (
                    <ChoiceView setCurrentView={setCurrentView} />
                )}

                {currentView === 'scanner-view' && (
                    <ScannerView
                        onScanSuccess={handleProductScan}
                        onBack={() => setCurrentView('choice-view')}
                        showToast={showToast}
                    />
                )}

                {currentView === 'manual-entry-view' && (
                    <ManualEntryView
                        onSearch={handleProductScan}
                        onBack={() => setCurrentView('choice-view')}
                    />
                )}

                {currentView === 'loading-view' && (
                    <LoadingView statusText="Analyzing product..." />
                )}

                {currentView === 'manual-fallback-view' && (
                    <ManualFallbackView
                        barcode={currentBarcode}
                        token={token}
                        onSubmitSuccess={(pData, pAnalysis) => {
                            pData._source = 'manual';
                            setProductData(pData);
                            setAnalysis(pAnalysis);
                            setCurrentView('results-view');
                        }}
                        onCancel={() => setCurrentView('choice-view')}
                        showToast={showToast}
                    />
                )}

                {currentView === 'results-view' && (
                    <ResultsView
                        productData={productData}
                        analysis={analysis}
                        token={token}
                        onScanAgain={() => setCurrentView('choice-view')}
                        showToast={showToast}
                    />
                )}

                {currentView === 'history-view' && (
                    <HistoryFavoritesView
                        token={token}
                        onSelectProduct={handleProductScan}
                        onBack={() => setCurrentView('choice-view')}
                        showToast={showToast}
                    />
                )}

                {currentView === 'profile-view' && (
                    <ProfileView
                        token={token}
                        onBack={() => setCurrentView('choice-view')}
                        onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
                        showToast={showToast}
                    />
                )}
            </main>

            <ToastContainer toasts={toasts} />

            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                token={token}
                onAccountDeleted={handleAccountDeleted}
                showToast={showToast}
            />
        </div>
    );
}
