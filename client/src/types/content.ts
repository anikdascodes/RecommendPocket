export interface ContentItem {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  rating: string;
  thumbnail: string;
  playCount?: number;
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

export const CATEGORIES = [
  { id: "romance", name: "Romance", icon: "fas fa-heart", color: "text-red-500" },
  { id: "thriller", name: "Thriller", icon: "fas fa-ghost", color: "text-orange-500" },
  { id: "comedy", name: "Comedy", icon: "fas fa-laugh", color: "text-yellow-500" },
  { id: "drama", name: "Drama", icon: "fas fa-theater-masks", color: "text-blue-500" },
  { id: "sci-fi", name: "Sci-Fi", icon: "fas fa-rocket", color: "text-green-500" },
  { id: "fantasy", name: "Fantasy", icon: "fas fa-crown", color: "text-purple-500" },
  { id: "historical", name: "Historical", icon: "fas fa-history", color: "text-amber-500" },
  { id: "mystery", name: "Mystery", icon: "fas fa-search", color: "text-red-500" },
];

export const DURATION_OPTIONS = [
  { id: "short", name: "Short Sessions", description: "5-15 minutes", icon: "fas fa-coffee" },
  { id: "medium", name: "Medium Sessions", description: "15-45 minutes", icon: "fas fa-clock" },
  { id: "long", name: "Long Sessions", description: "45+ minutes", icon: "fas fa-bed" },
];
