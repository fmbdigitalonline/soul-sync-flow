
import React, { useEffect, useState } from 'react';

interface PerformanceMetrics {
  messageStartTime: number | null;
  responseTime: number | null;
  streamingTime: number | null;
  totalTime: number | null;
}

interface PerformanceMonitorProps {
  isLoading: boolean;
  isStreaming: boolean;
  messageCount: number;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isLoading,
  isStreaming,
  messageCount
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    messageStartTime: null,
    responseTime: null,
    streamingTime: null,
    totalTime: null
  });

  // Track message sending
  useEffect(() => {
    if (isLoading && !metrics.messageStartTime) {
      setMetrics(prev => ({
        ...prev,
        messageStartTime: Date.now(),
        responseTime: null,
        streamingTime: null,
        totalTime: null
      }));
    }
  }, [isLoading, metrics.messageStartTime]);

  // Track response time when streaming starts
  useEffect(() => {
    if (isStreaming && metrics.messageStartTime && !metrics.responseTime) {
      const responseTime = Date.now() - metrics.messageStartTime;
      setMetrics(prev => ({
        ...prev,
        responseTime
      }));
      console.log(`📊 Response time: ${responseTime}ms`);
    }
  }, [isStreaming, metrics.messageStartTime, metrics.responseTime]);

  // Track total time when streaming completes
  useEffect(() => {
    if (!isStreaming && !isLoading && metrics.messageStartTime && metrics.responseTime) {
      const totalTime = Date.now() - metrics.messageStartTime;
      const streamingTime = totalTime - metrics.responseTime;
      
      setMetrics(prev => ({
        ...prev,
        streamingTime,
        totalTime
      }));
      
      console.log(`📊 Performance metrics:`, {
        responseTime: metrics.responseTime,
        streamingTime,
        totalTime,
        target: '< 10s total'
      });
      
      // Reset for next message
      setTimeout(() => {
        setMetrics({
          messageStartTime: null,
          responseTime: null,
          streamingTime: null,
          totalTime: null
        });
      }, 1000);
    }
  }, [isStreaming, isLoading, metrics.messageStartTime, metrics.responseTime]);

  // Don't render anything - this is just for monitoring
  return null;
};
