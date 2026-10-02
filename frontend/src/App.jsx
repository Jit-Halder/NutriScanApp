import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

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

// Inner app that has access to all contexts
function AppInner() {
    const { token, handleLogout, handleAccountDeleted } = useAuth();
    const { currentView, setCurrentView } = useNavigation();
    const { toasts, showToast } = useToast();

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
                handleLogout();
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
    }, [token, showToast, handleLogout, setCurrentView]);

    const isAuthMode = ['auth-view', 'otp-view', 'forgot-password-view', 'reset-password-view'].includes(currentView);

    return (
        <div className={`dashboard ${isAuthMode ? 'auth-mode' : ''} ${isCollapsed ? 'is-collapsed' : ''}`}>
            {!isAuthMode && (
                <Sidebar
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

                <Routes>
                    <Route path="/login" element={<AuthView />} />
                    <Route path="/verify-otp" element={<OtpView />} />
                    <Route path="/forgot-password" element={<ForgotPasswordView />} />
                    <Route path="/reset-password" element={<ResetPasswordView />} />

                    <Route path="/" element={<ChoiceView />} />
                    <Route
                        path="/scan"
                        element={
                            <ScannerView
                                onScanSuccess={handleProductScan}
                                onBack={() => setCurrentView('choice-view')}
                            />
                        }
                    />
                    <Route
                        path="/manual-entry"
                        element={
                            <ManualEntryView
                                onSearch={handleProductScan}
                                onBack={() => setCurrentView('choice-view')}
                            />
                        }
                    />
                    <Route
                        path="/loading"
                        element={<LoadingView statusText="Analyzing product..." />}
                    />
                    <Route
                        path="/manual-fallback"
                        element={
                            <ManualFallbackView
                                barcode={currentBarcode}
                                onSubmitSuccess={(pData, pAnalysis) => {
                                    pData._source = 'manual';
                                    setProductData(pData);
                                    setAnalysis(pAnalysis);
                                    setCurrentView('results-view');
                                }}
                                onCancel={() => setCurrentView('choice-view')}
                            />
                        }
                    />
                    <Route
                        path="/results"
                        element={
                            <ResultsView
                                productData={productData}
                                analysis={analysis}
                                onScanAgain={() => setCurrentView('choice-view')}
                            />
                        }
                    />
                    <Route
                        path="/history"
                        element={
                            <HistoryFavoritesView
                                onSelectProduct={handleProductScan}
                                onBack={() => setCurrentView('choice-view')}
                            />
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProfileView
                                onBack={() => setCurrentView('choice-view')}
                                onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
                            />
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>

            <ToastContainer toasts={toasts} />

            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={() => {
                    setIsLogoutModalOpen(false);
                    handleLogout();
                }}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onAccountDeleted={() => {
                    setIsDeleteModalOpen(false);
                    handleAccountDeleted();
                }}
            />
        </div>
    );
}

// Root App wraps everything in providers and BrowserRouter
export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <NavigationProvider>
                    <ToastProvider>
                        <AuthProvider>
                            <AppInner />
                        </AuthProvider>
                    </ToastProvider>
                </NavigationProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

