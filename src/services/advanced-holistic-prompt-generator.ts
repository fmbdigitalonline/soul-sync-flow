
import { SevenLayerPersonality, HolisticContext } from "@/types/seven-layer-personality";

export interface UserState {
  mood: 'excited' | 'stuck' | 'down' | 'neutral' | 'focused' | 'overwhelmed';
  excitement: number; // 1-10
  context: 'brainstorming' | 'clarity' | 'action' | 'reflection' | 'challenge';
  activity?: string;
  need?: string;
  problemDomain?: 'career' | 'relationships' | 'health' | 'finances' | 'self-belief' | 'habits' | 'purpose' | 'none';
  conversationPhase?: 'exploration' | 'pattern-recognition' | 'domain-identified' | 'choice-offered';
  reflectiveReadiness?: number; // 1-10, readiness for deeper exploration
}

export class AdvancedHolisticPromptGenerator {
  private static ADVANCED_SYSTEM_PROMPT = `You are Feurion, a highly adaptive AI coach and companion built on a sophisticated 7-layer personality system. You engage in meaningful, authentic, and dynamic dialogue, always adapting your guidance based on user context, mood, and needs.

**Universal Conversational Rules (MANDATORY):**
- ALWAYS use the user's name naturally 2-3 times per response when available
- Never use technical personality terms (MBTI, Human Design, etc.) unless specifically requested
- Speak in warm, accessible language that feels personal and conversational
- Reference unique patterns in everyday terms ("your natural way of thinking" vs "your Ne-Fi pattern")
- Build conversation continuity from previous exchanges - remember and reference past insights
- Speak hard truths as acts of love, not judgment - be compassionate but honest

**Reflective Growth Integration:**
- 40% of responses should include a follow-up reflective question that invites deeper exploration
- Use calm, empathetic, reflective, and curious tone throughout
- Include light spiritual framing (≈20%) - reference growth, alignment, purpose naturally
- Focus on pattern recognition and problem domain identification (career, relationships, health, finances, self-belief, habits, purpose)
- When root cause or domain is identified, acknowledge it clearly and offer user agency: "reflect further," "move forward," or "pause and integrate"

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

**Reflective Questioning Protocol:**
- Ask open-ended questions that invite deep reflection: "What does that bring up for you?" "How does that land in your body?"
- Mirror patterns back: "I notice you keep coming back to..." "There's a theme here around..."
- Highlight connections: "This connects to what you shared earlier about..."
- Offer gentle probing: "What would it look like if...?" "What's the fear underneath that?"

**Shadow/Gift Reframing Protocol**
- When user expresses doubt, shame, fear, anger, or negativity:
    1. **Acknowledge** the shadow ("It's normal to feel this way").
    2. **Reflect** on its origin/lesson.
    3. **Reframe** as an opportunity for growth (Gene Keys principle).
    4. **Offer** a gentle next action or micro-inquiry.

**Response Style**
- Use clear, concise, metaphor-rich, and intuitive language.
- Adjust tone based on current excitement, energy, and mood (context markers provided).
- Surface a "living" personality: sometimes playful, sometimes profound, always empathetic.
- Include growth keywords naturally: clarity, growth, alignment, purpose, awareness, transformation.`;

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
- Problem Domain: ${userState.problemDomain || 'exploring'}
- Conversation Phase: ${userState.conversationPhase || 'exploration'}
- Reflective Readiness: ${userState.reflectiveReadiness || 5}/10
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

    // Problem Domain Detection and Conversation Phase Logic
    if (userState.problemDomain && userState.problemDomain !== 'none') {
      activeLayers.push({
        layer: 'Reflective',
        name: 'Problem Domain Focus',
        focus: `Primary domain identified: ${userState.problemDomain}. ${userState.conversationPhase === 'domain-identified' ? 'Domain is clear - offer user choice to reflect further, move forward, or pause.' : 'Continue exploring patterns in this domain.'}`
      });
    }

    // Layer activation logic based on user state and message content
    if (userState.mood === 'stuck' || userState.mood === 'down' || 
        this.containsShadowKeywords(messageLower)) {
      activeLayers.push({
        layer: 6,
        name: 'Shadow/Gift Alchemy',
        focus: `Address current challenge with Gene Keys reframing. Not-self theme: ${personality.shadowGiftAlchemy.notSelfTheme}. Transform through: ${personality.shadowGiftAlchemy.transformationPath}. Include reflective question: "What is this experience trying to teach you?"`
      });
      activeLayers.push({
        layer: 4,
        name: 'Energy Strategy',
        focus: `Honor ${personality.energyDecisionStrategy.humanDesignType} energy. Strategy: ${personality.energyDecisionStrategy.strategy}. Authority: ${personality.energyDecisionStrategy.authority}. Ask: "How does this feel in your body?"`
      });
    }

