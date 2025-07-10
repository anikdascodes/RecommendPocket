import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import Home from "@/pages/home";
import { UserPreferences } from "@/types/content";
import { Headphones } from "lucide-react";

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 gradient-bg rounded-full animate-pulse-slow mb-4 mx-auto flex items-center justify-center">
          <Headphones className="text-white w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold gradient-bg bg-clip-text text-transparent">
          AudioVibe
        </h2>
        <p className="text-gray-400 mt-2">Preparing your personalized experience...</p>
      </div>
    </div>
  );
}

function Router() {
  const [isLoading, setIsLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleOnboardingComplete = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!userPreferences) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Switch>
      <Route path="/" component={() => <Home userPreferences={userPreferences} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
