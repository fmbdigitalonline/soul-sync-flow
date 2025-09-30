
import React from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Calendar, TrendingUp, Star, Play, CheckCircle, Brain } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PIEDashboardPanel } from "@/components/pie/PIEDashboardPanel";
import { PIEContextualInsights } from "@/components/pie/PIEContextualInsights";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { format } from "date-fns";


const Dashboard = () => {
  const { t } = useLanguage();
  const { stats, recentActivities, weeklyProgress, loading } = useDashboardData();

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
          {/* PIE Insights Panel */}
          <div className="lg:col-span-1">
            <PIEDashboardPanel />
          </div>

          {/* Quick Stats with Contextual Insights */}
          <CosmicCard className="p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {t('dashboard.quickStats')}
            </h2>
            
            {/* Contextual PIE Insights for Dashboard */}
            <div className="mb-6">
              <PIEContextualInsights context="dashboard" compact={true} maxInsights={2} />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{loading ? '...' : stats.tasksCompleted}</div>
                <div className="text-sm text-gray-600">{t('dashboard.tasksCompleted')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{loading ? '...' : stats.focusSessions}</div>
                <div className="text-sm text-gray-600">{t('dashboard.focusSessions')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{loading ? '...' : `${weeklyProgress.productivity}%`}</div>
                <div className="text-sm text-gray-600">{t('dashboard.productivity')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{loading ? '...' : stats.currentStreak}</div>
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

        {/* Recent Activities with Pattern Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CosmicCard className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {t('dashboard.recentActivities')}
            </h2>
            
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No recent activities yet. Start your journey!
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {activity.type === 'focus_session' && <Clock className="w-5 h-5 text-blue-600" />}
                      {activity.type === 'task_completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {activity.type === 'coach_conversation' && <Brain className="w-5 h-5 text-purple-600" />}
                      {!['focus_session', 'task_completed', 'coach_conversation'].includes(activity.type) && (
                        <Star className="w-5 h-5 text-orange-600" />
                      )}
                      <div>
                        <div className="text-sm font-medium">{activity.description}</div>
                        <div className="text-xs text-gray-500">{format(activity.timestamp, 'MMM d, h:mm a')}</div>
                      </div>
                    </div>
                    {activity.points > 0 && <Badge variant="secondary">+{activity.points} pts</Badge>}
                  </div>
                ))}
              </div>
            )}
          </CosmicCard>

          <CosmicCard className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              {t('dashboard.weeklyProgress')}
            </h2>
            
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t('dashboard.productivity')}</span>
                    <span>{weeklyProgress.productivity}%</span>
                  </div>
                  <Progress value={weeklyProgress.productivity} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t('dashboard.focusTime')}</span>
                    <span>{weeklyProgress.focusTime}</span>
                  </div>
                  <Progress value={Math.min((parseInt(weeklyProgress.focusTime) / 20) * 100, 100)} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t('dashboard.goalsProgress')}</span>
                    <span>{weeklyProgress.goalsProgress.completed}/{weeklyProgress.goalsProgress.total}</span>
                  </div>
                  <Progress 
                    value={weeklyProgress.goalsProgress.total > 0 
                      ? (weeklyProgress.goalsProgress.completed / weeklyProgress.goalsProgress.total) * 100 
                      : 0
                    } 
                    className="h-2" 
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t('dashboard.consistency')}</span>
                    <span>{weeklyProgress.consistency} days</span>
                  </div>
                  <Progress value={Math.min((weeklyProgress.consistency / 7) * 100, 100)} className="h-2" />
                </div>
              </div>
            )}
          </CosmicCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
