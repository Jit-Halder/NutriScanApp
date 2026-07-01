class PersonalizationService {
    static generateFeedback(product, userProfile) {
        const warnings = [];
        const suggestions = [];
        
        if (!product || !product.nutrition) return { warnings, suggestions };

        const { nutrition, ingredients } = product;

        // Health Conditions
        if (userProfile.healthConditions) {
            const conditions = Array.isArray(userProfile.healthConditions) 
                ? userProfile.healthConditions 
                : typeof userProfile.healthConditions === 'string' 
                    ? JSON.parse(userProfile.healthConditions) 
                    : [];

            if (conditions.includes('diabetes') && nutrition.sugars > 5) {
                warnings.push('High sugar content. Not recommended for diabetic users.');
            }
            if (conditions.includes('hypertension') && nutrition.sodium > 400) {
                warnings.push('High sodium content. Not recommended for hypertension.');
            }
        }

        // Allergies
        if (userProfile.allergies && ingredients) {
            const allergies = Array.isArray(userProfile.allergies)
                ? userProfile.allergies
                : typeof userProfile.allergies === 'string'
                    ? JSON.parse(userProfile.allergies)
                    : [];
                    
            const ingredientsLower = ingredients.toLowerCase();
            allergies.forEach(allergy => {
                if (ingredientsLower.includes(allergy.toLowerCase())) {
                    warnings.push(`Contains allergen: ${allergy}`);
                }
            });
        }

        // Dietary Preferences
        if (userProfile.dietaryPreferences && ingredients) {
            const prefs = Array.isArray(userProfile.dietaryPreferences)
                ? userProfile.dietaryPreferences
                : typeof userProfile.dietaryPreferences === 'string'
                    ? JSON.parse(userProfile.dietaryPreferences)
                    : [];
            
            const ingredientsLower = ingredients.toLowerCase();
            if (prefs.includes('vegan')) {
                const animalProducts = ['milk', 'cheese', 'egg', 'meat', 'chicken', 'beef', 'pork', 'honey', 'gelatin'];
                animalProducts.forEach(ap => {
                    if (ingredientsLower.includes(ap)) {
                        warnings.push(`May not be vegan: contains ${ap}`);
                    }
                });
            }
        }

        // General suggestions
        if (nutrition.fiber > 5) {
            suggestions.push('Good source of fiber.');
        }
        if (nutrition.protein > 10) {
            suggestions.push('Good source of protein.');
        }

        return { warnings, suggestions };
    }
}

module.exports = PersonalizationService;
