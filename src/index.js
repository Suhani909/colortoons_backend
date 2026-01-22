require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const imageRoutes = require('./routes/imageRoutes');
const errorHandler = require('./middlewares/errorHandler');
const config = require('./config/config');

const app = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
app.use(cors({
    origin: config.isProduction
        ? process.env.ALLOWED_ORIGINS?.split(',') || '*'
        : '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression for production
if (config.isProduction) {
    app.use(compression());
}

// Logging
app.use(morgan(config.isProduction ? 'combined' : 'dev'));

// Body parser
app.use(express.json({ limit: '10mb' }));

// Trust proxy for rate limiting behind load balancer
if (config.isProduction) {
    app.set('trust proxy', 1);
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv
    });
});

// API Routes
app.use('/api/v1', imageRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Graceful shutdown handling (only for local development)
if (process.env.VERCEL !== '1') {
    const server = app.listen(config.port, () => {
        console.log(`🎨 Coloring App Backend running on port ${config.port}`);
        console.log(`📍 Environment: ${config.nodeEnv}`);
        console.log(`🔗 Health check: http://localhost:${config.port}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received. Shutting down gracefully...');
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });

    process.on('SIGINT', () => {
        console.log('SIGINT received. Shutting down gracefully...');
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });
}

module.exports = app;

