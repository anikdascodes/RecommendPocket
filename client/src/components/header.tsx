import { Search, UserCircle, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 glass-effect border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Headphones className="text-white w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold gradient-bg bg-clip-text text-transparent">
              AudioVibe
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <UserCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
