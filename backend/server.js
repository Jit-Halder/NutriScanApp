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

// Smart database startup: check if tables exist before syncing
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');

        // Check if tables already exist by querying the Users table
        let tablesExist = false;
        try {
            await sequelize.query('SELECT 1 FROM Users LIMIT 1');
            tablesExist = true;
            console.log('Database tables already exist - skipping sync');
        } catch (e) {
            console.log('Tables not found - will create them now');
        }

        // Only sync (create tables) if they don't already exist
        if (!tablesExist) {
            await sequelize.sync();
            console.log('Database tables created successfully');
        }

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
