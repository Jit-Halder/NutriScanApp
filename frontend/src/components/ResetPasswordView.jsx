import React, { useState } from 'react';

export default function ResetPasswordView({ setCurrentView, authEmail, showToast }) {
    const [resetOtpCode, setResetOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!authEmail) {
            showToast('Email is required', 'error');
            return;
        }
        if (!resetOtpCode) {
            showToast('Reset OTP code is required', 'error');
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            showToast('New password must be at least 6 characters', 'error');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: authEmail, otp: resetOtpCode, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Password reset successfully! Please login.', 'success');
                setResetOtpCode('');
                setNewPassword('');
                setCurrentView('auth-view');
            } else {
                showToast(data.message || 'Failed to reset password', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Network error', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="reset-password-view" className="view active">
            <div className="glass-card auth-card">
                <div className="auth-header">
                    <div className="auth-header-icon" style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
                        <i className="ph-duotone ph-lock-key-open" style={{ color: 'var(--primary-500)' }}></i>
                    </div>
                    <h2>Set New Password</h2>
                    <p>Enter the reset code sent to your email and your new password.</p>
                </div>
                <form id="reset-password-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="reset-otp-code">Reset OTP Code</label>
                        <input
                            type="text"
                            id="reset-otp-code"
                            required
                            placeholder="Enter OTP"
                            maxLength="6"
                            value={resetOtpCode}
                            onChange={(e) => setResetOtpCode(e.target.value)}
                            style={{
                                textAlign: 'center',
                                letterSpacing: '0.5rem',
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                fontFamily: 'var(--font-mono)'
                            }}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reset-new-password">New Password</label>
                        <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="reset-new-password"
                                required
                                placeholder="At least 6 characters"
                                minLength="6"
                                style={{ paddingRight: '3rem' }}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
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
                    </div>
                    <div className="flex flex-col gap-4 mt-4">
                        <button type="submit" disabled={loading} className="btn btn-primary btn-large">
                            {loading ? 'Updating...' : 'Update Password'}
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