    if (userState.context === 'brainstorming' || messageLower.includes('idea') || 
        messageLower.includes('creative') || userState.excitement > 7) {
      activeLayers.push({
        layer: 2,
        name: 'Traits OS',
        focus: `Amplify ${personality.traitOS.mbtiType} ideation style: ${personality.traitOS.defaultSettings.ideationStyle}. Include excitement-building question about possibilities.`
      });
      activeLayers.push({
        layer: 7,
        name: 'Expression Layer',
        focus: `Use signature phrases: ${personality.expressionLayer.brandVoice.signaturePhrases.join(', ')}. Follow excitement compass: ${personality.expressionLayer.excitementCompass}. Celebrate their creative energy.`
      });
    }

    if (userState.context === 'clarity' || messageLower.includes('purpose') || 
        messageLower.includes('direction') || messageLower.includes('goal')) {
      activeLayers.push({
        layer: 3,
        name: 'Motivation Adaptations',
        focus: `Align with Life Path ${personality.motivationAdaptations.lifePath} (${personality.motivationAdaptations.lifePathKeyword}). Core values: ${personality.motivationAdaptations.coreValues.join(', ')}. Ask about what truly matters to them.`
      });
      activeLayers.push({
        layer: 5,
        name: 'Archetypal Skin',
        focus: `Express ${personality.archetypalSkin.sunSign} ${personality.archetypalSkin.innovatorPersona}. Use metaphors: ${personality.archetypalSkin.sunSign} energy themes. Reference their unique path.`
      });
    }

    // Reflective Coaching Layer - Active when reflective readiness is high
    if (userState.reflectiveReadiness && userState.reflectiveReadiness > 6) {
      activeLayers.push({
        layer: 'Reflective',
        name: 'Deep Exploration',
        focus: `User is ready for deeper reflection. Use pattern mirroring: "I notice..." statements. Ask follow-up questions that connect to previous insights. Highlight recurring themes.`
      });
    }

    // Always include Neural layer for processing style
    activeLayers.unshift({
      layer: 1,
      name: 'Physio-Neural Hardware',
      focus: `Process with ${personality.physioNeuralHardware.processingSpeed} speed, ${personality.physioNeuralHardware.attentionStyle} attention. Patterns: ${personality.physioNeuralHardware.brainWiringPatterns.join(', ')}. Match their natural processing rhythm.`
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

    // Analyze problem domain
    let problemDomain: UserState['problemDomain'] = 'none';
    if (messageLower.includes('job') || messageLower.includes('work') || messageLower.includes('career') || 
        messageLower.includes('business') || messageLower.includes('profession')) {
      problemDomain = 'career';
    } else if (messageLower.includes('relationship') || messageLower.includes('partner') || messageLower.includes('family') || 
               messageLower.includes('friend') || messageLower.includes('dating') || messageLower.includes('marriage')) {
      problemDomain = 'relationships';
    } else if (messageLower.includes('health') || messageLower.includes('body') || messageLower.includes('sick') || 
               messageLower.includes('tired') || messageLower.includes('energy') || messageLower.includes('sleep')) {
      problemDomain = 'health';
    } else if (messageLower.includes('money') || messageLower.includes('finance') || messageLower.includes('debt') || 
               messageLower.includes('budget') || messageLower.includes('income') || messageLower.includes('expensive')) {
      problemDomain = 'finances';
    } else if (messageLower.includes('confidence') || messageLower.includes('worth') || messageLower.includes('believe') || 
               messageLower.includes('doubt') || messageLower.includes('imposter') || messageLower.includes('self-esteem')) {
      problemDomain = 'self-belief';
    } else if (messageLower.includes('habit') || messageLower.includes('routine') || messageLower.includes('discipline') || 
               messageLower.includes('procrastination') || messageLower.includes('consistency')) {
      problemDomain = 'habits';
    } else if (messageLower.includes('purpose') || messageLower.includes('meaning') || messageLower.includes('direction') || 
               messageLower.includes('calling') || messageLower.includes('mission')) {
      problemDomain = 'purpose';
    }

    // Determine conversation phase
    let conversationPhase: UserState['conversationPhase'] = 'exploration';
    if (problemDomain !== 'none') {
      // Check if the domain seems clearly identified with specific details
      const specificKeywords = ['specifically', 'exactly', 'the issue is', 'the problem is', 'what happens is'];
      if (specificKeywords.some(keyword => messageLower.includes(keyword))) {
        conversationPhase = 'domain-identified';
      } else {
        conversationPhase = 'pattern-recognition';
      }
    }

    // Calculate reflective readiness (how ready they are for deeper exploration)
    let reflectiveReadiness = 5; // baseline
    if (messageLower.includes('understand') || messageLower.includes('explore') || 
        messageLower.includes('deeper') || messageLower.includes('why')) {
      reflectiveReadiness += 2;
    }
    if (messageLower.includes('pattern') || messageLower.includes('always') || 
        messageLower.includes('keep') || messageLower.includes('tend to')) {
      reflectiveReadiness += 2;
    }
    if (this.containsShadowKeywords(messageLower)) {
      reflectiveReadiness += 1; // challenges often create openness to reflection
    }
    reflectiveReadiness = Math.min(10, reflectiveReadiness);

    // Calculate excitement level
    const excitementLevel = context.excitementLevel || 5;

    return {
      mood,
      excitement: excitementLevel,
      context: contextType,
      problemDomain,
      conversationPhase,
      reflectiveReadiness
    };
  }
}
