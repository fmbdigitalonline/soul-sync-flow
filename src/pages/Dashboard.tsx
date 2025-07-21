

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle, Map, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOptimizedBlueprintData } from "@/hooks/use-optimized-blueprint-data";
import { isAdminUser } from "@/utils/isAdminUser";
import { EnhancedProductivityDashboard } from "@/components/productivity/EnhancedProductivityDashboard";
import { PIENotificationSystem } from "@/components/pie/PIENotificationSystem";
import { PIEContextualInsights } from "@/components/pie/PIEContextualInsights";
import { PIEUserExperienceHub } from "@/components/pie/PIEUserExperienceHub";
import User360Dashboard from "@/components/User360Dashboard";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { isMobile } = useIsMobile();
  
  const { 
    blueprintData, 
    loading, 
    error, 
    hasBlueprint, 
    refetch 
  } = useOptimizedBlueprintData();

  console.log("Dashboard Page Debug:", {
    user: !!user,
    authLoading,
    loading,
    hasBlueprint,
    blueprintData: !!blueprintData,
    error
  });

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <MainLayout>
        <PIENotificationSystem />
        <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6">
          <Loader2 className="h-8 w-8 animate-spin text-soul-purple" />
          <p className="mt-2 text-sm sm:text-base">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  // Show sign in required if no user
  if (!user) {
    return (
      <MainLayout>
        <div className="w-full min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
          <div className="cosmic-card p-6 sm:p-8 text-center max-w-md w-full">
            <h1 className="text-xl sm:text-2xl font-bold font-display mb-4">
              <span className="gradient-text">Soul Dashboard</span>
            </h1>
            <p className="mb-6 text-sm sm:text-base">Please sign in to view your dashboard</p>
            <Button 
              className="bg-soul-purple hover:bg-soul-purple/90 w-full"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show loading while blueprint is loading
  if (loading) {
    return (
      <MainLayout>
        <PIENotificationSystem />
        <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6">
          <Loader2 className="h-8 w-8 animate-spin text-soul-purple" />
          <p className="mt-2 text-sm sm:text-base">Loading dashboard...</p>
        </div>
      </MainLayout>
    );
  }

  // Show error if there's an error
  if (error) {
    return (
      <MainLayout>
        <PIENotificationSystem />
        <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </MainLayout>
    );
  }

  // Redirect to onboarding only if no blueprint exists
  if (!hasBlueprint) {
    navigate('/onboarding');
    return null;
  }

  const isAdmin = isAdminUser(user);

  return (
    <MainLayout>
      <PIENotificationSystem />
      <div className="w-full p-4 sm:p-6 pb-20">
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-display">
            <span className="gradient-text">Soul Dashboard</span>
          </h1>
          
          {/* Enhanced PIE Contextual Insights */}
          <div className="mb-4">
            <PIEContextualInsights context="dashboard" compact={true} maxInsights={1} />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              className="bg-soul-purple hover:bg-soul-purple/90 flex items-center justify-center text-sm h-9"
              onClick={() => navigate('/coach')}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat with Coach
            </Button>
            <Button 
              variant="outline"
              className="flex items-center justify-center text-sm h-9"
              onClick={() => navigate('/journey')}
            >
              <Map className="mr-2 h-4 w-4" />
              View Journey
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          {/* Mobile: Use a scrollable horizontal tabs layout */}
          {isMobile ? (
            <div className="relative mb-6">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex space-x-1 min-w-max p-1 bg-muted rounded-3xl">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-2xl transition-all whitespace-nowrap text-xs font-medium ${
                      activeTab === "overview" 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("productivity")}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-2xl transition-all whitespace-nowrap text-xs font-medium ${
                      activeTab === "productivity" 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Productivity
                  </button>
                  <button
                    onClick={() => setActiveTab("growth")}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-2xl transition-all whitespace-nowrap text-xs font-medium ${
                      activeTab === "growth" 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Growth
                  </button>
                  <button
                    onClick={() => setActiveTab("blueprint")}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-2xl transition-all whitespace-nowrap text-xs font-medium ${
                      activeTab === "blueprint" 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Blueprint
                  </button>
                  <button
                    onClick={() => setActiveTab("user360")}
                    className={`flex items-center justify-center gap-1 py-2 px-3 rounded-2xl transition-all whitespace-nowrap text-xs font-medium ${
                      activeTab === "user360" 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Database className="h-3 w-3 flex-shrink-0" />
                    360°
                  </button>
                  <button
                    onClick={() => setActiveTab("pie")}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-2xl transition-all whitespace-nowrap text-xs font-medium ${
                      activeTab === "pie" 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    PIE Hub
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Desktop: Use standard TabsList */
            <TabsList className="grid grid-cols-6 w-full max-w-5xl mx-auto h-auto p-1">
              <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">Overview</TabsTrigger>
              <TabsTrigger value="productivity" className="text-xs sm:text-sm py-2">Productivity</TabsTrigger>
              <TabsTrigger value="growth" className="text-xs sm:text-sm py-2">Growth</TabsTrigger>
              <TabsTrigger value="blueprint" className="text-xs sm:text-sm py-2">Blueprint</TabsTrigger>
              <TabsTrigger value="user360" className="text-xs sm:text-sm py-2 flex items-center gap-1">
                <Database className="h-3 w-3" />
                360° Profile
              </TabsTrigger>
              <TabsTrigger value="pie" className="text-xs sm:text-sm py-2">PIE Hub</TabsTrigger>
            </TabsList>
          )}
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="cosmic-card">
                <h2 className="text-xl font-bold mb-4">Welcome to your Soul Dashboard</h2>
                <p>This is your personalized space to track your progress, gain insights, and connect with your inner self.</p>
                
                <div className="mt-4">
                  <PIEContextualInsights context="dashboard" compact={false} maxInsights={2} />
                </div>
              </div>
              <div className="cosmic-card">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <Button onClick={() => navigate('/coach')} className="w-full">Chat with Coach</Button>
                  <Button onClick={() => navigate('/journey')} className="w-full">View Journey</Button>
                  <Button onClick={() => setActiveTab('user360')} variant="outline" className="w-full">
                    <Database className="mr-2 h-4 w-4" />
                    View 360° Profile
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="productivity" className="mt-6">
            <div className="mb-4">
              <PIEContextualInsights context="productivity" compact={true} maxInsights={2} />
            </div>
            <EnhancedProductivityDashboard />
          </TabsContent>
          
          <TabsContent value="growth" className="mt-6">
            <div className="cosmic-card">
              <h2 className="text-xl font-bold mb-4">Growth & Development</h2>
              <p>Explore resources and tools to support your personal and spiritual growth.</p>
              
              <div className="mt-4">
                <PIEContextualInsights context="growth" compact={false} maxInsights={3} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="blueprint" className="mt-6">
            <div className="cosmic-card">
              <h2 className="text-xl font-bold mb-4">Soul Blueprint</h2>
              <p>Dive deep into your unique astrological and personality insights.</p>
            </div>
          </TabsContent>

          <TabsContent value="user360" className="mt-6">
            <User360Dashboard />
          </TabsContent>

          <TabsContent value="pie" className="mt-6">
            <PIEUserExperienceHub />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Dashboard;

