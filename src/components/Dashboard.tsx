
import React from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Calendar, TrendingUp, Star, Play, CheckCircle, Brain } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PIEDashboardPanel } from "@/components/pie/PIEDashboardPanel";

const Dashboard = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {t('dashboard.welcome')}
          </h1>
          <p className="text-gray-600">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* PIE Insights Panel - New Addition */}
          <div className="lg:col-span-1">
            <PIEDashboardPanel />
          </div>

          {/* Quick Stats */}
          <CosmicCard className="p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {t('dashboard.quickStats')}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">12</div>
                <div className="text-sm text-gray-600">{t('dashboard.tasksCompleted')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">3</div>
                <div className="text-sm text-gray-600">{t('dashboard.focusSessions')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">85%</div>
                <div className="text-sm text-gray-600">{t('dashboard.productivity')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">7</div>
                <div className="text-sm text-gray-600">{t('dashboard.dayStreak')}</div>
              </div>
            </div>
          </CosmicCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <CosmicCard className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="font-semibold">{t('dashboard.focusTimer')}</h3>
                <p className="text-sm text-gray-600">{t('dashboard.startFocusSession')}</p>
              </div>
            </div>
            <Button className="w-full mt-3" variant="outline">
              <Play className="w-4 h-4 mr-2" />
              {t('dashboard.start')}
            </Button>
          </CosmicCard>

          <CosmicCard className="p-4">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-semibold">{t('dashboard.setGoal')}</h3>
                <p className="text-sm text-gray-600">{t('dashboard.defineNewGoal')}</p>
              </div>
            </div>
            <Button className="w-full mt-3" variant="outline">
              <Target className="w-4 h-4 mr-2" />
              {t('dashboard.create')}
            </Button>
          </CosmicCard>

          <CosmicCard className="p-4">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold">{t('dashboard.aiCoach')}</h3>
                <p className="text-sm text-gray-600">{t('dashboard.getPersonalizedAdvice')}</p>
              </div>
            </div>
            <Button className="w-full mt-3" variant="outline">
              <Brain className="w-4 h-4 mr-2" />
              {t('dashboard.chat')}
            </Button>
          </CosmicCard>

          <CosmicCard className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-orange-600" />
              <div>
                <h3 className="font-semibold">{t('dashboard.planning')}</h3>
                <p className="text-sm text-gray-600">{t('dashboard.organizeYourDay')}</p>
              </div>
            </div>
            <Button className="w-full mt-3" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              {t('dashboard.plan')}
            </Button>
          </CosmicCard>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CosmicCard className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {t('dashboard.recentActivities')}
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">{t('dashboard.completedMorningRoutine')}</span>
                </div>
                <Badge variant="secondary">+10 pts</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">{t('dashboard.focusSession25min')}</span>
                </div>
                <Badge variant="secondary">+15 pts</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span className="text-sm">{t('dashboard.aiCoachSession')}</span>
                </div>
                <Badge variant="secondary">+5 pts</Badge>
              </div>
            </div>
          </CosmicCard>

          <CosmicCard className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              {t('dashboard.weeklyProgress')}
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t('dashboard.productivity')}</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t('dashboard.focusTime')}</span>
                  <span>12h 30m</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t('dashboard.goalsProgress')}</span>
                  <span>3/4</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t('dashboard.consistency')}</span>
                  <span>7 days</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
            </div>
          </CosmicCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
