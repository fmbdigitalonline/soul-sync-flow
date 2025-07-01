
import { PIEDataPoint } from "@/types/pie-types";

interface CorrelationResult {
  correlation: number;
  significance: number; // p-value
  sampleSize: number;
  method: string;
  confidence: number;
  metadata: {
    variance: number;
    standardDeviation: number;
    meanValue: number;
    timespan: number;
  };
}

interface TimeSeriesData {
  timestamps: number[];
  values: number[];
}

class RealTimeCorrelationEngine {
  // Calculate Pearson correlation coefficient with statistical significance
  calculatePearsonCorrelation(data1: number[], data2: number[]): { correlation: number; significance: number } {
    if (data1.length !== data2.length || data1.length < 3) {
      return { correlation: 0, significance: 1 };
    }

    const n = data1.length;
    
    // Calculate means
    const mean1 = data1.reduce((a, b) => a + b, 0) / n;
    const mean2 = data2.reduce((a, b) => a + b, 0) / n;
    
    // Calculate correlation components
    let numerator = 0;
    let sumSq1 = 0;
    let sumSq2 = 0;
    
    for (let i = 0; i < n; i++) {
      const diff1 = data1[i] - mean1;
      const diff2 = data2[i] - mean2;
      numerator += diff1 * diff2;
      sumSq1 += diff1 * diff1;
      sumSq2 += diff2 * diff2;
    }
    
    const denominator = Math.sqrt(sumSq1 * sumSq2);
    const correlation = denominator === 0 ? 0 : numerator / denominator;
    
    // Calculate t-statistic for significance testing
    const tStat = Math.abs(correlation) * Math.sqrt((n - 2) / (1 - correlation * correlation));
    
    // Approximate p-value using t-distribution (simplified)
    const degreesOfFreedom = n - 2;
    const significance = this.calculateTTestPValue(tStat, degreesOfFreedom);
    
    return { correlation, significance };
  }

  // Simplified t-test p-value calculation
  private calculateTTestPValue(tStat: number, df: number): number {
    // Approximate p-value calculation for t-distribution
    if (df <= 0) return 1;
    
    const x = tStat / Math.sqrt(df);
    const a = Math.atan(x);
    const p = 0.5 - (a / Math.PI);
    
    return Math.max(0.001, Math.min(0.999, 2 * p)); // Two-tailed test
  }

  // Cross-correlation with lag analysis
  calculateCrossCorrelation(series1: TimeSeriesData, series2: TimeSeriesData, maxLag: number = 5): CorrelationResult[] {
    const results: CorrelationResult[] = [];
    
    for (let lag = -maxLag; lag <= maxLag; lag++) {
      const { aligned1, aligned2 } = this.alignSeriesWithLag(series1, series2, lag);
      
      if (aligned1.length < 3) continue;
      
      const { correlation, significance } = this.calculatePearsonCorrelation(aligned1, aligned2);
      
      // Calculate metadata
      const variance = this.calculateVariance(aligned1);
      const standardDeviation = Math.sqrt(variance);
      const meanValue = aligned1.reduce((a, b) => a + b, 0) / aligned1.length;
      
      // Calculate confidence based on sample size and correlation strength
      const sampleSizeFactor = Math.min(1, aligned1.length / 30);
      const correlationStrengthFactor = Math.abs(correlation);
      const confidence = Math.min(0.95, sampleSizeFactor * correlationStrengthFactor * (1 - significance));
      
      results.push({
        correlation,
        significance,
        sampleSize: aligned1.length,
        method: `cross_correlation_lag_${lag}`,
        confidence,
        metadata: {
          variance,
          standardDeviation,
          meanValue,
          timespan: lag
        }
      });
    }
    
    return results.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }

  // Align two time series with specified lag
  private alignSeriesWithLag(series1: TimeSeriesData, series2: TimeSeriesData, lag: number): { aligned1: number[]; aligned2: number[] } {
    const aligned1: number[] = [];
    const aligned2: number[] = [];
    
    const tolerance = 3600000; // 1 hour tolerance for timestamp matching
    
    for (let i = 0; i < series1.timestamps.length; i++) {
      const targetTimestamp = series1.timestamps[i] + (lag * 3600000); // lag in hours
      
      // Find closest timestamp in series2
      let closestIndex = -1;
      let minDiff = Infinity;
      
      for (let j = 0; j < series2.timestamps.length; j++) {
        const diff = Math.abs(series2.timestamps[j] - targetTimestamp);
        if (diff < minDiff && diff < tolerance) {
          minDiff = diff;
          closestIndex = j;
        }
      }
      
      if (closestIndex !== -1) {
        aligned1.push(series1.values[i]);
        aligned2.push(series2.values[closestIndex]);
      }
    }
    
    return { aligned1, aligned2 };
  }

