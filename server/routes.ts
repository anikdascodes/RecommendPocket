import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserPreferencesSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server | Express> {
  // Get all audio content
  app.get("/api/content", async (req, res) => {
    try {
      const content = await storage.getAllAudioContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  // Get content by category
  app.get("/api/content/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const content = await storage.getAudioContentByCategory(category);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content by category" });
    }
  });

  // Search content
  app.get("/api/content/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ error: "Search query is required" });
      }
      const content = await storage.searchContent(q);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to search content" });
    }
  });

  // Save user preferences
  app.post("/api/preferences", async (req, res) => {
    try {
      // Supply defaults for optional columns that may be missing from the client payload
      const hydrated = {
        autoPlay: true,
        downloadQuality: "high",
        playbackSpeed: 1.0,
        preferredNarrators: [],
        preferredLanguages: ["English"],
        ...req.body,
      };

      const validatedPreferences = insertUserPreferencesSchema.parse(hydrated);

      // For demo purposes, using userId 1
      const preferences = await storage.saveUserPreferences({
        ...validatedPreferences,
        userId: 1,
      });
      res.json(preferences);
    } catch (error) {
      console.error("Failed to save preferences:", error);

      // If validation error provide 400 so client can react appropriately
      if ((error as any)?.issues) {
        return res.status(400).json({ error: "Invalid preferences", details: error });
      }

      res.status(500).json({ error: "Failed to save preferences" });
    }
  });

  // Get enhanced smart recommendations using advanced local algorithm
  app.post("/api/recommendations", async (req, res) => {
    try {
      console.log('Recommendation request received:', JSON.stringify(req.body, null, 2));
      const { preferences } = req.body;
      
      if (!preferences) {
        console.error('No preferences provided in request');
        return res.status(400).json({ error: "Preferences are required" });
      }
      
      const userId = 1; // Demo user ID
      console.log('Using userId:', userId);
      
      // Get all content and user data
      console.log('Fetching content and user data...');
      const allContent = await storage.getAllAudioContent();
      console.log('All content count:', allContent.length);
      
      const userFavorites = await storage.getUserFavorites(userId);
      console.log('User favorites count:', userFavorites.length);
      
      const userHistory = await storage.getListeningHistory(userId);
      console.log('User history count:', userHistory.length);
      
      const userRatings = await storage.getUserRatings(userId);
      console.log('User ratings count:', userRatings.length);
      
      // Generate enhanced smart recommendations using advanced algorithm
      console.log('Generating recommendations...');
      const recommendations = generateAdvancedRecommendations(
        preferences, 
        allContent, 
        userFavorites, 
        userHistory,
        userRatings
      );
      
      console.log('Generated recommendations count:', recommendations.length);
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ 
        error: "Failed to generate recommendations",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // User feedback for recommendations
  app.post("/api/recommendations/feedback", async (req, res) => {
    try {
      const { contentId, feedback, userId } = req.body; // feedback: 'like', 'dislike', 'not_interested'
      
      // Store feedback (in a real app, you'd save this to improve future recommendations)
      console.log(`User ${userId} gave feedback "${feedback}" for content ${contentId}`);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  // Favorites endpoints
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const { userId, contentId } = req.body;
      const favorite = await storage.addToFavorites(userId, contentId);
      res.json(favorite);
    } catch (error) {
      res.status(500).json({ error: "Failed to add to favorites" });
    }
  });

  app.delete("/api/favorites", async (req, res) => {
    try {
      const { userId, contentId } = req.body;
      const removed = await storage.removeFromFavorites(userId, contentId);
      res.json({ success: removed });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove from favorites" });
    }
  });

  // Listening history endpoints
  app.get("/api/history/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const history = await storage.getListeningHistory(userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listening history" });
    }
  });

  app.post("/api/progress", async (req, res) => {
    try {
      const { userId, contentId, progressMinutes, completed } = req.body;
      const progress = await storage.updateListeningProgress(userId, contentId, progressMinutes, completed);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  // Rating endpoints
  app.post("/api/rate", async (req, res) => {
    try {
      const { userId, contentId, rating, review } = req.body;
      const userRating = await storage.rateContent(userId, contentId, rating, review);
      res.json(userRating);
    } catch (error) {
      res.status(500).json({ error: "Failed to rate content" });
    }
  });

  app.get("/api/content/:id/rating", async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      const averageRating = await storage.getAverageRating(contentId);
      res.json({ averageRating });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rating" });
    }
  });

  // For serverless environments, return the app directly
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    console.log('Returning Express app for serverless environment');
    return app;
  }
  
  // For development, create and return HTTP server
  console.log('Creating HTTP server for development environment');
  const httpServer = createServer(app);
  return httpServer;
}

