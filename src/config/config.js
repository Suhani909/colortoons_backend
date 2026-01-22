module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  googleCloud: {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
  },
  
  imageGen: {
    timeout: parseInt(process.env.IMAGE_GEN_TIMEOUT) || 120000,
    maxRetries: parseInt(process.env.MAX_RETRY_ATTEMPTS) || 3,
    model: 'imagen-3.0-generate-001',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
  },
  
  /**
   * Get difficulty settings based on slider value (0-100)
   * @param {number} difficulty - Slider value from 0 to 100
   * @returns {Object} - Sections, detail level, and line thickness
   */
  getDifficultySettings(difficulty) {
    // Clamp difficulty between 0 and 100
    const d = Math.max(0, Math.min(100, difficulty));
    
    // Calculate sections: 5 at 0%, 100 at 100%
    const sections = 5 + Math.round((d / 100) * 95);
    
    // Determine detail level
    let detail, lineThickness;
    if (d < 30) {
      detail = 'simple, large areas, minimal details';
      lineThickness = 'thick bold lines';
    } else if (d < 70) {
      detail = 'moderate detail, medium-sized areas';
      lineThickness = 'medium weight lines';
    } else {
      detail = 'intricate details, small areas, complex patterns';
      lineThickness = 'fine detailed lines';
    }
    
    return {
      sections,
      sectionsRange: `${Math.max(5, sections - 5)}-${sections + 5}`,
      detail,
      lineThickness,
      difficultyPercent: d
    };
  },
  
  // Supported image styles
  imageStyles: {
    cartoon: 'cartoon style, animated, fun, playful',
    realistic: 'realistic style, naturalistic, lifelike',
    mandala: 'mandala style, symmetrical, geometric patterns, circular',
    anime: 'anime style, Japanese animation, cute',
    geometric: 'geometric shapes, abstract, modern, angular',
    nature: 'nature theme, organic shapes, botanical',
    fantasy: 'fantasy style, magical, whimsical, enchanting',
    minimalist: 'minimalist style, clean, simple, modern'
  }
};
