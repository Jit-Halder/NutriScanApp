import React from 'react';

export default function LoadingView({ statusText = 'Analyzing product...' }) {
    return (
        <div id="loading-view" className="view active">
            <div className="glass-card" style={{ maxWidth: '560px', margin: '0 auto' }}>
                <div className="flex items-center gap-4 mb-6">
                    <div className="skeleton skeleton-image"></div>
                    <div style={{ flex: 1 }}>
                        <div className="skeleton skeleton-text" style={{ width: '75%' }}></div>
                        <div className="skeleton skeleton-text" style={{ width: '45%', marginBottom: 0 }}></div>
                    </div>
                </div>
                <div className="skeleton skeleton-block"></div>
                <div className="skeleton skeleton-block" style={{ height: '140px' }}></div>
                
                <div className="text-center mt-8">
                    <div className="loader"></div>
                    <p className="loading-subtext" id="loading-status">{statusText}</p>
                </div>
            </div>
        </div>
    );
}
