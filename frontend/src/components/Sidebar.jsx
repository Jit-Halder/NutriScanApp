import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';

export default function Sidebar({
    isCollapsed,
    setIsCollapsed,
    isMobileOpen,
    setIsMobileOpen,
    onLogoutClick
}) {
    const { token, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { currentView, setCurrentView } = useNavigation();

    const handleLogoClick = (e) => {
        e.preventDefault();
        if (window.innerWidth <= 768) {
            setIsMobileOpen(false);
        } else {
            setIsCollapsed(!isCollapsed);
        }
    };

    const handleNavClick = (viewId) => {
        setCurrentView(viewId);
        if (isMobileOpen) {
            setIsMobileOpen(false);
        }
    };

    const userInitials = user && user.name ? user.name.substring(0, 2).toUpperCase() : 'NS';

    return (
        <>
            <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`} id="sidebar">
                <button className="sidebar-logo" onClick={handleLogoClick} aria-label="Toggle sidebar">
                    <div className="sidebar-logo-icon">
                        <i className="ph-fill ph-plant"></i>
                    </div>
                    <div className="sidebar-logo-text">
                        <h1>NutriScan</h1>
                        <span>Health Dashboard</span>
                    </div>
                </button>

                <nav className="sidebar-nav">
                    <div className="sidebar-section-label">Main</div>

                    <button
                        className={`nav-item ${['choice-view', 'scanner-view', 'manual-entry-view', 'results-view', 'manual-fallback-view'].includes(currentView) ? 'active' : ''}`}
                        onClick={() => handleNavClick('choice-view')}
                    >
                        <i className="ph-duotone ph-scan"></i>
                        <span>Scan Product</span>
                    </button>

                    {token && (
                        <button
                            className={`nav-item ${currentView === 'history-view' ? 'active' : ''}`}
                            onClick={() => handleNavClick('history-view')}
                        >
                            <i className="ph-duotone ph-clock-counter-clockwise"></i>
                            <span>Activity</span>
                        </button>
                    )}

                    <div className="sidebar-section-label">Account</div>

                    {!token ? (
                        <button
                            className={`nav-item ${['auth-view', 'otp-view', 'forgot-password-view', 'reset-password-view'].includes(currentView) ? 'active' : ''}`}
                            onClick={() => handleNavClick('auth-view')}
                        >
                            <i className="ph-duotone ph-sign-in"></i>
                            <span>Login / Register</span>
                        </button>
                    ) : (
                        <button className="nav-item" onClick={onLogoutClick}>
                            <i className="ph-duotone ph-sign-out"></i>
                            <span>Logout</span>
                        </button>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={toggleTheme} className="nav-item theme-toggle-nav" aria-label="Toggle Dark Mode">
                        {theme === 'dark' ? (
                            <>
                                <i className="ph ph-sun"></i>
                                <span>Light Mode</span>
                            </>
                        ) : (
                            <>
                                <i className="ph ph-moon"></i>
                                <span>Dark Mode</span>
                            </>
                        )}
                    </button>

                    {token && (
                        <button
                            className={`sidebar-user ${currentView === 'profile-view' ? 'active' : ''}`}
                            onClick={() => handleNavClick('profile-view')}
                            title="View Profile"
                            aria-label="View your profile"
                        >
                            <div className="sidebar-user-avatar">{userInitials}</div>
                            <div className="sidebar-user-info">
                                <div className="sidebar-user-name">{user?.name || 'User'}</div>
                                <div className="sidebar-user-email">{user?.email || 'user@email.com'}</div>
                            </div>
                            <i className="ph ph-caret-right sidebar-user-arrow"></i>
                        </button>
                    )}
                </div>
            </aside>

            {isMobileOpen && (
                <div
                    className="sidebar-overlay active"
                    onClick={() => setIsMobileOpen(false)}
                ></div>
            )}
        </>
    );
}
