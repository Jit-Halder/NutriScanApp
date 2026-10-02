import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import { useNavigation } from './NavigationContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setTokenState] = useState(() => localStorage.getItem('token') || null);
    const [user, setUser] = useState(null);

    // Shared auth form state (passed between auth flow screens)
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');

    const { showToast } = useToast();
    const { setCurrentView } = useNavigation();

    const setToken = useCallback((newToken) => {
        setTokenState(newToken);
        if (newToken) {
            localStorage.setItem('token', newToken);
        } else {
            localStorage.removeItem('token');
        }
    }, []);

    const handleSessionExpired = useCallback(() => {
        setToken(null);
        setUser(null);
        setAuthEmail('');
        setAuthPassword('');
        showToast('Session expired. Please login again.', 'error');
        setCurrentView('auth-view');
    }, [setToken, showToast, setCurrentView]);

    const handleLogout = useCallback(() => {
        setToken(null);
        setUser(null);
        setAuthEmail('');
        setAuthPassword('');
        showToast('Logged out successfully.', 'info');
        setCurrentView('auth-view');
    }, [setToken, showToast, setCurrentView]);

    // Fetch user info whenever token changes
    useEffect(() => {
        if (!token) {
            setUser(null);
            return;
        }

        fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    handleSessionExpired();
                    return null;
                }
                return res.ok ? res.json() : null;
            })
            .then(data => {
                if (data) setUser(data);
            })
            .catch(err => console.error('Me request failed', err));
    }, [token, handleSessionExpired]);

    const handleAccountDeleted = useCallback(() => {
        setToken(null);
        setUser(null);
        setAuthEmail('');
        setAuthPassword('');
        setCurrentView('auth-view');
    }, [setToken, setCurrentView]);

    return (
        <AuthContext.Provider value={{
            token,
            setToken,
            user,
            authEmail,
            setAuthEmail,
            authPassword,
            setAuthPassword,
            handleLogout,
            handleSessionExpired,
            handleAccountDeleted,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
