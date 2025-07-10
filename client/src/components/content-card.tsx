import { Star, Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentItem } from "@/types/content";

interface ContentCardProps {
  content: ContentItem;
  onPlay?: (content: ContentItem) => void;
}

export default function ContentCard({ content, onPlay }: ContentCardProps) {
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
    <div className="content-card bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-700 transition-all duration-300 cursor-pointer">
      <div className="relative">
        <img
          src={content.thumbnail}
          alt={content.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
          <span className={`mr-1 ${getCategoryColor(content.category)}`}>
            {getCategoryIcon(content.category)}
          </span>
          {content.category.charAt(0).toUpperCase() + content.category.slice(1)}
        </div>
        <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {content.duration}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-white">{content.title}</h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
          {content.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-yellow-500 text-sm">
            <Star className="w-4 h-4 mr-1 fill-current" />
            <span>{content.rating}</span>
          </div>
          <Button
            size="sm"
            className="gradient-bg text-white hover:opacity-90"
            onClick={() => onPlay?.(content)}
          >
            <Play className="w-3 h-3 mr-1" />
            Play
          </Button>
        </div>
      </div>
    </div>
  );
}
