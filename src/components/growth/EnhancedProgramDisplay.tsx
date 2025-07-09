import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Target, Lightbulb, AlertTriangle, ArrowRight, Star } from 'lucide-react';
import { GrowthProgram } from '@/types/growth-program';

interface PlanBranch {
  title: string;
  strategy: string;
  objectives: string[];
  actionSteps: string[];
  advantages: string[];
  challenges: string[];
  isRecommended?: boolean;
}

interface EnhancedProgramDisplayProps {
  program: GrowthProgram;
  planBranches: PlanBranch[];
  onSelectBranch: (branch: PlanBranch) => void;
}

export function EnhancedProgramDisplay({ program, planBranches, onSelectBranch }: EnhancedProgramDisplayProps) {
  const [selectedBranch, setSelectedBranch] = useState<PlanBranch | null>(null);

  const handleSelectBranch = (branch: PlanBranch) => {
    setSelectedBranch(branch);
    onSelectBranch(branch);
  };

  const getBranchIcon = (title: string) => {
    if (title.toLowerCase().includes('gradual')) {
      return <Target className="h-5 w-5 text-blue-600" />;
    } else if (title.toLowerCase().includes('intensive')) {
      return <CheckCircle className="h-5 w-5 text-purple-600" />;
    } else if (title.toLowerCase().includes('balanced')) {
      return <Star className="h-5 w-5 text-green-600" />;
    }
    return <Lightbulb className="h-5 w-5 text-amber-600" />;
  };

  const getBranchColor = (title: string) => {
    if (title.toLowerCase().includes('gradual')) {
      return 'border-blue-200 bg-blue-50';
    } else if (title.toLowerCase().includes('intensive')) {
      return 'border-purple-200 bg-purple-50';
    } else if (title.toLowerCase().includes('balanced')) {
      return 'border-green-200 bg-green-50';
    }
    return 'border-amber-200 bg-amber-50';
  };

  return (
    <div className="space-y-6">
      {/* Program Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Your Personalized Growth Plan
          </CardTitle>
          <p className="text-muted-foreground">
            Choose your preferred approach to {program.domain.replace('_', ' ')} growth
          </p>
        </CardHeader>
      </Card>

      {/* Plan Branches Display */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {planBranches.map((branch, index) => (
          <Card 
            key={index} 
            className={`relative cursor-pointer transition-all hover:shadow-lg ${getBranchColor(branch.title)} ${
              selectedBranch === branch ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleSelectBranch(branch)}
          >
            {branch.isRecommended && (
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                  Recommended
                </Badge>
              </div>
            )}
            
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                {getBranchIcon(branch.title)}
                <div>
                  <CardTitle className="text-lg">{branch.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {branch.strategy}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Objectives */}
              {branch.objectives && branch.objectives.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Objectives</h4>
                  <ul className="space-y-1">
                    {branch.objectives.slice(0, 2).map((objective, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Steps Preview */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Actions</h4>
                <ul className="space-y-1">
                  {branch.actionSteps.slice(0, 2).map((step, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                      <ArrowRight className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Advantages */}
              <div>
                <h4 className="text-sm font-semibold text-green-700 mb-2">Advantages</h4>
                <ul className="space-y-1">
                  {branch.advantages.slice(0, 2).map((advantage, idx) => (
                    <li key={idx} className="text-xs text-green-600 flex items-start gap-2">
                      <Lightbulb className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      {advantage}
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                className="w-full mt-4" 
                variant={selectedBranch === branch ? "default" : "outline"}
                size="sm"
              >
                {selectedBranch === branch ? 'Selected' : 'Choose This Path'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed View */}
      {selectedBranch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {getBranchIcon(selectedBranch.title)}
              {selectedBranch.title} - Detailed View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="benefits">Benefits</TabsTrigger>
                <TabsTrigger value="considerations">Considerations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Strategy</h4>
                    <p className="text-muted-foreground">{selectedBranch.strategy}</p>
                  </div>
                  
                  {selectedBranch.objectives && selectedBranch.objectives.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Objectives</h4>
                      <ul className="space-y-2">
                        {selectedBranch.objectives.map((objective, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="actions" className="mt-4">
                <div>
                  <h4 className="font-semibold mb-3">Action Steps</h4>
                  <div className="space-y-3">
                    {selectedBranch.actionSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="benefits" className="mt-4">
                <div>
                  <h4 className="font-semibold mb-3">Advantages</h4>
                  <div className="space-y-2">
                    {selectedBranch.advantages.map((advantage, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                        <Lightbulb className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{advantage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="considerations" className="mt-4">
                <div>
                  <h4 className="font-semibold mb-3">Challenges & Considerations</h4>
                  <div className="space-y-2">
                    {selectedBranch.challenges.map((challenge, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 bg-amber-50 rounded">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{challenge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}