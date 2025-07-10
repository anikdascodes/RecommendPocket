import type { Express } from "express";
import { createServer, type Server } from "http";
import fetch from "node-fetch";
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
      const validatedPreferences = insertUserPreferencesSchema.parse(req.body);
      // For demo purposes, using userId 1
      const preferences = await storage.saveUserPreferences({
        ...validatedPreferences,
        userId: 1,
      });
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ error: "Failed to save preferences" });
    }
  });

  // Get AI recommendations
  app.post("/api/recommendations", async (req, res) => {
    try {
      const { preferences } = req.body;
      
      // Get all content for AI processing
      const allContent = await storage.getAllAudioContent();
      
      // Generate AI recommendations using OpenRouter
      const recommendations = await generateAIRecommendations(preferences, allContent);
      
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
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
    return app;
  }
  
  // For development, create and return HTTP server
  const httpServer = createServer(app);
  return httpServer;
}

async function generateAIRecommendations(preferences: any, allContent: any[]) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }
  
  const MODEL_NAME = "google/gemma-3n-e2b-it:free";

  // Create a more detailed prompt with specific instructions
  const userGenres = preferences.genres.join(", ");
  const durationPreference = preferences.duration;
  
  const contentList = allContent.map(c => 
    `ID: ${c.id}, Title: "${c.title}", Category: ${c.category}, Duration: ${c.duration}, Description: "${c.description}"`
  ).join("\n");

  const prompt = `You are an expert audio content recommendation engine. Analyze the user's preferences and recommend the most suitable content.

USER PREFERENCES:
- Preferred genres: ${userGenres}
- Listening session length: ${durationPreference}

AVAILABLE CONTENT:
${contentList}

TASK: Recommend exactly 6 pieces of content that best match the user's preferences. Consider:
1. Genre matching (highest priority)
2. Duration compatibility with listening habits
3. Content quality and engagement potential

REQUIRED OUTPUT FORMAT (JSON only, no additional text):
[
  {"contentId": 1, "reason": "Specific reason why this matches user preferences", "score": 95},
  {"contentId": 3, "reason": "Another specific matching reason", "score": 88}
]

Return only the JSON array, no other text or formatting.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.REPLIT_DOMAINS?.split(",")[0] || "http://localhost:5000",
        "X-Title": "AudioVibe AI Recommendations"
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          {
            role: "system",
            content: "You are an expert audio content recommendation system. Always respond with valid JSON arrays only, no additional text or formatting."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim();
    
    console.log("AI Response:", aiResponse);
    
    // Parse AI response to extract recommendations
    let recommendations;
    try {
      // Clean the response - remove any markdown formatting
      let cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Try to extract JSON from the AI response
      const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        // Try parsing the entire response as JSON
        recommendations = JSON.parse(cleanResponse);
      }
      
      // Validate recommendations structure
      if (!Array.isArray(recommendations)) {
        throw new Error("Response is not an array");
      }
      
      // Ensure all recommendations have required fields and valid contentIds
      recommendations = recommendations.filter(rec => {
        const hasValidFields = rec.contentId && rec.reason && rec.score;
        const contentExists = allContent.some(c => c.id === rec.contentId);
        return hasValidFields && contentExists;
      }).slice(0, 6);
      
      if (recommendations.length === 0) {
        throw new Error("No valid recommendations found");
      }
      
      console.log(`Successfully parsed ${recommendations.length} valid recommendations from AI`);
      
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw AI response:", aiResponse);
      
      // Enhanced fallback: recommend based on genre preferences with better matching
      const genreMatches = allContent.filter(content => 
        preferences.genres.includes(content.category)
      );
      
      // If no genre matches, pick diverse content
      const fallbackContent = genreMatches.length > 0 ? genreMatches : allContent;
      
      recommendations = fallbackContent
        .slice(0, 6)
        .map((content, index) => ({
          contentId: content.id,
          reason: genreMatches.length > 0 
            ? `Perfect match for your ${content.category} preference - ${content.title} offers engaging storytelling`
            : `Highly rated ${content.category} content - ${content.title} is popular among listeners`,
          score: genreMatches.length > 0 ? 90 - (index * 5) : 75 - (index * 3)
        }));
    }

    // Enrich recommendations with full content data
    const enrichedRecommendations = recommendations
      .map((rec: any) => {
        const content = allContent.find(c => c.id === rec.contentId);
        return {
          ...rec,
          content
        };
      })
      .filter(rec => rec.content); // Only return recommendations where content was found

    return enrichedRecommendations;
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    
    // Fallback: return content based on user preferences
    const genreMatchedContent = allContent.filter(content => 
      preferences.genres.includes(content.category)
    );
    
    // If no genre matches found, use all content
    const fallbackContent = genreMatchedContent.length > 0 ? genreMatchedContent : allContent;
    
    const fallbackRecommendations = fallbackContent
      .slice(0, 6)
      .map((content, index) => ({
        contentId: content.id,
        reason: genreMatchedContent.length > 0 
          ? `Perfect match for your ${content.category} preference`
          : `Popular ${content.category} content`,
        score: genreMatchedContent.length > 0 ? 90 - (index * 5) : 75 - (index * 3),
        content
      }));

    return fallbackRecommendations;
  }
}
