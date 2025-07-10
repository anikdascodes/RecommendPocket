import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search, Sparkles, RefreshCw, Flame, Plus, ThumbsUp, ThumbsDown, X, TrendingUp, Star, Clock, Target } from "lucide-react";
import Header from "@/components/header";
import ContentCard from "@/components/content-card";
import CategoryFilter from "@/components/category-filter";
import LoadingSkeleton from "@/components/loading-skeleton";
import AudioPlayer from "@/components/audio-player";
import { contentApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { ContentItem, UserPreferences, Recommendation } from "@/types/content";

interface HomeProps {
  userPreferences: UserPreferences;
}

interface EnhancedRecommendation extends Recommendation {
  confidence: number;
  recommendationType: string;
  matchDetails: {
    genreMatch: number;
    durationMatch: number;
    qualityScore: number;
    similarityScore: number;
    discoveryScore: number;
  };
}

export default function Home({ userPreferences }: HomeProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendations, setRecommendations] = useState<EnhancedRecommendation[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false); // Changed from true to false
  const [isSearchFocused, setIsSearchFocused] = useState(false); // New state to track focus
  const [currentlyPlaying, setCurrentlyPlaying] = useState<ContentItem | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [dismissedRecommendations, setDismissedRecommendations] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Popular search suggestions when no query
  const popularSuggestions = [
    "romance", "thriller", "mystery", "comedy", "fantasy", "adventure", "sci-fi", "drama"
  ];

  const userId = 1; // For demo purposes

  // Handle keyboard events and clicks outside search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSuggestions(false);
        setIsSearchFocused(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch all content
  const { data: allContent = [], isLoading: contentLoading } = useQuery({
    queryKey: ["/api/content"],
    queryFn: contentApi.getAllContent,
  });

  // Search content using API when searchQuery changes
  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ["/api/content/search", searchQuery],
    queryFn: () => contentApi.searchContent(searchQuery),
    enabled: searchQuery.length > 0,
  });

  // Fetch user favorites
  const { data: userFavorites = [] } = useQuery({
    queryKey: ["/api/favorites", userId],
    queryFn: () => contentApi.getUserFavorites(userId),
  });

  // Fetch listening history
  const { data: listeningHistory = [] } = useQuery({
    queryKey: ["/api/history", userId],
    queryFn: () => contentApi.getListeningHistory(userId),
  });

  // Generate Enhanced Recommendations
  const generateRecommendationsMutation = useMutation({
    mutationFn: contentApi.generateRecommendations,
    onSuccess: (data) => {
      setRecommendations(data);
      toast({
        title: "Smart Recommendations Updated! 🎯",
        description: `Generated ${data.length} personalized recommendations with advanced matching.`,
      });
    },
    onError: (error) => {
      console.error("Error generating recommendations:", error);
      toast({
        title: "Recommendation Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Recommendation feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: ({ contentId, feedback }: { contentId: number; feedback: string }) =>
      fetch('/api/recommendations/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, feedback, userId })
      }),
    onSuccess: () => {
      toast({
        title: "Thanks for your feedback!",
        description: "This helps us improve your recommendations.",
      });
    },
  });

  // Favorites mutations
  const addToFavoritesMutation = useMutation({
    mutationFn: ({ userId, contentId }: { userId: number; contentId: number }) => 
      contentApi.addToFavorites(userId, contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  const removeFromFavoritesMutation = useMutation({
    mutationFn: ({ userId, contentId }: { userId: number; contentId: number }) => 
      contentApi.removeFromFavorites(userId, contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  // Progress tracking mutation
  const updateProgressMutation = useMutation({
    mutationFn: ({ userId, contentId, progressMinutes, completed }: { 
      userId: number; 
      contentId: number; 
      progressMinutes: number; 
      completed: boolean;
    }) => contentApi.updateProgress(userId, contentId, progressMinutes, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
    },
  });

  // Update favorites set when data changes
  useEffect(() => {
    if (userFavorites) {
      setFavorites(new Set(userFavorites.map((fav: any) => fav.contentId)));
    }
  }, [userFavorites]);

  // Generate initial recommendations
  useEffect(() => {
    if (userPreferences && recommendations.length === 0 && !generateRecommendationsMutation.isPending) {
      generateRecommendationsMutation.mutate({
        preferences: userPreferences,
      });
    }
  }, [userPreferences, recommendations.length, generateRecommendationsMutation.isPending]);

  // Use search results when searching, otherwise filter all content by category
  const baseContent = searchQuery.length > 0 ? searchResults : allContent;
  const filteredContent = baseContent.filter((content: ContentItem) => {
    return selectedCategory === "all" || content.category === selectedCategory;
  });

  const handleRefreshRecommendations = () => {
    generateRecommendationsMutation.mutate({
      preferences: userPreferences,
    });
  };

  const handlePlay = (content: ContentItem) => {
    setCurrentlyPlaying(content);
    setIsPlayerOpen(true);
  };

  const handleFavorite = (contentId: number) => {
    if (favorites.has(contentId)) {
      removeFromFavoritesMutation.mutate({ userId, contentId });
      setFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(contentId);
        return newSet;
      });
    } else {
      addToFavoritesMutation.mutate({ userId, contentId });
      setFavorites(prev => new Set([...prev, contentId]));
    }
  };

  const handleProgressUpdate = (progressMinutes: number, completed: boolean) => {
    if (currentlyPlaying) {
      updateProgressMutation.mutate({
        userId,
        contentId: currentlyPlaying.id,
        progressMinutes,
        completed,
      });
    }
  };

  const handleRecommendationFeedback = (contentId: number, feedback: string) => {
    feedbackMutation.mutate({ contentId, feedback });
    
    if (feedback === 'not_interested') {
      setDismissedRecommendations(prev => new Set([...prev, contentId]));
    }
  };

  // Get progress for content
  const getContentProgress = (contentId: number) => {
    const history = listeningHistory.find((h: any) => h.contentId === contentId);
    if (!history || !currentlyPlaying) return 0;
    
    // Calculate progress percentage based on total duration
    const totalMinutes = currentlyPlaying.totalDurationMinutes || 
      parseInt(currentlyPlaying.duration.replace(/[^\d]/g, '')) || 60;
    return Math.min((history.progressMinutes / totalMinutes) * 100, 100);
  };

  const getRecommendationTypeIcon = (type: string) => {
    const icons = {
      'perfect_match': Target,
      'based_on_history': TrendingUp,
      'highly_rated': Star,
      'discovery': Sparkles
    };
    return icons[type as keyof typeof icons] || Sparkles;
  };

  const getRecommendationTypeColor = (type: string) => {
    const colors = {
      'perfect_match': 'text-green-400',
      'based_on_history': 'text-blue-400',
      'highly_rated': 'text-yellow-400',
      'discovery': 'text-purple-400'
    };
    return colors[type as keyof typeof colors] || 'text-primary';
  };

  const getRecommendationTypeLabel = (type: string) => {
    const labels = {
      'perfect_match': 'Perfect Match',
      'based_on_history': 'Based on History',
      'highly_rated': 'Highly Rated',
      'discovery': 'Discovery'
    };
    return labels[type as keyof typeof labels] || 'Recommended';
  };

  // Filter out dismissed recommendations
  const visibleRecommendations = recommendations.filter(
    rec => !dismissedRecommendations.has(rec.content.id)
  );

  const trendingContent = allContent
    .sort((a: ContentItem, b: ContentItem) => (b.playCount || 0) - (a.playCount || 0))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      {/* Search Section */}
      <section className="bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={searchContainerRef} className="relative max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="Search for audio content..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                // Only show suggestions if the search input is focused
                if (isSearchFocused) {
                  setShowSuggestions(true);
                }
              }}
              onFocus={() => {
                setIsSearchFocused(true);
                setShowSuggestions(true);
              }}
              onBlur={() => {
                setIsSearchFocused(false);
                // Delay hiding suggestions to allow clicking on them
                setTimeout(() => setShowSuggestions(false), 150);
              }}
              className="w-full bg-gray-700 border-gray-600 rounded-xl px-6 py-4 pl-12 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-700 border border-gray-600 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
                {searchQuery.length > 0 ? (
                  // Show search results when user is typing
                  searchLoading ? (
                    <div className="px-4 py-3 text-gray-400 flex items-center">
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-600">
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                      </div>
                      {searchResults.slice(0, 6).map((content: ContentItem) => (
                        <div
                          key={content.id}
                          className="px-4 py-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0 transition-colors"
                          onClick={() => {
                            setSearchQuery(content.title);
                            setShowSuggestions(false);
                            setIsSearchFocused(false);
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-medium truncate">{content.title}</div>
                              <div className="text-gray-400 text-sm truncate">{content.description}</div>
                              <div className="text-gray-500 text-xs mt-1">
                                {content.category} • {content.duration} • {content.rating}⭐
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {searchResults.length > 6 && (
                        <div className="px-4 py-2 text-xs text-gray-400 text-center">
                          and {searchResults.length - 6} more results...
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-4 py-3 text-gray-400">
                      No results found for "{searchQuery}"
                    </div>
                  )
                ) : (
                  // Show popular suggestions when search is empty
                  <>
                    <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-600">
                      Popular searches
                    </div>
                    {popularSuggestions.map((suggestion) => (
                      <div
                        key={suggestion}
                        className="px-4 py-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0 transition-colors"
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setShowSuggestions(false);
                          setIsSearchFocused(false);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="text-white font-medium">{suggestion}</div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Enhanced Smart Recommendations Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <Sparkles className="text-primary mr-2" />
                Smart Recommendations
                <span className="ml-2 bg-gradient-to-r from-primary to-accent text-white text-xs px-2 py-1 rounded-full">
                  AI-Powered
                </span>
              </h2>
              <p className="text-gray-400">
                Personalized for your {userPreferences.genres.join(", ")} preferences
              </p>
            </div>
            <Button
              onClick={handleRefreshRecommendations}
              disabled={generateRecommendationsMutation.isPending}
              className="bg-primary text-white hover:bg-primary/90"
            >
              <RefreshCw className={`mr-2 w-4 h-4 ${generateRecommendationsMutation.isPending ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {generateRecommendationsMutation.isPending ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {visibleRecommendations
                .filter(rec => rec.content && rec.content.id) // Filter out invalid recommendations
                .map((rec) => {
                  const IconComponent = getRecommendationTypeIcon(rec.recommendationType);
                  const typeColor = getRecommendationTypeColor(rec.recommendationType);
                  const typeLabel = getRecommendationTypeLabel(rec.recommendationType);
                  
                  return (
                    <div key={rec.content.id} className="relative group">
                      <ContentCard
                        content={rec.content}
                        onPlay={handlePlay}
                        onFavorite={handleFavorite}
                        isFavorite={favorites.has(rec.content.id)}
                        progress={getContentProgress(rec.content.id)}
                      />
                      
                      {/* Enhanced Recommendation Details */}
                      <div className="mt-3 p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg">
                        {/* Recommendation Type and Confidence */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <IconComponent className={`w-4 h-4 ${typeColor}`} />
                            <span className={`text-sm font-medium ${typeColor}`}>
                              {typeLabel}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="text-xs text-gray-400">Match:</div>
                            <div className={`text-sm font-bold ${
                              rec.confidence >= 80 ? 'text-green-400' : 
                              rec.confidence >= 60 ? 'text-yellow-400' : 'text-gray-400'
                            }`}>
                              {Math.round(rec.confidence)}%
                            </div>
                          </div>
                        </div>

                        {/* Reason */}
                        <div className="mb-3">
                          <p className="text-sm text-gray-200 leading-relaxed">
                            {rec.reason}
                          </p>
                        </div>

                        {/* Match Breakdown */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Genre Match</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-600 rounded-full h-1">
                                <div 
                                  className="bg-green-400 h-1 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, rec.matchDetails?.genreMatch || 0)}%` }}
                                />
                              </div>
                              <span className="text-gray-300 w-8">{Math.round(rec.matchDetails?.genreMatch || 0)}%</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Duration Fit</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-600 rounded-full h-1">
                                <div 
                                  className="bg-blue-400 h-1 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, rec.matchDetails?.durationMatch || 0)}%` }}
                                />
                              </div>
                              <span className="text-gray-300 w-8">{Math.round(rec.matchDetails?.durationMatch || 0)}%</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Quality Score</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-600 rounded-full h-1">
                                <div 
                                  className="bg-yellow-400 h-1 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, rec.matchDetails?.qualityScore || 0)}%` }}
                                />
                              </div>
                              <span className="text-gray-300 w-8">{Math.round(rec.matchDetails?.qualityScore || 0)}%</span>
                            </div>
                          </div>
                        </div>

                        {/* User Feedback Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRecommendationFeedback(rec.content.id, 'like')}
                              className="text-gray-400 hover:text-green-400 hover:bg-green-400/10 p-1"
                              title="Good recommendation"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRecommendationFeedback(rec.content.id, 'dislike')}
                              className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 p-1"
                              title="Not interested"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRecommendationFeedback(rec.content.id, 'not_interested')}
                              className="text-gray-400 hover:text-gray-300 hover:bg-gray-600/50 p-1"
                              title="Remove this recommendation"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            {Math.round(rec.score)}/100
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Show message if no recommendations */}
          {!generateRecommendationsMutation.isPending && visibleRecommendations.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                Ready to discover amazing content?
              </h3>
              <p className="text-gray-500 mb-6">
                Click refresh to get personalized recommendations based on your preferences
              </p>
              <Button
                onClick={handleRefreshRecommendations}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Sparkles className="mr-2 w-4 h-4" />
                Generate Recommendations
              </Button>
            </div>
          )}

          {/* All Content Grid */}
          <div className="mt-12">
            <h3 className="text-xl font-bold mb-6">
              {searchQuery.length > 0 
                ? `Search Results` 
                : selectedCategory === "all" ? "All Content" : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Content`}
            </h3>

            {/* Show search status */}
            {searchQuery.length > 0 && (
              <div className="mb-4 text-sm text-gray-400">
                {searchLoading ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </div>
                ) : (
                  <span>Found {searchResults.length} results for "{searchQuery}"</span>
                )}
              </div>
            )}
            
            {contentLoading || (searchQuery.length > 0 && searchLoading) ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredContent.length > 0 ? (
                  filteredContent.map((content: ContentItem) => (
                    <ContentCard
                      key={content.id}
                      content={content}
                      onPlay={handlePlay}
                      onFavorite={handleFavorite}
                      isFavorite={favorites.has(content.id)}
                      progress={getContentProgress(content.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">
                      {searchQuery.length > 0 ? "No search results found" : "No content found"}
                    </div>
                    <div className="text-gray-500">
                      {searchQuery.length > 0 
                        ? `Try a different search term or clear your search` 
                        : "Try adjusting your category filter"}
                    </div>
                    {searchQuery.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => setSearchQuery("")}
                        className="mt-4"
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Load More Button */}
          {filteredContent.length > 0 && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
              >
                <Plus className="mr-2 w-4 h-4" />
                Load More Content
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-8 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Flame className="text-accent mr-2" />
            Trending This Week
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingContent.map((content: ContentItem, index) => (
              <div
                key={content.id}
                className="bg-gray-700 rounded-xl p-4 hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{content.title}</h3>
                    <p className="text-gray-400 text-sm">
                      {content.category} • {content.playCount || 0} plays
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audio Player */}
      <AudioPlayer
        content={currentlyPlaying}
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        onFavorite={handleFavorite}
        isFavorite={currentlyPlaying ? favorites.has(currentlyPlaying.id) : false}
        onProgressUpdate={handleProgressUpdate}
      />
    </div>
  );
}