function generateAdvancedRecommendations(
  preferences: any, 
  allContent: any[], 
  userFavorites: any[], 
  userHistory: any[],
  userRatings: any[]
) {
  const favoriteContentIds = new Set(userFavorites.map(f => f.contentId));
  const historyContentIds = new Set(userHistory.map(h => h.contentId));
  const userRatingMap = new Map(userRatings.map(r => [r.contentId, r.rating]));
  
  // Get user's listening patterns
  const listeningPatterns = analyzeLlisteningPatterns(userHistory, allContent);
  const preferredCategories = getPreferredCategories(userFavorites, userRatings, allContent);
  
  // Score each piece of content with advanced algorithm
  const scoredContent = allContent.map(content => {
    try {
      let score = 0;
      let reasons = [];
      let confidence = 0;
      let recommendationType = 'general';
      
      // Initialize default match details
      let matchDetails = {
        genreMatch: 0,
        durationMatch: 0,
        qualityScore: 0,
        similarityScore: 0,
        discoveryScore: 0
      };
      
      // 1. Primary Genre Preference (35% weight)
      const genreMatch = calculateGenreMatch(content, preferences, preferredCategories);
      const genreScore = genreMatch.score * 35;
      score += genreScore;
      matchDetails.genreMatch = genreScore;
      if (genreMatch.reason) reasons.push(genreMatch.reason);
      confidence += genreMatch.confidence;
      
      // 2. Duration Compatibility (25% weight) - Enhanced
      const durationMatch = calculateAdvancedDurationScore(content.duration, preferences.duration, listeningPatterns);
      const durationScore = durationMatch.score * 25;
      score += durationScore;
      matchDetails.durationMatch = durationScore;
      if (durationMatch.reason) reasons.push(durationMatch.reason);
      confidence += durationMatch.confidence;
      
      // 3. Quality & Popularity (20% weight) - Enhanced
      const qualityScore = calculateQualityScore(content, allContent);
      const qualityScoreValue = qualityScore.score * 20;
      score += qualityScoreValue;
      matchDetails.qualityScore = qualityScoreValue;
      if (qualityScore.reason) reasons.push(qualityScore.reason);
      confidence += qualityScore.confidence;
      
      // 4. Personal Similarity (15% weight) - Enhanced
      const similarityScore = calculateSimilarityScore(content, userFavorites, userRatings, allContent);
      const similarityScoreValue = similarityScore.score * 15;
      score += similarityScoreValue;
      matchDetails.similarityScore = similarityScoreValue;
      if (similarityScore.reason) reasons.push(similarityScore.reason);
      confidence += similarityScore.confidence;
      
      // 5. Discovery & Freshness (5% weight)
      const discoveryScore = calculateDiscoveryScore(content, favoriteContentIds, historyContentIds, preferences);
      const discoveryScoreValue = discoveryScore.score * 5;
      score += discoveryScoreValue;
      matchDetails.discoveryScore = discoveryScoreValue;
      if (discoveryScore.reason) reasons.push(discoveryScore.reason);
      
      // Apply penalties and bonuses
      const penalties = calculatePenalties(content, favoriteContentIds, historyContentIds);
      score += penalties.score;
      
      // Determine recommendation type
      if (preferences.genres && preferences.genres.includes(content.category)) {
        recommendationType = 'perfect_match';
      } else if (preferredCategories.includes(content.category)) {
        recommendationType = 'based_on_history';
      } else if (parseFloat(content.rating) >= 4.5) {
        recommendationType = 'highly_rated';
      } else {
        recommendationType = 'discovery';
      }
      
      // Select best reason with context
      const bestReason = selectBestReason(reasons, recommendationType, content);
      
      return {
        contentId: content.id,
        content,
        score: Math.max(0, Math.min(100, score)),
        reason: bestReason,
        confidence: Math.min(100, confidence / 4), // Average confidence
        recommendationType,
        matchDetails
      };
    } catch (error) {
      console.error('Error processing content for recommendations:', error);
      // Return a minimal recommendation object if there's an error
      return {
        contentId: content.id,
        content,
        score: 25, // Default low score
        reason: `Quality ${content.category} content`,
        confidence: 25,
        recommendationType: 'discovery',
        matchDetails: {
          genreMatch: 0,
          durationMatch: 0,
          qualityScore: 25,
          similarityScore: 0,
          discoveryScore: 0
        }
      };
    }
  });
  
  // Filter and sort recommendations
  const validRecommendations = scoredContent
    .filter(item => item.score > 15) // Minimum threshold
    .sort((a, b) => {
      // Primary sort by score, secondary by confidence
      if (Math.abs(a.score - b.score) < 5) {
        return b.confidence - a.confidence;
      }
      return b.score - a.score;
    });
  
  // Ensure diversity in recommendations
  const diverseRecommendations = ensureDiversity(validRecommendations, 8);
  
  return diverseRecommendations.slice(0, 6);
}

