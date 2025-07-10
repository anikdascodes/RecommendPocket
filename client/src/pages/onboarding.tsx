import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { contentApi } from "@/lib/api";
import { CATEGORIES, DURATION_OPTIONS, UserPreferences } from "@/types/content";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";

interface OnboardingProps {
  onComplete: (preferences: UserPreferences) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>({
    genres: [],
    duration: "",
  });

  const savePreferencesMutation = useMutation({
    mutationFn: contentApi.savePreferences,
    onSuccess: () => {
      onComplete(preferences);
    },
  });

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleGenre = (genre: string) => {
    setPreferences(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const selectDuration = (duration: string) => {
    setPreferences(prev => ({
      ...prev,
      duration,
    }));
  };

  const generateRecommendations = () => {
    savePreferencesMutation.mutate({
      ...preferences,
      completedOnboarding: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <div className="text-center mb-12 animate-fade-in">
            <div className="w-24 h-24 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="text-white w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Welcome to AudioVibe</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Let's create a personalized audio experience just for you. We'll ask a few questions to understand your preferences.
            </p>
            
            <Button
              onClick={nextStep}
              size="lg"
              className="gradient-bg text-white mt-8 hover:opacity-90 transition-opacity"
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Genre Preferences */}
        {currentStep === 2 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">What genres do you enjoy?</h2>
              <p className="text-gray-400">Select all that apply</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {CATEGORIES.map((category) => (
                <Card
                  key={category.id}
                  className={`category-card cursor-pointer hover:bg-gray-700 transition-all duration-300 ${
                    preferences.genres.includes(category.id) ? "selected" : ""
                  }`}
                  onClick={() => toggleGenre(category.id)}
                >
                  <CardContent className="p-6 text-center">
                    <i className={`${category.icon} text-3xl ${category.color} mb-3`}></i>
                    <h3 className="font-semibold text-white">{category.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button
                onClick={previousStep}
                variant="outline"
                className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={nextStep}
                disabled={preferences.genres.length === 0}
                className="gradient-bg text-white hover:opacity-90"
              >
                Continue
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Content Duration */}
        {currentStep === 3 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">How long do you usually listen?</h2>
              <p className="text-gray-400">This helps us recommend the perfect content length for your sessions</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {DURATION_OPTIONS.map((option) => (
                <Card
                  key={option.id}
                  className={`duration-card cursor-pointer hover:bg-gray-700 transition-all duration-300 ${
                    preferences.duration === option.id ? "selected" : ""
                  }`}
                  onClick={() => selectDuration(option.id)}
                >
                  <CardContent className="p-6 text-center">
                    <i className={`${option.icon} text-3xl text-primary mb-3`}></i>
                    <h3 className="font-semibold mb-2 text-white">{option.name}</h3>
                    <p className="text-gray-400 text-sm">{option.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button
                onClick={previousStep}
                variant="outline"
                className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={generateRecommendations}
                disabled={!preferences.duration || savePreferencesMutation.isPending}
                className="gradient-bg text-white hover:opacity-90"
              >
                {savePreferencesMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generating Recommendations...
                  </>
                ) : (
                  <>
                    Generate My Recommendations
                    <Sparkles className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
