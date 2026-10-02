import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigation } from '../context/NavigationContext';

export default function AuthView() {
    const { setToken, authEmail, setAuthEmail, authPassword, setAuthPassword } = useAuth();
    const { showToast } = useToast();
    const { setCurrentView } = useNavigation();

    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
        const body = { email: authEmail, password: authPassword };
        if (isRegistering) body.name = name;

        setLoading(true);

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok) {
                if (isRegistering) {
                    showToast('Registered! Please check your email for OTP.', 'success');
                    setCurrentView('otp-view');
                } else {
                    showToast('Logged in successfully!', 'success');
                    localStorage.setItem('token', data.token);
                    setToken(data.token);
                    setCurrentView('choice-view');
                }
            } else {
                if (data.notVerified) {
                    showToast(data.message || 'Please verify your email.', 'error');
                    setCurrentView('otp-view');
                } else {
                    showToast(data.message || 'Auth failed', 'error');
                }
            }
        } catch (err) {
            console.error(err);
            showToast('Network error while connecting to server.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="auth-view" className="view active">
            <div className="glass-card auth-card">
                <div className="auth-header">
                    <div className="auth-header-icon">
                        <i className="ph-duotone ph-shield-check"></i>
                    </div>
                    <h2>Welcome to NutriScan</h2>
                    <p>Log in to get personalized health warnings based on your profile.</p>
                </div>
                <form id="auth-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="auth-email">Email</label>
                        <div className="input-icon-wrapper">
                            <input
                                type="email"
                                id="auth-email"
                                required
                                placeholder="Enter your email"
                                value={authEmail}
                                onChange={(e) => setAuthEmail(e.target.value)}
                            />
                            <i className="ph ph-envelope-simple"></i>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="auth-password">Password</label>
                        <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="auth-password"
                                required
                                placeholder="Enter your password"
                                style={{ paddingRight: '3rem' }}
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                            />
                            <i className="ph ph-lock-key"></i>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 2
                                }}
                            >
                                <i className={`ph ph-eye${showPassword ? '-slash' : ''}`} style={{ fontSize: '1.15rem' }}></i>
                            </button>
                        </div>
                        {!isRegistering && (
                            <div className="flex justify-end mt-1">
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentView('forgot-password-view');
                                    }}
                                    style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}
                                >
                                    Forgot password?
                                </a>
                            </div>
                        )}
                    </div>

                    {isRegistering && (
                        <div className="form-group">
                            <label htmlFor="auth-name">Name</label>
                            <div className="input-icon-wrapper">
                                <input
                                    type="text"
                                    id="auth-name"
                                    required
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <i className="ph ph-user"></i>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-4 mt-4">
                        <button type="submit" disabled={loading} className="btn btn-primary btn-large">
                            {loading ? (isRegistering ? 'Registering...' : 'Logging in...') : (isRegistering ? 'Register' : 'Login')}
                        </button>
                        <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ textAlign: 'center' }}
                            onClick={() => setIsRegistering(!isRegistering)}
                        >
                            {isRegistering ? 'Already have an account? Login here' : "Don't have an account? Register here"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
