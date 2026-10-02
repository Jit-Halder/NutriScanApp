import React, { useState } from 'react';

export default function ManualFallbackView({ barcode, token, onSubmitSuccess, onCancel, showToast }) {
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [energy, setEnergy] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [sugar, setSugar] = useState('');
    const [satfat, setSatfat] = useState('');
    const [sodium, setSodium] = useState('');
    const [fiber, setFiber] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const productData = {
            barcode: barcode || 'Manual Entry',
            name,
            brand,
            ingredients,
            nutrition: {
                energyKcal: parseFloat(energy) || 0,
                protein: parseFloat(protein) || 0,
                carbohydrates: parseFloat(carbs) || 0,
                sugars: parseFloat(sugar) || 0,
                saturatedFat: parseFloat(satfat) || 0,
                sodium: parseFloat(sodium) || 0,
                fiber: parseFloat(fiber) || 0,
                fat: 0
            }
        };

        try {
            const payload = {
                barcode: productData.barcode,
                name: productData.name,
                brand: productData.brand,
                ingredients: productData.ingredients,
                nutritionFacts: productData.nutrition,
                packagingDetails: 'Submitted via Web App'
            };

            const res = await fetch('/api/products/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showToast('Product submitted to database!', 'success');
            }
        } catch (err) {
            console.error("Submission error", err);
        } finally {
            setSubmitting(false);
            const analysis = { feedback: 'Product submitted successfully!', warnings: [], suggestions: [] };
            onSubmitSuccess(productData, analysis);
        }
    };

    return (
        <div id="manual-fallback-view" className="view active">
            <div className="glass-card form-card" style={{ maxWidth: '600px' }}>
                <div className="auth-header">
                    <div className="auth-header-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                        <i className="ph-duotone ph-warning-circle" style={{ color: 'var(--score-e)' }}></i>
                    </div>
                    <h2>Product Not Found</h2>
                    <p>We couldn't find this product in our databases. Help us by submitting its details to calculate the score and add it to our system!</p>
                </div>
                <form id="manual-nutrition-form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label htmlFor="input-name">Product Name</label>
                            <input
                                type="text"
                                id="input-name"
                                required
                                placeholder="e.g. Tomato Ketchup"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label htmlFor="input-brand">Brand</label>
                            <input
                                type="text"
                                id="input-brand"
                                required
                                placeholder="e.g. Heinz"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                            />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label htmlFor="input-ingredients">Ingredients (comma separated)</label>
                            <textarea
                                id="input-ingredients"
                                required
                                placeholder="e.g. Tomatoes, Sugar, Salt..."
                                value={ingredients}
                                onChange={(e) => setIngredients(e.target.value)}
                                style={{ resize: 'vertical', minHeight: '80px' }}
                            ></textarea>
                        </div>

                        <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-primary)' }}>
                            <h3 style={{ margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className="ph-fill ph-chart-pie-slice" style={{ color: 'var(--primary)' }}></i> Nutrition Facts <span className="text-muted" style={{ fontWeight: 400, fontSize: '0.8rem' }}>(per 100g)</span>
                            </h3>
                        </div>

                        <div className="form-group">
                            <label htmlFor="input-energy">Energy (kcal)</label>
                            <input type="number" step="any" required value={energy} onChange={(e) => setEnergy(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="input-protein">Protein (g)</label>
                            <input type="number" step="any" required value={protein} onChange={(e) => setProtein(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="input-carbs">Carbs (g)</label>
                            <input type="number" step="any" required value={carbs} onChange={(e) => setCarbs(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="input-sugar">Sugar (g)</label>
                            <input type="number" step="any" required value={sugar} onChange={(e) => setSugar(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="input-satfat">Saturated Fat (g)</label>
                            <input type="number" step="any" required value={satfat} onChange={(e) => setSatfat(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="input-sodium">Sodium (mg)</label>
                            <input type="number" step="any" required value={sodium} onChange={(e) => setSodium(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="input-fiber">Fiber (g)</label>
                            <input type="number" step="any" required value={fiber} onChange={(e) => setFiber(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
                        <button type="submit" disabled={submitting} className="btn btn-primary">
                            <i className="ph ph-check"></i> {submitting ? 'Submitting...' : 'Submit & Calculate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
