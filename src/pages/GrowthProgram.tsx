
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, Lock, Play, ArrowRight, TrendingUp, Calendar, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { growthProgramService } from '@/services/growth-program-service';
import { GrowthProgram, ProgramWeek, LifeDomain } from '@/types/growth-program';
import { GrowthProgramInterface } from '@/components/growth/GrowthProgramInterface';

const GrowthProgramPage: React.FC = () => {
  const [currentProgram, setCurrentProgram] = useState<GrowthProgram | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<ProgramWeek | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { blueprintData } = useBlueprintCache();

  useEffect(() => {
    loadCurrentProgram();
  }, [user]);

  const loadCurrentProgram = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const program = await growthProgramService.getCurrentProgram(user.id);
      setCurrentProgram(program);
    } catch (error) {
      console.error('Error loading program:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWeekSelect = (week: ProgramWeek) => {
    setSelectedWeek(week);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-soul-deep via-soul-purple to-soul-bright p-6">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <Clock className="h-6 w-6 animate-spin mr-2" />
                Loading your Growth Program...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (selectedWeek) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-soul-deep via-soul-purple to-soul-bright p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedWeek(null)}
              className="mb-4"
            >
              ← Back to Program Overview
            </Button>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl capitalize">
                      Week {selectedWeek.week_number}: {selectedWeek.theme.replace('_', ' ')}
                    </CardTitle>
                    <p className="text-muted-foreground mt-2">{selectedWeek.focus_area}</p>
                  </div>
                  <Badge variant={selectedWeek.is_completed ? "default" : "secondary"}>
                    {selectedWeek.is_completed ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="activities" className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="activities">Activities</TabsTrigger>
                    <TabsTrigger value="tools">Tools</TabsTrigger>
                    <TabsTrigger value="completion">Completion</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="activities" className="space-y-4">
                    <h3 className="text-lg font-semibold">Key Activities This Week</h3>
                    <div className="space-y-3">
                      {selectedWeek.key_activities.map((activity, idx) => (
                        <Card key={idx}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-soul-purple rounded-full" />
                              <span>{activity}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tools" className="space-y-4">
                    <h3 className="text-lg font-semibold">Tools Available</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedWeek.tools_unlocked.map((tool) => (
                        <Card key={tool}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Target className="h-5 w-5 text-soul-purple" />
                              <span className="font-medium">{tool}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="completion" className="space-y-4">
                    <h3 className="text-lg font-semibold">Completion Criteria</h3>
                    <div className="space-y-3">
                      {selectedWeek.completion_criteria.map((criteria, idx) => (
                        <Card key={idx}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <CheckCircle className={`h-5 w-5 ${selectedWeek.is_completed ? 'text-green-600' : 'text-gray-400'}`} />
                              <span>{criteria}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    {!selectedWeek.is_completed && (
                      <Button className="w-full bg-soul-purple hover:bg-soul-purple/90 mt-6">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Week as Complete
                      </Button>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-deep via-soul-purple to-soul-bright p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            Growth Programs
          </h1>
          <p className="text-soul-light text-lg">
            Personalized growth journeys tailored to your unique blueprint and life goals
          </p>
        </div>

        <GrowthProgramInterface onWeekSelect={handleWeekSelect} />
      </div>
    </div>
  );
};

export default GrowthProgramPage;