  // Calculate variance for a dataset
  private calculateVariance(data: number[]): number {
    if (data.length === 0) return 0;
    
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const squaredDiffs = data.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
  }

  // Sliding window correlation analysis
  async performSlidingWindowCorrelation(
    moodData: PIEDataPoint[], 
    astronomicalEvents: any[], 
    windowSizeHours: number = 48
  ): Promise<CorrelationResult[]> {
    console.log(`🔗 Performing sliding window correlation analysis (${windowSizeHours}h windows)`);
    
    const correlations: CorrelationResult[] = [];
    const windowSizeMs = windowSizeHours * 3600000;
    
    try {
      // Convert mood data to time series
      const moodSeries: TimeSeriesData = {
        timestamps: moodData.map(d => new Date(d.timestamp).getTime()),
        values: moodData.map(d => d.value)
      };
      
      for (const event of astronomicalEvents) {
        const eventTime = new Date(event.startTime).getTime();
        const windowStart = eventTime - windowSizeMs / 2;
        const windowEnd = eventTime + windowSizeMs / 2;
        
        // Filter mood data within window
        const windowMoodData = moodData.filter(d => {
          const timestamp = new Date(d.timestamp).getTime();
          return timestamp >= windowStart && timestamp <= windowEnd;
        });
        
        if (windowMoodData.length < 3) continue;
        
        // Create event intensity time series aligned with mood data
        const eventSeries: TimeSeriesData = {
          timestamps: windowMoodData.map(d => new Date(d.timestamp).getTime()),
          values: windowMoodData.map(() => event.intensity || 0.5)
        };
        
        // Calculate cross-correlation
        const crossCorrelations = this.calculateCrossCorrelation(
          {
            timestamps: windowMoodData.map(d => new Date(d.timestamp).getTime()),
            values: windowMoodData.map(d => d.value)
          },
          eventSeries,
          3 // max lag of 3 hours
        );
        
        if (crossCorrelations.length > 0) {
          const bestCorrelation = crossCorrelations[0];
          correlations.push({
            ...bestCorrelation,
            method: `sliding_window_${event.eventType}`,
            metadata: {
              ...bestCorrelation.metadata,
              timespan: windowSizeHours
            }
          });
        }
      }
      
      console.log(`🔗 Generated ${correlations.length} sliding window correlations`);
      return correlations;
      
    } catch (error) {
      console.error('❌ Error in sliding window correlation:', error);
      return [];
    }
  }

  // Wavelet coherence analysis (simplified implementation)
  calculateWaveletCoherence(series1: TimeSeriesData, series2: TimeSeriesData): CorrelationResult {
    console.log('🌊 Calculating wavelet coherence');
    
    try {
      // Simplified continuous wavelet transform using Morlet wavelet
      const scales = [2, 4, 8, 16, 32]; // Different time scales
      let maxCoherence = 0;
      let bestScale = scales[0];
      
      for (const scale of scales) {
        const coherence = this.calculateScaleCoherence(series1, series2, scale);
        if (coherence > maxCoherence) {
          maxCoherence = coherence;
          bestScale = scale;
        }
      }
      
      // Convert coherence to correlation-like measure
      const correlation = maxCoherence * 2 - 1; // Map [0,1] to [-1,1]
      
      // Calculate significance based on coherence strength and sample size
      const significance = Math.max(0.001, 1 - maxCoherence);
      
      return {
        correlation,
        significance,
        sampleSize: Math.min(series1.values.length, series2.values.length),
        method: `wavelet_coherence_scale_${bestScale}`,
        confidence: Math.min(0.9, maxCoherence * 0.9),
        metadata: {
          variance: this.calculateVariance(series1.values),
          standardDeviation: Math.sqrt(this.calculateVariance(series1.values)),
          meanValue: series1.values.reduce((a, b) => a + b, 0) / series1.values.length,
          timespan: bestScale
        }
      };
      
    } catch (error) {
      console.error('❌ Error in wavelet coherence calculation:', error);
      return {
        correlation: 0,
        significance: 1,
        sampleSize: 0,
        method: 'wavelet_coherence_error',
        confidence: 0,
        metadata: { variance: 0, standardDeviation: 0, meanValue: 0, timespan: 0 }
      };
    }
  }

