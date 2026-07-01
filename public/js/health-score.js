/**
 * health-score.js - Official Nutri-Score & NOVA Group logic
 */

class HealthScoreCalculator {
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
            nutriGrade = this._calculateNutriScoreLocal(data.nutrition);
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
        badPoints += Math.min(10, Math.floor(n.energyKcal / 80)); // Approx 335kJ = 80kcal
        
        // Sugar (max 10)
        badPoints += Math.min(10, Math.floor(n.sugars / 4.5));
        
        // Sat Fat (max 10)
        badPoints += Math.min(10, Math.floor(n.saturatedFat));
        
        // Sodium (max 10) - Convert mg to g (1g = 1000mg = ~400mg sodium per point)
        badPoints += Math.min(10, Math.floor(n.sodium / 90)); 

        let goodPoints = 0;
        
        // Fiber (max 5)
        goodPoints += Math.min(5, Math.floor(n.fiber / 0.9));
        
        // Protein (max 5)
        goodPoints += Math.min(5, Math.floor(n.protein / 1.6));

        // Simplified final score
        const finalScore = badPoints - goodPoints;

        // Corrected Nutri-Score thresholds based on FSA-NPS (Beverages vs Solid Foods simplified)
        // Since beverages (like Pepsi) usually have lower overall points but should be rated poorly due to sugar,
        // we adjust the thresholds. If it's pure sugar water, it should definitely be an E.
        
        // Heuristic: If it has zero protein/fiber and high sugar, it's likely a soda/candy.
        if (n.sugars > 10 && goodPoints === 0) {
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
            color: this.COLORS.nutri[grade],
            description: descriptions[grade] || 'Unknown',
            reason: reasons[grade] + (isCalculated ? ' (Calculated locally from entered nutrition)' : ' (Official rating via Open Food Facts API)'),
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
            color: this.COLORS.nova[group],
            description: descriptions[group] || 'Unknown',
            reason: reasons[group]
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
