import { Star, Play, Clock, Heart, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentItem } from "@/types/content";
import { useState } from "react";

interface ContentCardProps {
  content: ContentItem;
  onPlay?: (content: ContentItem) => void;
  onFavorite?: (contentId: number) => void;
  isFavorite?: boolean;
  progress?: number; // Progress percentage (0-100)
}

export default function ContentCard({ content, onPlay, onFavorite, isFavorite = false, progress = 0 }: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      romance: "❤️",
      thriller: "👻",
      comedy: "😂",
      drama: "🎭",
      "sci-fi": "🚀",
      fantasy: "👑",
      historical: "🏛️",
      mystery: "🔍",
    };
    return icons[category] || "🎵";
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      romance: "text-red-500",
      thriller: "text-orange-500",
      comedy: "text-yellow-500",
      drama: "text-blue-500",
      "sci-fi": "text-green-500",
      fantasy: "text-purple-500",
      historical: "text-amber-500",
      mystery: "text-red-500",
    };
    return colors[category] || "text-gray-500";
  };

  return (
    <div 
      className="content-card bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-700 transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img
          src={content.thumbnail}
          alt={content.title}
          className="w-full h-48 object-cover"
        />
        
        {/* Progress Bar */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900 bg-opacity-50">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
          <span className={`mr-1 ${getCategoryColor(content.category)}`}>
            {getCategoryIcon(content.category)}
          </span>
          {content.category.charAt(0).toUpperCase() + content.category.slice(1)}
        </div>

        {/* Duration */}
        <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {content.duration}
        </div>

        {/* Favorite Button */}
        {isHovered && (
          <div className="absolute top-3 left-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onFavorite?.(content.id);
              }}
              className={`bg-black bg-opacity-50 hover:bg-opacity-70 ${
                isFavorite ? 'text-red-500' : 'text-white'
              } rounded-full w-8 h-8`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
        )}

        {/* Play Button Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <Button
              size="lg"
              onClick={() => onPlay?.(content)}
              className="bg-primary text-white hover:bg-primary/90 rounded-full w-16 h-16"
            >
              <Play className="w-8 h-8" />
            </Button>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-white">{content.title}</h3>
        {content.narrator && (
          <p className="text-gray-500 text-xs mb-1">Narrated by {content.narrator}</p>
        )}
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
          {content.description}
        </p>
        
        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {content.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            {content.tags.length > 3 && (
              <span className="text-gray-500 text-xs">+{content.tags.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center text-yellow-500 text-sm">
            <Star className="w-4 h-4 mr-1 fill-current" />
            <span>{content.rating}</span>
            {content.playCount && content.playCount > 0 && (
              <span className="text-gray-500 text-xs ml-2">
                {content.playCount} plays
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              className="gradient-bg text-white hover:opacity-90"
              onClick={() => onPlay?.(content)}
            >
              <Play className="w-3 h-3 mr-1" />
              {progress > 0 ? 'Continue' : 'Play'}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
