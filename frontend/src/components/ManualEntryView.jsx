import React, { useState } from 'react';

export default function ManualEntryView({ onSearch, onBack }) {
    const [barcode, setBarcode] = useState('');

    const handleSearch = () => {
        const code = barcode.trim();
        if (code) {
            onSearch(code);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div id="manual-entry-view" className="view active">
            <div className="glass-card scanner-card">
                <div className="card-title-row">
                    <h2><i className="ph-duotone ph-keyboard" style={{ color: '#6366f1' }}></i> Enter Barcode</h2>
                    <button onClick={onBack} className="btn btn-secondary btn-small">
                        <i className="ph ph-arrow-left"></i> Back
                    </button>
                </div>
                <p className="text-secondary mb-4" style={{ fontSize: '0.925rem' }}>
                    Type the barcode number found on the product packaging.
                </p>
                <div className="flex gap-3">
                    <input
                        type="text"
                        id="manual-barcode"
                        placeholder="e.g. 8901058810235"
                        inputMode="numeric"
                        autoComplete="off"
                        autoFocus
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        onKeyPress={handleKeyPress}
                        style={{
                            flex: 1,
                            fontFamily: 'var(--font-mono)',
                            fontSize: '1.05rem',
                            letterSpacing: '1px'
                        }}
                    />
                    <button onClick={handleSearch} className="btn btn-primary" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                        <i className="ph ph-magnifying-glass" style={{ fontSize: '1.2rem' }}></i>
                    </button>
                </div>
            </div>
        </div>
    );
}
