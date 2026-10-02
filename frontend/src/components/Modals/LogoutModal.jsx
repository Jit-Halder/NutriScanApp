import React from 'react';

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay active">
            <div className="glass-card modal-card">
                <i className="ph-duotone ph-sign-out" style={{ fontSize: '3.5rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Log Out?</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.925rem', lineHeight: 1.6 }}>
                    Are you sure you want to log out of your account?
                </p>
                <div className="flex gap-4 justify-center">
                    <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
                        Cancel
                    </button>
                    <button type="button" onClick={onConfirm} className="btn btn-primary" style={{ flex: 1 }}>
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}
