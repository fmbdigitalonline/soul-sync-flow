
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
    <div className="min-h-screen bg-gradient-secondary-surface p-container">
      {/* PIE Notification System */}
      <PIENotificationSystem />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-spacing-7">
          <h1 className="text-heading-xl bg-gradient-primary bg-clip-text text-transparent mb-spacing-2 font-display">
            {t('dashboard.welcome')}
          </h1>
          <p className="text-text-secondary font-body">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-spacing-6 mb-spacing-7">
          {/* PIE Insights Panel */}
          <div className="lg:col-span-1">
            <PIEDashboardPanel />
          </div>

          {/* Quick Stats with Contextual Insights */}
          <CosmicCard className="p-container lg:col-span-2">
            <h2 className="text-heading-lg mb-spacing-4 flex items-center gap-spacing-2 font-display text-text-main">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t('dashboard.quickStats')}
            </h2>
            
            {/* Contextual PIE Insights for Dashboard */}
            <div className="mb-spacing-6">
              <PIEContextualInsights context="dashboard" compact={true} maxInsights={2} />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-spacing-4">
              <div className="text-center">
                <div className="text-heading-lg text-primary font-display">12</div>
                <div className="text-caption-sm text-text-secondary font-body">{t('dashboard.tasksCompleted')}</div>
              </div>
              <div className="text-center">
                <div className="text-heading-lg text-secondary font-display">3</div>
                <div className="text-caption-sm text-text-secondary font-body">{t('dashboard.focusSessions')}</div>
              </div>
              <div className="text-center">
                <div className="text-heading-lg text-success font-display">85%</div>
                <div className="text-caption-sm text-text-secondary font-body">{t('dashboard.productivity')}</div>
              </div>
              <div className="text-center">
                <div className="text-heading-lg text-warning font-display">7</div>
                <div className="text-caption-sm text-text-secondary font-body">{t('dashboard.dayStreak')}</div>
              </div>
            </div>
          </CosmicCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-spacing-4 mb-spacing-7">
          <CosmicCard className="p-component">
            <div className="flex items-center space-x-spacing-3">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-semibold font-display text-text-main">{t('dashboard.focusTimer')}</h3>
                <p className="text-caption-sm text-text-secondary font-body">{t('dashboard.startFocusSession')}</p>
              </div>
            </div>
            <Button className="w-full mt-spacing-3" variant="outline">
              <Play className="w-4 h-4 mr-spacing-2" />
              {t('dashboard.start')}
            </Button>
          </CosmicCard>

          <CosmicCard className="p-component">
            <div className="flex items-center space-x-spacing-3">
              <Target className="w-8 h-8 text-secondary" />
              <div>
                <h3 className="font-semibold font-display text-text-main">{t('dashboard.setGoal')}</h3>
                <p className="text-caption-sm text-text-secondary font-body">{t('dashboard.defineNewGoal')}</p>
              </div>
            </div>
            <Button className="w-full mt-spacing-3" variant="outline">
              <Target className="w-4 h-4 mr-spacing-2" />
              {t('dashboard.create')}
            </Button>
          </CosmicCard>

          <CosmicCard className="p-component">
            <div className="flex items-center space-x-spacing-3">
              <Brain className="w-8 h-8 text-success" />
              <div>
                <h3 className="font-semibold font-display text-text-main">{t('dashboard.aiCoach')}</h3>
                <p className="text-caption-sm text-text-secondary font-body">{t('dashboard.getPersonalizedAdvice')}</p>
              </div>
            </div>
            <Button className="w-full mt-spacing-3" variant="outline">
              <Brain className="w-4 h-4 mr-spacing-2" />
              {t('dashboard.chat')}
            </Button>
          </CosmicCard>

          <CosmicCard className="p-component">
            <div className="flex items-center space-x-spacing-3">
              <Calendar className="w-8 h-8 text-warning" />
              <div>
                <h3 className="font-semibold font-display text-text-main">{t('dashboard.planning')}</h3>
                <p className="text-caption-sm text-text-secondary font-body">{t('dashboard.organizeYourDay')}</p>
              </div>
            </div>
            <Button className="w-full mt-spacing-3" variant="outline">
              <Calendar className="w-4 h-4 mr-spacing-2" />
              {t('dashboard.plan')}
            </Button>
          </CosmicCard>
        </div>

        {/* Recent Activities with Pattern Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-spacing-6">
          <CosmicCard className="p-container">
            <h2 className="text-heading-lg mb-spacing-4 flex items-center gap-spacing-2 font-display text-text-main">
              <CheckCircle className="w-5 h-5 text-primary" />
              {t('dashboard.recentActivities')}
            </h2>
            
            <div className="space-y-spacing-3">
              <div className="flex items-center justify-between p-component bg-surface-elevated rounded-shape-lg">
                <div className="flex items-center space-x-spacing-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-caption-sm font-body text-text-main">{t('dashboard.completedMorningRoutine')}</span>
                </div>
                <Badge variant="secondary">+10 pts</Badge>
              </div>
              
              <div className="flex items-center justify-between p-component bg-surface-elevated rounded-shape-lg">
                <div className="flex items-center space-x-spacing-3">
                  <Clock className="w-5 h-5 text-secondary" />
                  <span className="text-caption-sm font-body text-text-main">{t('dashboard.focusSession25min')}</span>
                </div>
                <Badge variant="secondary">+15 pts</Badge>
              </div>
              
              <div className="flex items-center justify-between p-component bg-surface-elevated rounded-shape-lg">
                <div className="flex items-center space-x-spacing-3">
                  <Brain className="w-5 h-5 text-primary" />
                  <span className="text-caption-sm font-body text-text-main">{t('dashboard.aiCoachSession')}</span>
                </div>
                <Badge variant="secondary">+5 pts</Badge>
              </div>
            </div>
          </CosmicCard>

          <CosmicCard className="p-container">
            <h2 className="text-heading-lg mb-spacing-4 flex items-center gap-spacing-2 font-display text-text-main">
              <Star className="w-5 h-5 text-primary" />
              {t('dashboard.weeklyProgress')}
            </h2>
            
            <div className="space-y-spacing-4">
              <div>
                <div className="flex justify-between text-caption-sm mb-spacing-1 font-body">
                  <span className="text-text-main">{t('dashboard.productivity')}</span>
                  <span className="text-text-main">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-caption-sm mb-spacing-1 font-body">
                  <span className="text-text-main">{t('dashboard.focusTime')}</span>
                  <span className="text-text-main">12h 30m</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-caption-sm mb-spacing-1 font-body">
                  <span className="text-text-main">{t('dashboard.goalsProgress')}</span>
                  <span className="text-text-main">3/4</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-caption-sm mb-spacing-1 font-body">
                  <span className="text-text-main">{t('dashboard.consistency')}</span>
                  <span className="text-text-main">7 days</span>
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
