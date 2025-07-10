import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/types/content";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <section className="bg-gray-900 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto space-x-4 pb-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "secondary"}
            className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedCategory === "all"
                ? "gradient-bg text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
            onClick={() => onCategoryChange("all")}
          >
            All
          </Button>
          {CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "secondary"}
              className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? "gradient-bg text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => onCategoryChange(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
