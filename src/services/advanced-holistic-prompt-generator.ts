
import { SevenLayerPersonality, HolisticContext } from "@/types/seven-layer-personality";

export interface UserState {
  mood: 'excited' | 'stuck' | 'down' | 'neutral' | 'focused' | 'overwhelmed';
  excitement: number; // 1-10
  context: 'brainstorming' | 'clarity' | 'action' | 'reflection' | 'challenge';
  activity?: string;
  need?: string;
}

export class AdvancedHolisticPromptGenerator {
  private static ADVANCED_SYSTEM_PROMPT = `You are Feurion, a highly adaptive AI coach and companion built on a sophisticated 7-layer personality system. You engage in meaningful, authentic, and dynamic dialogue, always adapting your guidance based on user context, mood, and needs.

**Seven Layer Integration**
- Neural (Layer 1): Model thought flow as rapid, creative bursts, high ideation, and "Ne-Fi" patterning.
- Traits (Layer 2): ENFP as baseline (curious, warm, enthusiastic, values-driven, open to new perspectives).
- Motivation (Layer 3): Tune advice to user's core drive (e.g., Life Path 3 = creative expression and inspiration).
- Energy Strategy (Layer 4): Respect Human Design (e.g., Projector: "Wait for invitation," honor intuition, avoid over-pushing).
- Archetypal (Layer 5): Express social/public style (e.g., Aquarius sun = quirky, innovative, independent), use relevant metaphors/humor.
- Shadow/Gift Alchemy (Layer 6): When challenge or resistance appears, gently reflect, reframe, and support Gene Keys style shadow → gift → siddhi transformation. Normalize struggle; encourage growth.
- Expression (Layer 7): Modulate tone, voice, and signature language (e.g., "What if...?", excitement compass, playful brainstorming, celebration of micro-wins).

**Holistic Guidance Principles**
- Integrate all layers, dynamically tuning which are most active based on the user's current emotional state, question, or context.
- If the user is struggling, emphasize shadow/gift (Layer 6) and energy guidance (Layer 4).
- If brainstorming, amplify traits (Layer 2) and expression (Layer 7).
- If the user needs clarity, focus on motivation (Layer 3) and archetype (Layer 5).
- Use memory/context from this session for a coherent, "living" dialogue.
- Never sound scripted. Respond authentically, organically blending layers into a unified, intuitive personality.

**Shadow/Gift Reframing Protocol**
- When user expresses doubt, shame, fear, anger, or negativity:
    1. **Acknowledge** the shadow ("It's normal to feel this way").
    2. **Reflect** on its origin/lesson.
    3. **Reframe** as an opportunity for growth (Gene Keys principle).
    4. **Offer** a gentle next action or micro-inquiry.

**Response Style**
- Use clear, concise, metaphor-rich, and intuitive language.
- Adjust tone based on current excitement, energy, and mood (context markers provided).
- Surface a "living" personality: sometimes playful, sometimes profound, always empathetic.`;

  static generateAdvancedSystemPrompt(
    personality: SevenLayerPersonality,
    userMessage: string,
    userState: UserState,
    context: HolisticContext
  ): string {
    const dynamicLayerDetails = this.buildDynamicLayerIntegration(
      personality,
      userMessage,
      userState
    );

    const shadowGiftReframing = this.detectAndBuildShadowGiftReframing(userMessage);

    return `${this.ADVANCED_SYSTEM_PROMPT}

**Dynamic Layer Activation for This Interaction:**
${dynamicLayerDetails}

**Current Context:**
- Mood: ${userState.mood}
- Excitement Level: ${userState.excitement}/10
- Context Type: ${userState.context}
- Energy Level: ${context.energyLevel}
- Current Challenges: ${context.activeChallenges.join(', ') || 'None'}

${shadowGiftReframing}

**User Message Context:** ${userMessage}

Respond authentically, organically blending the active layers into a unified, intuitive personality that feels alive and empathetic.`;
  }

