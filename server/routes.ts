import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserPreferencesSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}

async function generateAIRecommendations(preferences: any, allContent: any[]) {
  const OPENROUTER_API_KEY = "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";
  const MODEL_NAME = "google/gemma-2-9b-it:free";

  const prompt = `Based on user preferences:
- Preferred genres: ${preferences.genres.join(", ")}
- Listening duration: ${preferences.duration}

Available audio content: ${JSON.stringify(allContent.map(c => ({ id: c.id, title: c.title, category: c.category, description: c.description })))}

Please recommend the best 6-8 pieces of content for this user. Return a JSON array with content IDs, reasons for recommendation, and scores (1-100). Focus on matching genres and duration preferences.

Example format:
[
  {"contentId": 1, "reason": "Perfect match for romance preference with engaging storyline", "score": 95},
  {"contentId": 3, "reason": "Great comedy content that fits your preferred listening duration", "score": 88}
]`;

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
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse AI response to extract recommendations
    let recommendations;
    try {
      // Try to extract JSON from the AI response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in AI response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response, using fallback:", parseError);
      // Fallback: recommend based on genre preferences
      recommendations = allContent
        .filter(content => preferences.genres.includes(content.category))
        .slice(0, 6)
        .map(content => ({
          contentId: content.id,
          reason: `Recommended because you selected ${content.category} as a preferred genre`,
          score: 85
        }));
    }

    // Enrich recommendations with full content data
    const enrichedRecommendations = recommendations.map((rec: any) => {
      const content = allContent.find(c => c.id === rec.contentId);
      return {
        ...rec,
        content
      };
    });

    return enrichedRecommendations;
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    
    // Fallback: return content based on user preferences
    const fallbackRecommendations = allContent
      .filter(content => preferences.genres.includes(content.category))
      .slice(0, 6)
      .map(content => ({
        contentId: content.id,
        reason: `Recommended because you selected ${content.category} as a preferred genre`,
        score: 85,
        content
      }));

    return fallbackRecommendations;
  }
}
