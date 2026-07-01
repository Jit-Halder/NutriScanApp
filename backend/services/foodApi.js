const axios = require('axios');
const { nutriScore } = require('nutri-score');

const OFF_API_BASE = 'https://world.openfoodfacts.net/api/v2/product';
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

class FoodAPI {
    static async getProductByBarcode(barcode) {
        let result = null;

        // Attempt 1: Open Food Facts
        try {
            const offResult = await this._fetchFromOpenFoodFacts(barcode);
            if (offResult) {
                offResult._source = 'openfoodfacts';
                offResult._hasNutrition = true;
                
                // If OpenFoodFacts didn't provide a Nutri-Score, calculate it mathematically
                if (!offResult.nutriScore) {
                    offResult.nutriScore = this._calculateOfficialNutriScore(offResult.nutrition, offResult.name, offResult._categories);
                }
                
                result = offResult;
            }
        } catch (err) {
            console.warn('[OFF] Open Food Facts request failed:', err.message);
        }

        // Attempt 2: Spoonacular (Only if OFF failed and API key exists)
        if (!result && SPOONACULAR_API_KEY) {
            try {
                const spoonResult = await this._fetchFromSpoonacular(barcode);
                if (spoonResult) {
                    spoonResult._source = 'spoonacular';
                    spoonResult._hasNutrition = true;
                    
                    // Spoonacular never returns Nutri-Score, calculate it mathematically
                    spoonResult.nutriScore = this._calculateOfficialNutriScore(spoonResult.nutrition, spoonResult.name, spoonResult._categories);
                    
                    result = spoonResult;
                }
            } catch (err) {
                console.warn('[Spoonacular] request failed:', err.message);
            }
        }

        return result;
    }

    /**
     * Mathematically calculates the true Nutri-Score using the official algorithm.
     * Takes into account solid vs beverage categorization.
     */
    static _calculateOfficialNutriScore(nutrition, productName = '', categories = []) {
        if (!nutrition) return null;

        const nameLower = productName.toLowerCase();
        const catLower = (categories || []).join(' ').toLowerCase();
        
        // Detect if the product is a beverage (strict sugar penalties in FSA-NPS)
        const isBeverage = 
            nameLower.includes('pepsi') || 
            nameLower.includes('cola') || 
            nameLower.includes('soda') || 
            nameLower.includes('drink') || 
            nameLower.includes('beverage') || 
            nameLower.includes('juice') || 
            nameLower.includes('water') || 
            nameLower.includes('tea') || 
            catLower.includes('beverage') || 
            catLower.includes('drink');

        const productType = isBeverage ? 'beverage' : 'solid';

        try {
            const calculatedScore = nutriScore.calculateClass({
                energy: (nutrition.energyKcal || 0) * 4.184, // convert kcal to kJ
                fibers: nutrition.fiber || 0,
                fruit_percentage: 0, // Fallback if unknown
                proteins: nutrition.protein || 0,
                saturated_fats: nutrition.saturatedFat || 0,
                sodium: nutrition.sodium || 0,
                sugar: nutrition.sugars || 0
            }, productType);

            return calculatedScore ? calculatedScore.toUpperCase() : null;
        } catch (error) {
            console.error('Error calculating Nutri-Score:', error);
            return null;
        }
    }

