import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { isAdminUser } from '@/utils/isAdminUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Users, 
  Settings, 
  BarChart3, 
  Brain, 
  Zap, 
  Database,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AdminOverviewPanel } from '@/components/admin/AdminOverviewPanel';
import { AdminPIEMonitoring } from '@/components/admin/AdminPIEMonitoring';
import { AdminVFPGraphMonitoring } from '@/components/admin/AdminVFPGraphMonitoring';
import { AdminTMGMonitoring } from '@/components/admin/AdminTMGMonitoring';
import { AdminACSMonitoring } from '@/components/admin/AdminACSMonitoring';
import { AdminUserAnalytics } from '@/components/admin/AdminUserAnalytics';
import { AdminSystemHealth } from '@/components/admin/AdminSystemHealth';
import { AdminConfigurationHub } from '@/components/admin/AdminConfigurationHub';
import { AdminSystemDiagnostics } from '@/components/admin/AdminSystemDiagnostics';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [systemHealth, setSystemHealth] = useState({
    pie: { status: 'healthy', score: 85 },
    vfpGraph: { status: 'healthy', score: 90 },
    tmg: { status: 'healthy', score: 92 },
    acs: { status: 'healthy', score: 95 }
  });

  // Redirect if not admin
  if (!user || !isAdminUser(user)) {
    return <Navigate to="/" replace />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Monitor and configure Soul Guide innovations</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                <Activity className="w-3 h-3 mr-1" />
                Real-time monitoring
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* System Health Summary */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {Object.entries(systemHealth).map(([key, health]) => (
              <Card key={key} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase">
                      {key === 'vfpGraph' ? 'VFP-Graph' : key.toUpperCase()}
                    </p>
                    <div className={`flex items-center gap-2 mt-1 ${getStatusColor(health.status)}`}>
                      {getStatusIcon(health.status)}
                      <span className="font-semibold">{health.score}%</span>
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="pie" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              PIE
            </TabsTrigger>
            <TabsTrigger value="vfp" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              VFP-Graph
            </TabsTrigger>
            <TabsTrigger value="tmg" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              TMG
            </TabsTrigger>
            <TabsTrigger value="acs" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              ACS
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Health
            </TabsTrigger>
            <TabsTrigger value="diagnostics" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Diagnostics
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverviewPanel />
          </TabsContent>

          <TabsContent value="pie">
            <AdminPIEMonitoring />
          </TabsContent>

          <TabsContent value="vfp">
            <AdminVFPGraphMonitoring />
          </TabsContent>

          <TabsContent value="tmg">
            <AdminTMGMonitoring />
          </TabsContent>

          <TabsContent value="acs">
            <AdminACSMonitoring />
          </TabsContent>

          <TabsContent value="users">
            <AdminUserAnalytics />
          </TabsContent>

          <TabsContent value="health">
            <AdminSystemHealth />
          </TabsContent>

          <TabsContent value="diagnostics">
            <AdminSystemDiagnostics />
          </TabsContent>

          <TabsContent value="config">
            <AdminConfigurationHub />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
