import React, { useMemo } from 'react';
import { LifeWheelAssessment, DomainGap } from '@/types/growth-program';

interface LifeWheelVisualizationProps {
  assessments: LifeWheelAssessment[];
  gaps?: DomainGap[];
  size?: number;
  interactive?: boolean;
  showGaps?: boolean;
  onDomainClick?: (domain: string) => void;
}

const DOMAIN_COLORS = {
  wellbeing: '#8B5CF6',      // Purple
  energy: '#F59E0B',         // Amber
  career: '#3B82F6',         // Blue
  relationships: '#EF4444',  // Red
  finances: '#10B981',       // Emerald
  health: '#06B6D4',         // Cyan
  personal_growth: '#84CC16', // Lime
  creativity: '#F97316',     // Orange
  spirituality: '#8B5CF6',   // Purple
  home_family: '#EC4899',    // Pink
  productivity: '#6366F1',   // Indigo
  stress: '#6B7280'          // Gray
} as const;

export function LifeWheelVisualization({ 
  assessments, 
  gaps, 
  size = 300, 
  interactive = false,
  showGaps = true,
  onDomainClick 
}: LifeWheelVisualizationProps) {
  const wheelData = useMemo(() => {
    if (!assessments.length) return [];

    const totalDomains = assessments.length;
    const angleStep = (2 * Math.PI) / totalDomains;
    const radius = size / 2 - 40;
    const centerX = size / 2;
    const centerY = size / 2;

    return assessments.map((assessment, index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top
      const gap = gaps?.find(g => g.domain === assessment.domain);
      
      // Calculate positions for current and desired scores
      const currentRadius = (assessment.current_score / 10) * radius;
      const desiredRadius = (assessment.desired_score / 10) * radius;
      
      const currentX = centerX + Math.cos(angle) * currentRadius;
      const currentY = centerY + Math.sin(angle) * currentRadius;
      
      const desiredX = centerX + Math.cos(angle) * desiredRadius;
      const desiredY = centerY + Math.sin(angle) * desiredRadius;
      
      // Label position (outside the wheel)
      const labelRadius = radius + 25;
      const labelX = centerX + Math.cos(angle) * labelRadius;
      const labelY = centerY + Math.sin(angle) * labelRadius;

      return {
        domain: assessment.domain,
        angle,
        current: { x: currentX, y: currentY, score: assessment.current_score },
        desired: { x: desiredX, y: desiredY, score: assessment.desired_score },
        label: { x: labelX, y: labelY },
        color: DOMAIN_COLORS[assessment.domain as keyof typeof DOMAIN_COLORS] || '#6B7280',
        gap: gap?.gap_size || 0,
        priority: gap?.priority_score || 0,
        importance: assessment.importance_rating
      };
    });
  }, [assessments, gaps, size]);

  // Generate concentric circles for scale
  const scaleCircles = useMemo(() => {
    const circles = [];
    const radius = size / 2 - 40;
    const centerX = size / 2;
    const centerY = size / 2;

    for (let i = 2; i <= 10; i += 2) {
      const circleRadius = (i / 10) * radius;
      circles.push({
        radius: circleRadius,
        cx: centerX,
        cy: centerY,
        score: i
      });
    }
    return circles;
  }, [size]);

  const handleDomainClick = (domain: string) => {
    if (interactive && onDomainClick) {
      onDomainClick(domain);
    }
  };

  return (
    <div className="relative">
      <svg width={size} height={size} className="drop-shadow-sm">
        {/* Background circles */}
        {scaleCircles.map((circle) => (
          <circle
            key={circle.score}
            cx={circle.cx}
            cy={circle.cy}
            r={circle.radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="1"
            opacity="0.3"
          />
        ))}

        {/* Scale labels */}
        {scaleCircles.map((circle) => (
          <text
            key={`label-${circle.score}`}
            x={circle.cx}
            y={circle.cy - circle.radius - 5}
            textAnchor="middle"
            className="text-xs fill-muted-foreground"
          >
            {circle.score}
          </text>
        ))}

        {/* Wheel segments and data */}
        {wheelData.map((segment, index) => (
          <g key={segment.domain}>
            {/* Current score line */}
            <line
              x1={size / 2}
              y1={size / 2}
              x2={segment.current.x}
              y2={segment.current.y}
              stroke={segment.color}
              strokeWidth="3"
              opacity="0.8"
            />

            {/* Desired score line (if different) */}
            {showGaps && segment.gap > 0 && (
              <line
                x1={size / 2}
                y1={size / 2}
                x2={segment.desired.x}
                y2={segment.desired.y}
                stroke={segment.color}
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.5"
              />
            )}

            {/* Current score point */}
            <circle
              cx={segment.current.x}
              cy={segment.current.y}
              r="6"
              fill={segment.color}
              stroke="white"
              strokeWidth="2"
              className={interactive ? "cursor-pointer hover:r-8 transition-all" : ""}
              onClick={() => handleDomainClick(segment.domain)}
            />

            {/* Desired score point (if showing gaps) */}
            {showGaps && segment.gap > 0 && (
              <circle
                cx={segment.desired.x}
                cy={segment.desired.y}
                r="4"
                fill="none"
                stroke={segment.color}
                strokeWidth="2"
                strokeDasharray="3,3"
                opacity="0.7"
              />
            )}

            {/* Domain label */}
            <text
              x={segment.label.x}
              y={segment.label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-xs font-medium fill-foreground ${
                interactive ? "cursor-pointer hover:fill-primary" : ""
              }`}
              onClick={() => handleDomainClick(segment.domain)}
            >
              {segment.domain.replace('_', ' ')}
            </text>

            {/* Score label */}
            <text
              x={segment.current.x}
              y={segment.current.y - 15}
              textAnchor="middle"
              className="text-xs font-bold fill-foreground"
            >
              {segment.current.score}
            </text>

            {/* Gap indicator */}
            {showGaps && segment.gap > 0 && (
              <text
                x={segment.desired.x + 10}
                y={segment.desired.y}
                textAnchor="start"
                className="text-xs fill-muted-foreground"
              >
                +{segment.gap}
              </text>
            )}
          </g>
        ))}

        {/* Center circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="8"
          fill="hsl(var(--primary))"
          stroke="white"
          strokeWidth="2"
        />
      </svg>

      {/* Legend */}
      {showGaps && (
        <div className="absolute bottom-2 left-2 text-xs space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-current"></div>
            <span className="text-muted-foreground">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 border-t-2 border-dashed border-current opacity-50"></div>
            <span className="text-muted-foreground">Desired</span>
          </div>
        </div>
      )}
    </div>
  );
}