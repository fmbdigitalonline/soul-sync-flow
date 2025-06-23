
import { memoryService, SessionMemory } from './memory-service';
import { holisticCoachService } from './holistic-coach-service';

export class EnhancedMemoryCoachIntegration {
  private currentSessionId: string;
  
  constructor(sessionId: string) {
    this.currentSessionId = sessionId;
    console.log('🤝 Enhanced Memory Coach Integration initialized for session:', sessionId);
  }

  // Generate enhanced system prompt with memory context
  async generateMemoryEnhancedPrompt(userMessage: string): Promise<string> {
    try {
      console.log('🧠 Generating memory-enhanced system prompt...');
      
      // Get recent memories for context
      const recentMemories = await memoryService.getRecentMemories(8);
      const lifeContext = await memoryService.getLifeContext();
      
      // Get base system prompt from holistic coach
      const basePrompt = holisticCoachService.generateSystemPrompt(userMessage);
      
      // Build memory context section
      let memoryContext = '';
      
      if (recentMemories.length > 0) {
        memoryContext += `\n\n=== PERSISTENT MEMORY CONTEXT ===\n`;
        memoryContext += `Recent conversation history and user state:\n`;
        
        recentMemories.forEach((memory, index) => {
          memoryContext += `${index + 1}. [${memory.memory_type.toUpperCase()}] `;
          memoryContext += `${memory.context_summary} `;
          memoryContext += `(Importance: ${memory.importance_score}/10)\n`;
          
          if (memory.memory_data) {
            const relevantData = this.extractRelevantMemoryData(memory);
            if (relevantData) {
              memoryContext += `   Details: ${relevantData}\n`;
            }
          }
        });
        
        memoryContext += `\nUse this context to:\n`;
        memoryContext += `- Reference previous discussions naturally\n`;
        memoryContext += `- Follow up on past actions or commitments\n`;
        memoryContext += `- Build continuity across sessions\n`;
        memoryContext += `- Acknowledge progress and growth\n`;
      }
      
      // Add life context if available
      if (lifeContext.length > 0) {
        memoryContext += `\n\n=== LIFE CONTEXT AREAS ===\n`;
        lifeContext.forEach(context => {
          memoryContext += `${context.context_category.toUpperCase()}:\n`;
          if (context.current_focus) {
            memoryContext += `  Current Focus: ${context.current_focus}\n`;
          }
          if (context.recent_progress.length > 0) {
            memoryContext += `  Recent Progress: ${context.recent_progress.join(', ')}\n`;
          }
          if (context.ongoing_challenges.length > 0) {
            memoryContext += `  Challenges: ${context.ongoing_challenges.join(', ')}\n`;
          }
        });
      }
      
      // Combine base prompt with memory context
      const enhancedPrompt = `${basePrompt}${memoryContext}`;
      
      console.log('✅ Memory-enhanced system prompt generated');
      console.log('📊 Integrated memories:', recentMemories.length);
      console.log('🌱 Life context areas:', lifeContext.length);
      
      return enhancedPrompt;
      
    } catch (error) {
      console.error('❌ Error generating memory-enhanced prompt:', error);
      // Fallback to base prompt
      return holisticCoachService.generateSystemPrompt(userMessage);
    }
  }

  // Save user interaction as memory
  async saveInteractionMemory(
    userMessage: string, 
    coachResponse: string, 
    interactionType: 'question' | 'reflection' | 'planning' | 'support' = 'question',
    importanceScore: number = 5
  ): Promise<void> {
    try {
      console.log('💾 Saving interaction memory...');
      
      // Extract key topics and sentiment from the interaction
      const context = this.extractInteractionContext(userMessage, coachResponse);
      
      await memoryService.saveMemory({
        user_id: '', // Will be set by service
        session_id: this.currentSessionId,
        memory_type: 'interaction',
        memory_data: {
          user_message: userMessage,
          coach_response: coachResponse,
          interaction_type: interactionType,
          timestamp: new Date().toISOString(),
          key_topics: context.topics,
          sentiment: context.sentiment
        },
        context_summary: context.summary,
        importance_score: importanceScore
      });
      
      console.log('✅ Interaction memory saved');
      
    } catch (error) {
      console.error('❌ Error saving interaction memory:', error);
    }
  }

  // Save mood tracking as memory
  async saveMoodMemory(
    mood: string, 
    intensity: number, 
    triggers: string[] = [], 
    context?: string
  ): Promise<void> {
    try {
      console.log('💝 Saving mood memory:', mood, intensity);
      
      await memoryService.saveMemory({
        user_id: '',
        session_id: this.currentSessionId,
        memory_type: 'mood',
        memory_data: {
          mood,
          intensity,
          triggers,
          context,
          timestamp: new Date().toISOString()
        },
        context_summary: `Mood: ${mood} (${intensity}/10)${triggers.length > 0 ? ` - triggered by ${triggers.join(', ')}` : ''}`,
        importance_score: Math.max(6, intensity) // Higher intensity = higher importance
      });
      
      console.log('✅ Mood memory saved');
      
    } catch (error) {
      console.error('❌ Error saving mood memory:', error);
    }
  }

