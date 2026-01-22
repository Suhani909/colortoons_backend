const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const rateLimiter = require('../middlewares/rateLimiter');

// Apply rate limiting to all routes
router.use(rateLimiter);

/**
 * @route   POST /api/v1/generate
 * @desc    Generate a coloring page (synchronous)
 * @body    { description: string, difficulty: 0-100, style: string }
 */
router.post('/generate', imageController.generateImage);

/**
 * @route   POST /api/v1/generate/async
 * @desc    Start async image generation
 * @body    { description: string, difficulty: 0-100, style: string }
 */
router.post('/generate/async', imageController.generateImageAsync);

/**
 * @route   GET /api/v1/status/:jobId
 * @desc    Check generation status
 */
router.get('/status/:jobId', imageController.checkStatus);

/**
 * @route   GET /api/v1/options
 * @desc    Get available styles and difficulty info
 */
router.get('/options', imageController.getOptions);

/**
 * @route   POST /api/v1/regenerate
 * @desc    Regenerate with same parameters
 */
router.post('/regenerate', imageController.regenerateImage);

module.exports = router;
