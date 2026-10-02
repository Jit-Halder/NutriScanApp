import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function HistoryFavoritesView({ onSelectProduct, onBack }) {
    const { token, handleSessionExpired } = useAuth();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState('history'); // 'history' | 'favorites'
    const [historyItems, setHistoryItems] = useState([]);
    const [favoriteItems, setFavoriteItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        setLoading(true);

        if (activeTab === 'history') {
            fetch('/api/products/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    if (res.status === 401 || res.status === 403) {
                        handleSessionExpired();
                        return null;
                    }
                    return res.json();
                })
                .then(data => {
                    if (Array.isArray(data)) setHistoryItems(data);
                    else setHistoryItems([]);
                })
                .catch(err => {
                    console.error(err);
                    showToast('Failed to load history.', 'error');
                })
                .finally(() => setLoading(false));
        } else {
            fetch('/api/products/favorites', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    if (res.status === 401 || res.status === 403) {
                        handleSessionExpired();
                        return null;
                    }
                    return res.json();
                })
                .then(data => {
                    if (Array.isArray(data)) setFavoriteItems(data);
                    else setFavoriteItems([]);
                })
                .catch(err => {
                    console.error(err);
                    showToast('Failed to load favorites.', 'error');
                })
                .finally(() => setLoading(false));
        }
    }, [activeTab, token, showToast, handleSessionExpired]);

    return (
        <div id="history-view" className="view active">
            <div className="glass-card" style={{ maxWidth: '640px', margin: '0 auto' }}>
                <div className="card-title-row">
                    <h2><i className="ph-duotone ph-activity" style={{ color: 'var(--primary)' }}></i> Your Activity</h2>
                    <button onClick={onBack} className="btn btn-secondary btn-small">
                        <i className="ph ph-arrow-left"></i> Back
                    </button>
                </div>

                <div className="tabs">
                    <button
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Scan History
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
                        onClick={() => setActiveTab('favorites')}
                    >
                        Favorites
                    </button>
                </div>

                {loading ? (
                    <p className="text-center text-secondary" style={{ padding: '2rem' }}>Loading...</p>
                ) : activeTab === 'history' ? (
                    <div className="list-container" style={{ maxHeight: '480px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {historyItems.length === 0 ? (
                            <p className="text-center text-secondary" style={{ padding: '2rem' }}>No scan history found.</p>
                        ) : (
                            historyItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="product-list-item"
                                    onClick={() => onSelectProduct(item.barcode)}
                                >
                                    <div className="product-list-item-info">
                                        <span className="product-list-item-title">{item.productName || 'Unknown Product'}</span>
                                        <span className="product-list-item-subtitle">
                                            Barcode: {item.barcode} • {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="product-list-item-action">
                                        <i className="ph ph-caret-right" style={{ fontSize: '1.2rem' }}></i>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="list-container" style={{ maxHeight: '480px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {favoriteItems.length === 0 ? (
                            <p className="text-center text-secondary" style={{ padding: '2rem' }}>No saved products yet.</p>
                        ) : (
                            favoriteItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="product-list-item"
                                    onClick={() => onSelectProduct(item.barcode)}
                                >
                                    <div className="product-list-item-info">
                                        <span className="product-list-item-title">{item.productName || 'Unknown Product'}</span>
                                        <span className="product-list-item-subtitle">Barcode: {item.barcode}</span>
                                    </div>
                                    <div className="product-list-item-action">
                                        <i className="ph ph-caret-right" style={{ fontSize: '1.2rem' }}></i>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
