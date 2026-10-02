/**
 * healthScore.js - Official Nutri-Score & NOVA Group logic
 */

export class HealthScoreCalculator {
    // Standard colors
    static COLORS = {
        nutri: {
            a: '#038141', // Dark Green
            b: '#85bb2f', // Light Green
            c: '#fecb02', // Yellow
            d: '#ee8100', // Orange
            e: '#e63e11'  // Red
        },
        nova: {
            1: '#00aa00', // Unprocessed
            2: '#ffcc00', // Processed culinary ingredients
            3: '#ff6600', // Processed
            4: '#ff0000'  // Ultra-processed
        }
    };

    /**
     * Get health analysis based on product data (API or manual)
     * @param {Object} data Normalized product data
     * @returns {Object} Formatted scores and explanations
     */
    static analyze(data) {
        let nutriGrade = data.nutriScore ? data.nutriScore.toLowerCase() : null;
        let novaVal = data.novaGroup || null;
        let isCalculated = false;

        // If no Nutri-Score from API (like in pure manual entry), calculate it locally as a final fallback
        if (!nutriGrade || !['a','b','c','d','e'].includes(nutriGrade)) {
            nutriGrade = this._calculateNutriScoreLocal(data.nutrition || {});
            isCalculated = true;
        }

        const nutriData = this._getNutriScoreDetails(nutriGrade, isCalculated);
        const novaData = this._getNovaDetails(novaVal);

        return {
            nutriScore: nutriData,
            novaGroup: novaData
        };
    }

    /**
     * Local FSA-NPS calculation algorithm (simplified for manual entry)
     */
    static _calculateNutriScoreLocal(n) {
        let badPoints = 0;
        
        // Energy (max 10)
        badPoints += Math.min(10, Math.floor((n.energyKcal || 0) / 80)); // Approx 335kJ = 80kcal
        
        // Sugar (max 10)
        badPoints += Math.min(10, Math.floor((n.sugars || 0) / 4.5));
        
        // Sat Fat (max 10)
        badPoints += Math.min(10, Math.floor(n.saturatedFat || 0));
        
        // Sodium (max 10) - Convert mg to g
        badPoints += Math.min(10, Math.floor((n.sodium || 0) / 90)); 

        let goodPoints = 0;
        
        // Fiber (max 5)
        goodPoints += Math.min(5, Math.floor((n.fiber || 0) / 0.9));
        
        // Protein (max 5)
        goodPoints += Math.min(5, Math.floor((n.protein || 0) / 1.6));

        // Simplified final score
        const finalScore = badPoints - goodPoints;

        if ((n.sugars || 0) > 10 && goodPoints === 0) {
            return 'e'; // Force E for high sugar, empty calorie foods
        }

        if (finalScore <= -1) return 'a';
        if (finalScore <= 2) return 'b';
        if (finalScore <= 10) return 'c';
        if (finalScore <= 18) return 'd';
        return 'e';
    }

    static _getNutriScoreDetails(grade, isCalculated) {
        const descriptions = {
            'a': 'Excellent nutritional quality',
            'b': 'Good nutritional quality',
            'c': 'Moderate nutritional quality',
            'd': 'Poor nutritional quality',
            'e': 'Bad nutritional quality'
        };

        const reasons = {
            'a': 'Rich in positive nutrients (fiber, protein) and low in bad nutrients.',
            'b': 'Good balance, suitable for regular consumption.',
            'c': 'Consume in moderation. Balance with healthier foods.',
            'd': 'High in sugar, fat, or salt. Limit consumption.',
            'e': 'Very high in sugar, fat, or salt. Avoid or eat rarely.'
        };

        return {
            grade: grade.toUpperCase(),
            color: this.COLORS.nutri[grade] || this.COLORS.nutri['c'],
            description: descriptions[grade] || 'Unknown',
            reason: (reasons[grade] || '') + (isCalculated ? ' (Calculated locally from entered nutrition)' : ' (Official rating via Open Food Facts API)'),
            isCalculated
        };
    }

    static _getNovaDetails(group) {
        if (!group) return null;
        
        const descriptions = {
            1: 'Unprocessed / Minimally processed',
            2: 'Processed culinary ingredients',
            3: 'Processed foods',
            4: 'Ultra-processed foods'
        };

        const reasons = {
            1: 'Whole foods altered only by removing inedible parts, drying, roasting, or boiling.',
            2: 'Substances extracted from nature (oils, sugar, salt) used to prepare whole foods.',
            3: 'Made by adding salt, oil, or sugar to Group 1 foods (e.g., canned veg, fresh bread).',
            4: 'Industrial formulations containing cosmetic additives (flavors, colors) and heavily processed ingredients.'
        };

        return {
            group: group,
            color: this.COLORS.nova[group] || '#94a3b8',
            description: descriptions[group] || 'Unknown',
            reason: reasons[group] || ''
        };
    }

    static highlightBadIngredients(text) {
        if (!text || text === 'Not available') return text;

        const badKeywords = [
            'sugar', 'syrup', 'fructose', 'sucrose', 'glucose', 'dextrose',
            'palm oil', 'partially hydrogenated', 'margarine',
            'artificial flavor', 'artificial colour', 'preservative',
            'sodium nitrite', 'monosodium glutamate', 'msg', 'tbhq', 'bht', 'bha'
        ];

        let htmlText = text;
        badKeywords.forEach(keyword => {
            const regex = new RegExp(`\\b(${keyword}[a-z]*)\\b`, 'gi');
            htmlText = htmlText.replace(regex, '<span class="highlight-bad">$&</span>');
        });

        return htmlText;
    }
}

export const ADDITIVE_INFO = {
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
