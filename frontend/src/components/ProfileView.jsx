import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProfileView({ onBack, onOpenDeleteModal }) {
    const { token } = useAuth();
    const { showToast } = useToast();

    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [healthConditions, setHealthConditions] = useState('');
    const [allergies, setAllergies] = useState('');
    const [dietaryPreferences, setDietaryPreferences] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!token) return;

        fetch('/api/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : null)
            .then(profile => {
                if (profile) {
                    if (profile.name) setName(profile.name);
                    if (profile.age) setAge(profile.age);
                    if (profile.gender) setGender(profile.gender);
                    if (profile.healthConditions) setHealthConditions(profile.healthConditions.join(', '));
                    if (profile.allergies) setAllergies(profile.allergies.join(', '));
                    if (profile.dietaryPreferences) setDietaryPreferences(profile.dietaryPreferences.join(', '));
                }

                // If name is not in profile, fetch from /api/auth/me
                if (!profile || !profile.name) {
                    fetch('/api/auth/me', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                        .then(res => res.ok ? res.json() : null)
                        .then(meData => {
                            if (meData && meData.name) setName(meData.name);
                        })
                        .catch(() => {});
                }
            })
            .catch(err => console.error(err));
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const body = {
            age: age ? Number(age) : null,
            gender,
            healthConditions: healthConditions.split(',').map(s => s.trim()).filter(Boolean),
            allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
            dietaryPreferences: dietaryPreferences.split(',').map(s => s.trim()).filter(Boolean)
        };

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                showToast('Profile updated successfully!', 'success');
                onBack();
            } else {
                showToast('Failed to update profile.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Error saving profile.', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div id="profile-view" className="view active">
            <div className="glass-card form-card" style={{ maxWidth: '600px' }}>
                <div className="card-title-row">
                    <h2><i className="ph-duotone ph-user-circle" style={{ color: 'var(--primary)' }}></i> User Profile</h2>
                    <button onClick={onBack} className="btn btn-secondary btn-small">
                        <i className="ph ph-arrow-left"></i> Back
                    </button>
                </div>
                <form id="profile-form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Name</label>
                            <div style={{
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--input-border)',
                                background: 'var(--bg-tertiary)',
                                color: 'var(--text-primary)',
                                fontWeight: 500,
                                minHeight: '48px',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                {name || 'User'}
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="prof-age">Age</label>
                            <input
                                type="number"
                                id="prof-age"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="prof-gender">Gender</label>
                            <select
                                id="prof-gender"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                            >
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="prof-conditions">Health Conditions</label>
                            <input
                                type="text"
                                id="prof-conditions"
                                placeholder="e.g., diabetes, hypertension"
                                value={healthConditions}
                                onChange={(e) => setHealthConditions(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="prof-allergies">Allergies</label>
                            <input
                                type="text"
                                id="prof-allergies"
                                placeholder="e.g., peanuts, dairy"
                                value={allergies}
                                onChange={(e) => setAllergies(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="prof-diet">Dietary Preferences</label>
                            <input
                                type="text"
                                id="prof-diet"
                                placeholder="e.g., vegan, keto"
                                value={dietaryPreferences}
                                onChange={(e) => setDietaryPreferences(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onBack} className="btn btn-secondary">Close</button>
                        <button type="submit" disabled={saving} className="btn btn-primary">
                            <i className="ph ph-check"></i> {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-primary)', paddingTop: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={onOpenDeleteModal}
                            className="btn btn-danger btn-large"
                        >
                            <i className="ph ph-trash"></i> Delete Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
