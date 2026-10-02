import React, { useState } from 'react';

export default function DeleteModal({ isOpen, onClose, token, onAccountDeleted, showToast }) {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/delete', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                showToast('Account deleted successfully', 'success');
                onAccountDeleted();
            } else {
                const data = await res.json().catch(() => ({}));
                showToast(data.message || 'Failed to delete account', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('An error occurred while deleting account.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay active">
            <div className="glass-card modal-card">
                <i className="ph-duotone ph-warning" style={{ fontSize: '3.5rem', color: 'var(--score-e)', marginBottom: '1rem' }}></i>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Delete Account?</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.925rem', lineHeight: 1.6 }}>
                    Are you sure you want to delete your account? This action is permanent and will erase all your scan history and saved data.
                </p>
                <div className="flex gap-4 justify-center">
                    <button type="button" onClick={onClose} disabled={loading} className="btn btn-secondary" style={{ flex: 1 }}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirmDelete}
                        disabled={loading}
                        className="btn btn-primary"
                        style={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)'
                        }}
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}
