import React, { createContext, useContext, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationContext = createContext(null);

export const viewToPathMap = {
    'choice-view': '/',
    'scanner-view': '/scan',
    'manual-entry-view': '/manual-entry',
    'loading-view': '/loading',
    'manual-fallback-view': '/manual-fallback',
    'results-view': '/results',
    'history-view': '/history',
    'profile-view': '/profile',
    'auth-view': '/login',
    'otp-view': '/verify-otp',
    'forgot-password-view': '/forgot-password',
    'reset-password-view': '/reset-password',
};

const pathToViewMap = Object.entries(viewToPathMap).reduce((acc, [view, path]) => {
    acc[path] = view;
    return acc;
}, {});

export function NavigationProvider({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    const currentView = useMemo(() => {
        return pathToViewMap[location.pathname] || 'choice-view';
    }, [location.pathname]);

    const setCurrentView = (viewIdOrPath, options) => {
        const targetPath = viewToPathMap[viewIdOrPath] || viewIdOrPath;
        navigate(targetPath, options);
    };

    return (
        <NavigationContext.Provider value={{ currentView, setCurrentView, navigate, location }}>
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation() {
    const ctx = useContext(NavigationContext);
    if (!ctx) throw new Error('useNavigation must be used within a NavigationProvider');
    return ctx;
}