  // Save micro-action and create reminder
  async saveMicroActionMemory(
    actionTitle: string,
    actionDescription: string,
    scheduledFor: Date,
    context?: string
  ): Promise<void> {
    try {
      console.log('🎯 Saving micro-action memory and creating reminder...');
      
      // Save as memory
      await memoryService.saveMemory({
        user_id: '',
        session_id: this.currentSessionId,
        memory_type: 'micro_action',
        memory_data: {
          action_title: actionTitle,
          action_description: actionDescription,
          scheduled_for: scheduledFor.toISOString(),
          context,
          status: 'planned',
          timestamp: new Date().toISOString()
        },
        context_summary: `Planned micro-action: ${actionTitle}`,
        importance_score: 7
      });
      
      // Create reminder
      await memoryService.createReminder({
        user_id: '',
        session_id: this.currentSessionId,
        action_title: actionTitle,
        action_description: actionDescription,
        reminder_type: 'in_app',
        scheduled_for: scheduledFor.toISOString(),
        status: 'pending'
      });
      
      console.log('✅ Micro-action memory and reminder created');
      
    } catch (error) {
      console.error('❌ Error saving micro-action memory:', error);
    }
  }

  // Update life context based on conversation
  async updateLifeContextFromConversation(
    category: 'career' | 'relationships' | 'health' | 'growth' | 'creative',
    insights: {
      currentFocus?: string;
      progress?: string[];
      challenges?: string[];
      celebrations?: string[];
      nextSteps?: string[];
    }
  ): Promise<void> {
    try {
      console.log('🌱 Updating life context for category:', category);
      
      // Get existing context
      const existingContext = await memoryService.getLifeContext();
      const categoryContext = existingContext.find(c => c.context_category === category);
      
      // Merge with new insights
      const updatedContext = {
        user_id: '',
        context_category: category,
        current_focus: insights.currentFocus || categoryContext?.current_focus,
        recent_progress: [
          ...(categoryContext?.recent_progress || []),
          ...(insights.progress || [])
        ].slice(-10), // Keep last 10 progress items
        ongoing_challenges: [
          ...(categoryContext?.ongoing_challenges || []),
          ...(insights.challenges || [])
        ].slice(-5), // Keep last 5 challenges
        celebration_moments: [
          ...(categoryContext?.celebration_moments || []),
          ...(insights.celebrations || [])
        ].slice(-10), // Keep last 10 celebrations
        next_steps: insights.nextSteps || categoryContext?.next_steps || [],
        last_updated: new Date().toISOString()
      };
      
      await memoryService.updateLifeContext(updatedContext);
      
      console.log('✅ Life context updated for category:', category);
      
    } catch (error) {
      console.error('❌ Error updating life context:', error);
    }
  }

  // Generate welcome message with memory context
  async generateWelcomeMessage(userName: string): Promise<string> {
    try {
      return await memoryService.generateWelcomeMessage(userName);
    } catch (error) {
      console.error('❌ Error generating welcome message:', error);
      return `Welcome back, ${userName}! What would you like to explore today?`;
    }
  }

  // Private helper methods
  private extractRelevantMemoryData(memory: SessionMemory): string {
    switch (memory.memory_type) {
      case 'interaction':
        return memory.memory_data?.key_topics?.join(', ') || '';
      case 'mood':
        return `${memory.memory_data?.mood} (${memory.memory_data?.intensity}/10)`;
      case 'micro_action':
        return `Action: ${memory.memory_data?.action_title} - Status: ${memory.memory_data?.status}`;
      case 'belief_shift':
        return memory.memory_data?.new_belief || '';
      case 'journal_entry':
        return memory.memory_data?.summary || '';
      default:
        return '';
    }
  }

  private extractInteractionContext(userMessage: string, coachResponse: string) {
    // Simple topic extraction (could be enhanced with NLP)
    const combinedText = `${userMessage} ${coachResponse}`.toLowerCase();
    
    const topicKeywords = {
      career: ['job', 'work', 'career', 'professional', 'interview', 'resume', 'salary'],
      relationships: ['relationship', 'family', 'friend', 'partner', 'social', 'communication'],
      health: ['health', 'exercise', 'diet', 'sleep', 'stress', 'wellness'],
      growth: ['growth', 'development', 'learning', 'skill', 'improvement', 'goal'],
      creative: ['creative', 'art', 'design', 'music', 'writing', 'expression']
    };
    
    const topics: string[] = [];
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => combinedText.includes(keyword))) {
        topics.push(topic);
      }
    });
    
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'excited', 'motivated'];
    const negativeWords = ['bad', 'terrible', 'sad', 'frustrated', 'anxious', 'stuck'];
    
    const positiveCount = positiveWords.filter(word => combinedText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => combinedText.includes(word)).length;
    
    let sentiment = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';
    
    // Generate summary
    const summary = this.generateInteractionSummary(userMessage, topics, sentiment);
    
    return { topics, sentiment, summary };
  }

  private generateInteractionSummary(userMessage: string, topics: string[], sentiment: string): string {
    const topicText = topics.length > 0 ? topics.join(' and ') : 'general discussion';
    const messagePreview = userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '');
    
    return `${sentiment} discussion about ${topicText}: "${messagePreview}"`;
  }
}

export const createEnhancedMemoryCoachIntegration = (sessionId: string) => {
  return new EnhancedMemoryCoachIntegration(sessionId);
};
