const config = require('../config/config');

/**
 * Builds optimized prompts for coloring page generation
 */
class PromptBuilder {

    /**
     * Build the complete prompt for image generation
     * @param {string} description - User's image description
     * @param {number} difficulty - Slider value 0-100
     * @param {string} style - Image style preference
     * @returns {string} - Complete prompt for Imagen
     */
    static buildColoringPagePrompt(description, difficulty, style) {
        const diffSettings = config.getDifficultySettings(difficulty);
        const styleDesc = config.imageStyles[style] || config.imageStyles.cartoon;

        const prompt = `
Create a COLOR BY NUMBERS coloring page with the following specifications:

SUBJECT: ${description}

STYLE REQUIREMENTS:
- ${styleDesc}
- Black and white LINE ART ONLY
- Pure white background
- Clean, closed outlines suitable for coloring
- ${diffSettings.lineThickness}
- ${diffSettings.detail}
- Approximately ${diffSettings.sectionsRange} distinct numbered sections

TECHNICAL REQUIREMENTS:
- High contrast black outlines on white background
- Each colorable section must be clearly enclosed
- Small numbers (1-${diffSettings.sections}) placed inside each section
- Numbers should be small, readable, and centered in their sections
- NO shading, NO gradients, NO filled areas
- NO gray tones - only pure black lines on pure white
- Professional coloring book quality
- Clean, crisp vector-like lines
- Suitable for printing and coloring

OUTPUT: A ready-to-color numbered coloring page with clear sections and visible numbers inside each area.
    `.trim();

        return prompt;
    }

    /**
     * Build a simplified prompt for faster generation
     */
    static buildSimplePrompt(description, difficulty, style) {
        const diffSettings = config.getDifficultySettings(difficulty);
        const styleDesc = config.imageStyles[style] || '';

        return `Color by numbers coloring page: ${description}. ${styleDesc}. Black and white line art, ${diffSettings.detail}, ${diffSettings.sectionsRange} numbered sections, white background, clean outlines, no shading.`;
    }

    /**
     * Validate input parameters
     */
    static validateInputs(description, difficulty, style) {
        const errors = [];

        if (!description || description.trim().length < 3) {
            errors.push('Description must be at least 3 characters long');
        }

        if (description && description.length > 500) {
            errors.push('Description must be less than 500 characters');
        }

        if (typeof difficulty !== 'number' || difficulty < 0 || difficulty > 100) {
            errors.push('Difficulty must be a number between 0 and 100');
        }

        if (style && !config.imageStyles[style]) {
            errors.push(`Invalid style. Choose from: ${Object.keys(config.imageStyles).join(', ')}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = PromptBuilder;
