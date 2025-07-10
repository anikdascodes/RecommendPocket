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
};
