import React from 'react';

export default function ChoiceView({ setCurrentView }) {
    return (
        <div id="choice-view" className="view active">
            <div className="hero-section">
                <div className="hero-icon">
                    <div className="hero-icon-wrapper">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 8V6C4 4.895 4.895 4 6 4H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M16 4H18C19.105 4 20 4.895 20 6V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M4 16V18C4 19.105 4.895 20 6 20H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M16 20H18C19.105 20 20 19.105 20 18V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            
                            <rect x="6.5" y="8" width="1.5" height="8" fill="currentColor" rx="0.5"/>
                            <rect x="9.5" y="8" width="1" height="8" fill="currentColor" rx="0.5"/>
                            <rect x="12" y="8" width="2.5" height="8" fill="currentColor" rx="0.5"/>
                            <rect x="16" y="8" width="1.5" height="8" fill="currentColor" rx="0.5"/>
                            
                            <rect x="2" y="11.5" width="20" height="1.5" fill="var(--primary)" rx="0.75" style={{ filter: 'drop-shadow(0 0 4px var(--primary))' }}>
                                <animate attributeName="y" values="7.5; 15; 7.5" dur="2s" repeatCount="indefinite" />
                            </rect>
                        </svg>
                    </div>
                </div>
                <h2 className="hero-title">How would you like to scan?</h2>
                <p className="hero-subtitle">Choose an input method to look up a food product and get instant health insights.</p>

                <div className="choice-grid">
                    <button
                        onClick={() => setCurrentView('scanner-view')}
                        className="choice-card-item choice-card-item--camera"
                    >
                        <div className="choice-card-icon">
                            <i className="ph-fill ph-camera"></i>
                        </div>
                        <div>
                            <strong>Use Camera</strong>
                            <small>Scan barcode with your device camera</small>
                        </div>
                    </button>
                    <button
                        onClick={() => setCurrentView('manual-entry-view')}
                        className="choice-card-item choice-card-item--manual"
                    >
                        <div className="choice-card-icon">
                            <i className="ph-fill ph-keyboard"></i>
                        </div>
                        <div>
                            <strong>Enter Manually</strong>
                            <small>Type or paste a barcode number</small>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
