const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/scan/:barcode', authMiddleware, productController.scanProduct);
router.get('/history', authMiddleware, productController.getScanHistory);
router.post('/submit', authMiddleware, productController.submitMissingProduct);

router.get('/favorites', authMiddleware, productController.getFavorites);
router.post('/favorites/toggle', authMiddleware, productController.toggleFavorite);
router.get('/favorites/check/:barcode', authMiddleware, productController.checkFavorite);

module.exports = router;
