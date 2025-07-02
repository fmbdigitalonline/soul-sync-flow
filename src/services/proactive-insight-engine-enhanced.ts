
/**
 * Proactive Insight Engine - Enhanced Implementation
 * Patent Enhancement: Astrological correlation discovery with anticipatory delivery
 */

export interface AstrologicalEvent {
  type: 'transit' | 'aspect' | 'ingress' | 'retrograde';
  planet: string;
  sign?: string;
  house?: number;
  aspect?: string;
  startDate: Date;
  endDate: Date;
  intensity: number;
}

export interface CorrelationWindow {
  eventType: string;
  userPattern: string;
  correlation: number;
  confidence: number;
  windowDays: number;
  occurrences: number;
}

export interface ProactiveInsight {
  id: string;
  content: string;
  anticipationDays: number;
  correlationScore: number;
  personalizedTone: 'gentle' | 'direct' | 'encouraging' | 'analytical';
  deliveryTimestamp: Date;
  feedbackScore?: number;
}

export class ProactiveInsightEngineEnhanced {
  private correlationWindows: CorrelationWindow[] = [];
  private astrologicalEvents: AstrologicalEvent[] = [];
  private userPatterns: Map<string, number[]> = new Map();
  private insightHistory: ProactiveInsight[] = [];
  private confidenceThreshold: number = 0.7;
  private anticipationBuffer: number = 3; // days

  /**
   * Patent Claim Element: External event correlation discovery
   * Uses astrological transits as unique external trigger class
   */
  async analyzeCorrelations(
    userBehaviorData: Array<{ date: Date; mood: number; productivity: number; engagement: number }>,
    astroEvents: AstrologicalEvent[]
  ): Promise<CorrelationWindow[]> {
    this.astrologicalEvents = astroEvents;
    
    const correlations: CorrelationWindow[] = [];
    
    // Sliding window analysis for each event type
    for (const eventType of ['transit', 'retrograde', 'aspect']) {
      const relevantEvents = astroEvents.filter(e => e.type === eventType);
      
      for (const userMetric of ['mood', 'productivity', 'engagement']) {
        const correlation = await this.computeSlidingWindowCorrelation(
          userBehaviorData,
          relevantEvents,
          userMetric
        );
        
        if (correlation.correlation > this.confidenceThreshold) {
          correlations.push(correlation);
          console.log(`🔮 PIE: Found correlation ${eventType} → ${userMetric}: ${correlation.correlation.toFixed(3)}`);
        }
      }
    }
    
    this.correlationWindows = correlations;
    return correlations;
  }

  /**
   * Patent Claim Element: Sliding-window statistics with confidence threshold
   */
  private async computeSlidingWindowCorrelation(
    userData: Array<{ date: Date; mood: number; productivity: number; engagement: number }>,
    events: AstrologicalEvent[],
    metric: string
  ): Promise<CorrelationWindow> {
    const windowSizes = [3, 7, 14, 21]; // days
    let bestCorrelation = 0;
    let bestWindow = 7;
    let occurrenceCount = 0;
    
    for (const windowSize of windowSizes) {
      const { correlation, occurrences } = this.analyzeWindowCorrelation(
        userData,
        events,
        metric,
        windowSize
      );
      
      if (Math.abs(correlation) > Math.abs(bestCorrelation)) {
        bestCorrelation = correlation;
        bestWindow = windowSize;
        occurrenceCount = occurrences;
      }
    }
    
    const confidence = this.calculateConfidence(bestCorrelation, occurrenceCount);
    
    return {
      eventType: events[0]?.type || 'unknown',
      userPattern: metric,
      correlation: bestCorrelation,
      confidence,
      windowDays: bestWindow,
      occurrences: occurrenceCount
    };
  }

