const sequelize = require('../config/database');
const User = require('./User');
const UserProfile = require('./UserProfile');
const ProductScanHistory = require('./ProductScanHistory');
const SavedProduct = require('./SavedProduct');
const ProductSubmission = require('./ProductSubmission');
const NutritionAnalysisResult = require('./NutritionAnalysisResult');
const UserFeedback = require('./UserFeedback');

// Define Relationships
User.hasOne(UserProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
UserProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ProductScanHistory, { foreignKey: 'userId', onDelete: 'CASCADE' });
ProductScanHistory.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(SavedProduct, { foreignKey: 'userId', onDelete: 'CASCADE' });
SavedProduct.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ProductSubmission, { foreignKey: 'userId', onDelete: 'CASCADE' });
ProductSubmission.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(NutritionAnalysisResult, { foreignKey: 'userId', onDelete: 'CASCADE' });
NutritionAnalysisResult.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(UserFeedback, { foreignKey: 'userId', onDelete: 'CASCADE' });
UserFeedback.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    sequelize,
    User,
    UserProfile,
    ProductScanHistory,
    SavedProduct,
    ProductSubmission,
    NutritionAnalysisResult,
    UserFeedback
};
