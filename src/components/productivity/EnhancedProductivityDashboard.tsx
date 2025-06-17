
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Settings, Brain, Zap, Clock } from "lucide-react";
import { WeeklySummary } from "./WeeklySummary";
import { IntelligentScheduler } from "./IntelligentScheduler";
import { ProgressAnalytics } from "./ProgressAnalytics";
import { CalendarSync } from "./CalendarSync";
import ProductivityDashboard from "./ProductivityDashboard";

export const EnhancedProductivityDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'overview' | 'analytics' | 'schedule' | 'sync'>('overview');
  
  return (
    <div className="space-y-6">
      {/* Enhanced Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Productivity Suite</h2>
          <p className="text-muted-foreground">
            Complete productivity management with AI insights
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Phase 1 Complete
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProductivityDashboard />
            </div>
            <div>
              <WeeklySummary />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <ProgressAnalytics />
        </TabsContent>
        
        <TabsContent value="schedule" className="mt-6">
          <IntelligentScheduler />
        </TabsContent>
        
        <TabsContent value="sync" className="mt-6">
          <CalendarSync />
        </TabsContent>
      </Tabs>
    </div>
  );
};
