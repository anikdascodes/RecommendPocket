export interface ContentItem {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  rating: string;
  thumbnail: string;
  playCount?: number;
  tags?: string[];
  language?: string;
  narrator?: string;
  audioUrl?: string;
  fileSize?: string;
  releaseDate?: string;
  totalDurationMinutes?: number;
}

export interface UserPreferences {
  genres: string[];
  duration: string;
  completedOnboarding?: boolean;
}

export interface Recommendation {
  contentId: number;
  reason: string;
  score: number;
  content: ContentItem;
}

export interface EnhancedRecommendation extends Recommendation {
  confidence: number;
  recommendationType: 'perfect_match' | 'based_on_history' | 'highly_rated' | 'discovery';
  matchDetails: {
    genreMatch: number;
    durationMatch: number;
    qualityScore: number;
    similarityScore: number;
    discoveryScore: number;
  };
}

export interface RecommendationFeedback {
  contentId: number;
  feedback: 'like' | 'dislike' | 'not_interested';
  userId: number;
  timestamp: Date;
}

export const CATEGORIES = [
  { id: "romance", name: "Romance", icon: "fas fa-heart", color: "text-red-500" },
  { id: "thriller", name: "Thriller", icon: "fas fa-bolt", color: "text-orange-500" },
  { id: "mystery", name: "Mystery", icon: "fas fa-search", color: "text-blue-500" },
  { id: "comedy", name: "Comedy", icon: "fas fa-laugh", color: "text-yellow-500" },
  { id: "drama", name: "Drama", icon: "fas fa-masks-theater", color: "text-purple-500" },
  { id: "sci-fi", name: "Sci-Fi", icon: "fas fa-rocket", color: "text-green-500" },
  { id: "fantasy", name: "Fantasy", icon: "fas fa-dragon", color: "text-indigo-500" },
  { id: "historical", name: "Historical", icon: "fas fa-landmark", color: "text-amber-500" },
];

export const DURATION_OPTIONS = [
  {
    id: "short",
    name: "Short Sessions",
    description: "15-30 minutes perfect for commutes",
    icon: "fas fa-clock",
  },
  {
    id: "medium",
    name: "Medium Sessions", 
    description: "30-90 minutes for focused listening",
    icon: "fas fa-hourglass-half",
  },
  {
    id: "long",
    name: "Long Sessions",
    description: "90+ minutes for deep immersion",
    icon: "fas fa-hourglass-end",
  },
];
