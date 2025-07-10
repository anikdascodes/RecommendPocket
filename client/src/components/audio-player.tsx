import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Share, MoreHorizontal } from "lucide-react";
import { ContentItem } from "@/types/content";

interface AudioPlayerProps {
  content: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onFavorite?: (contentId: number) => void;
  isFavorite?: boolean;
  onProgressUpdate?: (progressMinutes: number, completed: boolean) => void;
}

export default function AudioPlayer({ 
  content, 
  isOpen, 
  onClose, 
  onFavorite, 
  isFavorite = false,
  onProgressUpdate 
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && content) {
      audioRef.current.load();
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [content]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      setCurrentTime(current);
      
      // Update progress every 30 seconds
      if (Math.floor(current) % 30 === 0 && current > 0) {
        const progressMinutes = Math.floor(current / 60);
        const completed = current >= duration * 0.95; // 95% completion
        onProgressUpdate?.(progressMinutes, completed);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      const time = (value[0] / 100) * duration;
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (audioRef.current) {
      audioRef.current.volume = value[0] / 100;
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 15;
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 15;
    }
  };

  if (!isOpen || !content) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 z-50">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      >
        <source src={content.audioUrl || "/audio/sample.mp3"} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          {/* Content Info */}
          <div className="flex items-center space-x-3 flex-1">
            <img
              src={content.thumbnail}
              alt={content.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="min-w-0">
              <h4 className="text-white font-medium truncate">{content.title}</h4>
              <p className="text-gray-400 text-sm truncate">{content.narrator || "Unknown Narrator"}</p>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={skipBackward}
              className="text-gray-300 hover:text-white"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              onClick={togglePlayPause}
              className="bg-primary text-white hover:bg-primary/90 rounded-full w-10 h-10"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={skipForward}
              className="text-gray-300 hover:text-white"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
            <Slider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Additional Controls */}
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onFavorite?.(content.id)}
              className={`${isFavorite ? 'text-red-500' : 'text-gray-300'} hover:text-red-400`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>

            <div className="flex items-center space-x-1">
              <Volume2 className="w-4 h-4 text-gray-300" />
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-16"
              />
            </div>

            <select
              value={playbackSpeed}
              onChange={(e) => {
                const speed = parseFloat(e.target.value);
                setPlaybackSpeed(speed);
                if (audioRef.current) {
                  audioRef.current.playbackRate = speed;
                }
              }}
              className="bg-gray-700 text-white text-xs rounded px-2 py-1 border-none"
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>

            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-gray-300 hover:text-white"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}