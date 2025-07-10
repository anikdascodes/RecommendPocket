import { getQueryFn } from "./queryClient";

export interface GenerateRecommendationsRequest {
  preferences: {
    genres: string[];
    duration: string;
  };
}

export interface RecommendationFeedbackRequest {
  contentId: number;
  feedback: 'like' | 'dislike' | 'not_interested';
  userId: number;
}

export const contentApi = {
  // Content endpoints
  getAllContent: getQueryFn<any[]>({ on401: "throw" }),
  searchContent: async (query: string) => {
    const response = await fetch(`/api/content/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  },
  
  // Enhanced recommendation endpoints
  generateRecommendations: async (request: GenerateRecommendationsRequest) => {
    console.log('Sending recommendation request:', request);
    const response = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    console.log('Recommendation response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Recommendation request failed:', response.status, errorText);
      throw new Error(`Failed to generate recommendations: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Recommendation response data:', data);
    return data;
  },
  
  submitRecommendationFeedback: async (request: RecommendationFeedbackRequest) => {
    const response = await fetch('/api/recommendations/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error('Failed to submit feedback');
    return response.json();
  },
  
  // User preferences
  savePreferences: async (preferences: any) => {
    const response = await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences)
    });
    if (!response.ok) throw new Error('Failed to save preferences');
    return response.json();
  },
  
  // Favorites
  getUserFavorites: async (userId: number) => {
    const response = await fetch(`/api/favorites/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch favorites');
    return response.json();
  },
  
  addToFavorites: async (userId: number, contentId: number) => {
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, contentId })
    });
    if (!response.ok) throw new Error('Failed to add to favorites');
    return response.json();
  },
  
  removeFromFavorites: async (userId: number, contentId: number) => {
    const response = await fetch('/api/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, contentId })
    });
    if (!response.ok) throw new Error('Failed to remove from favorites');
    return response.json();
  },
  
  // Listening history
  getListeningHistory: async (userId: number) => {
    const response = await fetch(`/api/history/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },
  
  updateProgress: async (userId: number, contentId: number, progressMinutes: number, completed: boolean) => {
    const response = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, contentId, progressMinutes, completed })
    });
    if (!response.ok) throw new Error('Failed to update progress');
    return response.json();
  },
  
  // Ratings
  getUserRatings: async (userId: number) => {
    const response = await fetch(`/api/ratings/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch ratings');
    return response.json();
  },
  
  rateContent: async (userId: number, contentId: number, rating: number, review?: string) => {
    const response = await fetch('/api/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, contentId, rating, review })
    });
    if (!response.ok) throw new Error('Failed to rate content');
    return response.json();
  }
};