function analyzeLlisteningPatterns(userHistory: any[], allContent: any[]) {
  if (userHistory.length === 0) return null;
  
  const contentMap = new Map(allContent.map(c => [c.id, c]));
  const durations = userHistory
    .map(h => contentMap.get(h.contentId))
    .filter(Boolean)
    .map(c => extractMinutes(c.duration));
  
  if (durations.length === 0) return null;
  
  const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  return { averageDuration: avgDuration, totalSessions: userHistory.length };
}

function getPreferredCategories(userFavorites: any[], userRatings: any[], allContent: any[]) {
  const contentMap = new Map(allContent.map(c => [c.id, c]));
  const categoryScore = new Map();
  
  // Score from favorites
  userFavorites.forEach(fav => {
    const content = contentMap.get(fav.contentId);
    if (content) {
      categoryScore.set(content.category, (categoryScore.get(content.category) || 0) + 3);
    }
  });
  
  // Score from ratings (4+ stars)
  userRatings.forEach(rating => {
    if (rating.rating >= 4) {
      const content = contentMap.get(rating.contentId);
      if (content) {
        categoryScore.set(content.category, (categoryScore.get(content.category) || 0) + rating.rating);
      }
    }
  });
  
  return Array.from(categoryScore.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category);
}

function calculateGenreMatch(content: any, preferences: any, preferredCategories: string[]) {
  try {
    let score = 0;
    let reason = '';
    let confidence = 0;
    
    if (preferences?.genres?.includes(content.category)) {
      score = 1;
      reason = `Perfect match for your ${content.category} preference`;
      confidence = 100;
    } else if (preferredCategories.includes(content.category)) {
      score = 0.8;
      reason = `You've enjoyed ${content.category} content before`;
      confidence = 80;
    } else {
      // Similar genre matching
      const similarGenres = getSimilarGenres(content.category);
      const matchedSimilar = preferences?.genres?.find((g: string) => similarGenres.includes(g));
      if (matchedSimilar) {
        score = 0.6;
        reason = `Similar to your ${matchedSimilar} preference`;
        confidence = 60;
      } else {
        score = 0.2;
        confidence = 20;
      }
    }
    
    return { score, reason, confidence };
  } catch (error) {
    console.error('Error in calculateGenreMatch:', error);
    return { score: 0.2, reason: '', confidence: 20 };
  }
}

function calculateAdvancedDurationScore(contentDuration: string, preferredDuration: string, patterns: any) {
  try {
    const contentMinutes = extractMinutes(contentDuration);
    let score = 0;
    let reason = '';
    let confidence = 50;
    
    // Use user's actual listening patterns if available
    if (patterns?.averageDuration) {
      const diff = Math.abs(contentMinutes - patterns.averageDuration);
      if (diff <= 15) {
        score = 1;
        reason = `Perfect ${contentDuration} length based on your listening history`;
        confidence = 90;
      } else if (diff <= 30) {
        score = 0.8;
        reason = `Good ${contentDuration} length for your sessions`;
        confidence = 70;
      } else {
        score = Math.max(0.3, 1 - (diff / 120));
        confidence = 40;
      }
    } else {
      // Fall back to preference-based scoring
      const durationRanges = {
        'short': { min: 0, max: 30, ideal: 15 },
        'medium': { min: 25, max: 90, ideal: 60 },
        'long': { min: 60, max: 300, ideal: 120 }
      };
      
      const range = durationRanges[preferredDuration as keyof typeof durationRanges];
      if (range && contentMinutes >= range.min && contentMinutes <= range.max) {
        const distanceFromIdeal = Math.abs(contentMinutes - range.ideal);
        const maxDistance = Math.max(range.ideal - range.min, range.max - range.ideal);
        score = 1 - (distanceFromIdeal / maxDistance);
        
        if (score > 0.8) {
          reason = `Ideal ${contentDuration} for ${preferredDuration} sessions`;
          confidence = 80;
        }
      } else {
        score = 0.3;
      }
    }
    
    return { score, reason, confidence };
  } catch (error) {
    console.error('Error in calculateAdvancedDurationScore:', error);
    return { score: 0.5, reason: '', confidence: 50 };
  }
}

