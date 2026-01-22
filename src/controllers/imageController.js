const imageGenService = require('../services/imageGenService');
const PromptBuilder = require('../utils/promptBuilder');
const config = require('../config/config');

const imageController = {

    /**
     * Generate a new coloring page
     * POST /api/v1/generate
     */
    async generateImage(req, res, next) {
        try {
            const { description, difficulty = 50, style = 'cartoon' } = req.body;

            // Validate inputs
            const validation = PromptBuilder.validateInputs(description, difficulty, style);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: validation.errors
                });
            }

            // Create job ID for tracking
            const jobId = imageGenService.createJob();

            // Generate image
            const result = await imageGenService.generateColoringPage({
                description: description.trim(),
                difficulty: Number(difficulty),
                style,
                jobId
            });

            return res.status(200).json({
                success: true,
                data: {
                    jobId: result.jobId,
                    image: {
                        base64: result.imageData,
                        mimeType: 'image/png',
                        url: result.imageUrl
                    },
                    metadata: result.metadata
                }
            });

        } catch (error) {
            next(error);
        }
    },

    /**
     * Generate image with polling support (for long-running requests)
     * POST /api/v1/generate/async
     */
    async generateImageAsync(req, res, next) {
        try {
            const { description, difficulty = 50, style = 'cartoon' } = req.body;

            // Validate inputs
            const validation = PromptBuilder.validateInputs(description, difficulty, style);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: validation.errors
                });
            }

            // Create job
            const jobId = imageGenService.createJob();

            // Return job ID immediately
            res.status(202).json({
                success: true,
                message: 'Image generation started',
                data: {
                    jobId,
                    statusUrl: `/api/v1/status/${jobId}`,
                    estimatedTime: '30-90 seconds'
                }
            });

            // Process in background
            imageGenService.generateColoringPage({
                description: description.trim(),
                difficulty: Number(difficulty),
                style,
                jobId
            }).catch(error => {
                console.error(`Job ${jobId} failed:`, error.message);
            });

        } catch (error) {
            next(error);
        }
    },

    /**
     * Check generation status
     * GET /api/v1/status/:jobId
     */
    async checkStatus(req, res, next) {
        try {
            const { jobId } = req.params;

            const job = imageGenService.getJobStatus(jobId);

            if (!job) {
                return res.status(404).json({
                    success: false,
                    error: 'Job not found or expired'
                });
            }

            // If completed, include result
            const response = {
                success: true,
                data: {
                    id: job.id,
                    status: job.status,
                    message: job.message,
                    createdAt: job.createdAt,
                    updatedAt: job.updatedAt
                }
            };

            if (job.status === 'completed' && job.result) {
                response.data.image = {
                    base64: job.result.imageData,
                    mimeType: 'image/png',
                    url: job.result.imageUrl
                };
            }

            return res.status(200).json(response);

        } catch (error) {
            next(error);
        }
    },

    /**
     * Get available options
     * GET /api/v1/options
     */
    async getOptions(req, res) {
        // Show example difficulty settings
        const difficultyExamples = [0, 25, 50, 75, 100].map(d => ({
            value: d,
            ...config.getDifficultySettings(d)
        }));

        return res.status(200).json({
            success: true,
            data: {
                difficulty: {
                    min: 0,
                    max: 100,
                    default: 50,
                    description: 'Slider from 0 (easiest) to 100 (hardest)',
                    examples: difficultyExamples
                },
                styles: Object.keys(config.imageStyles).map(key => ({
                    id: key,
                    name: key.charAt(0).toUpperCase() + key.slice(1),
                    description: config.imageStyles[key]
                }))
            }
        });
    },

    /**
     * Regenerate with same parameters
     * POST /api/v1/regenerate
     */
    async regenerateImage(req, res, next) {
        return imageController.generateImage(req, res, next);
    }
};

module.exports = imageController;
