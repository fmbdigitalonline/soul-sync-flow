
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Activity, 
  Star,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const userGrowthData = [
  { date: '2025-06-25', newUsers: 12, activeUsers: 45, retention: 78 },
  { date: '2025-06-26', newUsers: 15, activeUsers: 52, retention: 82 },
  { date: '2025-06-27', newUsers: 9, activeUsers: 48, retention: 79 },
  { date: '2025-06-28', newUsers: 18, activeUsers: 61, retention: 85 },
  { date: '2025-06-29', newUsers: 14, activeUsers: 57, retention: 81 },
  { date: '2025-06-30', newUsers: 21, activeUsers: 64, retention: 87 },
  { date: '2025-07-01', newUsers: 16, activeUsers: 68, retention: 89 }
];

const featureUsage = [
  { feature: 'PIE Insights', usage: 85, satisfaction: 4.2 },
  { feature: 'VFP-Graph', usage: 92, satisfaction: 4.5 },
  { feature: 'TMG Memory', usage: 78, satisfaction: 4.1 },
  { feature: 'ACS Adaptation', usage: 67, satisfaction: 4.6 },
  { feature: 'Blueprint Gen', usage: 94, satisfaction: 4.4 }
];

export const AdminUserAnalytics: React.FC = () => {
  const { t } = useLanguage();
  const [userMetrics, setUserMetrics] = useState({
    totalUsers: 1247,
    activeToday: 68,
    newThisWeek: 105,
    avgSessionTime: 24.3, // minutes
    retentionRate: 89.2,
    conversionRate: 23.4,
    churnRate: 4.2,
    satisfaction: 4.4
  });

  const [topUsers, setTopUsers] = useState([
    { id: '#1247', email: 'user@example.com', joinDate: '2024-12-15', sessions: 245, satisfaction: 4.8, innovations: ['PIE', 'VFP', 'TMG', 'ACS'] },
    { id: '#1089', email: 'power.user@domain.com', joinDate: '2024-11-22', sessions: 189, satisfaction: 4.6, innovations: ['VFP', 'TMG', 'ACS'] },
    { id: '#1356', email: 'beta.tester@test.com', joinDate: '2024-10-08', sessions: 312, satisfaction: 4.9, innovations: ['PIE', 'VFP', 'TMG'] },
    { id: '#1124', email: 'early.adopter@mail.com', joinDate: '2024-09-14', sessions: 156, satisfaction: 4.3, innovations: ['PIE', 'ACS'] }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const handleExportData = () => {
    console.log('Exporting user analytics data...');
  };

  const getInnovationColor = (innovation: string) => {
    const colors = {
      'PIE': 'bg-blue-100 text-blue-800',
      'VFP': 'bg-yellow-100 text-yellow-800',
      'TMG': 'bg-green-100 text-green-800',
      'ACS': 'bg-purple-100 text-purple-800'
    };
    return colors[innovation as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* User Analytics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            User Analytics & Behavior
          </h2>
          <p className="text-gray-600 mt-1">Comprehensive user engagement and satisfaction metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key User Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userMetrics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{userMetrics.newThisWeek} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userMetrics.activeToday}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((userMetrics.activeToday / userMetrics.totalUsers) * 100)}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userMetrics.avgSessionTime}m</div>
            <p className="text-xs text-muted-foreground">
              Average user session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userMetrics.satisfaction}/5</div>
            <p className="text-xs text-muted-foreground">
              Overall platform rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Growth and Retention Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth & Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="newUsers" stroke="#8884d8" name="New Users" />
                <Line type="monotone" dataKey="activeUsers" stroke="#82ca9d" name="Active Users" />
                <Line type="monotone" dataKey="retention" stroke="#ffc658" name="Retention %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Usage & Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={featureUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" fill="#8884d8" name="Usage %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Behavior Metrics */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Retention Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">7-Day Retention</span>
              <span className="font-bold">{userMetrics.retentionRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Churn Rate</span>
              <span className="font-bold">{userMetrics.churnRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Conversion Rate</span>
              <span className="font-bold">{userMetrics.conversionRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Levels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Power Users</span>
              <span className="font-bold">23 (1.8%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Regular Users</span>
              <span className="font-bold">487 (39.1%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Casual Users</span>
              <span className="font-bold">737 (59.1%)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Innovation Adoption</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">All 4 Innovations</span>
              <span className="font-bold">23 users</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">3 Innovations</span>
              <span className="font-bold">156 users</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">2+ Innovations</span>
              <span className="font-bold">487 users</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Top Users by Engagement
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={t('forms.placeholders.searchUsers')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Satisfaction</TableHead>
                <TableHead>Active Innovations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell>{user.sessions}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {user.satisfaction}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.innovations.map((innovation) => (
                        <Badge key={innovation} className={getInnovationColor(innovation)} variant="outline">
                          {innovation}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
