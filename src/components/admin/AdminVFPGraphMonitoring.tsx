
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  TrendingUp, 
  Users, 
  Activity, 
  Target,
  RefreshCw,
  Settings
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const mockVFPData = [
  { date: '2025-06-25', vectors: 156, coherence: 87.2, accuracy: 92.1 },
  { date: '2025-06-26', vectors: 168, coherence: 89.1, accuracy: 94.3 },
  { date: '2025-06-27', vectors: 142, coherence: 85.8, accuracy: 91.7 },
  { date: '2025-06-28', vectors: 184, coherence: 91.4, accuracy: 95.2 },
  { date: '2025-06-29', vectors: 172, coherence: 88.9, accuracy: 93.8 },
  { date: '2025-06-30', vectors: 195, coherence: 92.7, accuracy: 96.1 },
  { date: '2025-07-01', vectors: 203, coherence: 94.3, accuracy: 97.4 }
];

const vectorDistribution = [
  { dimension: 32, count: 45, coherence: 89.2 },
  { dimension: 64, count: 38, coherence: 91.7 },
  { dimension: 96, count: 42, coherence: 87.9 },
  { dimension: 128, count: 62, coherence: 94.1 }
];

export const AdminVFPGraphMonitoring: React.FC = () => {
  const [vfpMetrics, setVfpMetrics] = useState({
    totalVectors: 1186,
    activeUsers: 62,
    avgCoherence: 91.3,
    personalityAccuracy: 94.5,
    vectorGeneration: 203, // per day
    dimensionUtilization: 87.2,
    feedbackScore: 4.3,
    systemLoad: 68.4
  });

  const [recentVectors, setRecentVectors] = useState([
    { id: 1, user: 'User #1247', dimensions: 128, coherence: 94.1, personality: 'ENFP/Generator', created: '2 min ago' },
    { id: 2, user: 'User #1089', dimensions: 96, coherence: 87.9, personality: 'INTJ/Projector', created: '5 min ago' },
    { id: 3, user: 'User #1356', dimensions: 128, coherence: 92.7, personality: 'ESFJ/Manifestor', created: '8 min ago' },
    { id: 4, user: 'User #1124', dimensions: 64, coherence: 89.3, personality: 'ISTP/Reflector', created: '12 min ago' }
  ]);

  const handleRefreshMetrics = () => {
    console.log('Refreshing VFP-Graph metrics...');
  };

  const getCoherenceColor = (coherence: number) => {
    if (coherence >= 90) return 'text-green-600';
    if (coherence >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* VFP-Graph Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-600" />
            VFP-Graph (Vectorized Fusion Personality) Monitoring
          </h2>
          <p className="text-gray-600 mt-1">128-dimensional personality vector generation and analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600">
            90% Beta Ready
          </Badge>
          <Button onClick={handleRefreshMetrics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vectors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vfpMetrics.totalVectors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{vfpMetrics.vectorGeneration} generated today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vfpMetrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Users with VFP vectors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Coherence</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vfpMetrics.avgCoherence}%</div>
            <p className="text-xs text-muted-foreground">
              Vector coherence score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personality Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vfpMetrics.personalityAccuracy}%</div>
            <p className="text-xs text-muted-foreground">
              Matching accuracy rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>VFP-Graph Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockVFPData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="vectors" stroke="#8884d8" name="Vectors Generated" />
                <Line type="monotone" dataKey="coherence" stroke="#82ca9d" name="Coherence Score" />
                <Line type="monotone" dataKey="accuracy" stroke="#ffc658" name="Accuracy %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vector Dimension Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={vectorDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dimension" name="Dimensions" />
                <YAxis dataKey="count" name="Count" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter dataKey="count" fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Performance */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vector Generation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Daily Rate</span>
              <span className="font-bold">{vfpMetrics.vectorGeneration}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Dimension Utilization</span>
              <span className="font-bold">{vfpMetrics.dimensionUtilization}%</span>
            </div>
            <Progress value={vfpMetrics.dimensionUtilization} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">System Load</span>
              <span className="font-bold">{vfpMetrics.systemLoad}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Response Time</span>
              <span className="font-bold">0.8s</span>
            </div>
            <Progress value={vfpMetrics.systemLoad} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Satisfaction Score</span>
              <span className="font-bold">{vfpMetrics.feedbackScore}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Thumbs Up Rate</span>
              <span className="font-bold">89.2%</span>
            </div>
            <Progress value={89.2} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Vectors */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Generated Vectors</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Coherence</TableHead>
                <TableHead>Personality Type</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentVectors.map((vector) => (
                <TableRow key={vector.id}>
                  <TableCell className="font-medium">{vector.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{vector.dimensions}D</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={getCoherenceColor(vector.coherence)}>
                      {vector.coherence}%
                    </span>
                  </TableCell>
                  <TableCell>{vector.personality}</TableCell>
                  <TableCell className="text-gray-500">{vector.created}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
