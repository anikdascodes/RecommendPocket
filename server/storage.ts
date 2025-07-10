import { 
  users, userPreferences, audioContent, recommendations, userFavorites, listeningHistory, userRatings,
  type User, type InsertUser, type UserPreferences, type InsertUserPreferences, type AudioContent, type InsertAudioContent, 
  type Recommendation, type InsertRecommendation, type UserFavorites, type InsertUserFavorites, 
  type ListeningHistory, type InsertListeningHistory, type UserRatings, type InsertUserRatings 
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  saveUserPreferences(preferences: InsertUserPreferences & { userId: number }): Promise<UserPreferences>;
  
  getAllAudioContent(): Promise<AudioContent[]>;
  getAudioContentByCategory(category: string): Promise<AudioContent[]>;
  createAudioContent(content: InsertAudioContent): Promise<AudioContent>;
  getContentById(id: number): Promise<AudioContent | undefined>;
  
  getRecommendations(userId: number): Promise<(Recommendation & { content: AudioContent })[]>;
  saveRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  
  searchContent(query: string): Promise<AudioContent[]>;
  
  // Favorites
  getUserFavorites(userId: number): Promise<(UserFavorites & { content: AudioContent })[]>;
  addToFavorites(userId: number, contentId: number): Promise<UserFavorites>;
  removeFromFavorites(userId: number, contentId: number): Promise<boolean>;
  isFavorite(userId: number, contentId: number): Promise<boolean>;
  
  // Listening History
  getListeningHistory(userId: number): Promise<(ListeningHistory & { content: AudioContent })[]>;
  updateListeningProgress(userId: number, contentId: number, progressMinutes: number, completed: boolean): Promise<ListeningHistory>;
  getContentProgress(userId: number, contentId: number): Promise<ListeningHistory | undefined>;
  
  // User Ratings
  getUserRatings(userId: number): Promise<(UserRatings & { content: AudioContent })[]>;
  rateContent(userId: number, contentId: number, rating: number, review?: string): Promise<UserRatings>;
  getContentRating(userId: number, contentId: number): Promise<UserRatings | undefined>;
  getAverageRating(contentId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userPreferences: Map<number, UserPreferences>;
  private audioContent: Map<number, AudioContent>;
  private recommendations: Map<number, Recommendation>;
  private userFavorites: Map<number, UserFavorites>;
  private listeningHistory: Map<number, ListeningHistory>;
  private userRatings: Map<number, UserRatings>;
  private currentUserId: number;
  private currentPreferencesId: number;
  private currentContentId: number;
  private currentRecommendationId: number;
  private currentFavoritesId: number;
  private currentHistoryId: number;
  private currentRatingId: number;

  constructor() {
    this.users = new Map();
    this.userPreferences = new Map();
    this.audioContent = new Map();
    this.recommendations = new Map();
    this.userFavorites = new Map();
    this.listeningHistory = new Map();
    this.userRatings = new Map();
    this.currentUserId = 1;
    this.currentPreferencesId = 1;
    this.currentContentId = 1;
    this.currentRecommendationId = 1;
    this.currentFavoritesId = 1;
    this.currentHistoryId = 1;
    this.currentRatingId = 1;
    
    // Initialize with sample content
    this.initializeSampleContent();
  }

  private initializeSampleContent() {
    const sampleContent: InsertAudioContent[] = [
      {
        title: "The CEO's Secret Love",
        description: "When ambitious MBA graduate Sarah lands her dream job, she never expected to fall for her mysterious CEO who harbors dark secrets about his past...",
        category: "romance",
        duration: "4h 32m",
        rating: "4.8",
        thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        tags: ["CEO", "workplace romance", "secrets", "contemporary"],
        language: "English",
        narrator: "Emma Thompson",
        audioUrl: "/audio/ceo-secret-love.mp3",
        fileSize: "256 MB",
        totalDurationMinutes: 272
      },
      {
        title: "Blood Moon Rising",
        description: "Detective Maria Santos thought she'd seen it all until bodies start appearing with mysterious bite marks during the blood moon...",
        category: "thriller",
        duration: "42m",
        rating: "4.6",
        thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
      },
      {
        title: "Café Chronicles",
        description: "Join barista Jake as he navigates hilarious customer encounters, workplace romance, and the daily chaos of running the city's busiest café...",
        category: "comedy",
        duration: "28m",
        rating: "4.9",
        thumbnail: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
      },
      {
        title: "Family Secrets",
        description: "When Emma returns home for her father's funeral, she uncovers family secrets that threaten to tear apart everything she thought she knew...",
        category: "drama",
        duration: "6h 15m",
        rating: "4.7",
        thumbnail: "https://images.unsplash.com/photo-1556745753-b2904692b3cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
      },
      {
        title: "Nova Station",
        description: "In the year 2387, Commander Riley leads humanity's last hope aboard the space station Nova as alien forces threaten Earth's survival...",
        category: "sci-fi",
        duration: "8h 22m",
        rating: "4.5",
        thumbnail: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
      },
      {
        title: "Dragon's Crown",
        description: "Young mage Aria discovers she's the last of an ancient bloodline destined to reclaim the Dragon's Crown and save the magical realm of Eldoria...",
        category: "fantasy",
        duration: "12h 45m",
        rating: "4.8",
        thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
      },
      {
        title: "The Last Pharaoh",
        description: "Journey back to ancient Egypt as we uncover the untold story of Cleopatra's final days and the Roman conspiracy that sealed her fate...",
        category: "historical",
        duration: "9h 18m",
        rating: "4.6",
        thumbnail: "https://images.unsplash.com/photo-1539650116574-75c0c6d0c0c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
      },
      {
        title: "Missing Hours",
        description: "Private investigator Alex Chen has 48 hours to solve a missing person case that leads to a web of corruption reaching the highest levels of government...",
        category: "mystery",
        duration: "55m",
        rating: "4.7",
        thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
      },
      {
        title: "Billionaire's Revenge",
        description: "Tech mogul Adrian Kane will stop at nothing to destroy the woman who betrayed him, but what happens when revenge turns into obsession?",
        category: "romance",
        duration: "5h 12m",
        rating: "4.7",
        thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
      },
      {
        title: "Stand-Up Struggles",
        description: "Follow comedian Mike Torres as he bombs, succeeds, and everything in between on his journey from open mic nights to comedy stardom...",
        category: "comedy",
        duration: "35m",
        rating: "4.6",
        thumbnail: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
      },
      {
        title: "The Escape Room",
        description: "Six strangers wake up in an elaborate escape room where failure means death. But who put them there and why?",
        category: "thriller",
        duration: "1h 15m",
        rating: "4.4",
        thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
      },
      {
        title: "Immortal Hearts",
        description: "Vampire prince Damien has lived for centuries until he meets mortal artist Luna, forcing him to choose between his immortal duty and true love...",
        category: "fantasy",
        duration: "7h 30m",
        rating: "4.9",
        thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
      }
    ];

    sampleContent.forEach(content => {
      this.createAudioContent(content);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    return Array.from(this.userPreferences.values()).find(
      (pref) => pref.userId === userId
    );
  }

  async saveUserPreferences(preferences: InsertUserPreferences & { userId: number }): Promise<UserPreferences> {
    const id = this.currentPreferencesId++;
    const userPref: UserPreferences = { 
      id,
      userId: preferences.userId,
      genres: preferences.genres as string[],
      duration: preferences.duration,
      completedOnboarding: preferences.completedOnboarding || false
    };
    this.userPreferences.set(id, userPref);
    return userPref;
  }

  async getAllAudioContent(): Promise<AudioContent[]> {
    return Array.from(this.audioContent.values());
  }

  async getAudioContentByCategory(category: string): Promise<AudioContent[]> {
    return Array.from(this.audioContent.values()).filter(
      (content) => content.category === category
    );
  }

  async createAudioContent(content: InsertAudioContent): Promise<AudioContent> {
    const id = this.currentContentId++;
    const audioContent: AudioContent = { ...content, id, playCount: 0 };
    this.audioContent.set(id, audioContent);
    return audioContent;
  }

  async getRecommendations(userId: number): Promise<(Recommendation & { content: AudioContent })[]> {
    const userRecommendations = Array.from(this.recommendations.values()).filter(
      (rec) => rec.userId === userId
    );
    
    return userRecommendations.map(rec => {
      const content = this.audioContent.get(rec.contentId!);
      return { ...rec, content: content! };
    });
  }

  async saveRecommendation(recommendation: InsertRecommendation): Promise<Recommendation> {
    const id = this.currentRecommendationId++;
    const rec: Recommendation = { 
      ...recommendation, 
      id,
      userId: recommendation.userId || null,
      contentId: recommendation.contentId || null,
      reason: recommendation.reason || null,
      score: recommendation.score || null
    };
    this.recommendations.set(id, rec);
    return rec;
  }

  async searchContent(query: string): Promise<AudioContent[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.audioContent.values()).filter(
      (content) =>
        content.title.toLowerCase().includes(lowercaseQuery) ||
        content.description.toLowerCase().includes(lowercaseQuery) ||
        content.category.toLowerCase().includes(lowercaseQuery) ||
        (content.tags && content.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))) ||
        (content.narrator && content.narrator.toLowerCase().includes(lowercaseQuery))
    );
  }

  async getContentById(id: number): Promise<AudioContent | undefined> {
    return this.audioContent.get(id);
  }

  // Favorites methods
  async getUserFavorites(userId: number): Promise<(UserFavorites & { content: AudioContent })[]> {
    const userFavs = Array.from(this.userFavorites.values()).filter(
      (fav) => fav.userId === userId
    );
    
    return userFavs.map(fav => {
      const content = this.audioContent.get(fav.contentId!);
      return { ...fav, content: content! };
    });
  }

  async addToFavorites(userId: number, contentId: number): Promise<UserFavorites> {
    const id = this.currentFavoritesId++;
    const favorite: UserFavorites = {
      id,
      userId,
      contentId,
      createdAt: new Date(),
    };
    this.userFavorites.set(id, favorite);
    return favorite;
  }

  async removeFromFavorites(userId: number, contentId: number): Promise<boolean> {
    const toRemove = Array.from(this.userFavorites.entries()).find(
      ([_, fav]) => fav.userId === userId && fav.contentId === contentId
    );
    
    if (toRemove) {
      this.userFavorites.delete(toRemove[0]);
      return true;
    }
    return false;
  }

  async isFavorite(userId: number, contentId: number): Promise<boolean> {
    return Array.from(this.userFavorites.values()).some(
      (fav) => fav.userId === userId && fav.contentId === contentId
    );
  }

  // Listening History methods
  async getListeningHistory(userId: number): Promise<(ListeningHistory & { content: AudioContent })[]> {
    const userHistory = Array.from(this.listeningHistory.values()).filter(
      (history) => history.userId === userId
    );
    
    return userHistory.map(history => {
      const content = this.audioContent.get(history.contentId!);
      return { ...history, content: content! };
    });
  }

  async updateListeningProgress(userId: number, contentId: number, progressMinutes: number, completed: boolean): Promise<ListeningHistory> {
    const existing = Array.from(this.listeningHistory.values()).find(
      (history) => history.userId === userId && history.contentId === contentId
    );

    if (existing) {
      existing.progressMinutes = progressMinutes;
      existing.completed = completed;
      existing.lastPlayedAt = new Date();
      existing.totalListenTime = (existing.totalListenTime || 0) + 1; // Increment session count
      return existing;
    } else {
      const id = this.currentHistoryId++;
      const history: ListeningHistory = {
        id,
        userId,
        contentId,
        progressMinutes,
        completed,
        lastPlayedAt: new Date(),
        totalListenTime: 1,
      };
      this.listeningHistory.set(id, history);
      return history;
    }
  }

  async getContentProgress(userId: number, contentId: number): Promise<ListeningHistory | undefined> {
    return Array.from(this.listeningHistory.values()).find(
      (history) => history.userId === userId && history.contentId === contentId
    );
  }

  // User Ratings methods
  async getUserRatings(userId: number): Promise<(UserRatings & { content: AudioContent })[]> {
    const userRatings = Array.from(this.userRatings.values()).filter(
      (rating) => rating.userId === userId
    );
    
    return userRatings.map(rating => {
      const content = this.audioContent.get(rating.contentId!);
      return { ...rating, content: content! };
    });
  }

  async rateContent(userId: number, contentId: number, rating: number, review?: string): Promise<UserRatings> {
    const existing = Array.from(this.userRatings.values()).find(
      (r) => r.userId === userId && r.contentId === contentId
    );

    if (existing) {
      existing.rating = rating;
      existing.review = review || null;
      return existing;
    } else {
      const id = this.currentRatingId++;
      const userRating: UserRatings = {
        id,
        userId,
        contentId,
        rating,
        review: review || null,
        createdAt: new Date(),
      };
      this.userRatings.set(id, userRating);
      return userRating;
    }
  }

  async getContentRating(userId: number, contentId: number): Promise<UserRatings | undefined> {
    return Array.from(this.userRatings.values()).find(
      (rating) => rating.userId === userId && rating.contentId === contentId
    );
  }

  async getAverageRating(contentId: number): Promise<number> {
    const ratings = Array.from(this.userRatings.values()).filter(
      (rating) => rating.contentId === contentId
    );
    
    if (ratings.length === 0) return 0;
    
    const sum = ratings.reduce((acc, rating) => acc + (rating.rating || 0), 0);
    return sum / ratings.length;
  }
}

export const storage = new MemStorage();