    static async _fetchFromOpenFoodFacts(barcode) {
        // Fetching all language fields for ingredients
        const fields = 'product_name,brands,ingredients_text_en,ingredients_text,ingredients_text_fr,ingredients_text_es,ingredients_text_de,nutriments,nutrition_grades,nova_group,additives_tags,image_front_url,categories';
        const url = `${OFF_API_BASE}/${barcode}?fields=${fields}`;

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'NutriScan/1.0 - Web Application for Health Scoring'
            }
        });

        const data = response.data;

        if (data.status === 1 && data.product) {
            const p = data.product;
            const hasName = p.product_name && p.product_name.trim().length > 0;
            const hasNutriments = p.nutriments && Object.keys(p.nutriments).length > 0;

            if (hasName && hasNutriments) {
                return this._normalizeOFFData(p, barcode);
            }
            return null;
        }
        return null;
    }

    static _normalizeOFFData(p, barcode) {
        const nutriments = p.nutriments || {};

        // Exhaustive fallback for English ingredients text
        let ingredients = 'Not available';
        if (p.ingredients_text_en && p.ingredients_text_en.trim().length > 0) {
            ingredients = p.ingredients_text_en;
        } else if (p.ingredients_text && p.ingredients_text.trim().length > 0) {
            ingredients = p.ingredients_text;
        } else if (p.ingredients_text_fr && p.ingredients_text_fr.trim().length > 0) {
            ingredients = p.ingredients_text_fr;
        } else if (p.ingredients_text_es && p.ingredients_text_es.trim().length > 0) {
            ingredients = p.ingredients_text_es;
        } else if (p.ingredients_text_de && p.ingredients_text_de.trim().length > 0) {
            ingredients = p.ingredients_text_de;
        }

        return {
            barcode: barcode,
            name: p.product_name || 'Unknown Product',
            brand: p.brands ? p.brands.split(',')[0].trim() : 'Unknown Brand',
            imageUrl: p.image_front_url || null,
            ingredients: ingredients,
            additives: p.additives_tags || [],
            novaGroup: p.nova_group || null,
            nutriScore: p.nutrition_grades ? p.nutrition_grades.toUpperCase() : null,
            _categories: p.categories ? p.categories.split(',') : [],
            nutrition: {
                energyKcal: nutriments['energy-kcal_100g'] || 0,
                protein: nutriments.proteins_100g || 0,
                carbohydrates: nutriments.carbohydrates_100g || 0,
                sugars: nutriments.sugars_100g || 0,
                fat: nutriments.fat_100g || 0,
                saturatedFat: nutriments['saturated-fat_100g'] || 0,
                fiber: nutriments.fiber_100g || 0,
                sodium: (nutriments.sodium_100g || 0) * 1000
            }
        };
    }

    static async _fetchFromSpoonacular(barcode) {
        const url = `https://api.spoonacular.com/food/products/upc/${barcode}?apiKey=${SPOONACULAR_API_KEY}`;
        
        try {
            const response = await axios.get(url);
            const data = response.data;
            if (data.status === 'failure') return null;
            return this._normalizeSpoonacularData(data, barcode);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return null;
            }
            throw error;
        }
    }

    static async submitProductToOFF(productData) {
        // Only attempt to upload if credentials are provided in .env
        const userId = process.env.OFF_USER_ID;
        const password = process.env.OFF_PASSWORD;
        
        if (!userId || !password) {
            console.log('[OFF] Write credentials not configured. Skipping upload to Open Food Facts.');
            return false;
        }

        const url = 'https://world.openfoodfacts.org/cgi/product_jqm2.pl';
        
        // Prepare the form data expected by Open Food Facts
        const params = new URLSearchParams();
        params.append('code', productData.barcode);
        params.append('user_id', userId);
        params.append('password', password);
        params.append('product_name', productData.name || '');
        params.append('brands', productData.brand || '');
        params.append('ingredients_text', productData.ingredients || '');
        
        // Set nutrition facts (assuming they are per 100g)
        if (productData.nutritionFacts) {
            const nut = productData.nutritionFacts;
            params.append('nutrition_data_per', '100g');
            
            if (nut.energyKcal) {
                params.append('nutriment_energy-kcal', nut.energyKcal);
                params.append('nutriment_energy-kcal_unit', 'kcal');
            }
            if (nut.protein) {
                params.append('nutriment_proteins', nut.protein);
                params.append('nutriment_proteins_unit', 'g');
            }
            if (nut.carbohydrates) {
                params.append('nutriment_carbohydrates', nut.carbohydrates);
                params.append('nutriment_carbohydrates_unit', 'g');
            }
            if (nut.sugars) {
                params.append('nutriment_sugars', nut.sugars);
                params.append('nutriment_sugars_unit', 'g');
            }
            if (nut.saturatedFat) {
                params.append('nutriment_saturated-fat', nut.saturatedFat);
                params.append('nutriment_saturated-fat_unit', 'g');
            }
            if (nut.sodium) {
                // OFF expects sodium in grams usually or explicit unit
                params.append('nutriment_sodium', nut.sodium / 1000); // converting mg to g
                params.append('nutriment_sodium_unit', 'g');
            }
            if (nut.fiber) {
                params.append('nutriment_fiber', nut.fiber);
                params.append('nutriment_fiber_unit', 'g');
            }
        }

        try {
            const response = await axios.post(url, params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'NutriScan/1.0 - Web Application for Health Scoring'
                }
            });
            
            // OFF returns JSON for jqm2.pl if requested, but often HTML or a simple status object
            // If it succeeds, it usually has a status code 1 or status "status ok"
            console.log(`[OFF] Upload for ${productData.barcode} completed.`);
            return true;
        } catch (error) {
            console.error('[OFF] Upload failed:', error.message);
            return false;
        }
    }

    static _normalizeSpoonacularData(data, barcode) {
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
            novaGroup: null,
            nutriScore: null,
            _categories: data.breadcrumbs || [],
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

module.exports = FoodAPI;
