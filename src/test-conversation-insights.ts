// Test script to verify conversation insights pipeline
import { SmartInsightController } from './services/smart-insight-controller';

export async function testConversationInsightsPipeline(userId: string) {
  console.log('🧪 Testing Conversation Insights Pipeline...');
  console.log('User ID:', userId);
  
  try {
    // Test 1: Check if user can receive conversation insights
    const canReceiveConversation = SmartInsightController.canDeliverConversationInsight(userId);
    console.log('✅ Can deliver conversation insights:', canReceiveConversation);
    
    // Test 2: Check if user can receive analytical insights
    const canReceiveAnalytical = SmartInsightController.canDeliverAnalyticalInsight(userId);
    console.log('✅ Can deliver analytical insights:', canReceiveAnalytical);
    
    // Test 3: Check data sufficiency for analytics
    const hasSufficientData = await SmartInsightController.hasSufficientDataForAnalytics(userId);
    console.log('✅ Has sufficient data for analytics:', hasSufficientData);
    
    // Test 4: Generate conversation insights
    console.log('🎯 Generating conversation insights...');
    const conversationInsights = await SmartInsightController.generateConversationInsights(userId);
    console.log('✅ Generated conversation insights:', conversationInsights.length);
    
    if (conversationInsights.length > 0) {
      console.log('📋 Sample insights:');
      conversationInsights.forEach((insight, index) => {
        console.log(`${index + 1}. ${insight.title} (${insight.type}, confidence: ${insight.confidence})`);
        console.log(`   Message: ${insight.message.substring(0, 100)}...`);
        console.log(`   Priority: ${insight.priority}`);
      });
    } else {
      console.log('❌ No conversation insights generated');
    }
    
    // Test 5: Track activity and simulate user returning
    console.log('🚶 Simulating user activity tracking...');
    SmartInsightController.trackUserActivity(userId, 'conversation');
    SmartInsightController.trackUserActivity(userId, 'app_close');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 100));
    
    SmartInsightController.trackUserActivity(userId, 'app_open');
    const userReturned = SmartInsightController.userReturnedAfterLeaving(userId);
    console.log('✅ User returned after leaving:', userReturned);
    
    // Test 6: Get insight stats
    const stats = SmartInsightController.getInsightStats(userId);
    console.log('✅ Insight delivery stats:', stats);
    
    console.log('🎉 Conversation Insights Pipeline Test Complete!');
    return {
      canReceiveConversation,
      canReceiveAnalytical,
      hasSufficientData,
      conversationInsightsCount: conversationInsights.length,
      conversationInsights,
      userReturned,
      stats
    };
    
  } catch (error) {
    console.error('🚨 Pipeline test failed:', error);
    throw error;
  }
}

// Auto-run test if directly executed
if (typeof window !== 'undefined') {
  // Browser environment - can run test
  const userId = '465f1c5a-9054-478e-8337-d940072e0326'; // Current user ID from logs
  testConversationInsightsPipeline(userId).then(results => {
    console.log('🎯 Final test results:', results);
  }).catch(error => {
    console.error('❌ Test execution failed:', error);
  });
}