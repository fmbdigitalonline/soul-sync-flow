/**
 * Intent Router Service - Decision Layer (Directive 3: Verify Foundation)
 * Determines user intent to prevent generic responses and misinterpretation
 */

import { conversationSummaryService } from './conversation-summary-service';
import { turnBufferService } from './turn-buffer-service';

export type IntentType = 
  | 'reflection' // "Vertel me wat ik heb gezegd"
  | 'action' // "Wat moet ik doen?"
  | 'closure' // "Laten we stoppen"
  | 'exploration' // "Vertel me meer"
  | 'emotional_support' // Expressing frustration/emotion
  | 'clarification' // "Wat bedoel je?"
  | 'continuation'; // General conversation

export interface IntentAnalysis {
  type: IntentType;
  confidence: number;
  context: {
    emotionalState: string;
    isFollowUp: boolean;
    hasQuestion: boolean;
    isRequestingAction: boolean;
    isRequestingSummary: boolean;
    isExpressingFrustration: boolean;
  };
  suggestedResponse: 'reflector' | 'planner' | 'companion' | 'clarifier';
}

export class IntentRouterService {
  private static instance: IntentRouterService;

  static getInstance(): IntentRouterService {
    if (!this.instance) {
      this.instance = new IntentRouterService();
    }
    return this.instance;
  }

  /**
   * Analyze user intent from message and conversation context
   * Directive 2: Test case - Input: "vertel me wat ik heb gezegd", Expected: reflection intent with high confidence
   */
  async analyzeIntent(
    userMessage: string, 
    sessionId: string, 
    userId: string
  ): Promise<IntentAnalysis> {
    
    console.log('🎯 INTENT ROUTER: Analyzing user message for intent');
    
    const lowerMessage = userMessage.toLowerCase().trim();
    
    // Get conversation context
    const recentTurns = turnBufferService.getRecentTurns(sessionId, 3);
    const summary = await conversationSummaryService.getSummary(sessionId, userId);
    
    // Detect emotional state
    const emotionalState = this.detectEmotionalState(lowerMessage);
    const isFollowUp = recentTurns.length > 0;
    const hasQuestion = lowerMessage.includes('?') || this.hasQuestionWords(lowerMessage);
    
    // CRITICAL: Detect reflection requests - high priority patterns
    if (this.isReflectionRequest(lowerMessage)) {
      return {
        type: 'reflection',
        confidence: 0.95,
        context: {
          emotionalState,
          isFollowUp,
          hasQuestion: false,
          isRequestingAction: false,
          isRequestingSummary: true,
          isExpressingFrustration: false
        },
        suggestedResponse: 'reflector'
      };
    }

    // Detect closure/ending requests
    if (this.isClosureRequest(lowerMessage)) {
      return {
        type: 'closure',
        confidence: 0.90,
        context: {
          emotionalState,
          isFollowUp,
          hasQuestion: false,
          isRequestingAction: false,
          isRequestingSummary: false,
          isExpressingFrustration: false
        },
        suggestedResponse: 'companion'
      };
    }

    // Detect frustration/emotional support needs - especially "jammer dat je niet hebt opgelet"
    if (this.isExpressingFrustration(lowerMessage)) {
      return {
        type: 'emotional_support',
        confidence: 0.85,
        context: {
          emotionalState,
          isFollowUp,
          hasQuestion: false,
          isRequestingAction: false,
          isRequestingSummary: false,
          isExpressingFrustration: true
        },
        suggestedResponse: 'companion'
      };
    }

    // Detect action requests
    if (this.isActionRequest(lowerMessage)) {
      return {
        type: 'action',
        confidence: 0.80,
        context: {
          emotionalState,
          isFollowUp,
          hasQuestion,
          isRequestingAction: true,
          isRequestingSummary: false,
          isExpressingFrustration: false
        },
        suggestedResponse: 'planner'
      };
    }

    // Detect exploration/curiosity
    if (this.isExplorationRequest(lowerMessage)) {
      return {
        type: 'exploration',
        confidence: 0.75,
        context: {
          emotionalState,
          isFollowUp,
          hasQuestion,
          isRequestingAction: false,
          isRequestingSummary: false,
          isExpressingFrustration: false
        },
        suggestedResponse: 'companion'
      };
    }

    // Detect clarification requests
    if (this.isClarificationRequest(lowerMessage)) {
      return {
        type: 'clarification',
        confidence: 0.70,
        context: {
          emotionalState,
          isFollowUp,
          hasQuestion: true,
          isRequestingAction: false,
          isRequestingSummary: false,
          isExpressingFrustration: false
        },
        suggestedResponse: 'clarifier'
      };
    }

    // Default: continuation
    return {
      type: 'continuation',
      confidence: 0.60,
      context: {
        emotionalState,
        isFollowUp,
        hasQuestion,
        isRequestingAction: false,
        isRequestingSummary: false,
        isExpressingFrustration: false
      },
      suggestedResponse: 'companion'
    };
  }

  private isReflectionRequest(message: string): boolean {
    const reflectionPatterns = [
      'vertel me wat ik heb gezegd',
      'wat heb ik allemaal verteld',
      'vat samen wat ik zei',
      'wat was mijn verhaal',
      'herhaal wat ik vertelde',
      'wat vertelde ik net',
      'samenvatting van ons gesprek',
      'wat hebben we besproken',
      'reflectie van wat ik zei',
      'wat waren mijn punten',
      'mijn verhaal tot nu toe',
      'wat is mijn situatie'
    ];

    return reflectionPatterns.some(pattern => 
      message.includes(pattern) || this.fuzzyMatch(message, pattern)
    );
  }

