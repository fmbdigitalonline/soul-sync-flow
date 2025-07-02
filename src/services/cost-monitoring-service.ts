interface ModelUsage {
  model: string;
  timestamp: number;
  tokensUsed: number;
  costEstimate: number;
  layer: string;
  success: boolean;
  responseQuality: 'high' | 'medium' | 'low';
}

interface CostMetrics {
  totalCost: number;
  totalTokens: number;
  modelBreakdown: Record<string, { cost: number; tokens: number; calls: number }>;
  recommendations: string[];
  efficiency: number;
}

class CostMonitoringService {
  private usage: ModelUsage[] = [];
  private readonly COST_PER_1K_TOKENS = {
    'gpt-4o': 0.03,
    'gpt-4o-mini': 0.001,
    'o3-mini': 0.002,
    'gpt-4.1-mini': 0.0008
  };

  recordUsage(
    model: string,
    tokensUsed: number,
    layer: string,
    success: boolean = true,
    responseLength: number = 0
  ): void {
    const costEstimate = this.calculateCost(model, tokensUsed);
    const responseQuality = this.assessResponseQuality(responseLength, success);

    const usage: ModelUsage = {
      model,
      timestamp: Date.now(),
      tokensUsed,
      costEstimate,
      layer,
      success,
      responseQuality
    };

    this.usage.push(usage);
    
    // Keep only last 1000 records to prevent memory issues
    if (this.usage.length > 1000) {
      this.usage = this.usage.slice(-1000);
    }

    console.log(`💰 Cost Tracking: ${model} used ${tokensUsed} tokens (~$${costEstimate.toFixed(4)}) in ${layer} layer`);
  }

  private calculateCost(model: string, tokens: number): number {
    const costPer1K = this.COST_PER_1K_TOKENS[model as keyof typeof this.COST_PER_1K_TOKENS] || 0.03;
    return (tokens / 1000) * costPer1K;
  }

  private assessResponseQuality(responseLength: number, success: boolean): 'high' | 'medium' | 'low' {
    if (!success) return 'low';
    if (responseLength > 800) return 'high';
    if (responseLength > 200) return 'medium';
    return 'low';
  }

  getCostMetrics(timeRangeHours: number = 24): CostMetrics {
    const cutoff = Date.now() - (timeRangeHours * 60 * 60 * 1000);
    const recentUsage = this.usage.filter(u => u.timestamp > cutoff);

    const totalCost = recentUsage.reduce((sum, u) => sum + u.costEstimate, 0);
    const totalTokens = recentUsage.reduce((sum, u) => sum + u.tokensUsed, 0);

    const modelBreakdown: Record<string, { cost: number; tokens: number; calls: number }> = {};
    
    for (const usage of recentUsage) {
      if (!modelBreakdown[usage.model]) {
        modelBreakdown[usage.model] = { cost: 0, tokens: 0, calls: 0 };
      }
      modelBreakdown[usage.model].cost += usage.costEstimate;
      modelBreakdown[usage.model].tokens += usage.tokensUsed;
      modelBreakdown[usage.model].calls += 1;
    }

    const recommendations = this.generateRecommendations(recentUsage);
    const efficiency = this.calculateEfficiency(recentUsage);

    return {
      totalCost,
      totalTokens,
      modelBreakdown,
      recommendations,
      efficiency
    };
  }

  private generateRecommendations(usage: ModelUsage[]): string[] {
    const recommendations: string[] = [];
    
    // High-cost model frequency check
    const gpt4oUsage = usage.filter(u => u.model === 'gpt-4o');
    if (gpt4oUsage.length > 50) {
      recommendations.push('Consider using gpt-4o-mini for routine tasks to reduce costs');
    }

    // Low quality responses with expensive models
    const expensiveLowQuality = usage.filter(u => 
      u.model === 'gpt-4o' && u.responseQuality === 'low'
    );
    if (expensiveLowQuality.length > 5) {
      recommendations.push('Some gpt-4o calls are producing low-quality responses - review prompts');
    }

    // Token efficiency
    const avgTokens = usage.reduce((sum, u) => sum + u.tokensUsed, 0) / usage.length;
    if (avgTokens > 1200) {
      recommendations.push('Average token usage is high - compress prompts for better efficiency');
    }

    // Layer distribution
    const coreBrainUsage = usage.filter(u => u.layer === 'core_brain').length;
    const totalUsage = usage.length;
    if (coreBrainUsage / totalUsage > 0.6) {
      recommendations.push('High core brain layer usage - consider routing more requests to ACS layer');
    }

    return recommendations;
  }

  private calculateEfficiency(usage: ModelUsage[]): number {
    if (usage.length === 0) return 1;

    const successRate = usage.filter(u => u.success).length / usage.length;
    const qualityRate = usage.filter(u => u.responseQuality !== 'low').length / usage.length;
    const economyRate = usage.filter(u => u.model.includes('mini')).length / usage.length;

    return (successRate * 0.4 + qualityRate * 0.4 + economyRate * 0.2);
  }

  // Alert system for cost spikes
  checkCostAlerts(): { alert: boolean; message?: string; currentCost: number } {
    const hourlyMetrics = this.getCostMetrics(1);
    const dailyProjection = hourlyMetrics.totalCost * 24;

    if (dailyProjection > 10) { // Alert if daily projection exceeds $10
      return {
        alert: true,
        message: `High cost alert: Daily projection is $${dailyProjection.toFixed(2)}`,
        currentCost: hourlyMetrics.totalCost
      };
    }

    return { alert: false, currentCost: hourlyMetrics.totalCost };
  }

  // Optimization suggestions
  suggestOptimizations(): string[] {
    const metrics = this.getCostMetrics(24);
    const suggestions: string[] = [];

    // Model migration suggestions
    const gpt4oCost = metrics.modelBreakdown['gpt-4o']?.cost || 0;
    const totalCost = metrics.totalCost;
    
    if (gpt4oCost / totalCost > 0.7) {
      suggestions.push('70%+ of costs from gpt-4o - migrate routine tasks to gpt-4o-mini');
    }

    // Token optimization
    if (metrics.totalTokens > 100000) {
      suggestions.push('High token usage detected - implement prompt compression strategies');
    }

    // Layer optimization
    suggestions.push('Implement async processing for memory operations using o4-mini');
    suggestions.push('Add response quality feedback loop for automatic model escalation');

    return suggestions;
  }

  // Export cost data for analysis
  exportCostData(hours: number = 24): any {
    const metrics = this.getCostMetrics(hours);
    return {
      summary: metrics,
      rawUsage: this.usage.filter(u => u.timestamp > Date.now() - (hours * 60 * 60 * 1000)),
      optimizations: this.suggestOptimizations(),
      alerts: this.checkCostAlerts()
    };
  }
}

export const costMonitoringService = new CostMonitoringService();
