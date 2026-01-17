const OpenAI = require('openai');
const config = require('../config/config');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.client = null;
    this.isInitialized = false;

    if (config.openaiApiKey) {
      this.client = new OpenAI({
        apiKey: config.openaiApiKey,
      });
      this.isInitialized = true;
      logger.info('OpenAI client initialized');
    } else {
      logger.warn('OpenAI API key not found, AI features will be disabled');
    }
  }

  // Generate recipe suggestions based on available ingredients
  async generateRecipeSuggestions(ingredients, cuisine = null, dietaryRestrictions = []) {
    if (!this.isInitialized) {
      return this.getFallbackRecipeSuggestions(ingredients);
    }

    try {
      let prompt = `Based on these ingredients: ${ingredients.join(', ')}, suggest 3 creative recipe ideas for food videos.`;

      if (cuisine) {
        prompt += ` Focus on ${cuisine} cuisine.`;
      }

      if (dietaryRestrictions.length > 0) {
        prompt += ` Consider these dietary restrictions: ${dietaryRestrictions.join(', ')}.`;
      }

      prompt += `
      Each suggestion should include:
      - Recipe name (creative and appealing)
      - Brief description (2-3 sentences)
      - Key ingredients used from the list
      - Basic preparation steps (3-5 steps)
      - Why it would work well for video content
      - Estimated cooking time
      - Difficulty level (Easy/Medium/Hard)
      - Visual appeal rating (1-10)
      - Unique selling points for social media

      Format as JSON array of objects.`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1200,
        temperature: 0.8
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      logger.error('AI recipe generation error:', error);
      return this.getFallbackRecipeSuggestions(ingredients);
    }
  }

  // Analyze food content trends and provide insights
  async analyzeTrends(content, platform = 'general') {
    if (!this.isInitialized) {
      return this.getFallbackTrends(content);
    }

    try {
      const prompt = `Analyze this food content for trends and provide comprehensive insights: "${content}"

      Consider it's for ${platform} platform. Provide analysis on:
      - Current food trends and viral elements mentioned
      - Popular ingredients, cooking techniques, or presentation styles
      - Target audience preferences and demographics
      - Content style recommendations (colors, music, pacing)
      - Hashtag suggestions (15 relevant, trending hashtags)
      - Engagement potential score (1-10)
      - Trend prediction (will this go viral?)
      - Similar successful content examples
      - Optimization suggestions for better reach

      Format as JSON object with detailed analysis.`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.6
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      logger.error('AI trend analysis error:', error);
      return this.getFallbackTrends(content);
    }
  }

  // Generate professional video editing and content creation tips
  async generateVideoTips(videoDescription, videoLength = 'short', targetAudience = 'general') {
    if (!this.isInitialized) {
      return this.getFallbackVideoTips(videoDescription);
    }

    try {
      const prompt = `For a ${videoLength} food video described as: "${videoDescription}", targeted at ${targetAudience} audience, provide professional video editing and content creation tips:

      Provide detailed recommendations for:
      - Lighting setup and techniques
      - Camera angles, shots, and movement suggestions
      - Editing techniques (cuts, transitions, pacing)
      - Music/audio recommendations with specific genres/styles
      - Thumbnail and title optimization ideas
      - Hook strategies for first 3 seconds
      - Call-to-action suggestions
      - Text overlay and graphics recommendations
      - Color grading and visual effects
      - Best practices for ${videoLength} format videos

      Format as JSON object with categorized tips.`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1200,
        temperature: 0.7
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      logger.error('AI video tips error:', error);
      return this.getFallbackVideoTips(videoDescription);
    }
  }

  // Generate smart content recommendations for users
  async generateContentRecommendations(userPreferences, recentActivity = [], trendingTopics = []) {
    if (!this.isInitialized) {
      return this.getFallbackRecommendations();
    }

    try {
      const prompt = `Based on user preferences: ${JSON.stringify(userPreferences)}
      Recent activity: ${JSON.stringify(recentActivity)}
      Trending topics: ${JSON.stringify(trendingTopics)}

      Generate 5 personalized content recommendations for food videos:

      Each recommendation should include:
      - Content type (recipe, technique, trend, challenge, etc.)
      - Specific topic or recipe idea
      - Why it matches user preferences
      - Expected engagement potential
      - Difficulty level
      - Required ingredients/equipment
      - Time investment needed
      - Monetization potential
      - Trending hashtags to include

      Format as JSON array of recommendation objects.`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.8
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      logger.error('AI recommendations error:', error);
      return this.getFallbackRecommendations();
    }
  }

  // Generate automated hashtags for content
  async generateHashtags(content, contentType = 'food', platform = 'instagram') {
    if (!this.isInitialized) {
      return this.getFallbackHashtags(content);
    }

    try {
      const prompt = `Generate optimized hashtags for this ${contentType} content: "${content}"

      For ${platform} platform, provide:
      - 10 high-engagement hashtags (most popular)
      - 10 medium-engagement hashtags (niche but relevant)
      - 5 location-based hashtags (if applicable)
      - 5 trending hashtags (currently popular)
      - 5 branded/community hashtags
      - Optimal hashtag strategy (how many to use, placement)
      - Hashtag performance prediction
      - Alternative hashtag combinations

      Consider current food trends, seasonality, and platform algorithms.
      Format as JSON object with categorized hashtag lists.`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.6
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      logger.error('AI hashtag generation error:', error);
      return this.getFallbackHashtags(content);
    }
  }

  // Score content quality and provide improvement suggestions
  async scoreContentQuality(contentData) {
    if (!this.isInitialized) {
      return this.getFallbackQualityScore(contentData);
    }

    try {
      const { title, description, tags, videoLength, cuisine, ingredients, presentation } = contentData;

      const prompt = `Score this food content on various quality metrics:

      Content Details:
      - Title: "${title}"
      - Description: "${description}"
      - Tags: ${tags?.join(', ')}
      - Video Length: ${videoLength} seconds
      - Cuisine: ${cuisine}
      - Ingredients: ${ingredients?.join(', ')}
      - Presentation Style: ${presentation}

      Provide scores (1-10) and detailed feedback for:
      - Title effectiveness and clickability
      - Description engagement and SEO
      - Hashtag optimization and relevance
      - Content uniqueness and creativity
      - Production quality potential
      - Audience appeal and virality potential
      - Overall content quality score
      - Specific improvement suggestions
      - Estimated engagement rate prediction
      - Monetization readiness

      Format as JSON object with scores and detailed analysis.`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      logger.error('AI quality scoring error:', error);
      return this.getFallbackQualityScore(contentData);
    }
  }

  // Analyze food trends from multiple content pieces
  async analyzeFoodTrends(contentArray, timeRange = 'month') {
    if (!this.isInitialized) {
      return this.getFallbackTrendAnalysis(contentArray);
    }

    try {
      const prompt = `Analyze these food content pieces for broader trends: ${JSON.stringify(contentArray)}

      For the past ${timeRange}, identify:
      - Top emerging food trends
      - Popular ingredient combinations
      - Cooking techniques gaining popularity
      - Presentation styles trending
      - Cuisine fusions appearing
      - Dietary preferences shifting
      - Seasonal ingredient usage
      - Viral challenge potential
      - Platform-specific trends
      - Future trend predictions
      - Content creator opportunities

      Provide detailed trend analysis with data-driven insights.
      Format as JSON object with trend categories and insights.`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1200,
        temperature: 0.7
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      logger.error('AI trend analysis error:', error);
      return this.getFallbackTrendAnalysis(contentArray);
    }
  }

  // Generate recipe variations and improvements
  async generateRecipeVariations(baseRecipe, constraints = {}) {
    if (!this.isInitialized) {
      return this.getFallbackRecipeVariations(baseRecipe);
    }

    try {
      const prompt = `For this base recipe: ${JSON.stringify(baseRecipe)}
      Constraints: ${JSON.stringify(constraints)}

      Generate 3 creative variations:
      - Dietary adaptation (vegan, keto, gluten-free, etc.)
      - Cuisine fusion variation
      - Modern/trendy twist
      - Seasonal adaptation
      - Difficulty level adjustment
      - Ingredient substitution options
      - Presentation variations
      - Scaling options (servings, portions)

      Each variation should include modified ingredients, steps, and unique selling points.
      Format as JSON array of variation objects.`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.8
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      logger.error('AI recipe variations error:', error);
      return this.getFallbackRecipeVariations(baseRecipe);
    }
  }

  // Enhanced fallback methods with more comprehensive responses
  getFallbackRecipeSuggestions(ingredients) {
    return [
      {
        name: 'Simple Stir Fry',
        description: 'A quick and easy stir fry using available ingredients. Perfect for busy weeknights and great for video content.',
        ingredients: ingredients.slice(0, 3),
        steps: ['Chop ingredients', 'Heat oil in pan', 'Stir fry for 5-7 minutes'],
        cookingTime: '15 minutes',
        difficulty: 'Easy',
        visualAppeal: 7,
        sellingPoints: ['Quick prep', 'Colorful presentation', 'Versatile ingredients']
      },
      {
        name: 'Ingredient Medley Bowl',
        description: 'Combine ingredients creatively for a unique and nutritious dish. Great for showcasing ingredient transformations.',
        ingredients: ingredients,
        steps: ['Prepare ingredients separately', 'Arrange in bowl', 'Add dressing'],
        cookingTime: '20 minutes',
        difficulty: 'Medium',
        visualAppeal: 8,
        sellingPoints: ['Healthy and fresh', 'Instagram-worthy presentation', 'Customizable']
      },
      {
        name: 'Fusion Creation',
        description: 'Blend different cooking techniques for an innovative dish. Perfect for creative cooking demonstrations.',
        ingredients: ingredients,
        steps: ['Experiment with combinations', 'Test cooking methods', 'Plate creatively'],
        cookingTime: '25 minutes',
        difficulty: 'Hard',
        visualAppeal: 9,
        sellingPoints: ['Unique flavor profile', 'Cooking technique showcase', 'Viral potential']
      }
    ];
  }

  getFallbackTrends(content) {
    return {
      trends: ['Fresh ingredients', 'Quick recipes', 'Healthy eating'],
      ingredients: ['seasonal produce', 'herbs', 'spices'],
      techniques: ['stir fry', 'grilling', 'baking'],
      audience: 'young adults, health-conscious',
      recommendations: ['Use natural lighting', 'Add text overlays', 'Include recipe cards'],
      hashtags: ['foodie', 'cooking', 'recipe', 'foodstagram', 'yummy', 'delicious', 'homemade', 'foodlover', 'instafood', 'foodphotography'],
      engagementScore: 7,
      viralPotential: 'Medium',
      similarContent: ['Quick healthy meals', 'Ingredient spotlights'],
      optimizationTips: ['Add trending sounds', 'Use popular transitions', 'Include calls-to-action']
    };
  }

  getFallbackVideoTips(description) {
    return {
      lighting: 'Use natural light from window, avoid overhead lights',
      camera: 'Start with wide shot, use close-ups for details',
      editing: 'Keep pace fast, add text overlays, use trending music',
      music: 'Upbeat pop or trending audio from platform',
      thumbnail: 'Show final dish, add text overlay with hook',
      hook: 'Show ingredients quickly, ask engaging question',
      cta: 'Ask viewers to like/share/save, suggest trying recipe',
      text: 'Add ingredient names, cooking steps, fun facts',
      effects: 'Use subtle filters, add sparkles for highlights',
      bestPractices: 'Keep under 60 seconds, show transformation, end with result'
    };
  }

  getFallbackRecommendations() {
    return [
      {
        type: 'recipe',
        topic: 'Quick Pasta Dish',
        reason: 'Matches your Italian cuisine preference',
        engagement: 'High',
        difficulty: 'Easy',
        requirements: 'Basic kitchen tools',
        timeInvestment: '20 minutes',
        monetization: 'Recipe affiliate links',
        hashtags: ['pasta', 'quickrecipe', 'italianfood']
      },
      {
        type: 'technique',
        topic: 'Knife Skills Masterclass',
        reason: 'Based on your cooking improvement interest',
        engagement: 'Medium',
        difficulty: 'Medium',
        requirements: 'Chef knife, cutting board',
        timeInvestment: '15 minutes',
        monetization: 'Kitchen tool sponsorships',
        hashtags: ['knifeskills', 'cookingtips', 'chef']
      }
    ];
  }

  getFallbackHashtags(content) {
    return {
      highEngagement: ['foodie', 'cooking', 'recipe', 'foodstagram', 'yummy', 'delicious', 'homemade', 'foodlover', 'instafood', 'foodphotography'],
      mediumEngagement: ['foodblogger', 'cookingathome', 'foodvideo', 'kitchen', 'chef', 'foodgasm', 'tasty', 'foodpics', 'cookbook', 'foodart'],
      locationBased: ['foodiegram', 'foodspotting', 'localfood', 'foodtruck', 'streetfood'],
      trending: ['viral', 'trending', 'fyp', 'explore', 'discover'],
      branded: ['reel', 'tiktokfood', 'instacook', 'foodtok', 'cookwithme'],
      strategy: 'Use 5-10 hashtags total, mix popular and niche, place at end of caption',
      performance: 'Expected reach: 10k-50k views',
      alternatives: ['Mix with emojis', 'Use question hashtags', 'Create branded series']
    };
  }

  getFallbackQualityScore(contentData) {
    return {
      titleScore: 7,
      descriptionScore: 6,
      hashtagScore: 8,
      uniquenessScore: 7,
      productionScore: 6,
      audienceAppealScore: 7,
      overallScore: 7,
      suggestions: ['Add more descriptive title', 'Include cooking time in description', 'Add trending hashtags'],
      engagementPrediction: '15-25% engagement rate',
      monetizationReadiness: 'Good - ready for basic sponsorships'
    };
  }

  getFallbackTrendAnalysis(contentArray) {
    return {
      emergingTrends: ['Plant-based cooking', 'One-pan meals', 'Fusion cuisine'],
      popularIngredients: ['Avocado', 'Kale', 'Quinoa', 'Sweet potatoes'],
      cookingTechniques: ['Air frying', 'Sheet pan cooking', 'Sous vide'],
      presentationStyles: ['Minimalist plating', 'Color blocking', 'Storytelling layouts'],
      cuisineFusions: ['Mexican-Korean', 'Italian-Japanese', 'Indian-Mediterranean'],
      dietaryShifts: ['More plant-based', 'Gluten-conscious', 'Sugar reduction'],
      seasonalUsage: ['Winter root vegetables', 'Spring greens', 'Summer grilling'],
      viralPotential: ['Challenge recipes', 'Transformation videos', 'Speed cooking'],
      platformTrends: ['Short-form cooking', 'Ingredient hacks', 'Kitchen tours'],
      futurePredictions: ['AI-assisted cooking', 'Sustainable ingredients', 'Cultural fusion'],
      creatorOpportunities: ['Niche cuisine focus', 'Cooking challenges', 'Ingredient education']
    };
  }

  getFallbackRecipeVariations(baseRecipe) {
    return [
      {
        type: 'Dietary Adaptation',
        name: baseRecipe.name + ' (Vegan)',
        ingredients: ['Replace animal products with plant alternatives'],
        steps: ['Substitute ingredients accordingly', 'Adjust cooking times'],
        sellingPoints: ['Health-conscious appeal', 'Plant-based trend', 'Broader audience']
      },
      {
        type: 'Cuisine Fusion',
        name: baseRecipe.name + ' Fusion',
        ingredients: ['Add complementary spices from another cuisine'],
        steps: ['Incorporate fusion elements', 'Balance flavors'],
        sellingPoints: ['Unique flavor profile', 'Cultural storytelling', 'Trending fusion cuisine']
      },
      {
        type: 'Modern Twist',
        name: baseRecipe.name + ' 2.0',
        ingredients: ['Modern ingredient substitutions'],
        steps: ['Update techniques', 'Add contemporary elements'],
        sellingPoints: ['Innovation appeal', 'Modern aesthetics', 'Tech-savvy audience']
      }
    ];
  }

  // Check if AI service is available
  isAvailable() {
    return this.isInitialized;
  }
}

const aiService = new AIService();

module.exports = aiService;
