const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');

// Import routes (will be created later)
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '../public'))); // Serve static frontend

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/products', productRoutes);

// Health check endpoint (useful for Render)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all: serve index.html for any non-API route (SPA support)
app.get(/.*/, (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    } else {
        res.status(404).json({ message: 'API endpoint not found' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 3000;

// Import all models for individual sync
const { User, UserProfile, ProductScanHistory, SavedProduct, ProductSubmission, NutritionAnalysisResult, UserFeedback } = require('./models');

// Sync each model individually - skip ones that already exist (avoids FK duplicate errors)
async function syncModels() {
    const models = [
        { name: 'Users', model: User },
        { name: 'UserProfiles', model: UserProfile },
        { name: 'ProductScanHistories', model: ProductScanHistory },
        { name: 'SavedProducts', model: SavedProduct },
        { name: 'ProductSubmissions', model: ProductSubmission },
        { name: 'NutritionAnalysisResults', model: NutritionAnalysisResult },
        { name: 'UserFeedbacks', model: UserFeedback }
    ];

    for (const { name, model } of models) {
        try {
            // Check if table already exists
            await sequelize.query(`SELECT 1 FROM \`${name}\` LIMIT 1`);
            console.log(`  ✓ ${name} - already exists`);
        } catch (e) {
            // Table doesn't exist, create it
            try {
                await model.sync();
                console.log(`  ✓ ${name} - created`);
            } catch (syncErr) {
                console.error(`  ✗ ${name} - failed to create: ${syncErr.message}`);
            }
        }
    }
}

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');
        console.log('Syncing database tables...');
        await syncModels();
        console.log('Database tables ready');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to connect to database:', err.message);
        // Start server anyway so Render doesn't mark it as crashed
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT} (WITHOUT database)`);
        });
    }
}

startServer();
