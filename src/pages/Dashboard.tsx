import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle, Map } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOptimizedBlueprintData } from "@/hooks/use-optimized-blueprint-data";
import { isAdminUser } from "@/utils/isAdminUser";
import { EnhancedProductivityDashboard } from "@/components/productivity/EnhancedProductivityDashboard";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  
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
      <div className="w-full p-4 sm:p-6 pb-20">
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-display">
            <span className="gradient-text">Soul Dashboard</span>
          </h1>
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
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-4xl mx-auto h-auto p-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">Overview</TabsTrigger>
            <TabsTrigger value="productivity" className="text-xs sm:text-sm py-2">Productivity</TabsTrigger>
            <TabsTrigger value="growth" className="text-xs sm:text-sm py-2">Growth</TabsTrigger>
            <TabsTrigger value="blueprint" className="text-xs sm:text-sm py-2">Blueprint</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="cosmic-card">
                <h2 className="text-xl font-bold mb-4">Welcome to your Soul Dashboard</h2>
                <p>This is your personalized space to track your progress, gain insights, and connect with your inner self.</p>
              </div>
              <div className="cosmic-card">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <Button onClick={() => navigate('/coach')}>Chat with Coach</Button>
                <Button onClick={() => navigate('/journey')}>View Journey</Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="productivity" className="mt-6">
            <EnhancedProductivityDashboard />
          </TabsContent>
          
          <TabsContent value="growth" className="mt-6">
            <div className="cosmic-card">
              <h2 className="text-xl font-bold mb-4">Growth & Development</h2>
              <p>Explore resources and tools to support your personal and spiritual growth.</p>
            </div>
          </TabsContent>

          <TabsContent value="blueprint" className="mt-6">
            <div className="cosmic-card">
              <h2 className="text-xl font-bold mb-4">Soul Blueprint</h2>
              <p>Dive deep into your unique astrological and personality insights.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
