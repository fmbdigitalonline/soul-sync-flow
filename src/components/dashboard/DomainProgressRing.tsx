import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Activity } from 'lucide-react';

interface DomainProgressRingProps {
  domain: string;
  current: number;
  desired: number;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

const SIZE_CONFIG = {
  sm: { circle: 60, stroke: 4, text: 'text-xs' },
  md: { circle: 80, stroke: 6, text: 'text-sm' },
  lg: { circle: 100, stroke: 8, text: 'text-base' }
};

export function DomainProgressRing({ 
  domain, 
  current, 
  desired, 
  progress = 0,
  size = 'md',
  showLabels = true 
}: DomainProgressRingProps) {
  const config = SIZE_CONFIG[size];
  const radius = config.circle / 2 - config.stroke;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate progress as percentage of gap filled
  const gap = desired - current;
  const progressPercent = gap > 0 ? (progress / gap) * 100 : 100;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        <svg 
          width={config.circle} 
          height={config.circle} 
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={config.circle / 2}
            cy={config.circle / 2}
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth={config.stroke}
            fill="none"
            opacity="0.3"
          />
          
          {/* Progress circle */}
          <circle
            cx={config.circle / 2}
            cy={config.circle / 2}
            r={radius}
            stroke="hsl(var(--primary))"
            strokeWidth={config.stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold text-foreground ${config.text}`}>
            {current}
          </span>
          <span className={`text-muted-foreground text-xs`}>
            /{desired}
          </span>
        </div>
      </div>
      
      {showLabels && (
        <div className="text-center">
          <p className="text-sm font-medium capitalize">
            {domain.replace('_', ' ')}
          </p>
          <p className="text-xs text-muted-foreground">
            {Math.round(progressPercent)}% progress
          </p>
        </div>
      )}
    </div>
  );
}

interface MultiDomainProgressProps {
  domains: Array<{
    domain: string;
    current: number;
    desired: number;
    progress?: number;
    priority?: number;
  }>;
  title?: string;
}

export function MultiDomainProgress({ domains, title = "Growth Progress" }: MultiDomainProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {domains.map((domain) => (
            <div key={domain.domain} className="relative">
              <DomainProgressRing
                domain={domain.domain}
                current={domain.current}
                desired={domain.desired}
                progress={domain.progress || 0}
                size="md"
                showLabels={true}
              />
              
              {domain.priority && domain.priority > 7 && (
                <Badge 
                  className="absolute -top-1 -right-1 text-xs"
                  variant="destructive"
                >
                  High
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}