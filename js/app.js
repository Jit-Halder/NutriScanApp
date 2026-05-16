/**
 * app.js - Main Application Orchestrator
 * Handles the 3-tier fallback flow:
 *   1. Open Food Facts → full results
 *   2. UPCitemdb partial match → product identity + manual nutrition form
 *   3. Not found anywhere → full manual entry
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    // Views
    const choiceView          = document.getElementById('choice-view');
    const scannerView         = document.getElementById('scanner-view');
    const manualEntryView     = document.getElementById('manual-entry-view');
    const loadingView         = document.getElementById('loading-view');
    const manualFallbackView  = document.getElementById('manual-fallback-view');
    const resultsView         = document.getElementById('results-view');

    // Theme Toggle
    const themeToggle   = document.getElementById('theme-toggle');
    const themeIconMoon = document.getElementById('theme-icon-moon');
    const themeIconSun  = document.getElementById('theme-icon-sun');

    // Choice Screen
    const btnUseCamera  = document.getElementById('btn-use-camera');
    const btnUseManual  = document.getElementById('btn-use-manual');

    // Back Buttons
    const btnBackFromCamera = document.getElementById('btn-back-from-camera');
    const btnBackFromManual = document.getElementById('btn-back-from-manual');

    // Manual Barcode Entry
    const manualBarcodeInput = document.getElementById('manual-barcode');
    const btnManualSearch    = document.getElementById('btn-manual-search');

    // Manual Nutrition Form (full not-found)
    const manualNutritionForm = document.getElementById('manual-nutrition-form');
    const btnCancelManual     = document.getElementById('btn-cancel-manual');

    // Loading status
    const loadingStatus = document.getElementById('loading-status');

    // Results UI Elements
    const productImage   = document.getElementById('product-image');
    const productName    = document.getElementById('product-name');
    const productBrand   = document.getElementById('product-brand');
    const resultBarcode  = document.getElementById('result-barcode');

    // Data Source Banner
    const dataSourceBanner = document.getElementById('data-source-banner');
    const sourceIcon       = document.getElementById('source-icon');
    const sourceText       = document.getElementById('source-text');

    // Official Scores UI
    const nutriLetter = document.getElementById('nutri-letter');
    const nutriDesc   = document.getElementById('nutri-desc');
    const nutriReason = document.getElementById('nutri-reason');
    const nutriBlocks = document.querySelectorAll('.nutri-block');

    const novaSection        = document.getElementById('nova-section');
    const novaNumber         = document.getElementById('nova-number');
    const novaDesc           = document.getElementById('nova-desc');
    const novaReason         = document.getElementById('nova-reason');
    const ingredientsSection = document.getElementById('ingredients-section');
    const ingredientsList    = document.getElementById('ingredients-list');
    const btnScanAgain       = document.getElementById('btn-scan-again');

    // Nutrition Table
    const nutriEnergy  = document.getElementById('nutri-energy');
    const nutriProtein = document.getElementById('nutri-protein');
    const nutriCarbs   = document.getElementById('nutri-carbs');
    const nutriSugars  = document.getElementById('nutri-sugars');
    const nutriFat     = document.getElementById('nutri-fat');
    const nutriSatFat  = document.getElementById('nutri-satfat');
    const nutriFiber   = document.getElementById('nutri-fiber');
    const nutriSodium  = document.getElementById('nutri-sodium');

    // --- State ---
    let scanner            = null;
    let currentBarcode     = null;

    // --- All views for toggling ---
    const allViews = [choiceView, scannerView, manualEntryView, loadingView, manualFallbackView, resultsView];

    // --- Initialization ---
    initTheme();
    initApp();

    function initTheme() {
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

        const savedTheme = localStorage.getItem('nutriscan-theme') || 
                           (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        applyTheme(savedTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            applyTheme(currentTheme === 'light' ? 'dark' : 'light');
        });
    }

    function initApp() {
        // Init Scanner (don't start yet — wait for user choice)
        scanner = new BarcodeScanner('reader', handleSuccessfulScan);

        // --- Choice Screen ---
        btnUseCamera.addEventListener('click', () => {
            showView(scannerView);
            startScanning();
        });

        btnUseManual.addEventListener('click', () => {
            showView(manualEntryView);
            manualBarcodeInput.value = '';
            setTimeout(() => manualBarcodeInput.focus(), 350);
        });

        // --- Back Buttons ---
        btnBackFromCamera.addEventListener('click', () => {
            scanner.stop();
            showView(choiceView);
        });

        btnBackFromManual.addEventListener('click', () => {
            showView(choiceView);
        });

        // --- Manual Barcode Search ---
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

        // --- Scan Again → go back to choice screen ---
        btnScanAgain.addEventListener('click', () => {
            showView(choiceView);
            manualBarcodeInput.value = '';
        });

        // --- Manual Nutrition Fallback Form (full not-found) ---
        btnCancelManual.addEventListener('click', () => {
            showView(choiceView);
        });

        manualNutritionForm.addEventListener('submit', handleManualNutritionSubmit);
    }

    // --- Core Logic ---

    function startScanning() {
        // Slight delay to ensure DOM is ready and previous instance stopped completely
        setTimeout(() => {
            if (scanner) scanner.start();
        }, 300);
    }

    async function handleSuccessfulScan(barcodeText) {
        // 📱 Haptic Feedback
        if (navigator.vibrate) {
            navigator.vibrate([200]);
        }

        currentBarcode = barcodeText;
        showView(loadingView);
        updateLoadingStatus('Checking Open Food Facts...');

        try {
            const productData = await FoodAPI.getProductByBarcode(barcodeText);
            
            if (productData && productData._hasNutrition) {
                // ✅ Full data found (Open Food Facts)
                const result = HealthScoreCalculator.analyze(productData);
                renderResults(productData, result);
                showView(resultsView);

            } else {
                // ❌ Not found anywhere
                showView(manualFallbackView);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            // On network error or failure, show manual fallback
            showView(manualFallbackView);
        }
    }

    function handleManualNutritionSubmit(e) {
        e.preventDefault();

        // Build data object from form
        const productData = {
            barcode: currentBarcode || 'Manual Entry',
            name: 'Unknown Product',
            brand: 'Manual Entry',
            imageUrl: null,
            ingredients: 'Not available',
            _source: 'manual',
            nutrition: {
                energyKcal: parseFloat(document.getElementById('input-energy').value) || 0,
                protein: parseFloat(document.getElementById('input-protein').value) || 0,
                carbohydrates: 0,
                sugars: parseFloat(document.getElementById('input-sugar').value) || 0,
                fat: 0,
                saturatedFat: parseFloat(document.getElementById('input-satfat').value) || 0,
                fiber: parseFloat(document.getElementById('input-fiber').value) || 0,
                sodium: parseFloat(document.getElementById('input-sodium').value) || 0
            }
        };

        const result = HealthScoreCalculator.analyze(productData);
        renderResults(productData, result);
        showView(resultsView);
    }

    // --- UI Rendering ---

    function showView(viewElement) {
        allViews.forEach(v => {
            v.classList.remove('active');
            setTimeout(() => {
                if (!v.classList.contains('active')) v.classList.add('hidden');
            }, 300); // match CSS transition
        });

        viewElement.classList.remove('hidden');
        // trigger reflow
        void viewElement.offsetWidth;
        viewElement.classList.add('active');
    }

    function updateLoadingStatus(text) {
        if (loadingStatus) {
            loadingStatus.textContent = text;
        }
    }

    function renderDataSourceBanner(source) {
        const sources = {
            'openfoodfacts': {
                text: 'Full data from Open Food Facts',
                icon: '🌍',
                className: 'source-off'
            },
            'spoonacular': {
                text: 'Data provided by Spoonacular',
                icon: '🥄',
                className: 'source-spoonacular'
            },
            'manual': {
                text: 'All data entered manually',
                icon: '✏️',
                className: 'source-manual'
            }
        };

        const info = sources[source] || sources['manual'];
        sourceIcon.textContent = info.icon;
        sourceText.textContent = info.text;
        dataSourceBanner.className = `data-source-banner ${info.className}`;
        dataSourceBanner.classList.remove('hidden');
    }

    function renderResults(productData, scoreResult) {
        // 0. Data Source
        renderDataSourceBanner(productData._source || 'manual');

        // 1. Header
        productName.textContent = productData.name;
        productBrand.textContent = productData.brand;
        resultBarcode.textContent = productData.barcode || 'N/A';
        
        if (productData.imageUrl) {
            productImage.src = productData.imageUrl;
            productImage.classList.remove('hidden');
        } else {
            productImage.classList.add('hidden');
        }

        // 2. Nutri-Score Rendering
        nutriLetter.textContent = scoreResult.nutriScore.grade;
        nutriLetter.style.backgroundColor = scoreResult.nutriScore.color;
        nutriDesc.textContent = scoreResult.nutriScore.description;
        nutriReason.textContent = scoreResult.nutriScore.reason;

        // Reset and animate Nutri-Score blocks
        nutriBlocks.forEach((block, index) => {
            // Reset to default
            block.className = 'nutri-block';
            
            // Staggered entry animation
            setTimeout(() => {
                block.classList.add('anim-in');
                
                // Highlight final score
                if (block.textContent === scoreResult.nutriScore.grade) {
                    setTimeout(() => {
                        block.classList.add('anim-highlight');
                    }, 300); // Pop after entry
                }
            }, index * 80); // Stagger interval
        });

        // 3. NOVA Group Rendering
        if (scoreResult.novaGroup) {
            novaSection.classList.remove('hidden');
            novaNumber.textContent = scoreResult.novaGroup.group;
            novaNumber.style.backgroundColor = scoreResult.novaGroup.color;
            novaDesc.textContent = scoreResult.novaGroup.description;
            novaReason.textContent = scoreResult.novaGroup.reason;
        } else {
            novaSection.classList.add('hidden');
        }

        // 4. Ingredients
        if (productData.ingredients && productData.ingredients !== 'Not available') {
            ingredientsSection.classList.remove('hidden');
            ingredientsList.innerHTML = HealthScoreCalculator.highlightBadIngredients(productData.ingredients);
        } else {
            ingredientsSection.classList.add('hidden');
        }

        // 5. Nutrition Table
        const n = productData.nutrition;
        nutriEnergy.textContent = `${Math.round(n.energyKcal)} kcal`;
        nutriProtein.textContent = `${n.protein.toFixed(1)} g`;
        nutriCarbs.textContent = `${n.carbohydrates.toFixed(1)} g`;
        nutriSugars.textContent = `${n.sugars.toFixed(1)} g`;
        nutriFat.textContent = `${n.fat.toFixed(1)} g`;
        nutriSatFat.textContent = `${n.saturatedFat.toFixed(1)} g`;
        nutriFiber.textContent = `${n.fiber.toFixed(1)} g`;
        nutriSodium.textContent = `${Math.round(n.sodium)} mg`;
    }
});
