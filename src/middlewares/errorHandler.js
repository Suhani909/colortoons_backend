const config = require('../config/config');

const errorHandler = (err, req, res, next) => {
    // Log error
    console.error(`[${new Date().toISOString()}] Error:`, err.message);
    if (!config.isProduction) {
        console.error(err.stack);
    }

    // Default error
    let statusCode = 500;
    let message = 'Internal server error';
    let details = null;

    // Handle specific error types
    if (err.message?.includes('timeout')) {
        statusCode = 504;
        message = 'Image generation timed out. Please try again.';
    } else if (err.message?.includes('RESOURCE_EXHAUSTED')) {
        statusCode = 429;
        message = 'API quota exceeded. Please try again later.';
    } else if (err.message?.includes('INVALID_ARGUMENT')) {
        statusCode = 400;
        message = 'Invalid request parameters';
    } else if (err.message?.includes('PERMISSION_DENIED')) {
        statusCode = 403;
        message = 'API access denied. Check credentials.';
    } else if (err.message?.includes('NOT_FOUND')) {
        statusCode = 404;
        message = 'Resource not found';
    } else if (err.message?.includes('Vertex AI not initialized')) {
        statusCode = 503;
        message = 'Image generation service not configured';
    }

    // Include stack trace in development
    if (!config.isProduction) {
        details = err.stack;
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        details,
        timestamp: new Date().toISOString()
    });
};

module.exports = errorHandler;
