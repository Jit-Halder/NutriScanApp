/**
 * api.js - Multi-API handler with fallback chain for better Indian product coverage
 * 
 * Fallback Chain:
 *   1. Open Food Facts (primary) – full nutrition + scores
 *   2. UPCitemdb (fallback)      – product identity only (name, brand, image)
 *   3. Manual Entry (last resort) – user enters everything
 */

const OFF_API_BASE = 'https://world.openfoodfacts.net/api/v2/product';
const SPOONACULAR_API_KEY = 'cbede31f3bf8411e98fcfff16c849055';

class FoodAPI {

    /**
     * Main entry point — tries each API in the fallback chain.
     * @param {string} barcode
     * @returns {Promise<Object|null>} Product data or null if nothing found anywhere
     */
    static async getProductByBarcode(barcode) {
        // --- Attempt 1: Open Food Facts ---
        try {
            const offResult = await this._fetchFromOpenFoodFacts(barcode);
            if (offResult) {
                offResult._source = 'openfoodfacts';
                offResult._hasNutrition = true;
                return offResult;
            }
        } catch (err) {
            console.warn('[OFF] Open Food Facts request failed:', err.message);
        }

        // --- Attempt 2: Spoonacular ---
        try {
            const spoonResult = await this._fetchFromSpoonacular(barcode);
            if (spoonResult) {
                spoonResult._source = 'spoonacular';
                spoonResult._hasNutrition = true;
                return spoonResult;
            }
        } catch (err) {
            console.warn('[Spoonacular] request failed:', err.message);
        }

        // --- Nothing found in any API ---
        return null;
    }

    // ─── Open Food Facts ──────────────────────────────────────────────

    static async _fetchFromOpenFoodFacts(barcode) {
        const fields = 'product_name,brands,ingredients_text,nutriments,nutrition_grades,nova_group,additives_tags,image_front_url,categories';
        const url = `${OFF_API_BASE}/${barcode}?fields=${fields}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'NutriScan/1.0 - Web Application for Health Scoring'
            }
        });

        if (!response.ok) {
            console.warn(`[OFF] API returned ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();

        if (data.status === 1 && data.product) {
            // Extra check: does the product actually have meaningful data?
            const p = data.product;
            const hasName = p.product_name && p.product_name.trim().length > 0;
            const hasNutriments = p.nutriments && Object.keys(p.nutriments).length > 0;

            if (hasName && hasNutriments) {
                return this._normalizeOFFData(p, barcode);
            }
            // If name or nutriments are empty, treat as "not found" and fall through
            console.info('[OFF] Product found but data is incomplete, trying fallback...');
            return null;
        }

        return null;
    }

    static _normalizeOFFData(p, barcode) {
        const nutriments = p.nutriments || {};

        return {
            barcode: barcode,
            name: p.product_name || 'Unknown Product',
            brand: p.brands ? p.brands.split(',')[0].trim() : 'Unknown Brand',
            imageUrl: p.image_front_url || null,
            ingredients: p.ingredients_text || 'Not available',
            additives: p.additives_tags || [],
            novaGroup: p.nova_group || null,
            nutriScore: p.nutrition_grades || null,
            nutrition: {
                energyKcal: nutriments['energy-kcal_100g'] || 0,
                protein: nutriments.proteins_100g || 0,
                carbohydrates: nutriments.carbohydrates_100g || 0,
                sugars: nutriments.sugars_100g || 0,
                fat: nutriments.fat_100g || 0,
                saturatedFat: nutriments['saturated-fat_100g'] || 0,
                fiber: nutriments.fiber_100g || 0,
                sodium: (nutriments.sodium_100g || 0) * 1000 // Convert g to mg
            }
        };
    }

    // ─── Spoonacular API (Fallback 1) ─────────────────────────────────

    static async _fetchFromSpoonacular(barcode) {
        const url = `https://api.spoonacular.com/food/products/upc/${barcode}?apiKey=${SPOONACULAR_API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) return null; // Returns 404 or failure if not found
        
        const data = await response.json();
        if (data.status === 'failure') return null;
        
        return this._normalizeSpoonacularData(data, barcode);
    }

    static _normalizeSpoonacularData(data, barcode) {
        // Extract nutrients from the array
        const getNutrient = (name) => {
            if (!data.nutrition || !data.nutrition.nutrients) return 0;
            const nut = data.nutrition.nutrients.find(n => n.name === name);
            return nut ? nut.amount : 0;
        };

        const ingredients = (data.ingredients && data.ingredients.length > 0)
            ? data.ingredients.map(i => i.name).join(', ')
            : 'Not available';

        return {
            barcode: barcode,
            name: data.title || 'Unknown Product',
            brand: data.brand || 'Unknown Brand',
            imageUrl: data.image || null,
            ingredients: ingredients,
            additives: [],
            novaGroup: null, // Spoonacular doesn't provide NOVA
            nutriScore: null, // We calculate this later
            nutrition: {
                energyKcal: getNutrient('Calories') || 0,
                protein: getNutrient('Protein') || 0,
                carbohydrates: getNutrient('Carbohydrates') || 0,
                sugars: getNutrient('Sugar') || 0,
                fat: getNutrient('Fat') || 0,
                saturatedFat: getNutrient('Saturated Fat') || 0,
                fiber: getNutrient('Fiber') || 0,
                sodium: getNutrient('Sodium') || 0 
            }
        };
    }
}

// ─── Backend API Communication ──────────────────────────────────────
class BackendAPI {
    static get BASE_URL() {
        return 'http://localhost:3000/api';
    }

    static async resendOTP(email) {
        try {
            const response = await fetch(`${this.BASE_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to resend OTP');
            return data;
        } catch (error) {
            throw error;
        }
    }
}
