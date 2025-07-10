import { apiRequest } from "./queryClient";

export interface GenerateRecommendationsRequest {
  preferences: {
    genres: string[];
    duration: string;
  };
}

export const contentApi = {
  getAllContent: () => fetch("/api/content").then(res => res.json()),
  
  getContentByCategory: (category: string) => 
    fetch(`/api/content/category/${category}`).then(res => res.json()),
  
  searchContent: (query: string) => 
    fetch(`/api/content/search?q=${encodeURIComponent(query)}`).then(res => res.json()),
  
  savePreferences: (preferences: any) => 
    apiRequest("POST", "/api/preferences", preferences).then(res => res.json()),
  
  generateRecommendations: (data: GenerateRecommendationsRequest) => 
    apiRequest("POST", "/api/recommendations", data).then(res => res.json()),

  // Favorites API
  getUserFavorites: (userId: number) => 
    fetch(`/api/favorites/${userId}`).then(res => res.json()),
  
  addToFavorites: (userId: number, contentId: number) => 
    apiRequest("POST", "/api/favorites", { userId, contentId }).then(res => res.json()),
  
  removeFromFavorites: (userId: number, contentId: number) => 
    apiRequest("DELETE", "/api/favorites", { userId, contentId }).then(res => res.json()),

  // Progress API
  updateProgress: (userId: number, contentId: number, progressMinutes: number, completed: boolean) => 
    apiRequest("POST", "/api/progress", { userId, contentId, progressMinutes, completed }).then(res => res.json()),
  
  getListeningHistory: (userId: number) => 
    fetch(`/api/history/${userId}`).then(res => res.json()),

  // Rating API
  rateContent: (userId: number, contentId: number, rating: number, review?: string) => 
    apiRequest("POST", "/api/rate", { userId, contentId, rating, review }).then(res => res.json()),
  
  getContentRating: (contentId: number) => 
    fetch(`/api/content/${contentId}/rating`).then(res => res.json()),
};
