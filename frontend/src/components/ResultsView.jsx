import React, { useState, useEffect, useRef } from 'react';
import { HealthScoreCalculator, ADDITIVE_INFO } from '../utils/healthScore';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ResultsView({ productData, analysis, onScanAgain }) {
    const { token } = useAuth();
    const { showToast } = useToast();
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    // Radial gauge angle animation state
    const [gaugeAngle, setGaugeAngle] = useState(0);

    const scoreResult = HealthScoreCalculator.analyze(productData || {});
    const nutriGrade = scoreResult.nutriScore.grade;

    // Check favorite status on mount/product change
    useEffect(() => {
        let isMounted = true;
        if (productData && productData.barcode && token) {
            fetch(`/api/products/favorites/check/${productData.barcode}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                if (isMounted && data && typeof data.isFavorite === 'boolean') {
                    setIsFavorite(data.isFavorite);
                }
            })
            .catch(err => console.error("Check favorite error", err));
        }
        return () => { isMounted = false; };
    }, [productData, token]);

    // Animate radial gauge angle
    useEffect(() => {
        let start = null;
        let animationFrameId;
        const duration = 1500;

        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            setGaugeAngle(easeProgress * 360);

            if (progress < 1) {
                animationFrameId = window.requestAnimationFrame(animate);
            }
        };

        animationFrameId = window.requestAnimationFrame(animate);
        return () => window.cancelAnimationFrame(animationFrameId);
    }, [productData]);

    const handleToggleFavorite = async () => {
        if (!productData || !productData.barcode || !token) return;
        setFavoriteLoading(true);

        try {
            const res = await fetch('/api/products/favorites/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    barcode: productData.barcode,
                    productName: productData.name
                })
            });

            if (res.ok) {
                const nextSaved = !isFavorite;
                setIsFavorite(nextSaved);
                showToast(
                    nextSaved ? 'Product saved to favorites!' : 'Product removed from favorites.',
                    nextSaved ? 'success' : 'info'
                );
            } else {
                showToast('Failed to update favorite status.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Error toggling favorite.', 'error');
        } finally {
            setFavoriteLoading(false);
        }
    };

    if (!productData) return null;

    const n = productData.nutrition || {};

    // Source banner text
    let sourceClass = 'source-off';
    let sourceText = 'Data from Open Food Facts';
    let sourceIcon = 'ph-fill ph-database';

    if (productData._source === 'spoonacular') {
        sourceClass = 'source-upc';
        sourceText = 'Data from Spoonacular';
        sourceIcon = 'ph-fill ph-database';
    } else if (productData._source === 'manual' || productData.barcode === 'Manual Entry') {
        sourceClass = 'source-manual';
        sourceText = 'Calculated from User Submission';
        sourceIcon = 'ph-fill ph-user-circle';
    }

    const hasIngredients = productData.ingredients && productData.ingredients !== 'Not available';
    const hasAdditives = productData.additives && productData.additives.length > 0;

    return (
        <div id="results-view" className="view active">
            {/* Data Source Banner */}
            <div className={`data-source-banner ${sourceClass} stagger-item`}>
                <i className={`${sourceIcon} source-icon`}></i>
                <span>{sourceText}</span>
            </div>

            {/* Product Overview Card */}
            <div className="glass-card product-card stagger-item">
                <div className="product-header">
                    {productData.imageUrl && (
                        <img
                            id="product-image"
                            src={productData.imageUrl}
                            alt={productData.name}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    )}
                    <div className="product-titles">
                        <h2>{productData.name}</h2>
                        <p className="brand">{productData.brand}</p>
                        <div className="product-meta">
                            <div className="barcode-chip">
                                <i className="ph ph-barcode" style={{ fontSize: '1rem' }}></i>
                                <span>{productData.barcode || 'N/A'}</span>
                            </div>
                            <button
                                disabled={favoriteLoading}
                                onClick={handleToggleFavorite}
                                className="btn btn-secondary btn-small"
                                style={{ borderRadius: 'var(--radius-full)' }}
                            >
                                <i className={isFavorite ? "ph-fill ph-heart" : "ph ph-heart"} style={{ color: isFavorite ? 'var(--score-e)' : '' }}></i>
                                <span>{isFavorite ? 'Saved' : 'Save'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nutri-Score Section */}
            <div className="glass-card score-card stagger-item">
                <h3><i className="ph-fill ph-medal" style={{ color: 'var(--primary)', fontSize: '1rem' }}></i> Nutri-Score</h3>
                <div className="nutri-score-display">
                    <div className="nutri-gauge-container">
                        <div
                            className="nutri-gauge"
                            style={{
                                '--gauge-color': scoreResult.nutriScore.color,
                                '--gauge-angle': `${gaugeAngle}deg`
                            }}
                        >
                            <div className="nutri-gauge-label">
                                <div className="nutri-gauge-letter" style={{ color: scoreResult.nutriScore.color }}>
                                    {nutriGrade}
                                </div>
                                <div className="nutri-gauge-sublabel">Score</div>
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="nutri-blocks">
                                {['A', 'B', 'C', 'D', 'E'].map((letter) => {
                                    const isCurrent = letter === nutriGrade;
                                    const bgColors = {
                                        A: 'var(--score-a)',
                                        B: 'var(--score-b)',
                                        C: 'var(--score-c)',
                                        D: 'var(--score-d)',
                                        E: 'var(--score-e)'
                                    };
                                    return (
                                        <div
                                            key={letter}
                                            className={`nutri-block anim-in ${isCurrent ? 'anim-highlight' : ''}`}
                                            style={{ backgroundColor: bgColors[letter] }}
                                        >
                                            {letter}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="score-text">
                                <h4>{scoreResult.nutriScore.description}</h4>
                                <p className="reason-text">{scoreResult.nutriScore.reason}</p>
                                
                                {analysis && (analysis.feedback || (analysis.warnings && analysis.warnings.length > 0) || (analysis.suggestions && analysis.suggestions.length > 0)) && (
                                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
                                        {analysis.feedback && (
                                            <strong style={{ display: 'block', marginBottom: '4px' }}>{analysis.feedback}</strong>
                                        )}
                                        {analysis.warnings && analysis.warnings.length > 0 && (
                                            <span style={{ color: 'var(--score-e)', display: 'block', fontWeight: 500, fontSize: '0.9em' }}>
                                                ⚠️ {analysis.warnings.join(', ')}
                                            </span>
                                        )}
                                        {analysis.suggestions && analysis.suggestions.length > 0 && (
                                            <span style={{ color: 'var(--score-a)', display: 'block', fontWeight: 500, fontSize: '0.9em' }}>
                                                💡 {analysis.suggestions.join(', ')}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {scoreResult.novaGroup && (
                    <div id="nova-section" className="nova-display" style={{ marginTop: 'var(--space-6)' }}>
                        <h3><i className="ph-fill ph-flask" style={{ color: 'var(--accent-500)', fontSize: '1rem' }}></i> NOVA Classification</h3>
                        <div className="score-details">
                            <div className="score-badge nova-badge" style={{ backgroundColor: scoreResult.novaGroup.color }}>
                                <span>{scoreResult.novaGroup.group}</span>
                            </div>
                            <div className="score-text">
                                <h4>{scoreResult.novaGroup.description}</h4>
                                <p className="reason-text">{scoreResult.novaGroup.reason}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Ingredients & Additives Card */}
            {(hasIngredients || hasAdditives) && (
                <div className="glass-card ingredients-card stagger-item">
                    <h3><i className="ph-fill ph-leaf" style={{ color: 'var(--primary)', fontSize: '1rem' }}></i> Ingredients</h3>
                    {hasIngredients && (
                        <p
                            className="ingredients-text"
                            dangerouslySetInnerHTML={{
                                __html: HealthScoreCalculator.highlightBadIngredients(productData.ingredients)
                            }}
                        ></p>
                    )}

                    {hasAdditives && (
                        <div className="additives-container">
                            <h4>
                                <i className="ph-fill ph-warning-octagon" style={{ color: 'var(--score-e)' }}></i>
                                Additives Detected
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {productData.additives.map((add, idx) => {
                                    const cleanName = add.replace(/^[a-z]+:/i, '').toUpperCase().replace(/-/g, ' ');
                                    const rawE = cleanName.match(/E\d+[A-Z]?/i);
                                    let tooltip = "Food additive or preservative.";
                                    if (rawE && ADDITIVE_INFO[rawE[0].toUpperCase()]) {
                                        tooltip = ADDITIVE_INFO[rawE[0].toUpperCase()];
                                    } else if (rawE && rawE[0].toUpperCase().startsWith('E150')) {
                                        tooltip = 'Caramel color: Food coloring. Generally safe but some types are controversial.';
                                    }
                                    return (
                                        <span key={idx} className="additive-chip" title={tooltip}>
                                            {cleanName}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Nutrition Facts Card */}
            <div className="glass-card nutrition-card stagger-item">
                <h3>
                    <i className="ph-fill ph-chart-pie-slice" style={{ color: 'var(--primary)', fontSize: '1rem' }}></i> Nutrition Facts{' '}
                    <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 400, textTransform: 'none', letterSpacing: 'normal', marginLeft: '0.5rem' }}>
                        (per 100g)
                    </span>
                </h3>
                <div className="macro-grid">
                    <MacroCard label="Energy" value={n.energyKcal} suffix="kcal" decimals={0} />
                    <MacroCard label="Protein" value={n.protein} suffix="g" decimals={1} />
                    <MacroCard label="Carbs" value={n.carbohydrates} suffix="g" decimals={1} />
                    <MacroCard
                        label="Sugars"
                        value={n.sugars}
                        suffix="g"
                        decimals={1}
                        level={(n.sugars > 22.5) ? 'high' : (n.sugars > 5) ? 'med' : 'low'}
                    />
                    <MacroCard label="Fat" value={n.fat} suffix="g" decimals={1} />
                    <MacroCard
                        label="Sat. Fat"
                        value={n.saturatedFat}
                        suffix="g"
                        decimals={1}
                        level={(n.saturatedFat > 5) ? 'high' : (n.saturatedFat > 1.5) ? 'med' : 'low'}
                    />
                    <MacroCard label="Fiber" value={n.fiber} suffix="g" decimals={1} />
                    <MacroCard
                        label="Sodium"
                        value={n.sodium}
                        suffix="mg"
                        decimals={0}
                        level={(n.sodium > 600) ? 'high' : (n.sodium > 120) ? 'med' : 'low'}
                    />
                </div>
            </div>

            {/* Action Bar */}
            <div className="mt-6 stagger-item">
                <button onClick={onScanAgain} className="btn btn-primary btn-large">
                    <i className="ph ph-scan" style={{ fontSize: '1.2rem' }}></i> Scan Another Product
                </button>
            </div>
        </div>
    );
}

function MacroCard({ label, value, suffix, decimals = 0, level }) {
    const valNum = (value !== undefined && value !== null) ? Number(value) : 0;
    const levelClass = level ? `macro-${level}` : '';

    return (
        <div className={`macro-card ${levelClass}`}>
            <div className="macro-value">
                {valNum.toFixed(decimals)} {suffix}
            </div>
            <div className="macro-label">{label}</div>
        </div>
    );
}
