import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigation } from '../context/NavigationContext';

export default function ForgotPasswordView() {
    const { authEmail, setAuthEmail } = useAuth();
    const { showToast } = useToast();
    const { setCurrentView } = useNavigation();

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = authEmail.trim();
        if (!email) {
            showToast('Please enter your email', 'error');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                showToast(data.message || 'Reset code sent to email!', 'success');
                setCurrentView('reset-password-view');
            } else {
                showToast(data.message || 'Failed to send reset code', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Network error', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="forgot-password-view" className="view active">
            <div className="glass-card auth-card">
                <div className="auth-header">
                    <div className="auth-header-icon" style={{ background: 'rgba(234, 179, 8, 0.12)' }}>
                        <i className="ph-duotone ph-key" style={{ color: 'var(--score-c)' }}></i>
                    </div>
                    <h2>Reset Password</h2>
                    <p>Enter your email to receive a 6-digit password reset code.</p>
                </div>
                <form id="forgot-password-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="forgot-email">Email Address</label>
                        <div className="input-icon-wrapper">
                            <input
                                type="email"
                                id="forgot-email"
                                required
                                placeholder="Enter registered email"
                                value={authEmail}
                                onChange={(e) => setAuthEmail(e.target.value)}
                            />
                            <i className="ph ph-envelope-simple"></i>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 mt-4">
                        <button type="submit" disabled={loading} className="btn btn-primary btn-large">
                            {loading ? 'Sending...' : 'Send Reset Code'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => setCurrentView('auth-view')}
                        >
                            Back to Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
