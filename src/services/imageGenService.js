const { VertexAI } = require('@google-cloud/vertexai');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');
const PromptBuilder = require('../utils/promptBuilder');

class ImageGenService {
    constructor() {
        this.vertexAI = null;
        this.generativeModel = null;
        this.jobs = new Map();

        // Initialize Vertex AI if credentials are available
        this.initializeVertexAI();
    }

    initializeVertexAI() {
        try {
            if (!config.googleCloud.projectId) {
                console.warn('⚠️  GOOGLE_CLOUD_PROJECT_ID not set. Image generation will fail.');
                return;
            }

            // For Vercel: parse credentials from environment variable
            let authOptions = {};
            if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
                try {
                    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
                    authOptions = { credentials };
                } catch (e) {
                    console.error('❌ Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON');
                }
            }

            this.vertexAI = new VertexAI({
                project: config.googleCloud.projectId,
                location: config.googleCloud.location,
                googleAuthOptions: authOptions
            });

            // Use Gemini model for image generation
            this.generativeModel = this.vertexAI.getGenerativeModel({
                model: 'gemini-2.0-flash-exp',
            });

            console.log('✅ Vertex AI initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Vertex AI:', error.message);
        }
    }

    /**
     * Generate a coloring page image
     * @param {Object} params - Generation parameters
     * @returns {Promise<Object>} - Generated image data
     */
    async generateColoringPage({ description, difficulty, style, jobId }) {
        const startTime = Date.now();

        try {
            this.updateJobStatus(jobId, 'processing', 'Building prompt...');

            // Build the optimized prompt
            const prompt = PromptBuilder.buildColoringPagePrompt(description, difficulty, style);

            this.updateJobStatus(jobId, 'processing', 'Generating image...');

            // Call Google Imagen API
            const result = await this.callImagenAPI(prompt, jobId);

            const processingTime = Date.now() - startTime;

            this.updateJobStatus(jobId, 'completed', 'Image generated successfully');

            // Store result in job for async retrieval
            const job = this.jobs.get(jobId);
            if (job) {
                job.result = {
                    imageData: result.imageData,
                    imageUrl: result.imageUrl
                };
                this.jobs.set(jobId, job);
            }

            return {
                success: true,
                jobId,
                imageData: result.imageData,
                imageUrl: result.imageUrl,
                prompt,
                metadata: {
                    description,
                    difficulty,
                    style,
                    processingTimeMs: processingTime,
                    generatedAt: new Date().toISOString()
                }
            };

        } catch (error) {
            this.updateJobStatus(jobId, 'failed', error.message);
            throw error;
        }
    }

    /**
     * Call Google Imagen API with retry logic
     */
    async callImagenAPI(prompt, jobId, attempt = 1) {
        if (!this.generativeModel) {
            throw new Error('Vertex AI not initialized. Check GOOGLE_CLOUD_PROJECT_ID.');
        }

        try {
            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Image generation timeout'));
                }, config.imageGen.timeout);
            });

            // Use Gemini for image generation
            const response = await Promise.race([
                this.generativeModel.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseModalities: ['image', 'text'],
                        responseMimeType: 'image/png',
                    }
                }),
                timeoutPromise
            ]);

            const result = response.response;

            // Extract image from response
            if (result.candidates && result.candidates[0]?.content?.parts) {
                for (const part of result.candidates[0].content.parts) {
                    if (part.inlineData) {
                        return {
                            imageData: part.inlineData.data,
                            imageUrl: null
                        };
                    }
                }
            }

            throw new Error('No image generated from API');

        } catch (error) {
            // Retry logic
            if (attempt < config.imageGen.maxRetries && this.isRetryableError(error)) {
                this.updateJobStatus(jobId, 'processing', `Retrying... (attempt ${attempt + 1})`);

                // Exponential backoff
                const delay = Math.pow(2, attempt) * 1000;
                await this.sleep(delay);

                return this.callImagenAPI(prompt, jobId, attempt + 1);
            }

            throw error;
        }
    }

    /**
     * Create a new job
     */
    createJob() {
        const jobId = uuidv4();

        this.jobs.set(jobId, {
            id: jobId,
            status: 'queued',
            message: 'Job created',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            result: null
        });

        // Clean up old jobs after 30 minutes
        setTimeout(() => {
            this.jobs.delete(jobId);
        }, 30 * 60 * 1000);

        return jobId;
    }

    /**
     * Update job status
     */
    updateJobStatus(jobId, status, message) {
        if (this.jobs.has(jobId)) {
            const job = this.jobs.get(jobId);
            this.jobs.set(jobId, {
                ...job,
                status,
                message,
                updatedAt: new Date().toISOString()
            });
        }
    }

    /**
     * Get job status
     */
    getJobStatus(jobId) {
        return this.jobs.get(jobId) || null;
    }

    /**
     * Check if error is retryable
     */
    isRetryableError(error) {
        const retryableCodes = ['UNAVAILABLE', 'RESOURCE_EXHAUSTED', 'DEADLINE_EXCEEDED'];
        return retryableCodes.some(code => error.message?.includes(code)) ||
            error.message?.includes('timeout');
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Singleton instance
module.exports = new ImageGenService();
