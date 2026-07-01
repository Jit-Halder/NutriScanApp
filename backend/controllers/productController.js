const FoodAPI = require('../services/foodApi');
const PersonalizationService = require('../services/personalization');
const { ProductScanHistory, NutritionAnalysisResult, UserProfile, ProductSubmission, SavedProduct } = require('../models');

exports.scanProduct = async (req, res) => {
    try {
        const { barcode } = req.params;
        const userId = req.user.id;

        // 1. Fetch product data from API
        const productData = await FoodAPI.getProductByBarcode(barcode);

        if (!productData) {
            return res.status(404).json({ message: 'Product not found. Please add manually.' });
        }

        // 2. Save scan history
        await ProductScanHistory.create({
            userId,
            barcode,
            productName: productData.name
        });

        // 3. Generate Personalized Feedback
        const userProfile = await UserProfile.findOne({ where: { userId } });
        let feedback = null;
        let warnings = [];
        let suggestions = [];

        if (userProfile) {
            const analysis = PersonalizationService.generateFeedback(productData, userProfile);
            warnings = analysis.warnings;
            suggestions = analysis.suggestions;

            if (warnings.length > 0) {
                feedback = 'Product contains ingredients that conflict with your health profile.';
            } else {
                feedback = 'Product is safe to consume based on your profile.';
            }

            // Save Analysis Result
            await NutritionAnalysisResult.create({
                userId,
                barcode,
                score: productData.nutriScore,
                feedback,
                warnings,
                suggestions
            });
        }

        res.json({
            product: productData,
            analysis: {
                feedback,
                warnings,
                suggestions
            }
        });
    } catch (error) {
        console.error('Scan error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.getScanHistory = async (req, res) => {
    try {
        const history = await ProductScanHistory.findAll({ 
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.submitMissingProduct = async (req, res) => {
    try {
        const { barcode, name, brand, ingredients, nutritionFacts, packagingDetails } = req.body;
        const userId = req.user.id;

        const submission = await ProductSubmission.create({
            userId,
            barcode,
            name,
            brand,
            ingredients,
            nutritionFacts,
            packagingDetails,
            status: 'pending'
        });

        // Background task: Try submitting to Open Food Facts
        // We don't await this because we don't want to slow down the frontend response
        FoodAPI.submitProductToOFF({
            barcode,
            name,
            brand,
            ingredients,
            nutritionFacts
        });

        res.status(201).json({ message: 'Product submitted successfully', submission });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.getFavorites = async (req, res) => {
    try {
        const favorites = await SavedProduct.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.toggleFavorite = async (req, res) => {
    try {
        const { barcode, productName } = req.body;
        const userId = req.user.id;

        const existing = await SavedProduct.findOne({
            where: { userId, barcode }
        });

        if (existing) {
            await existing.destroy();
            return res.json({ message: 'Removed from favorites', isFavorite: false });
        } else {
            await SavedProduct.create({ userId, barcode, productName });
            return res.status(201).json({ message: 'Added to favorites', isFavorite: true });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.checkFavorite = async (req, res) => {
    try {
        const { barcode } = req.params;
        const userId = req.user.id;
        const existing = await SavedProduct.findOne({ where: { userId, barcode } });
        res.json({ isFavorite: !!existing });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
