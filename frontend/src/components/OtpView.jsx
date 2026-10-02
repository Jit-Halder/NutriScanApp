import React, { useState, useEffect } from 'react';
import { BackendAPI } from '../services/api';

export default function OtpView({ setCurrentView, authEmail, authPassword, setToken, showToast }) {
    const [otpCode, setOtpCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: authEmail, otp: otpCode })
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Email verified! Auto-logging in...', 'success');
                // Auto-login
                try {
                    const loginRes = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: authEmail, password: authPassword })
                    });
                    const loginData = await loginRes.json();
                    if (loginRes.ok) {
                        localStorage.setItem('token', loginData.token);
                        setToken(loginData.token);
                        setCurrentView('choice-view');
                    } else {
                        showToast('Verification complete. Please login.', 'info');
                        setCurrentView('auth-view');
                    }
                } catch (e) {
                    showToast('Verification complete. Please login.', 'info');
                    setCurrentView('auth-view');
                }
            } else {
                showToast(data.message || 'Verification failed', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Network error during OTP verification', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async (e) => {
        e.preventDefault();
        if (cooldown > 0) return;
        if (!authEmail) {
            showToast('Email is missing', 'error');
            return;
        }

        try {
            await BackendAPI.resendOTP(authEmail);
            showToast('OTP resent successfully!', 'success');
            setCooldown(60);
        } catch (err) {
            showToast(err.message || 'Failed to resend OTP', 'error');
        }
    };

    return (
        <div id="otp-view" className="view active">
            <div className="glass-card auth-card">
                <div className="auth-header">
                    <div className="auth-header-icon" style={{ background: 'rgba(139, 92, 246, 0.12)' }}>
                        <i className="ph-duotone ph-envelope-open" style={{ color: 'var(--accent-500)' }}></i>
                    </div>
                    <h2>Verify Your Email</h2>
                    <p>Enter the 6-digit code sent to your email.</p>
                </div>
                <form id="otp-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="otp-code">OTP Code</label>
                        <input
                            type="text"
                            id="otp-code"
                            required
                            placeholder="Enter OTP"
                            maxLength="6"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            style={{
                                textAlign: 'center',
                                letterSpacing: '0.5rem',
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                fontFamily: 'var(--font-mono)'
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-4 mt-4">
                        <button type="submit" disabled={loading} className="btn btn-primary btn-large">
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => setCurrentView('auth-view')}
                        >
                            Back to Login
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        {cooldown > 0 ? (
                            <span style={{ color: 'var(--text-muted)' }}>Wait {cooldown}s to resend</span>
                        ) : (
                            <a href="#" onClick={handleResendOTP} style={{ color: 'var(--primary)', fontWeight: 500 }}>
                                Resend OTP
                            </a>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