  private analyzeWindowCorrelation(
    userData: Array<{ date: Date; mood: number; productivity: number; engagement: number }>,
    events: AstrologicalEvent[],
    metric: string,
    windowDays: number
  ): { correlation: number; occurrences: number } {
    const correlationPairs: Array<{ eventIntensity: number; userValue: number }> = [];
    
    for (const event of events) {
      const eventStart = event.startDate;
      const windowEnd = new Date(eventStart.getTime() + windowDays * 24 * 60 * 60 * 1000);
      
      // Find user data points within the window
      const windowData = userData.filter(d => 
        d.date >= eventStart && d.date <= windowEnd
      );
      
      if (windowData.length > 0) {
        const avgUserValue = windowData.reduce((sum, d) => 
          sum + (d as any)[metric], 0) / windowData.length;
        
        correlationPairs.push({
          eventIntensity: event.intensity,
          userValue: avgUserValue
        });
      }
    }
    
    if (correlationPairs.length < 3) {
      return { correlation: 0, occurrences: correlationPairs.length };
    }
    
    const correlation = this.pearsonCorrelation(
      correlationPairs.map(p => p.eventIntensity),
      correlationPairs.map(p => p.userValue)
    );
    
    return { correlation, occurrences: correlationPairs.length };
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculateConfidence(correlation: number, occurrences: number): number {
    // Confidence based on correlation strength and sample size
    const correlationStrength = Math.abs(correlation);
    const sampleSize = Math.min(occurrences / 10, 1.0); // normalize to 0-1
    
    return (correlationStrength * 0.7) + (sampleSize * 0.3);
  }

  /**
   * Patent Claim Element: Anticipatory delivery before correlated event window
   */
  async generateAnticipatedInsights(
    vfpPersonaVector: number[],
    upcomingEvents: AstrologicalEvent[]
  ): Promise<ProactiveInsight[]> {
    const insights: ProactiveInsight[] = [];
    
    for (const event of upcomingEvents) {
      const relevantCorrelations = this.correlationWindows.filter(c =>
        c.eventType === event.type && c.confidence > this.confidenceThreshold
      );
      
      if (relevantCorrelations.length > 0) {
        const daysUntilEvent = this.daysBetween(new Date(), event.startDate);
        
        if (daysUntilEvent <= 7 && daysUntilEvent >= this.anticipationBuffer) {
          const insight = await this.craftPersonalizedInsight(
            event,
            relevantCorrelations,
            vfpPersonaVector,
            daysUntilEvent
          );
          
          insights.push(insight);
        }
      }
    }
    
    return insights;
  }

  /**
   * Patent Claim Element: Tone templating via VFP-Graph persona vector
   */
  private async craftPersonalizedInsight(
    event: AstrologicalEvent,
    correlations: CorrelationWindow[],
    personaVector: number[],
    daysUntil: number
  ): Promise<ProactiveInsight> {
    // Determine personalized tone from VFP-Graph vector
    const tone = this.determinePersonalizedTone(personaVector);
    
    // Generate insight content based on correlations
    const strongestCorrelation = correlations.reduce((max, c) => 
      Math.abs(c.correlation) > Math.abs(max.correlation) ? c : max
    );
    
    const baseContent = this.generateInsightContent(event, strongestCorrelation);
    const personalizedContent = this.applyTonePersonalization(baseContent, tone);
    
    const insight: ProactiveInsight = {
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: personalizedContent,
      anticipationDays: daysUntil,
      correlationScore: Math.abs(strongestCorrelation.correlation),
      personalizedTone: tone,
      deliveryTimestamp: new Date()
    };
    
    console.log(`🔮 PIE: Generated anticipatory insight (${daysUntil} days ahead): ${tone} tone, ${insight.correlationScore.toFixed(3)} correlation`);
    
    return insight;
  }

  private determinePersonalizedTone(personaVector: number[]): 'gentle' | 'direct' | 'encouraging' | 'analytical' {
    if (personaVector.length === 0) return 'encouraging';
    
    // Map persona dimensions to communication style
    const empathy = personaVector[0] || 0.5;
    const directness = personaVector[1] || 0.5;
    const analytical = personaVector[2] || 0.5;
    const optimism = personaVector[3] || 0.5;
    
    if (analytical > 0.7) return 'analytical';
    if (directness > 0.7) return 'direct';
    if (empathy > 0.7) return 'gentle';
    return 'encouraging';
  }

  private generateInsightContent(event: AstrologicalEvent, correlation: CorrelationWindow): string {
    const eventDescription = this.describeEvent(event);
    const patternDescription = this.describePattern(correlation);
    
    return `Based on your patterns, ${eventDescription} often correlates with ${patternDescription}. This typically occurs ${correlation.windowDays} days around such events.`;
  }

  private applyTonePersonalization(content: string, tone: 'gentle' | 'direct' | 'encouraging' | 'analytical'): string {
    const toneModifiers = {
      gentle: "You might notice that ",
      direct: "Expect that ",
      encouraging: "This could be a great time when ",
      analytical: "Historical data suggests that "
    };
    
    return toneModifiers[tone] + content.toLowerCase();
  }

  private describeEvent(event: AstrologicalEvent): string {
    switch (event.type) {
      case 'transit':
        return `${event.planet} transiting ${event.sign}`;
      case 'retrograde':
        return `${event.planet} retrograde`;
      case 'aspect':
        return `${event.aspect} aspect`;
      default:
        return 'this astrological event';
    }
  }

  private describePattern(correlation: CorrelationWindow): string {
    const direction = correlation.correlation > 0 ? 'increased' : 'decreased';
    return `${direction} ${correlation.userPattern}`;
  }

  /**
   * Patent Claim Element: Feedback loop for notification frequency adjustment
   */
  recordInsightFeedback(insightId: string, wasHelpful: boolean, clickedThrough: boolean): void {
    const insight = this.insightHistory.find(i => i.id === insightId);
    if (insight) {
      insight.feedbackScore = wasHelpful ? (clickedThrough ? 1.0 : 0.7) : 0.2;
      
      // Adjust future notification frequency
      this.adjustNotificationFrequency(insight.personalizedTone, insight.feedbackScore);
      
      console.log(`🎯 PIE Feedback: ${insightId} → ${insight.feedbackScore}, tone: ${insight.personalizedTone}`);
    }
  }

  private adjustNotificationFrequency(tone: string, feedbackScore: number): void {
    // Store tone-specific feedback for frequency adjustment
    const toneKey = `frequency_${tone}`;
    const currentFreq = parseFloat(localStorage.getItem(toneKey) || '1.0');
    
    // Adjust frequency based on feedback
    const adjustment = feedbackScore > 0.6 ? 1.1 : 0.9;
    const newFreq = Math.max(0.1, Math.min(2.0, currentFreq * adjustment));
    
    localStorage.setItem(toneKey, newFreq.toString());
  }

  private daysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getInsightHistory(): ProactiveInsight[] {
    return [...this.insightHistory];
  }

  getCorrelationWindows(): CorrelationWindow[] {
    return [...this.correlationWindows];
  }
}