function calculateQualityScore(content: any, allContent: any[]) {
  try {
    const rating = parseFloat(content.rating) || 0;
    const playCount = content.playCount || 0;
    
    // Calculate percentile ranks
    const allRatings = allContent.map(c => parseFloat(c.rating) || 0);
    const allPlayCounts = allContent.map(c => c.playCount || 0);
    
    const ratingPercentile = calculatePercentile(rating, allRatings);
    const popularityPercentile = calculatePercentile(playCount, allPlayCounts);
    
    let score = (ratingPercentile + popularityPercentile) / 200; // Normalize to 0-1
    let reason = '';
    let confidence = 60;
    
    if (rating >= 4.5 && ratingPercentile > 80) {
      reason = `Exceptional quality - ${rating}⭐ rating`;
      confidence = 90;
    } else if (rating >= 4.0 && popularityPercentile > 70) {
      reason = `Popular choice - ${rating}⭐ with ${playCount}+ plays`;
      confidence = 75;
    } else if (ratingPercentile > 60) {
      reason = `Well-rated content (${rating}⭐)`;
      confidence = 60;
    }
    
    return { score, reason, confidence };
  } catch (error) {
    console.error('Error in calculateQualityScore:', error);
    return { score: 0.5, reason: '', confidence: 50 };
  }
}

function calculateSimilarityScore(content: any, userFavorites: any[], userRatings: any[], allContent: any[]) {
  try {
    let score = 0;
    let reason = '';
    let confidence = 40;
    
    if (userFavorites.length === 0 && userRatings.length === 0) {
      return { score: 0.5, reason: '', confidence: 20 };
    }
    
    const contentMap = new Map(allContent.map(c => [c.id, c]));
    
    // Find similar content based on favorites
    const favoriteContents = userFavorites
      .map(fav => contentMap.get(fav.contentId))
      .filter(Boolean);
    
    const similarities = favoriteContents.map(favContent => {
      let similarity = 0;
      
      // Same category
      if (favContent.category === content.category) similarity += 0.4;
      
      // Similar duration
      const favDuration = extractMinutes(favContent.duration);
      const contentDuration = extractMinutes(content.duration);
      const durationSimilarity = 1 - Math.abs(favDuration - contentDuration) / 120;
      similarity += Math.max(0, durationSimilarity) * 0.3;
      
      // Similar rating range
      const favRating = parseFloat(favContent.rating) || 0;
      const contentRating = parseFloat(content.rating) || 0;
      const ratingSimilarity = 1 - Math.abs(favRating - contentRating) / 5;
      similarity += ratingSimilarity * 0.3;
      
      return { similarity, title: favContent.title };
    });
    
    if (similarities.length > 0) {
      const bestSimilarity = similarities.reduce((best, current) => 
        current.similarity > best.similarity ? current : best
      );
      
      score = bestSimilarity.similarity;
      if (score > 0.7) {
        reason = `Similar to "${bestSimilarity.title}" that you loved`;
        confidence = 80;
      } else if (score > 0.5) {
        reason = `Similar style to your favorites`;
        confidence = 65;
      }
    }
    
    return { score, reason, confidence };
  } catch (error) {
    console.error('Error in calculateSimilarityScore:', error);
    return { score: 0.3, reason: '', confidence: 30 };
  }
}

function calculateDiscoveryScore(content: any, favoriteIds: Set<number>, historyIds: Set<number>, preferences: any) {
  try {
    let score = 0;
    let reason = '';
    
    // Fresh content bonus
    if (!favoriteIds.has(content.id) && !historyIds.has(content.id)) {
      score = 0.8;
      
      // Encourage genre exploration
      if (!preferences?.genres?.includes(content.category)) {
        score = 1;
        reason = `Discover ${content.category} - expand your horizons`;
      } else {
        reason = `Fresh ${content.category} content for you`;
      }
    }
    
    return { score, reason, confidence: 50 };
  } catch (error) {
    console.error('Error in calculateDiscoveryScore:', error);
    return { score: 0.5, reason: '', confidence: 50 };
  }
}