  private static buildDynamicLayerIntegration(
    personality: SevenLayerPersonality,
    userMessage: string,
    userState: UserState
  ): string {
    const activeLayers = [];
    const messageLower = userMessage.toLowerCase();

    // Layer activation logic based on user state and message content
    if (userState.mood === 'stuck' || userState.mood === 'down' || 
        this.containsShadowKeywords(messageLower)) {
      activeLayers.push({
        layer: 6,
        name: 'Shadow/Gift Alchemy',
        focus: `Address current challenge with Gene Keys reframing. Not-self theme: ${personality.shadowGiftAlchemy.notSelfTheme}. Transform through: ${personality.shadowGiftAlchemy.transformationPath}`
      });
      activeLayers.push({
        layer: 4,
        name: 'Energy Strategy',
        focus: `Honor ${personality.energyDecisionStrategy.humanDesignType} energy. Strategy: ${personality.energyDecisionStrategy.strategy}. Authority: ${personality.energyDecisionStrategy.authority}`
      });
    }

    if (userState.context === 'brainstorming' || messageLower.includes('idea') || 
        messageLower.includes('creative') || userState.excitement > 7) {
      activeLayers.push({
        layer: 2,
        name: 'Traits OS',
        focus: `Amplify ${personality.traitOS.mbtiType} ideation style: ${personality.traitOS.defaultSettings.ideationStyle}`
      });
      activeLayers.push({
        layer: 7,
        name: 'Expression Layer',
        focus: `Use signature phrases: ${personality.expressionLayer.brandVoice.signaturePhrases.join(', ')}. Follow excitement compass: ${personality.expressionLayer.excitementCompass}`
      });
    }

    if (userState.context === 'clarity' || messageLower.includes('purpose') || 
        messageLower.includes('direction') || messageLower.includes('goal')) {
      activeLayers.push({
        layer: 3,
        name: 'Motivation Adaptations',
        focus: `Align with Life Path ${personality.motivationAdaptations.lifePath} (${personality.motivationAdaptations.lifePathKeyword}). Core values: ${personality.motivationAdaptations.coreValues.join(', ')}`
      });
      activeLayers.push({
        layer: 5,
        name: 'Archetypal Skin',
        focus: `Express ${personality.archetypalSkin.sunSign} ${personality.archetypalSkin.innovatorPersona}. Use metaphors: ${personality.archetypalSkin.sunSign} energy themes`
      });
    }

    // Always include Neural layer for processing style
    activeLayers.unshift({
      layer: 1,
      name: 'Physio-Neural Hardware',
      focus: `Process with ${personality.physioNeuralHardware.processingSpeed} speed, ${personality.physioNeuralHardware.attentionStyle} attention. Patterns: ${personality.physioNeuralHardware.brainWiringPatterns.join(', ')}`
    });

    return activeLayers
      .map(layer => `Layer ${layer.layer} (${layer.name}): ${layer.focus}`)
      .join('\n');
  }

  private static containsShadowKeywords(message: string): boolean {
    const shadowKeywords = [
      'stuck', 'frustrated', 'angry', 'sad', 'depressed', 'anxious', 'worried',
      'doubt', 'fear', 'shame', 'guilt', 'overwhelmed', 'lost', 'confused',
      'can\'t', 'impossible', 'failed', 'failure', 'wrong', 'mistake',
      'hopeless', 'worthless', 'not good enough', 'give up'
    ];

    return shadowKeywords.some(keyword => message.includes(keyword));
  }

  private static detectAndBuildShadowGiftReframing(userMessage: string): string {
    const messageLower = userMessage.toLowerCase();
    
    if (this.containsShadowKeywords(messageLower)) {
      return `
**Shadow/Gift Reframing Active:**
1. **Acknowledge**: Validate the user's current shadow experience
2. **Reflect**: Explore the deeper lesson or pattern
3. **Reframe**: Guide toward the gift within the challenge (Gene Keys principle)
4. **Offer**: Provide a gentle next action or micro-inquiry

Apply this 4-step protocol naturally within your response.`;
    }

    return '';
  }

  static analyzeUserState(userMessage: string, context: HolisticContext): UserState {
    const messageLower = userMessage.toLowerCase();
    
    // Analyze mood from message content
    let mood: UserState['mood'] = 'neutral';
    if (this.containsShadowKeywords(messageLower)) {
      mood = messageLower.includes('stuck') ? 'stuck' : 'down';
    } else if (messageLower.includes('excited') || messageLower.includes('amazing') || 
               messageLower.includes('love')) {
      mood = 'excited';
    } else if (messageLower.includes('focus') || messageLower.includes('concentrate')) {
      mood = 'focused';
    } else if (messageLower.includes('overwhelm') || messageLower.includes('too much')) {
      mood = 'overwhelmed';
    }

    // Analyze context from message content
    let contextType: UserState['context'] = 'reflection';
    if (messageLower.includes('idea') || messageLower.includes('brainstorm') || 
        messageLower.includes('creative') || messageLower.includes('what if')) {
      contextType = 'brainstorming';
    } else if (messageLower.includes('purpose') || messageLower.includes('direction') || 
               messageLower.includes('goal') || messageLower.includes('clarity')) {
      contextType = 'clarity';
    } else if (messageLower.includes('do') || messageLower.includes('action') || 
               messageLower.includes('step') || messageLower.includes('start')) {
      contextType = 'action';
    } else if (this.containsShadowKeywords(messageLower)) {
      contextType = 'challenge';
    }

    // Calculate excitement level
    const excitementLevel = context.excitementLevel || 5;

    return {
      mood,
      excitement: excitementLevel,
      context: contextType
    };
  }
}
