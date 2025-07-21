
import React from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Calendar, TrendingUp, Star, Play, CheckCircle, Brain } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PIEDashboardPanel } from "@/components/pie/PIEDashboardPanel";
import { PIEContextualInsights } from "@/components/pie/PIEContextualInsights";
import { PIENotificationSystem } from "@/components/pie/PIENotificationSystem";

const Dashboard = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-secondary-surface p-6">
      {/* PIE Notification System */}
      <PIENotificationSystem />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2 font-cormorant">
            {t('dashboard.welcome')}
          </h1>
          <p className="text-muted-foreground font-inter">
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
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 font-cormorant text-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t('dashboard.quickStats')}
            </h2>
            
            {/* Contextual PIE Insights for Dashboard */}
            <div className="mb-6">
              <PIEContextualInsights context="dashboard" compact={true} maxInsights={2} />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary font-cormorant">12</div>
                <div className="text-sm text-muted-foreground font-inter">{t('dashboard.tasksCompleted')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary font-cormorant">3</div>
                <div className="text-sm text-muted-foreground font-inter">{t('dashboard.focusSessions')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success font-cormorant">85%</div>
                <div className="text-sm text-muted-foreground font-inter">{t('dashboard.productivity')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning font-cormorant">7</div>
                <div className="text-sm text-muted-foreground font-inter">{t('dashboard.dayStreak')}</div>
              </div>
            </div>
          </CosmicCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <CosmicCard className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-semibold font-cormorant text-foreground">{t('dashboard.focusTimer')}</h3>
                <p className="text-sm text-muted-foreground font-inter">{t('dashboard.startFocusSession')}</p>
              </div>
            </div>
            <Button className="w-full mt-3" variant="outline">
              <Play className="w-4 h-4 mr-2" />
              {t('dashboard.start')}
            </Button>
          </CosmicCard>

          <CosmicCard className="p-4">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-secondary" />
              <div>
                <h3 className="font-semibold font-cormorant text-foreground">{t('dashboard.setGoal')}</h3>
                <p className="text-sm text-muted-foreground font-inter">{t('dashboard.defineNewGoal')}</p>
              </div>
            </div>
            <Button className="w-full mt-3" variant="outline">
              <Target className="w-4 h-4 mr-2" />
              {t('dashboard.create')}
            </Button>
          </CosmicCard>

          <CosmicCard className="p-4">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-success" />
              <div>
                <h3 className="font-semibold font-cormorant text-foreground">{t('dashboard.aiCoach')}</h3>
                <p className="text-sm text-muted-foreground font-inter">{t('dashboard.getPersonalizedAdvice')}</p>
              </div>
            </div>
            <Button className="w-full mt-3" variant="outline">
              <Brain className="w-4 h-4 mr-2" />
              {t('dashboard.chat')}
            </Button>
          </CosmicCard>

          <CosmicCard className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-warning" />
              <div>
                <h3 className="font-semibold font-cormorant text-foreground">{t('dashboard.planning')}</h3>
                <p className="text-sm text-muted-foreground font-inter">{t('dashboard.organizeYourDay')}</p>
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
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 font-cormorant text-foreground">
              <CheckCircle className="w-5 h-5 text-primary" />
              {t('dashboard.recentActivities')}
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm font-inter text-foreground">{t('dashboard.completedMorningRoutine')}</span>
                </div>
                <Badge variant="secondary">+10 pts</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-secondary" />
                  <span className="text-sm font-inter text-foreground">{t('dashboard.focusSession25min')}</span>
                </div>
                <Badge variant="secondary">+15 pts</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Brain className="w-5 h-5 text-primary" />
                  <span className="text-sm font-inter text-foreground">{t('dashboard.aiCoachSession')}</span>
                </div>
                <Badge variant="secondary">+5 pts</Badge>
              </div>
            </div>
          </CosmicCard>

          <CosmicCard className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 font-cormorant text-foreground">
              <Star className="w-5 h-5 text-primary" />
              {t('dashboard.weeklyProgress')}
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1 font-inter">
                  <span className="text-foreground">{t('dashboard.productivity')}</span>
                  <span className="text-foreground">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1 font-inter">
                  <span className="text-foreground">{t('dashboard.focusTime')}</span>
                  <span className="text-foreground">12h 30m</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1 font-inter">
                  <span className="text-foreground">{t('dashboard.goalsProgress')}</span>
                  <span className="text-foreground">3/4</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1 font-inter">
                  <span className="text-foreground">{t('dashboard.consistency')}</span>
                  <span className="text-foreground">7 days</span>
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
