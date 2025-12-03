import { pieSchedulingService } from '../pie-scheduling-service';
import { PIE_CONFIDENCE_THRESHOLD } from '@/types/pie-types';

jest.mock('@/integrations/supabase/client', () => {
  const tableData: Record<string, any[]> = {
    pie_predictive_rules: [],
    pie_astrological_events: [],
    conversation_memory: [],
    conversation_threads: [],
    conversation_messages: [],
    message_embeddings: [],
    hot_memory_cache: [],
    user_session_memory: [],
    memory_deltas: [],
    user_blueprints: [],
    hacs_intelligence: [],
    conversation_insights: [],
    pie_insights: [],
    pie_suppressed_events: []
  };

  const inserts: Record<string, any[]> = {
    pie_insights: [],
    pie_suppressed_events: []
  };

  const buildQuery = (table: string) => {
    const chain: any = {
      __resultPromise: Promise.resolve({ data: tableData[table] || [], error: null }),
      select: () => chain,
      eq: () => chain,
      gte: () => {
        chain.__resultPromise = Promise.resolve({ data: tableData[table] || [], error: null });
        return chain;
      },
      lte: () => {
        chain.__resultPromise = Promise.resolve({ data: tableData[table] || [], error: null });
        return chain;
      },
      order: () => {
        chain.__resultPromise = Promise.resolve({ data: tableData[table] || [], error: null });
        return chain;
      },
      limit: () => {
        chain.__resultPromise = Promise.resolve({ data: tableData[table] || [], error: null });
        return chain;
      },
      insert: (payload: any) => {
        (inserts[table] ||= []).push(payload);
        return Promise.resolve({ data: payload, error: null });
      }
    };

    chain.then = (resolve: any, reject: any) => chain.__resultPromise.then(resolve, reject);

    return chain;
  };

  return {
    supabase: {
      from: (table: string) => buildQuery(table)
    },
    __tableData: tableData,
    __inserts: inserts
  };
});

jest.mock('../pie-insight-generation-service', () => ({
  pieInsightGenerationService: {
    generateInsight: jest.fn(async (rule, event) => ({
      id: `${rule.id}-${event.id}`,
      userId: rule.userId,
      patternId: 'pattern-1',
      predictiveRuleId: rule.id,
      title: `Insight for ${event.eventType}`,
      message: 'Scheduled from conversational trigger',
      insightType: 'awareness',
      priority: 'medium',
      triggerEvent: event.eventType,
      triggerTime: event.startTime,
      deliveryTime: event.startTime,
      expirationTime: event.endTime || event.startTime,
      confidence: rule.confidence,
      delivered: false,
      acknowledged: false,
      communicationStyle: 'balanced',
      personalizedForBlueprint: false
    }))
  }
}));

describe('PIE Scheduling Service conversational triggers', () => {
  const { __tableData, __inserts } = jest.requireMock('@/integrations/supabase/client');

  beforeEach(async () => {
    Object.keys(__tableData).forEach(key => { __tableData[key] = []; });
    Object.keys(__inserts).forEach(key => { __inserts[key] = []; });
    __tableData.pie_predictive_rules.push(
      {
        id: 'rule-strong',
        user_id: 'user-1',
        event_type: 'conversation_memory',
        direction: 'positive',
        magnitude: 0.9,
        confidence: PIE_CONFIDENCE_THRESHOLD + 0.1,
        window_hours: 24,
        minimum_occurrences: 1,
        user_data_types: []
      },
      {
        id: 'rule-weak',
        user_id: 'user-1',
        event_type: 'conversation_memory',
        direction: 'neutral',
        magnitude: 0.2,
        confidence: PIE_CONFIDENCE_THRESHOLD - 0.2,
        window_hours: 24,
        minimum_occurrences: 1,
        user_data_types: []
      }
    );

    __tableData.conversation_memory.push({
      id: 'mem-1',
      user_id: 'user-1',
      memory_type: 'conversation_memory',
      created_at: new Date().toISOString(),
      relevance_score: 0.8,
      description: 'Recent intense dialogue'
    });

    await pieSchedulingService.initialize('user-1');
  });

  test('schedules insights from conversational data when astrological events are empty', async () => {
    await pieSchedulingService.scheduleInsights();

    expect(__inserts.pie_insights.length).toBe(1);
    expect(__inserts.pie_insights[0].trigger_event).toBe('conversation_memory');
    expect(__inserts.pie_insights[0].user_id).toBe('user-1');
  });

  test('logs suppressed events for low-confidence rules derived from conversations', async () => {
    await pieSchedulingService.scheduleInsights();

    expect(__inserts.pie_suppressed_events.length).toBe(1);
    expect(__inserts.pie_suppressed_events[0].suppression_reason).toBe('confidence_too_low');
    expect(pieSchedulingService.getSuppressedEventsAudit().length).toBeGreaterThan(0);
  });
});
