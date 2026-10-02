import React from 'react';

export default function MobileHeader({ onMenuClick }) {
    return (
        <header className="mobile-header hidden-desktop">
            <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Open menu">
                <i className="ph ph-list"></i>
            </button>
            <div className="mobile-logo-text">NutriScan</div>
            <div style={{ width: '40px' }}></div>
        </header>
    );
}
