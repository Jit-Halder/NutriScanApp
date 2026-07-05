/**
 * app.js - Main Application Orchestrator
 */

window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Add icon based on type
    let iconSvg = '';
    if (type === 'error') {
        iconSvg = `<i class="ph-fill ph-x-circle" style="font-size: 1.2rem; color: var(--score-e);"></i>`;
    } else if (type === 'success') {
        iconSvg = `<i class="ph-fill ph-check-circle" style="font-size: 1.2rem; color: var(--score-a);"></i>`;
    } else {
        iconSvg = `<i class="ph-fill ph-info" style="font-size: 1.2rem; color: var(--primary);"></i>`;
    }

    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const authView = document.getElementById('auth-view');
    const otpView = document.getElementById('otp-view');
    const profileView = document.getElementById('profile-view');
    const choiceView = document.getElementById('choice-view');
    const scannerView = document.getElementById('scanner-view');
    const manualEntryView = document.getElementById('manual-entry-view');
    const loadingView = document.getElementById('loading-view');
    const manualFallbackView = document.getElementById('manual-fallback-view');
    const resultsView = document.getElementById('results-view');
    const historyView = document.getElementById('history-view');

    const allViews = [authView, otpView, profileView, choiceView, scannerView, manualEntryView, loadingView, manualFallbackView, resultsView, historyView];

    // Nav Buttons (Sidebar)
    const navScan = document.getElementById('nav-scan');
    const navHistory = document.getElementById('nav-history');
    const navAuth = document.getElementById('nav-auth');
    const navProfile = document.getElementById('nav-profile');
    const navLogout = document.getElementById('nav-logout');
    const sidebarUserSection = document.getElementById('sidebar-user-section');
    const sidebarUserName = document.getElementById('sidebar-user-name');
    const sidebarUserEmail = document.getElementById('sidebar-user-email');
    const sidebarAvatar = document.getElementById('sidebar-avatar');

    const navItems = [navScan, navHistory, navAuth, navProfile];

    // Sidebar Toggle
    const sidebar = document.getElementById('sidebar');
    const sidebarLogoLink = document.getElementById('sidebar-logo-link');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');

    // Auth Form
    const authForm = document.getElementById('auth-form');
    const authEmail = document.getElementById('auth-email');
    const authPassword = document.getElementById('auth-password');
    const togglePassword = document.getElementById('toggle-password');
    const authName = document.getElementById('auth-name');
    const authNameGroup = document.getElementById('auth-name-group');
    const btnToggleAuth = document.getElementById('btn-toggle-auth');
    const btnSubmitAuth = document.getElementById('btn-submit-auth');
    
    // OTP Form
    const otpForm = document.getElementById('otp-form');
    const otpCode = document.getElementById('otp-code');
    const btnBackToLogin = document.getElementById('btn-back-to-login');

    // Profile Form
    const profileForm = document.getElementById('profile-form');
    const btnCloseProfile = document.getElementById('btn-close-profile');
    const btnDeleteAccount = document.getElementById('btn-delete-account');

    // Delete Modal
    const deleteModal = document.getElementById('delete-modal');
    const btnCancelDelete = document.getElementById('btn-cancel-delete');
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');

    // Logout Modal
    const logoutModal = document.getElementById('logout-modal');
    const btnCancelLogout = document.getElementById('btn-cancel-logout');
    const btnConfirmLogout = document.getElementById('btn-confirm-logout');

    // Choice Screen
    const btnUseCamera = document.getElementById('btn-use-camera');
    const btnUseManual = document.getElementById('btn-use-manual');

    // History & Favorites View
    const btnCloseHistory = document.getElementById('btn-close-history');
    const tabHistory = document.getElementById('tab-history');
    const tabFavorites = document.getElementById('tab-favorites');
    const historyList = document.getElementById('history-list');
    const favoritesList = document.getElementById('favorites-list');

    // Scanner
    const manualBarcodeInput = document.getElementById('manual-barcode');
    const btnManualSearch = document.getElementById('btn-manual-search');
    const btnBackFromCamera = document.getElementById('btn-back-from-camera');
    const btnBackFromManual = document.getElementById('btn-back-from-manual');
    const btnScanAgain = document.getElementById('btn-scan-again');

    const loadingStatus = document.getElementById('loading-status');

    let scanner = null;
    let currentBarcode = null;
    let isRegistering = false;
    let authToken = localStorage.getItem('token');

    initTheme();
    initApp();
    checkAuth();

    function initTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIconMoon = document.getElementById('theme-icon-moon');
        const themeIconSun = document.getElementById('theme-icon-sun');

        function applyTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('nutriscan-theme', theme);
            if (theme === 'light') {
                themeIconMoon.classList.add('hidden');
                themeIconSun.classList.remove('hidden');
            } else {
                themeIconMoon.classList.remove('hidden');
                themeIconSun.classList.add('hidden');
            }
        }
        const savedTheme = localStorage.getItem('nutriscan-theme') || 'light';
        applyTheme(savedTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            applyTheme(currentTheme === 'light' ? 'dark' : 'light');
        });
    }

    function initApp() {
        scanner = new BarcodeScanner('reader', handleSuccessfulScan);

        // Auth Logic
        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                const type = authPassword.getAttribute('type') === 'password' ? 'text' : 'password';
                authPassword.setAttribute('type', type);
                if (type === 'text') {
                    togglePassword.innerHTML = `<i class="ph ph-eye-slash" style="font-size: 1.15rem;"></i>`;
                } else {
                    togglePassword.innerHTML = `<i class="ph ph-eye" style="font-size: 1.15rem;"></i>`;
                }
            });
        }

        // Sidebar Toggle
        const dashboard = document.querySelector('.dashboard');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                sidebar.classList.add('open');
                sidebarOverlay.classList.add('active');
            });
        }

        if (sidebarLogoLink) {
            sidebarLogoLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                    sidebarOverlay.classList.remove('active');
                } else if (dashboard) {
                    dashboard.classList.toggle('is-collapsed');
                }
            });
        }
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('active');
            });
        }

        // Sidebar Navigation
        navItems.forEach(item => {
            if (item) {
                item.addEventListener('click', (e) => {
                    const targetViewId = item.getAttribute('data-view');
                    const targetView = document.getElementById(targetViewId);
                    if (targetView) {
                        showView(targetView);
                    }
                });
            }
        });

        btnToggleAuth.addEventListener('click', () => {
            isRegistering = !isRegistering;
            authNameGroup.style.display = isRegistering ? 'block' : 'none';
            btnToggleAuth.textContent = isRegistering ? 'Already have an account? Login here' : 'Don\'t have an account? Register here';
            btnSubmitAuth.textContent = isRegistering ? 'Register' : 'Login';
        });

        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
            const body = { email: authEmail.value, password: authPassword.value };
            if (isRegistering) body.name = authName.value;

            const originalText = btnSubmitAuth.textContent;
            btnSubmitAuth.disabled = true;
            btnSubmitAuth.textContent = isRegistering ? 'Registering...' : 'Logging in...';

            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                const data = await res.json();
                if (res.ok) {
                    if (isRegistering) {
                        window.showToast('Registered! Please check your email for OTP.', 'success');
                        showView(otpView);
                    } else {
                        authToken = data.token;
                        localStorage.setItem('token', authToken);
                        checkAuth();
                    }
                } else {
                    if (data.notVerified) {
                        window.showToast(data.message, 'error');
                        showView(otpView);
                    } else {
                        window.showToast(data.message || 'Auth failed', 'error');
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                btnSubmitAuth.disabled = false;
                btnSubmitAuth.textContent = originalText;
            }
        });

        otpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnSubmitOtp = document.getElementById('btn-submit-otp');
            const originalText = btnSubmitOtp.textContent;
            btnSubmitOtp.disabled = true;
            btnSubmitOtp.textContent = 'Verifying...';

            try {
                const res = await fetch('/api/auth/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: authEmail.value, otp: otpCode.value })
                });
                const data = await res.json();
                if (res.ok) {
                    isRegistering = false;
                    otpCode.value = ''; // Clear OTP input
                    
                    // Explicitly switch the UI back to Login mode
                    authNameGroup.style.display = 'none';
                    btnToggleAuth.textContent = 'Don\'t have an account? Register here';
                    btnSubmitAuth.textContent = 'Login';
                    authName.value = ''; // Clear the name field since it's login now
                    
                    // Auto-login the user since we already have their email and password in the fields
                    try {
                        const loginRes = await fetch('/api/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: authEmail.value, password: authPassword.value })
                        });
                        const loginData = await loginRes.json();
                        if (loginRes.ok) {
                            window.showToast('Email verified! Logging you in...', 'success');
                            authToken = loginData.token;
                            localStorage.setItem('token', authToken);
                            checkAuth();
                        } else {
                            window.showToast('Email verified successfully. Please login.', 'success');
                            showView(authView); // Fallback to login view if auto-login fails
                        }
                    } catch (e) {
                        window.showToast('Email verified successfully. Please login.', 'success');
                        showView(authView);
                    }
                } else {
                    window.showToast(data.message || 'Verification failed', 'error');
                }
            } catch (err) {
                console.error(err);
            } finally {
                btnSubmitOtp.disabled = false;
                btnSubmitOtp.textContent = originalText;
            }
        });

        const resendOtpBtn = document.getElementById('resend-otp-btn');
        const resendOtpTimer = document.getElementById('resend-otp-timer');
        let resendCooldown = 0;
        let resendInterval;

        if (resendOtpBtn) {
            resendOtpBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (resendCooldown > 0) return;

                const email = authEmail.value;
                if (!email) {
                    window.showToast('Email is missing', 'error');
                    return;
                }

                try {
                    // Show loading state
                    resendOtpBtn.textContent = 'Sending...';
                    resendOtpBtn.style.pointerEvents = 'none';
                    resendOtpBtn.style.color = 'var(--text-muted)';

                    await BackendAPI.resendOTP(email);
                    window.showToast('OTP resent successfully!', 'success');

                    // Start cooldown
                    resendCooldown = 60;
                    resendOtpBtn.style.display = 'none';
                    resendOtpTimer.style.display = 'inline';
                    
                    resendInterval = setInterval(() => {
                        resendCooldown--;
                        resendOtpTimer.textContent = `Wait ${resendCooldown}s`;
                        if (resendCooldown <= 0) {
                            clearInterval(resendInterval);
                            resendOtpBtn.style.display = 'inline';
                            resendOtpBtn.textContent = 'Resend OTP';
                            resendOtpBtn.style.pointerEvents = 'auto';
                            resendOtpBtn.style.color = 'var(--primary)';
                            resendOtpTimer.style.display = 'none';
                        }
                    }, 1000);

                } catch (error) {
                    window.showToast(error.message || 'Failed to resend OTP', 'error');
                    resendOtpBtn.textContent = 'Resend OTP';
                    resendOtpBtn.style.pointerEvents = 'auto';
                    resendOtpBtn.style.color = 'var(--primary)';
                }
            });
        }

        btnBackToLogin.addEventListener('click', () => {
            showView(authView);
        });

        navLogout.addEventListener('click', (e) => {
            e.preventDefault();
            logoutModal.classList.remove('hidden');
            logoutModal.classList.add('active');
        });

        if (btnCancelLogout) {
            btnCancelLogout.addEventListener('click', () => {
                logoutModal.classList.remove('active');
                logoutModal.classList.add('hidden');
            });
        }

        if (btnConfirmLogout) {
            btnConfirmLogout.addEventListener('click', () => {
                logoutModal.classList.remove('active');
                logoutModal.classList.add('hidden');
                authToken = null;
                localStorage.removeItem('token');
                authEmail.value = '';
                authPassword.value = '';
                authName.value = '';
                sidebarUserSection.classList.add('hidden');
                checkAuth();
            });
        }

        // Close profile back to scan
        const btnCloseProfile2 = document.getElementById('btn-close-profile-2');
        if (btnCloseProfile2) btnCloseProfile2.addEventListener('click', () => showView(choiceView));

        btnCloseHistory.addEventListener('click', () => showView(choiceView));

        tabHistory.addEventListener('click', () => {
            tabHistory.classList.add('active');
            tabHistory.style.borderBottomColor = 'var(--primary)';
            tabHistory.style.color = 'var(--text-primary)';
            
            tabFavorites.classList.remove('active');
            tabFavorites.style.borderBottomColor = 'transparent';
            tabFavorites.style.color = 'var(--text-secondary)';
            
            historyList.classList.remove('hidden');
            favoritesList.classList.add('hidden');
            loadHistory();
        });

        tabFavorites.addEventListener('click', () => {
            tabFavorites.classList.add('active');
            tabFavorites.style.borderBottomColor = 'var(--primary)';
            tabFavorites.style.color = 'var(--text-primary)';
            
            tabHistory.classList.remove('active');
            tabHistory.style.borderBottomColor = 'transparent';
            tabHistory.style.color = 'var(--text-secondary)';
            
            favoritesList.classList.remove('hidden');
            historyList.classList.add('hidden');
            loadFavorites();
        });

        async function loadHistory() {
            historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Loading history...</p>';
            try {
                const res = await fetch('/api/products/history', {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.length === 0) {
                        historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No scan history found.</p>';
                        return;
                    }
                    historyList.innerHTML = data.map(item => `
                        <div class="product-list-item" data-barcode="${item.barcode}">
                            <div class="product-list-item-info">
                                <span class="product-list-item-title">${item.productName || 'Unknown Product'}</span>
                                <span class="product-list-item-subtitle">Barcode: ${item.barcode} • ${new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div class="product-list-item-action">
                                <i class="ph ph-caret-right" style="font-size: 1.2rem;"></i>
                            </div>
                        </div>
                    `).join('');

                    // Add click listeners to load the product
                    historyList.querySelectorAll('.product-list-item').forEach(el => {
                        el.addEventListener('click', () => {
                            handleSuccessfulScan(el.dataset.barcode);
                        });
                    });
                }
            } catch (err) {
                console.error(err);
                historyList.innerHTML = '<p style="text-align: center; color: var(--score-avoid); padding: 20px;">Failed to load history.</p>';
            }
        }

        async function loadFavorites() {
            favoritesList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Loading favorites...</p>';
            try {
                const res = await fetch('/api/products/favorites', {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.length === 0) {
                        favoritesList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No saved products yet.</p>';
                        return;
                    }
                    favoritesList.innerHTML = data.map(item => `
                        <div class="product-list-item" data-barcode="${item.barcode}">
                            <div class="product-list-item-info">
                                <span class="product-list-item-title">${item.productName || 'Unknown Product'}</span>
                                <span class="product-list-item-subtitle">Barcode: ${item.barcode}</span>
                            </div>
                            <div class="product-list-item-action">
                                <i class="ph ph-caret-right" style="font-size: 1.2rem;"></i>
                            </div>
                        </div>
                    `).join('');

                    // Add click listeners to load the product
                    favoritesList.querySelectorAll('.product-list-item').forEach(el => {
                        el.addEventListener('click', () => {
                            handleSuccessfulScan(el.dataset.barcode);
                        });
                    });
                }
            } catch (err) {
                console.error(err);
                favoritesList.innerHTML = '<p style="text-align: center; color: var(--score-avoid); padding: 20px;">Failed to load favorites.</p>';
            }
        }

        // Fetch profile logic is triggered when navProfile is clicked via showView intercept
        // We'll hook into showView for active state and breadcrumb updates.
        // Profile logic fetch moved to checkAuth or showView hook, but let's just keep a standalone fetch for it
        // Fetch profile logic was moved to the global DOMContentLoaded scope so showView can access it

        btnCloseProfile.addEventListener('click', () => showView(choiceView));

        btnDeleteAccount.addEventListener('click', (e) => {
            // Prevent default form submission behavior since the button is inside a form
            e.preventDefault();
            deleteModal.classList.remove('hidden');
            deleteModal.classList.add('active');
        });

        btnCancelDelete.addEventListener('click', () => {
            deleteModal.classList.remove('active');
            setTimeout(() => deleteModal.classList.add('hidden'), 300);
        });

        btnConfirmDelete.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                // Disable button and show loading state
                btnConfirmDelete.disabled = true;
                btnConfirmDelete.textContent = 'Deleting...';

                const currentToken = localStorage.getItem('token');
                const res = await fetch('/api/auth/delete', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${currentToken}` }
                });
                
                if (res.ok) {
                    window.showToast('Account deleted successfully', 'success');
                    authToken = null;
                    localStorage.removeItem('token');
                    authEmail.value = '';
                    authPassword.value = '';
                    authName.value = '';
                    
                    // Hide modal and trigger checkAuth to show login screen
                    deleteModal.classList.remove('active');
                    setTimeout(() => {
                        deleteModal.classList.add('hidden');
                        checkAuth();
                    }, 300);
                } else {
                    const data = await res.json();
                    window.showToast(data.message || 'Failed to delete account', 'error');
                }
            } catch(err) {
                console.error(err);
                window.showToast('An error occurred', 'error');
            } finally {
                btnConfirmDelete.disabled = false;
                btnConfirmDelete.textContent = 'Delete';
            }
        });

        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const body = {
                age: document.getElementById('prof-age').value,
                gender: document.getElementById('prof-gender').value,
                healthConditions: document.getElementById('prof-conditions').value.split(',').map(s=>s.trim()).filter(Boolean),
                allergies: document.getElementById('prof-allergies').value.split(',').map(s=>s.trim()).filter(Boolean),
                dietaryPreferences: document.getElementById('prof-diet').value.split(',').map(s=>s.trim()).filter(Boolean),
            };

            try {
                const res = await fetch('/api/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(body)
                });
                if (res.ok) {
                    window.showToast('Profile updated', 'success');
                    showView(choiceView);
                }
            } catch(err) { console.error(err); }
        });

        // Scanning
        btnUseCamera.addEventListener('click', () => {
            showView(scannerView);
            setTimeout(() => { if (scanner) scanner.start(); }, 300);
        });

        btnUseManual.addEventListener('click', () => {
            showView(manualEntryView);
            manualBarcodeInput.value = '';
            setTimeout(() => manualBarcodeInput.focus(), 350);
        });

        btnBackFromCamera.addEventListener('click', () => {
            scanner.stop();
            showView(choiceView);
        });

        btnBackFromManual.addEventListener('click', () => showView(choiceView));
        btnScanAgain.addEventListener('click', () => showView(choiceView));

        btnManualSearch.addEventListener('click', () => {
            const code = manualBarcodeInput.value.trim();
            if (code) handleSuccessfulScan(code);
        });

        manualBarcodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const code = manualBarcodeInput.value.trim();
                if (code) handleSuccessfulScan(code);
            }
        });

        // Manual Submit Fallback Logic
        document.getElementById('btn-cancel-manual').addEventListener('click', () => {
            showView(choiceView);
        });

        document.getElementById('manual-nutrition-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const productData = {
                barcode: currentBarcode || 'Manual Entry',
                name: document.getElementById('input-name').value,
                brand: document.getElementById('input-brand').value,
                ingredients: document.getElementById('input-ingredients').value,
                nutrition: {
                    energyKcal: parseFloat(document.getElementById('input-energy').value) || 0,
                    protein: parseFloat(document.getElementById('input-protein').value) || 0,
                    carbohydrates: parseFloat(document.getElementById('input-carbs').value) || 0,
                    sugars: parseFloat(document.getElementById('input-sugar').value) || 0,
                    saturatedFat: parseFloat(document.getElementById('input-satfat').value) || 0,
                    sodium: parseFloat(document.getElementById('input-sodium').value) || 0,
                    fiber: parseFloat(document.getElementById('input-fiber').value) || 0,
                    fat: 0 // Fallback
                }
            };

            // Calculate score locally for immediate feedback
            const analysis = { feedback: 'Product submitted successfully!', warnings: [], suggestions: [] };
            
            // Post to backend to save submission
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
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(payload)
                });
                
                if (res.ok) {
                    window.showToast('Product submitted to database!', 'success');
                }
            } catch(err) {
                console.error("Submission error", err);
            }

            // Render Results
            renderResults(productData, analysis);
            
            // Show manual badge
            document.getElementById('data-source-banner').classList.remove('hidden');
            document.getElementById('source-icon').className = 'ph-fill ph-user-circle source-icon source-manual';
            document.getElementById('source-text').textContent = 'Calculated from User Submission';
            
            showView(resultsView);
        });
    }

    async function checkAuth() {
        if (authToken) {
            document.querySelector('.dashboard').classList.remove('auth-mode');
            navScan.classList.remove('hidden');
            navAuth.classList.add('hidden');
            navProfile.classList.remove('hidden');
            navHistory.classList.remove('hidden');
            navLogout.classList.remove('hidden');
            sidebarUserSection.classList.remove('hidden');
            
            // Try to fetch user info for sidebar
            try {
                const meRes = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                if (meRes.ok) {
                    const meData = await meRes.json();
                    if (meData.name) {
                        sidebarUserName.textContent = meData.name;
                        sidebarAvatar.textContent = meData.name.substring(0, 2).toUpperCase();
                    }
                    if (meData.email) {
                        sidebarUserEmail.textContent = meData.email;
                    }
                }
            } catch (e) { console.error(e); }

            showView(choiceView);
        } else {
            document.querySelector('.dashboard').classList.add('auth-mode');
            navScan.classList.add('hidden');
            navAuth.classList.remove('hidden');
            navProfile.classList.add('hidden');
            navHistory.classList.add('hidden');
            navLogout.classList.add('hidden');
            sidebarUserSection.classList.add('hidden');
            showView(authView);
        }
    }

    async function fetchProfileData() {
        try {
            const res = await fetch('/api/profile', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            let userName = '';
            if (res.ok) {
                const profile = await res.json();
                userName = profile.name || '';
                document.getElementById('prof-age').value = profile.age || '';
                document.getElementById('prof-gender').value = profile.gender || '';
                document.getElementById('prof-conditions').value = profile.healthConditions ? profile.healthConditions.join(', ') : '';
                document.getElementById('prof-allergies').value = profile.allergies ? profile.allergies.join(', ') : '';
                document.getElementById('prof-diet').value = profile.dietaryPreferences ? profile.dietaryPreferences.join(', ') : '';
            }

            if (!userName) {
                try {
                    const meRes = await fetch('/api/auth/me', {
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    if (meRes.ok) {
                        const meData = await meRes.json();
                        userName = meData.name || '';
                    }
                } catch (e) { console.error('Failed to fetch user me:', e); }
            }

            document.getElementById('prof-name').textContent = userName;
            
            // Update sidebar user info
            if (userName && sidebarUserName) {
                sidebarUserName.textContent = userName;
                const initials = userName.substring(0, 2).toUpperCase();
                sidebarAvatar.textContent = initials;
            }
        } catch(e) { console.error(e); }
    }

    function showView(viewElement) {
        // Hide mobile sidebar if open
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        }

        allViews.forEach(v => {
            v.classList.remove('active');
            setTimeout(() => {
                if (!v.classList.contains('active')) v.classList.add('hidden');
            }, 300);
            
            // Reset stagger animations by removing and re-adding them
            const staggerItems = v.querySelectorAll('.stagger-item');
            staggerItems.forEach(item => {
                item.style.animation = 'none';
                item.offsetHeight; /* trigger reflow */
                item.style.animation = null; 
            });
        });
        
        viewElement.classList.remove('hidden');
        void viewElement.offsetWidth;
        viewElement.classList.add('active');

        // Update active nav state and breadcrumb
        let matchedNav = null;
        let breadcrumbText = 'NutriScan';

        if (viewElement === choiceView || viewElement === scannerView || viewElement === manualEntryView) {
            matchedNav = navScan;
            breadcrumbText = 'Scan Product';
        } else if (viewElement === historyView) {
            matchedNav = navHistory;
            breadcrumbText = 'Activity';
            if (typeof loadHistory === 'function') loadHistory();
        } else if (viewElement === authView || viewElement === otpView) {
            matchedNav = navAuth;
            breadcrumbText = 'Login / Register';
        } else if (viewElement === profileView) {
            matchedNav = navProfile;
            breadcrumbText = 'Profile';
            if (typeof fetchProfileData === 'function') fetchProfileData();
        } else if (viewElement === resultsView) {
            breadcrumbText = 'Results';
        }

        navItems.forEach(item => {
            if (item) item.classList.remove('active');
        });

        if (matchedNav) {
            matchedNav.classList.add('active');
        }

        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = breadcrumbText;
        }
    }

    async function handleSuccessfulScan(barcodeText) {
        try { if (navigator.vibrate) navigator.vibrate([200]); } catch(e) {}
        if(scanner) scanner.stop();
        currentBarcode = barcodeText;
        showView(loadingView);
        loadingStatus.textContent = 'Analyzing product...';

        try {
            const res = await fetch(`/api/products/scan/${barcodeText}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                const dataSourceBanner = document.getElementById('data-source-banner');
                if (dataSourceBanner) dataSourceBanner.classList.add('hidden');
                renderResults(data.product, data.analysis);
                
                // Set up save button listener for this specific product
                const btnToggleFavorite = document.getElementById('btn-toggle-favorite');
                if (btnToggleFavorite) {
                    // Remove old listeners to prevent duplicates
                    const newBtn = btnToggleFavorite.cloneNode(true);
                    btnToggleFavorite.parentNode.replaceChild(newBtn, btnToggleFavorite);
                    
                    // Reset UI to unsaved state initially (or fetch actual state if backend supports it)
                    const iconHeart = newBtn.querySelector('#icon-heart');
                    const textFavorite = newBtn.querySelector('#text-favorite');
                    iconHeart.className = 'ph ph-heart';
                    textFavorite.textContent = 'Save';
                    let isSaved = false;

                    // Fetch actual save status on load
                    try {
                        const checkRes = await fetch(`/api/products/favorites/check/${data.product.barcode}`, {
                            headers: { 'Authorization': `Bearer ${authToken}` }
                        });
                        if (checkRes.ok) {
                            const checkData = await checkRes.json();
                            isSaved = checkData.isFavorite;
                            if (isSaved) {
                                iconHeart.className = 'ph-fill ph-heart';
                                textFavorite.textContent = 'Saved';
                            }
                        }
                    } catch (e) {
                        console.error('Failed to check favorite status', e);
                    }

                    newBtn.addEventListener('click', async () => {
                        try {
                            if (!isSaved) {
                                // Save product
                                const saveRes = await fetch('/api/products/favorites/toggle', {
                                    method: 'POST',
                                    headers: { 
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${authToken}` 
                                    },
                                    body: JSON.stringify({ barcode: data.product.barcode })
                                });
                                
                                if (saveRes.ok) {
                                    isSaved = true;
                                    iconHeart.className = 'ph-fill ph-heart';
                                    iconHeart.style.color = 'var(--score-e)';
                                    textFavorite.textContent = 'Saved';
                                    window.showToast('Product saved to favorites!', 'success');
                                } else {
                                    window.showToast('Failed to save product.', 'error');
                                }
                            } else {
                                // Unsave product (same endpoint for toggling off)
                                const unsaveRes = await fetch('/api/products/favorites/toggle', {
                                    method: 'POST',
                                    headers: { 
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${authToken}` 
                                    },
                                    body: JSON.stringify({ barcode: data.product.barcode })
                                });
                                
                                if (unsaveRes.ok) {
                                    isSaved = false;
                                    iconHeart.className = 'ph ph-heart';
                                    iconHeart.style.color = '';
                                    textFavorite.textContent = 'Save';
                                    window.showToast('Product removed from favorites.', 'info');
                                } else {
                                    window.showToast('Failed to remove product.', 'error');
                                }
                            }
                        } catch (err) {
                            console.error('Error toggling favorite:', err);
                            window.showToast('An error occurred.', 'error');
                        }
                    });
                }

                showView(resultsView);
            } else if (res.status === 404) {
                showView(manualFallbackView);
            } else if (res.status === 401 || res.status === 403) {
                window.showToast('Session expired. Please login again.', 'error');
                authToken = null;
                localStorage.removeItem('token');
                checkAuth();
            } else {
                const errData = await res.json().catch(() => ({}));
                window.showToast(errData.message || 'Error communicating with server.', 'error');
                showView(choiceView);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            window.showToast('Network error or server is unreachable.', 'error');
            showView(choiceView);
        }
    }

    function renderResults(productData, analysis) {
        document.getElementById('product-name').textContent = productData.name;
        document.getElementById('product-brand').textContent = productData.brand;
        document.getElementById('result-barcode').textContent = productData.barcode || 'N/A';
        
        const img = document.getElementById('product-image');
        if (productData.imageUrl) {
            img.src = productData.imageUrl;
            img.classList.remove('hidden');
            img.onerror = () => img.classList.add('hidden'); // Hide if image fails to load
        } else {
            img.classList.add('hidden');
        }

        // Use original HealthScoreCalculator logic to determine exact score details
        const scoreResult = HealthScoreCalculator.analyze(productData);

        // Nutri-Score rendering (Radial Gauge + Letter Blocks)
        const nutriLetter = document.getElementById('nutri-letter');
        const nutriDesc = document.getElementById('nutri-desc');
        const nutriGauge = document.querySelector('.nutri-gauge');
        const nutriGaugeLetter = document.querySelector('.nutri-gauge-letter');
        
        nutriLetter.textContent = scoreResult.nutriScore.grade;
        nutriLetter.style.backgroundColor = scoreResult.nutriScore.color;
        nutriDesc.textContent = scoreResult.nutriScore.description;

        // Set Radial Gauge color
        if (nutriGauge) {
            nutriGauge.style.setProperty('--gauge-color', scoreResult.nutriScore.color);
            // Animate gauge angle from 0 to 360 over 1.5s
            let start = null;
            const duration = 1500;
            const animateGauge = (timestamp) => {
                if (!start) start = timestamp;
                const progress = Math.min((timestamp - start) / duration, 1);
                // Ease out cubic
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const angle = easeProgress * 360;
                nutriGauge.style.setProperty('--gauge-angle', `${angle}deg`);
                if (progress < 1) {
                    window.requestAnimationFrame(animateGauge);
                }
            };
            window.requestAnimationFrame(animateGauge);
        }

        if (nutriGaugeLetter) {
            nutriGaugeLetter.textContent = scoreResult.nutriScore.grade;
            nutriGaugeLetter.style.color = scoreResult.nutriScore.color;
        }

        // Reset and animate Nutri-Score blocks
        const nutriBlocks = document.querySelectorAll('.nutri-block');
        nutriBlocks.forEach((block, index) => {
            block.className = 'nutri-block';
            setTimeout(() => {
                block.classList.add('anim-in');
                if (block.textContent === scoreResult.nutriScore.grade) {
                    setTimeout(() => {
                        block.classList.add('anim-highlight');
                    }, 300);
                }
            }, index * 80);
        });
        
        // Render Analysis Feedback alongside original reason
        let reasonHTML = `<p class="reason-text">${scoreResult.nutriScore.reason}</p>`;
        if (analysis.feedback || (analysis.warnings && analysis.warnings.length) || (analysis.suggestions && analysis.suggestions.length)) {
            reasonHTML += `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color, rgba(0,0,0,0.1));">`;
            if (analysis.feedback) {
                reasonHTML += `<strong style="display: block; margin-bottom: 4px;">${analysis.feedback}</strong>`;
            }
            if (analysis.warnings && analysis.warnings.length) {
                reasonHTML += `<span style="color: var(--nutri-e, #e63e11); display: block; font-weight: 500; font-size: 0.9em;">⚠️ ${analysis.warnings.join(', ')}</span>`;
            }
            if (analysis.suggestions && analysis.suggestions.length) {
                reasonHTML += `<span style="color: var(--nutri-a, #038141); display: block; font-weight: 500; font-size: 0.9em;">💡 ${analysis.suggestions.join(', ')}</span>`;
            }
            reasonHTML += `</div>`;
        }
        document.getElementById('nutri-reason').innerHTML = reasonHTML;

        // NOVA Group Rendering
        const novaSection = document.getElementById('nova-section');
        const novaNumber = document.getElementById('nova-number');
        const novaDesc = document.getElementById('nova-desc');
        const novaReason = document.getElementById('nova-reason');
        if (scoreResult.novaGroup) {
            novaSection.classList.remove('hidden');
            novaNumber.textContent = scoreResult.novaGroup.group;
            novaNumber.style.backgroundColor = scoreResult.novaGroup.color;
            novaDesc.textContent = scoreResult.novaGroup.description;
            novaReason.textContent = scoreResult.novaGroup.reason;
        } else {
            novaSection.classList.add('hidden');
        }

        // Ingredients Highlighting
        const ingredientsSection = document.getElementById('ingredients-section');
        const ingredientsList = document.getElementById('ingredients-list');
        
        let hasIngredients = false;
        if (productData.ingredients && productData.ingredients !== 'Not available') {
            ingredientsSection.classList.remove('hidden');
            ingredientsList.classList.remove('hidden');
            ingredientsList.innerHTML = HealthScoreCalculator.highlightBadIngredients(productData.ingredients);
            hasIngredients = true;
        } else {
            ingredientsList.classList.add('hidden');
        }

        // Additives Rendering
        const additivesContainer = document.getElementById('additives-container');
        const additivesList = document.getElementById('additives-list');
        if (productData.additives && productData.additives.length > 0) {
            ingredientsSection.classList.remove('hidden'); // Ensure parent card is visible
            additivesContainer.classList.remove('hidden');
            
            const additiveInfo = {
                'E322': 'Lecithins: Emulsifier, generally considered safe.',
                'E412': 'Guar gum: Thickener, generally safe but large amounts may cause digestive issues.',
                'E330': 'Citric acid: Natural preservative/flavor enhancer, safe.',
                'E621': 'MSG: Flavor enhancer. Safe for most, some report sensitivities.',
                'E211': 'Sodium benzoate: Preservative. May trigger allergies/asthma in some.',
                'E250': 'Sodium nitrite: Preservative in meats. Linked to increased cancer risk.',
                'E150A': 'Caramel color: Food coloring. Generally safe.',
                'E150D': 'Caramel color: Contains sulfites, controversial in large amounts.',
                'E129': 'Allura Red AC: Artificial color. Linked to hyperactivity in children.',
                'E951': 'Aspartame: Artificial sweetener. Controversial for sensitive individuals.',
                'E955': 'Sucralose: Artificial sweetener. May affect gut microbiome.',
                'E415': 'Xanthan gum: Thickener and stabilizer. Generally safe.',
                'E300': 'Ascorbic acid: Vitamin C, used as a preservative. Very safe.',
                'E407': 'Carrageenan: Thickener from seaweed. May cause digestive inflammation.',
                'E471': 'Mono/diglycerides: Emulsifiers from fats. Generally safe.',
                'E631': 'Disodium inosinate: Flavor enhancer, often used with MSG.',
                'E627': 'Disodium guanylate: Flavor enhancer, often used with MSG.',
                'E339': 'Sodium phosphates: Emulsifier/Preservative. Safe in moderation.',
                'E202': 'Potassium sorbate: Preservative. Generally safe.'
            };

            additivesList.innerHTML = productData.additives.map(add => {
                // OpenFoodFacts returns format like "en:e322", clean this up
                const cleanName = add.replace(/^[a-z]+:/i, '').toUpperCase().replace(/-/g, ' ');
                const rawE = cleanName.match(/E\d+[A-Z]?/i);
                
                let tooltipText = "Food additive or preservative.";
                if (rawE && additiveInfo[rawE[0].toUpperCase()]) {
                    tooltipText = additiveInfo[rawE[0].toUpperCase()];
                } else if (rawE && rawE[0].toUpperCase().startsWith('E150')) {
                    tooltipText = 'Caramel color: Food coloring. Generally safe but some types are controversial.';
                }

                return `<span class="additive-chip" data-tooltip="${tooltipText}">${cleanName}</span>`;
            }).join('');
        } else {
            additivesContainer.classList.add('hidden');
        }

        // Hide parent section entirely if neither exists
        if (!hasIngredients && (!productData.additives || productData.additives.length === 0)) {
            ingredientsSection.classList.add('hidden');
        }

        // Nutrition Macro Grid (Truthin style)
        const n = productData.nutrition || {};

        // Helper to animate count up
        const animateValue = (id, endVal, suffix = '', decimalPlaces = 0) => {
            const obj = document.getElementById(id);
            if (!obj) return;
            let startTimestamp = null;
            const duration = 1000;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                // Ease out
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const currentVal = (easeProgress * endVal).toFixed(decimalPlaces);
                obj.textContent = `${currentVal} ${suffix}`;
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    obj.textContent = `${endVal.toFixed(decimalPlaces)} ${suffix}`;
                }
            };
            window.requestAnimationFrame(step);
        };

        animateValue('nutri-energy', n.energyKcal || 0, 'kcal', 0);
        animateValue('nutri-protein', n.protein || 0, 'g', 1);
        animateValue('nutri-carbs', n.carbohydrates || 0, 'g', 1);
        animateValue('nutri-sugars', n.sugars || 0, 'g', 1);
        animateValue('nutri-fat', n.fat || 0, 'g', 1);
        animateValue('nutri-satfat', n.saturatedFat || 0, 'g', 1);
        animateValue('nutri-fiber', n.fiber || 0, 'g', 1);
        animateValue('nutri-sodium', n.sodium || 0, 'mg', 0);

        // Add visual indicators for high/med/low (FSA guidelines approximation per 100g)
        const sugarCard = document.getElementById('macro-sugar-card');
        const fatCard = document.getElementById('macro-satfat-card');
        const sodiumCard = document.getElementById('macro-sodium-card');

        // Sugar levels
        sugarCard.className = 'macro-card'; // reset
        if (n.sugars > 22.5) sugarCard.classList.add('macro-high');
        else if (n.sugars > 5) sugarCard.classList.add('macro-med');
        else sugarCard.classList.add('macro-low');

        // Saturated Fat levels
        fatCard.className = 'macro-card';
        if (n.saturatedFat > 5) fatCard.classList.add('macro-high');
        else if (n.saturatedFat > 1.5) fatCard.classList.add('macro-med');
        else fatCard.classList.add('macro-low');

        // Sodium levels
        sodiumCard.className = 'macro-card';
        if (n.sodium > 600) sodiumCard.classList.add('macro-high'); // mg
        else if (n.sodium > 120) sodiumCard.classList.add('macro-med');
        else sodiumCard.classList.add('macro-low');
    }
});
