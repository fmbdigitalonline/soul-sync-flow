
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Calendar, Activity } from 'lucide-react';

interface PatternData {
  date: string;
  value: number;
  confidence: number;
}

interface PIEPatternVisualizationProps {
  title: string;
  description: string;
  data: PatternData[];
  patternType: 'trend' | 'cyclic' | 'correlation';
  significance: number;
  strength: number;
}

export const PIEPatternVisualization: React.FC<PIEPatternVisualizationProps> = ({
  title,
  description,
  data,
  patternType,
  significance,
  strength
}) => {
  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'cyclic': return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'correlation': return <Activity className="w-5 h-5 text-green-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength > 0.7) return 'text-green-600';
    if (strength > 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSignificanceLabel = (significance: number) => {
    if (significance < 0.01) return 'Highly Significant';
    if (significance < 0.05) return 'Significant';
    return 'Moderate';
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getPatternIcon(patternType)}
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        
        <div className="flex flex-col space-y-1">
          <Badge variant="outline" className="capitalize">
            {patternType} Pattern
          </Badge>
          <Badge variant="outline" className={getStrengthColor(strength)}>
            {Math.round(strength * 100)}% strength
          </Badge>
        </div>
      </div>

      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value, name) => [
                typeof value === 'number' ? value.toFixed(2) : value, 
                name === 'value' ? 'Value' : 'Confidence'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="confidence" 
              stroke="#10b981" 
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Statistical Significance: <span className="font-medium">{getSignificanceLabel(significance)}</span>
        </span>
        <span className="text-gray-600">
          Based on {data.length} data points
        </span>
      </div>
    </Card>
  );
};
