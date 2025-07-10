import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, RefreshCw, Flame, Plus } from "lucide-react";
import Header from "@/components/header";
import ContentCard from "@/components/content-card";
import CategoryFilter from "@/components/category-filter";
import LoadingSkeleton from "@/components/loading-skeleton";
import { contentApi } from "@/lib/api";
import { ContentItem, UserPreferences, Recommendation } from "@/types/content";

interface HomeProps {
  userPreferences: UserPreferences;
}

export default function Home({ userPreferences }: HomeProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

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

  // Generate AI recommendations
  const generateRecommendationsMutation = useMutation({
    mutationFn: contentApi.generateRecommendations,
    onSuccess: (data) => {
      setRecommendations(data);
    },
  });

  // Generate initial recommendations
  useEffect(() => {
    if (userPreferences && !generateRecommendationsMutation.isPending) {
      generateRecommendationsMutation.mutate({
        preferences: userPreferences,
      });
    }
  }, [userPreferences]);

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
    console.log("Playing content:", content.title);
    // Implement play functionality
  };

  const trendingContent = allContent
    .sort((a: ContentItem, b: ContentItem) => (b.playCount || 0) - (a.playCount || 0))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      {/* Search Section */}
      <section className="bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="Search for audio content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-700 border-gray-600 rounded-xl px-6 py-4 pl-12 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* AI Recommendations Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <Sparkles className="text-primary mr-2" />
                AI Recommendations for You
              </h2>
              <p className="text-gray-400">
                Based on your preferences for {userPreferences.genres.join(", ")}
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
              {recommendations.map((rec) => (
                <div key={rec.content.id} className="relative">
                  <ContentCard
                    content={rec.content}
                    onPlay={handlePlay}
                  />
                  {rec.reason && (
                    <div className="mt-2 p-2 bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-400">{rec.reason}</p>
                    </div>
                  )}
                </div>
              ))}
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
    </div>
  );
}