  // Calculate coherence at a specific scale using simplified wavelet analysis
  private calculateScaleCoherence(series1: TimeSeriesData, series2: TimeSeriesData, scale: number): number {
    if (series1.values.length !== series2.values.length || series1.values.length < scale) {
      return 0;
    }
    
    // Simple moving average as approximation of wavelet smoothing
    const smooth1 = this.movingAverage(series1.values, scale);
    const smooth2 = this.movingAverage(series2.values, scale);
    
    // Calculate cross-correlation of smoothed series
    const { correlation } = this.calculatePearsonCorrelation(smooth1, smooth2);
    
    // Return coherence as absolute correlation
    return Math.abs(correlation);
  }

  // Moving average calculation
  private movingAverage(data: number[], windowSize: number): number[] {
    const result: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
      const window = data.slice(start, end);
      const avg = window.reduce((a, b) => a + b, 0) / window.length;
      result.push(avg);
    }
    
    return result;
  }

  // Fourier analysis for spectral density comparison
  performFourierAnalysis(data: TimeSeriesData): CorrelationResult {
    console.log('📊 Performing Fourier spectral analysis');
    
    try {
      // Simple DFT implementation for spectral analysis
      const N = data.values.length;
      if (N < 4) {
        return {
          correlation: 0,
          significance: 1,
          sampleSize: N,
          method: 'fourier_insufficient_data',
          confidence: 0,
          metadata: { variance: 0, standardDeviation: 0, meanValue: 0, timespan: 0 }
        };
      }
      
      // Calculate power spectral density
      const frequencies: number[] = [];
      const magnitudes: number[] = [];
      
      for (let k = 0; k < N / 2; k++) {
        let realPart = 0;
        let imagPart = 0;
        
        for (let n = 0; n < N; n++) {
          const angle = (2 * Math.PI * k * n) / N;
          realPart += data.values[n] * Math.cos(angle);
          imagPart -= data.values[n] * Math.sin(angle);
        }
        
        const magnitude = Math.sqrt(realPart * realPart + imagPart * imagPart);
        frequencies.push(k / N);
        magnitudes.push(magnitude);
      }
      
      // Find dominant frequency
      let maxMagnitude = 0;
      let dominantFrequency = 0;
      for (let i = 1; i < magnitudes.length; i++) { // Skip DC component
        if (magnitudes[i] > maxMagnitude) {
          maxMagnitude = magnitudes[i];
          dominantFrequency = frequencies[i];
        }
      }
      
      // Calculate spectral characteristics
      const totalPower = magnitudes.reduce((a, b) => a + b * b, 0);
      const spectralCentroid = magnitudes.reduce((sum, mag, i) => sum + mag * frequencies[i], 0) / magnitudes.reduce((a, b) => a + b, 0);
      
      // Convert spectral measures to correlation-like metrics
      const spectralConcentration = maxMagnitude / Math.sqrt(totalPower);
      const correlation = Math.min(1, spectralConcentration) * (dominantFrequency > 0 ? 1 : -1);
      
      const significance = Math.max(0.01, 1 - spectralConcentration);
      
      return {
        correlation,
        significance,
        sampleSize: N,
        method: 'fourier_spectral_analysis',
        confidence: Math.min(0.85, spectralConcentration * 0.8),
        metadata: {
          variance: this.calculateVariance(data.values),
          standardDeviation: Math.sqrt(this.calculateVariance(data.values)),
          meanValue: data.values.reduce((a, b) => a + b, 0) / data.values.length,
          timespan: dominantFrequency
        }
      };
      
    } catch (error) {
      console.error('❌ Error in Fourier analysis:', error);
      return {
        correlation: 0,
        significance: 1,
        sampleSize: 0,
        method: 'fourier_analysis_error',
        confidence: 0,
        metadata: { variance: 0, standardDeviation: 0, meanValue: 0, timespan: 0 }
      };
    }
  }
}

export const realTimeCorrelationEngine = new RealTimeCorrelationEngine();