  private isClosureRequest(message: string): boolean {
    const closurePatterns = [
      'laten we stoppen',
      'ik ga stoppen',
      'bedankt voor het gesprek',
      'dat was het',
      'ik ben klaar',
      'we kunnen afsluiten',
      'einde gesprek',
      'stop maar',
      'dank je wel',
      'tot ziens'
    ];

    return closurePatterns.some(pattern => message.includes(pattern));
  }

  private isExpressingFrustration(message: string): boolean {
    const frustrationPatterns = [
      'jammer dat je niet hebt opgelet',
      'je luistert niet',
      'je hebt niet opgelet', 
      'frustratie',
      'geïrriteerd',
      'boos',
      'teleurgesteld',
      'je begrijpt het niet',
      'waarom vraag je dat weer',
      'ik zei het al',
      'heb je niet gehoord'
    ];

    return frustrationPatterns.some(pattern => message.includes(pattern));
  }

  private isActionRequest(message: string): boolean {
    const actionPatterns = [
      'wat moet ik doen',
      'wat raad je aan',
      'geef me advies',
      'help me met',
      'hoe kan ik',
      'wat zijn mijn opties',
      'stappen om',
      'plan van aanpak',
      'concrete actie',
      'praktische oplossing'
    ];

    return actionPatterns.some(pattern => message.includes(pattern));
  }

  private isExplorationRequest(message: string): boolean {
    const explorationPatterns = [
      'vertel me meer',
      'leg uit',
      'wat betekent dit',
      'hoe werkt dat',
      'kun je uitleggen',
      'wat houdt dat in',
      'ik wil meer weten',
      'interessant, ga door',
      'verdieping'
    ];

    return explorationPatterns.some(pattern => message.includes(pattern));
  }

  private isClarificationRequest(message: string): boolean {
    const clarificationPatterns = [
      'wat bedoel je',
      'kun je dat herhalen',
      'ik begrijp het niet',
      'wat betekent',
      'verduidelijking',
      'hoe zo',
      'leg dat uit',
      'wat is dat'
    ];

    return clarificationPatterns.some(pattern => message.includes(pattern));
  }

  private detectEmotionalState(message: string): string {
    if (message.includes('boos') || message.includes('gefrustreerd') || message.includes('geïrriteerd')) {
      return 'gefrustreerd';
    }
    if (message.includes('blij') || message.includes('fijn') || message.includes('goed')) {
      return 'positief';
    }
    if (message.includes('verdrietig') || message.includes('down') || message.includes('teleurgesteld')) {
      return 'verdrietig';
    }
    if (message.includes('verward') || message.includes('onduidelijk')) {
      return 'verward';
    }
    if (message.includes('vastzitten') || message.includes('stuck')) {
      return 'vastgelopen';
    }
    
    return 'neutraal';
  }

  private hasQuestionWords(message: string): boolean {
    const questionWords = ['wat', 'hoe', 'waarom', 'wanneer', 'waar', 'wie', 'welke', 'kun je'];
    return questionWords.some(word => message.includes(word));
  }

  private fuzzyMatch(text: string, pattern: string, threshold: number = 0.7): boolean {
    const words1 = text.split(' ');
    const words2 = pattern.split(' ');
    const matches = words2.filter(word => words1.some(w => w.includes(word) || word.includes(w)));
    
    return matches.length / words2.length >= threshold;
  }

  /**
   * Generate appropriate prompt based on intent
   */
  generateContextPrompt(intent: IntentAnalysis, sessionId: string): string {
    const baseContext = `Intent gedetecteerd: ${intent.type} (${Math.round(intent.confidence * 100)}% zekerheid)`;
    
    switch (intent.type) {
      case 'reflection':
        return `${baseContext}

De gebruiker vraagt om een reflectie/samenvatting van wat zij hebben gezegd. Dit is NIET een verzoek om het gesprek te beëindigen.

INSTRUCTIE: Gebruik conversationSummaryService.generateReflectionSummary() om een grondige samenvatting te geven van:
- Hun hoofdthema's en zorgen
- Wat ze hebben gedeeld over hun situatie  
- Hun doelen en uitdagingen
- De emotionele context van hun verhaal

Wees specifiek en toon dat je hebt geluisterd naar wat zij hebben verteld.`;

      case 'emotional_support':
        return `${baseContext}

De gebruiker uit frustratie of teleurstelling, mogelijk omdat ze het gevoel hebben dat er niet goed is geluisterd.

INSTRUCTIE: 
1. Erken hun frustratie oprecht
2. Toon dat je WEL hebt geluisterd door specifiek te refereren aan wat ze eerder zeiden
3. Bied emotionele steun en validatie
4. Vraag hoe je beter kan helpen

Vermijd generieke antwoorden. Wees persoonlijk en empathisch.`;

      case 'action':
        return `${baseContext}

De gebruiker vraagt om concrete actie, advies of stappen.

INSTRUCTIE:
1. Gebruik hun eerdere context om gepersonaliseerd advies te geven
2. Geef specifieke, uitvoerbare stappen
3. Verbind advies aan hun eerder genoemde situatie en doelen
4. Vraag om feedback op de voorgestelde acties`;

      case 'closure':
        return `${baseContext}

De gebruiker wil het gesprek afsluiten.

INSTRUCTIE:
1. Bedank voor het delen
2. Geef een korte, waardevolle samenvatting van het gesprek
3. Bied aan om altijd beschikbaar te zijn voor verdere gesprekken
4. Eindig warm en ondersteunend`;

      default:
        return `${baseContext}

Standaard gespreksvoortzetting. Bouw voort op de eerdere context en houdt het gesprek natuurlijk gaande.`;
    }
  }
}

export const intentRouterService = IntentRouterService.getInstance();