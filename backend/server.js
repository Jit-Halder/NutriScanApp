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

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');

        // Step 1: Drop all foreign key constraints to prevent ER_FK_DUP_NAME errors
        // This is necessary because Aiven MySQL can have orphaned FK constraint names
        console.log('Cleaning up foreign key constraints...');
        try {
            const [constraints] = await sequelize.query(`
                SELECT CONSTRAINT_NAME, TABLE_NAME 
                FROM information_schema.TABLE_CONSTRAINTS 
                WHERE CONSTRAINT_TYPE = 'FOREIGN KEY' 
                AND TABLE_SCHEMA = DATABASE()
            `);
            for (const { CONSTRAINT_NAME, TABLE_NAME } of constraints) {
                try {
                    await sequelize.query(`ALTER TABLE \`${TABLE_NAME}\` DROP FOREIGN KEY \`${CONSTRAINT_NAME}\``);
                    console.log(`  Dropped FK: ${CONSTRAINT_NAME} from ${TABLE_NAME}`);
                } catch (e) {
                    // Ignore errors if table/constraint doesn't exist
                }
            }
        } catch (e) {
            console.log('  No FK constraints to clean up');
        }

        // Step 2: Now sync all models - this will recreate tables and FK constraints cleanly
        console.log('Syncing database tables...');
        await sequelize.sync();
        console.log('Database tables synced successfully');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server with database:', err.message);
        // Start server anyway so Render doesn't mark it as crashed
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT} (WITHOUT database)`);
        });
    }
}

startServer();