function calculatePenalties(content: any, favoriteIds: Set<number>, historyIds: Set<number>) {
  let score = 0;
  
  // Strong penalty for already favorited
  if (favoriteIds.has(content.id)) {
    score -= 50;
  }
  
  // Moderate penalty for recently played
  if (historyIds.has(content.id)) {
    score -= 25;
  }
  
  return { score };
}

function selectBestReason(reasons: string[], type: string, content: any) {
  if (reasons.length === 0) {
    const fallbackReasons = {
      'perfect_match': `Matches your ${content.category} preference perfectly`,
      'based_on_history': `Based on your listening history`,
      'highly_rated': `Highly rated by the community`,
      'discovery': `Something new to explore`
    };
    return fallbackReasons[type as keyof typeof fallbackReasons] || `Quality ${content.category} content`;
  }
  
  // Prioritize more specific and engaging reasons
  const priorityOrder = [
    'Perfect match',
    'Similar to',
    'Ideal',
    'Exceptional',
    'Popular choice',
    'You\'ve enjoyed',
    'Based on',
    'Discover',
    'Fresh'
  ];
  
  for (const priority of priorityOrder) {
    const matchingReason = reasons.find(r => r.includes(priority));
    if (matchingReason) return matchingReason;
  }
  
  return reasons[0];
}

function getSimilarGenres(genre: string): string[] {
  const genreSimilarity: Record<string, string[]> = {
    'romance': ['drama', 'comedy'],
    'thriller': ['mystery', 'drama'],
    'mystery': ['thriller', 'drama'],
    'comedy': ['romance', 'drama'],
    'drama': ['romance', 'mystery', 'historical'],
    'sci-fi': ['fantasy', 'thriller'],
    'fantasy': ['sci-fi', 'historical'],
    'historical': ['drama', 'fantasy']
  };
  
  return genreSimilarity[genre] || [];
}

function calculatePercentile(value: number, array: number[]): number {
  const sorted = array.sort((a, b) => a - b);
  const rank = sorted.filter(v => v <= value).length;
  return (rank / sorted.length) * 100;
}

function ensureDiversity(recommendations: any[], maxCount: number): any[] {
  const diverse: any[] = [];
  const categoriesUsed = new Set<string>();
  const typesUsed = new Map<string, number>();
  
  // First pass: Add top recommendations ensuring category diversity
  for (const rec of recommendations) {
    if (diverse.length >= maxCount) break;
    
    const category = rec.content.category;
    const type = rec.recommendationType;
    
    // Prefer diverse categories and types
    const categoryCount = Array.from(categoriesUsed).length;
    const typeCount = typesUsed.get(type) || 0;
    
    if (categoriesUsed.size < 4 && !categoriesUsed.has(category)) {
      diverse.push(rec);
      categoriesUsed.add(category);
      typesUsed.set(type, typeCount + 1);
    } else if (typeCount < 2) {
      diverse.push(rec);
      categoriesUsed.add(category);
      typesUsed.set(type, typeCount + 1);
    }
  }
  
  // Second pass: Fill remaining slots with best remaining
  for (const rec of recommendations) {
    if (diverse.length >= maxCount) break;
    if (!diverse.includes(rec)) {
      diverse.push(rec);
    }
  }
  
  return diverse;
}

function extractMinutes(duration: string): number {
  // Extract numbers from duration string (e.g., "45 min", "1h 30m", "2 hours")
  const hourMatch = duration.match(/(\d+)\s*h/i);
  const minuteMatch = duration.match(/(\d+)\s*m/i);
  
  let totalMinutes = 0;
  if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
  if (minuteMatch) totalMinutes += parseInt(minuteMatch[1]);
  
  // If no time format found, try to extract just numbers and assume minutes
  if (totalMinutes === 0) {
    const numberMatch = duration.match(/(\d+)/);
    if (numberMatch) totalMinutes = parseInt(numberMatch[1]);
  }
  
  return totalMinutes || 60; // Default to 60 minutes if can't parse
}
