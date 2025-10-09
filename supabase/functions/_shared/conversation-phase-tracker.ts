/**
 * Holistic Conversation State Tracker
 * Detects user intent clusters, sub-states, and provides opening rules for AI responses
 * Based on comprehensive behavioral interaction taxonomy
 */

export type ConversationCluster = 
  | 'engagement' | 'exploration' | 'clarification' | 'decision'
  | 'reflection' | 'validation' | 'constraint' | 'frustration'
  | 'meta_dialogue' | 'closure';

export interface DetectionResult {
  cluster: ConversationCluster;
  subState: string;
  confidence: number; // 0.0 - 1.0
  signals: DetectionSignal[];
  openingRule: string;
  allowedNextClusters: ConversationCluster[];
}

export interface DetectionSignal {
  type: 'paralinguistic' | 'sentence_form' | 'discourse_marker' | 'cluster_pattern';
  id: string;
  matched: string;
  weight: number;
}

// Comprehensive conversation state schema
const CONVERSATION_STATE_SCHEMA = {
  "version": "1.0.0",
  "language": "en",
  "globals": {
    "flags": "i",
    "max_signals_considered": 10,
    "default_state_if_tie": "clarification:why_question",
    "confidence_thresholds": { "high": 0.75, "medium": 0.5, "low": 0.3 }
  },
  "paralinguistic_rules": [
    { "id": "brevity_closure", "pattern": "^\\s*(ok(ay)?|thanks?|thx|ty|tyvm|cool|got it|fine|perfect|great|nice|awesome|sweet|kk|k)\\s*[.!]?\\s*$", "state_boost": { "cluster": "closure", "sub_state": "gratitude", "weight": 0.6 } },
    { "id": "emphasis_frustration", "pattern": "(!{2,}|\\.{3,}|[A-Z]{5,})", "state_boost": { "cluster": "frustration", "sub_state": "venting", "weight": 0.6 } },
    { "id": "time_pressure", "pattern": "\\b(today|asap|urgent|deadline|this\\s+week|now|right\\s+now|immediately|quick(ly)?|fast|soon|eod|end\\s+of\\s+(day|week))\\b", "state_boost": { "cluster": "constraint", "sub_state": "time_pressure", "weight": 0.6 } },
    { "id": "stuck_signal", "pattern": "\\b(stuck|blocked|trapped|spinning|circling|can'?t\\s+move\\s+forward)\\b", "state_boost": { "cluster": "validation", "sub_state": "self_disclosure", "weight": 0.3 } }
  ],
  "sentence_form_hints": [
    { "id": "wh_question", "pattern": "^[\\s]*(what|how|why|when|where|who|which|should|can|could|would|do|does|did)\\b|\\?$", "boost_clusters": [{ "cluster": "clarification", "weight": 0.6 }, { "cluster": "decision", "weight": 0.4 }] },
    { "id": "imperative_plan", "pattern": "\\b(give\\s+me|make\\s+me|tell\\s+me\\s+exactly|list|create|draft|outline)\\b", "boost_clusters": [{ "cluster": "decision", "weight": 0.8 }] },
    { "id": "comparative_conditional", "pattern": "\\b(if\\s+.*then|versus|vs\\.?|trade[-\\s]?off|compared\\s+to)\\b", "boost_clusters": [{ "cluster": "clarification", "weight": 0.7 }] }
  ],
  "discourse_markers": [
    { "id": "progression", "pattern": "\\b(so|therefore|next|anyway|moving\\s+on|then)\\b", "boost_clusters": [{ "cluster": "decision", "weight": 0.5 }, { "cluster": "integration", "weight": 0.3 }] },
    { "id": "contrast", "pattern": "\\b(but|however|that\\s+said|yet|still)\\b", "boost_clusters": [{ "cluster": "clarification", "weight": 0.4 }] },
    { "id": "wrapup", "pattern": "\\b(that\\s*helps|makes\\s*sense|got\\s*it|clear)\\b", "boost_clusters": [{ "cluster": "integration", "weight": 0.6 }] },
    { "id": "meta_manage", "pattern": "\\b(don't\\s+be\\s+emotional|just\\s+facts|shorter|simpler|rephrase|change\\s+tone)\\b", "boost_clusters": [{ "cluster": "meta_dialogue", "weight": 0.9 }] }
  ],
  "clusters": [
    {
      "id": "engagement",
      "weight": 1.0,
      "description": "Opening, reconnecting, setting scene/context.",
      "sub_states": [
        { "id": "greeting", "examples": ["hey", "hi", "good morning"], "regex": ["^(hey+|hi+|hello|hiya|yo|sup|what'?s\\s+up|good\\s*(morning|afternoon|evening|day)|greetings)\\b"] },
        { "id": "rapport_check", "examples": ["how are you?"], "regex": ["\\b(how\\s+are\\s+you|how'?s\\s+it\\s+going|you\\s+there|you\\s+good|quick\\s+check[-\\s]?in|how\\s+have\\s+you\\s+been)\\b"] },
        { "id": "context_setting", "examples": ["quick update on where I'm at…"], "regex": ["\\b(quick\\s+update|context|background|here's\\s+where\\s+(i'm|im)\\s+at|let\\s+me\\s+(set\\s+the\\s+)?scene|for\\s+context)\\b"] }
      ],
      "opening_rule": "Warm but brief open; move to user intent in <=1 sentence.",
      "allowed_next_clusters": ["exploration", "clarification", "validation"]
    },
    {
      "id": "exploration",
      "weight": 1.3,
      "description": "Surfacing ideas, possibilities, hypotheses.",
      "sub_states": [
        { "id": "idea_generation", "examples": ["what if we tried…"], "regex": ["\\b(what\\s+if|could\\s+we|let'?s\\s+try|brainstorm|what\\s+about|how\\s+about|maybe\\s+we|wild\\s+idea|thinking\\s+out\\s+loud)\\b"] },
        { "id": "curiosity_probe", "examples": ["I wonder how that works"], "regex": ["\\b((i|i'm|im)\\s+wonder(ing)?|curious|intrigued|interest(ed|ing)\\s+in|fascinated|i'd\\s+love\\s+to\\s+know)\\b"] },
        { "id": "scenario_imagining", "examples": ["suppose there's no budget"], "regex": ["\\b(suppose|imagine\\s+if|in\\s+that\\s+case|let'?s\\s+say|pretend|hypothetically|if\\s+we\\s+assume)\\b"] }
      ],
      "opening_rule": "No recap; nurture breadth with 2–3 options or questions.",
      "allowed_next_clusters": ["clarification", "decision", "validation"]
    },
    {
      "id": "clarification",
      "weight": 2.0,
      "description": "Understanding meaning, mechanism, definitions.",
      "sub_states": [
        { "id": "why_question", "examples": ["why does this keep happening?"], "regex": ["\\bwhy(\\s+(is|does|do|did|am\\s+i|can'?t|won'?t|would|should))?\\b|\\bhow\\s+come\\b"] },
        { "id": "definition_request", "examples": ["what exactly do you mean by…"], "regex": ["\\b(what\\s+(exactly|precisely)\\s+(do\\s+you\\s+)?mean|define|definition|what'?s\\s+the\\s+meaning|explain\\s+what|clarify)\\b"] },
        { "id": "example_request", "examples": ["can you give an example?"], "regex": ["\\b(example|for\\s+instance|like\\s+when|such\\s+as|can\\s+you\\s+show|walk\\s+me\\s+through)\\b"] },
        { "id": "tradeoff_analysis", "examples": ["A vs B"], "regex": ["\\b(vs\\.?|versus|trade[-\\s]?off|compared\\s+to|weigh(ing)?|pros\\s+and\\s+cons|which\\s+is\\s+better)\\b"] }
      ],
      "opening_rule": "Skip empathy; give a crisp model/mechanism then 1 probing question.",
      "allowed_next_clusters": ["decision", "reflection", "meta_dialogue"]
    },
    {
      "id": "decision",
      "weight": 2.2,
      "description": "Selecting a course; asking for steps/plan.",
      "sub_states": [
        { "id": "option_weighing", "examples": ["should I pick A or B?"], "regex": ["\\b(should\\s+i|which\\s+(one|option)|help\\s+me\\s+(choose|decide|pick)|or\\s+should\\s+i|a\\s+or\\s+b)\\b"] },
        { "id": "plan_request", "examples": ["give me the steps"], "regex": ["\\b(next\\s*step(s)?|action\\s*plan|give\\s+me\\s+(the\\s+)?steps|make\\s+me\\s+a\\s+plan|checklist|playbook|roadmap|game\\s+plan|how\\s+do\\s+i\\s+start)\\b"] },
        { "id": "commitment_signal", "examples": ["okay, I'll do that"], "regex": ["\\b(i'?ll\\s+do\\s+(that|it)|i\\s+commit|let'?s\\s+(do|go\\s+with)\\s+it|i'm\\s+(on|in)|count\\s+me\\s+in|let'?s\\s+go)\\b"] }
      ],
      "opening_rule": "Start with the prioritized step; then 2–3 bullet plan. No recap.",
      "allowed_next_clusters": ["reflection", "constraint", "frustration"]
    },
    {
      "id": "reflection",
      "weight": 1.8,
      "description": "Summarizing, integrating, extracting learning.",
      "sub_states": [
        { "id": "summary_request", "examples": ["recap in bullets"], "regex": ["\\b(tl;?dr|summar(y|ize)|recap|bullet\\s*points|in\\s*short|key\\s+takeaways|bottom\\s+line|main\\s+points)\\b"] },
        { "id": "synthesis", "examples": ["so basically I learned…"], "regex": ["\\b(so\\s+basically|net[\\s-]?net|in\\s+essence|the\\s+gist|long\\s+story\\s+short|to\\s+sum\\s+up|in\\s+other\\s+words)\\b"] },
        { "id": "learning_statement", "examples": ["this helps me see…"], "regex": ["\\b((this|that)\\s+helps\\s+me\\s+see|i\\s+realize(d)?|now\\s+i\\s+understand|i\\s+get\\s+it|makes\\s+sense|i\\s+see\\s+now|aha|i\\s+learned)\\b"] }
      ],
      "opening_rule": "Open with 1-line synthesis; deliver bullets; 1 metric/next check.",
      "allowed_next_clusters": ["closure", "decision"]
    },
    {
      "id": "validation",
      "weight": 1.4,
      "description": "Safety, reassurance, vulnerability.",
      "sub_states": [
        { "id": "self_disclosure", "examples": ["I feel unsure", "im feeling stuck", "feeling overwhelmed"], "regex": [
          "\\b(i\\s*(?:feel(?:ing)?|am|['']?m)\\s*(?:feeling\\s*)?(lost|stuck|unsure|overwhelmed|anxious|insecure|confused|blocked|frustrated|burnt[\\s-]?out|tired|scattered|defeated|hopeless|drained|empty))\\b",
          "\\b(?:feeling|feel)\\s+(lost|stuck|unsure|overwhelmed|anxious|insecure|confused|blocked|frustrated|burnt[\\s-]?out|tired|scattered|defeated|hopeless|drained|empty)\\b"
        ] },
        { "id": "reassurance_seek", "examples": ["is this normal?"], "regex": ["\\b(is\\s+this\\s+(normal|okay|fine|right|common)|does\\s+(that|this)\\s+make\\s+sense|am\\s+i\\s+(okay|wrong|crazy|alone\\s+in\\s+this))\\b"] },
        { "id": "vulnerability_signal", "examples": ["this part scares me"], "regex": ["\\b((this|that)\\s+(scares|worries|frightens)\\s+me|i'?m\\s+(afraid|scared|worried|nervous|terrified)|fear(ful)?|anxiety|dread)\\b"] }
      ],
      "opening_rule": "ONE sentence of empathy, then a stabilizing frame (no metaphors cascade).",
      "allowed_next_clusters": ["clarification", "decision"]
    },
    {
      "id": "constraint",
      "weight": 2.0,
      "description": "Limits: money/time/tools/policy.",
      "sub_states": [
        { "id": "money_scarcity", "examples": ["no budget"], "regex": ["\\b(no\\s*(money|budget|funds|cash)|too\\s*(expensive|costly|pricey)|can'?t\\s*afford|zero\\s+budget|broke|limited\\s+resources|on\\s+a\\s+shoestring)\\b"] },
        { "id": "time_pressure", "examples": ["no time this week"], "regex": ["\\b(no\\s*(time|hours|bandwidth)|this\\s*(week|month)|today|asap|urgent|deadline|running\\s+out\\s+of\\s+time|time[-\\s]?crunch|eod|need\\s+it\\s+(now|quick))\\b"] },
        { "id": "tooling_block", "examples": ["api keeps failing"], "regex": ["\\b(blocked|rate[\\s-]?limit(ed)?|api\\s+(fail(ing|ed|ure)?|error|down)|no\\s+access|policy\\s+block|permission\\s+denied|can'?t\\s+connect)\\b"] }
      ],
      "opening_rule": "Offer 1 no-cost path + 1 low-cost path; remove fluff.",
      "allowed_next_clusters": ["decision", "reflection"]
    },
    {
      "id": "frustration",
      "weight": 2.0,
      "description": "Blocked, irritated, emotional rupture.",
      "sub_states": [
        { "id": "complaint", "examples": ["this system isn't working"], "regex": ["\\b((this|it|that)\\s*(isn'?t|is\\s*not|doesn'?t|does\\s*not)\\s*(working|work)|broken|buggy|useless|garbage|terrible|awful|sucks)\\b"] },
        { "id": "venting", "examples": ["I'm so done with this!!!"], "regex": ["\\b(i'?m\\s+(so\\s+)?done|nothing\\s*(works|helps)|wtf|fml|screw\\s*this|fuck\\s*this|this\\s+is\\s+(ridiculous|insane|bullshit)|i\\s+give\\s+up|i\\s+quit|fed\\s+up)\\b|!{2,}|[A-Z]{5,}"] },
        { "id": "meta_feedback", "examples": ["you're repeating yourself"], "regex": ["\\b(repeat(ing)?\\s+(yourself|things)|too\\s+(long|vague|wordy|much)|robotic|generic|same\\s+thing|stop\\s+saying)\\b"] }
      ],
      "opening_rule": "Acknowledge in 1 line, then give friction-reducing step + quick win.",
      "allowed_next_clusters": ["validation", "decision"]
    },
    {
      "id": "meta_dialogue",
      "weight": 1.6,
      "description": "Talking about the conversation/system itself.",
      "sub_states": [
        { "id": "instruction_to_ai", "examples": ["don't give empathy, just facts"], "regex": ["\\b(just\\s+(facts|data|the\\s+answer)|no\\s+(fluff|empathy|feelings)|shorter|simpler|bullet\\s*points|be\\s+(direct|concise|brief)|cut\\s+to\\s+the\\s+chase|straight\\s+answer)\\b"] },
        { "id": "rephrasing_request", "examples": ["say that simpler"], "regex": ["\\b(rephrase|simplify|say\\s+(that|it)\\s+(simpler|differently|again)|tl;?dr|in\\s+plain\\s+english|eli5|dumb\\s+it\\s+down)\\b"] },
        { "id": "tone_feedback", "examples": ["that sounded robotic"], "regex": ["\\b(too\\s+(formal|casual|emotional|cold|robotic)|tone\\s+(off|wrong)|sounds?\\s+(robotic|generic|scripted|fake))\\b"] }
      ],
      "opening_rule": "Acknowledge the instruction; adapt immediately; confirm new mode in ≤1 line.",
      "allowed_next_clusters": ["clarification", "decision", "reflection"]
    },
    {
      "id": "closure",
      "weight": 2.4,
      "description": "Ending/pausing/hand-off.",
      "sub_states": [
        { "id": "gratitude", "examples": ["thanks"], "regex": ["\\b(thanks?|thank\\s*(you|u)|ty|tyvm|appreciate(d)?|grateful|much\\s+appreciated|cheers)\\b"] },
        { "id": "sign_off", "examples": ["talk later"], "regex": ["\\b(bye|talk\\s*(later|soon)|see\\s*(you|ya)|signing\\s*off|gotta\\s+go|ttyl|later|peace\\s+out|take\\s+care)\\b"] },
        { "id": "pause_request", "examples": ["let's stop here for now"], "regex": ["\\b(stop\\s+(here|now)|pause|that'?s\\s+(all|enough|it)|good\\s+for\\s+now|let'?s\\s+(end|wrap\\s+up)|i'?m\\s+done)\\b"] }
      ],
      "opening_rule": "Acknowledge and stop. No new content.",
      "allowed_next_clusters": []
    }
  ],
  "routing_graph": [
    { "from": "engagement", "to": ["exploration", "clarification", "validation"] },
    { "from": "exploration", "to": ["clarification", "decision", "validation"] },
    { "from": "clarification", "to": ["decision", "reflection", "meta_dialogue"] },
    { "from": "decision", "to": ["reflection", "constraint", "frustration"] },
    { "from": "reflection", "to": ["closure", "decision"] },
    { "from": "validation", "to": ["clarification", "decision"] },
    { "from": "constraint", "to": ["decision", "reflection"] },
    { "from": "frustration", "to": ["validation", "decision"] },
    { "from": "meta_dialogue", "to": ["clarification", "decision", "reflection"] }
  ],
  "opening_rules_fallback": {
    "default": "Start with a new lens or next step. Do not restate prior emotional context.",
    "with_constraints": "Start with constraint-aware path: one no-cost and one low-cost option."
  }
};

export class ConversationPhaseTracker {
  
  /**
   * Main detection method - analyzes user message and conversation history
   * to determine current conversation cluster, sub-state, and guidance
   */
  static detectState(
    userMessage: string, 
    conversationHistory: any[]
  ): DetectionResult {
    const signals: DetectionSignal[] = [];
    const clusterScores = new Map<ConversationCluster, number>();
    
    // Step 1: Paralinguistic detection (brevity, emphasis, time pressure)
    this.detectParalinguistic(userMessage, signals, clusterScores);
    
    // Step 2: Sentence form hints (questions, imperatives, conditionals)
    this.detectSentenceForm(userMessage, signals, clusterScores);
    
    // Step 3: Discourse markers (so, but, however, etc.)
    this.detectDiscourseMarkers(userMessage, signals, clusterScores);
    
    // Step 4: Cluster-specific pattern matching
    this.detectClusterPatterns(userMessage, signals, clusterScores);
    
    // Step 4.5: Resolve pattern collisions (e.g., greeting + validation)
    this.resolveClusterCollisions(clusterScores, signals);
    
    // Step 5: Calculate winner
    const winner = this.selectWinningCluster(clusterScores, conversationHistory);
    
    // Step 6: Detect sub-state within cluster
    const subState = this.detectSubState(userMessage, winner.cluster);
    
    // Step 7: Build result
    return {
      cluster: winner.cluster,
      subState,
      confidence: winner.confidence,
      signals,
      openingRule: this.getOpeningRule(winner.cluster),
      allowedNextClusters: this.getAllowedNextClusters(winner.cluster)
    };
  }
  
  private static detectParalinguistic(
    message: string,
    signals: DetectionSignal[],
    clusterScores: Map<ConversationCluster, number>
  ): void {
    const rules = CONVERSATION_STATE_SCHEMA.paralinguistic_rules;
    
    for (const rule of rules) {
      const regex = new RegExp(rule.pattern, CONVERSATION_STATE_SCHEMA.globals.flags);
      const match = message.match(regex);
      
      if (match) {
        signals.push({
          type: 'paralinguistic',
          id: rule.id,
          matched: match[0],
          weight: rule.state_boost.weight
        });
        
        const cluster = rule.state_boost.cluster as ConversationCluster;
        clusterScores.set(cluster, (clusterScores.get(cluster) || 0) + rule.state_boost.weight);
      }
    }
  }
  
  private static detectSentenceForm(
    message: string,
    signals: DetectionSignal[],
    clusterScores: Map<ConversationCluster, number>
  ): void {
    const hints = CONVERSATION_STATE_SCHEMA.sentence_form_hints;
    
    for (const hint of hints) {
      const regex = new RegExp(hint.pattern, CONVERSATION_STATE_SCHEMA.globals.flags);
      const match = message.match(regex);
      
      if (match) {
        signals.push({
          type: 'sentence_form',
          id: hint.id,
          matched: match[0],
          weight: hint.boost_clusters[0].weight
        });
        
        for (const boost of hint.boost_clusters) {
          const cluster = boost.cluster as ConversationCluster;
          clusterScores.set(cluster, (clusterScores.get(cluster) || 0) + boost.weight);
        }
      }
    }
  }
  
  private static detectDiscourseMarkers(
    message: string,
    signals: DetectionSignal[],
    clusterScores: Map<ConversationCluster, number>
  ): void {
    const markers = CONVERSATION_STATE_SCHEMA.discourse_markers;
    
    for (const marker of markers) {
      const regex = new RegExp(marker.pattern, CONVERSATION_STATE_SCHEMA.globals.flags);
      const match = message.match(regex);
      
      if (match) {
        signals.push({
          type: 'discourse_marker',
          id: marker.id,
          matched: match[0],
          weight: marker.boost_clusters[0].weight
        });
        
        for (const boost of marker.boost_clusters) {
          const cluster = boost.cluster as ConversationCluster;
          clusterScores.set(cluster, (clusterScores.get(cluster) || 0) + boost.weight);
        }
      }
    }
  }
  
  private static detectClusterPatterns(
    message: string,
    signals: DetectionSignal[],
    clusterScores: Map<ConversationCluster, number>
  ): void {
    const clusters = CONVERSATION_STATE_SCHEMA.clusters;
    
    for (const cluster of clusters) {
      for (const subState of cluster.sub_states) {
        for (const pattern of subState.regex) {
          const regex = new RegExp(pattern, CONVERSATION_STATE_SCHEMA.globals.flags);
          const match = message.match(regex);
          
          if (match) {
            signals.push({
              type: 'cluster_pattern',
              id: `${cluster.id}:${subState.id}`,
              matched: match[0],
              weight: cluster.weight
            });
            
            clusterScores.set(
              cluster.id as ConversationCluster, 
              (clusterScores.get(cluster.id as ConversationCluster) || 0) + cluster.weight
            );
          }
        }
      }
    }
  }
  
  /**
   * Resolve cluster collisions with precedence rules
   * Example: validation patterns should override engagement.greeting
   */
  private static resolveClusterCollisions(
    clusterScores: Map<ConversationCluster, number>,
    signals: DetectionSignal[]
  ): void {
    const hasGreeting = signals.some(s => s.id === 'greeting');
    const hasValidation = signals.some(s => s.type === 'cluster_pattern' && s.id.startsWith('validation:'));
    
    // Validation > greeting when both fire (emotional disclosure takes priority)
    if (hasGreeting && hasValidation) {
      const currentValidationScore = clusterScores.get('validation') || 0;
      clusterScores.set('validation', currentValidationScore + 0.4);
      console.log('🔀 COLLISION RESOLVED: Boosted validation over greeting (+0.4)');
    }
  }
  
  private static selectWinningCluster(
    clusterScores: Map<ConversationCluster, number>,
    conversationHistory: any[]
  ): { cluster: ConversationCluster; confidence: number } {
    if (clusterScores.size === 0) {
      // Fallback: Use turn count to guess
      const turnCount = Math.floor((conversationHistory.length + 1) / 2);
      
      if (turnCount <= 2) return { cluster: 'engagement', confidence: 0.3 };
      if (turnCount <= 5) return { cluster: 'clarification', confidence: 0.3 };
      return { cluster: 'decision', confidence: 0.3 };
    }
    
    let maxScore = 0;
    let winner: ConversationCluster = 'clarification';
    
    for (const [cluster, score] of clusterScores.entries()) {
      if (score > maxScore) {
        maxScore = score;
        winner = cluster;
      }
    }
    
    // Calculate confidence (normalize to 0-1 range, assume max realistic score is 3.0)
    const confidence = Math.min(1.0, maxScore / 3.0);
    
    return { cluster: winner, confidence };
  }
  
  private static detectSubState(message: string, cluster: ConversationCluster): string {
    const clusterDef = CONVERSATION_STATE_SCHEMA.clusters.find(c => c.id === cluster);
    if (!clusterDef) return 'unknown';
    
    for (const subState of clusterDef.sub_states) {
      for (const pattern of subState.regex) {
        const regex = new RegExp(pattern, CONVERSATION_STATE_SCHEMA.globals.flags);
        if (regex.test(message)) {
          return subState.id;
        }
      }
    }
    
    return clusterDef.sub_states[0]?.id || 'unknown';
  }
  
  private static getOpeningRule(cluster: ConversationCluster): string {
    const clusterDef = CONVERSATION_STATE_SCHEMA.clusters.find(c => c.id === cluster);
    return clusterDef?.opening_rule || CONVERSATION_STATE_SCHEMA.opening_rules_fallback.default;
  }
  
  private static getAllowedNextClusters(cluster: ConversationCluster): ConversationCluster[] {
    const clusterDef = CONVERSATION_STATE_SCHEMA.clusters.find(c => c.id === cluster);
    return (clusterDef?.allowed_next_clusters || []) as ConversationCluster[];
  }
  
  /**
   * Diagnostic utility: Get all signal details for debugging
   */
  static getSignalBreakdown(userMessage: string): {
    paralinguistic: any[];
    sentenceForm: any[];
    discourseMarkers: any[];
    clusterPatterns: any[];
  } {
    const breakdown = {
      paralinguistic: [] as any[],
      sentenceForm: [] as any[],
      discourseMarkers: [] as any[],
      clusterPatterns: [] as any[]
    };
    
    // Paralinguistic
    for (const rule of CONVERSATION_STATE_SCHEMA.paralinguistic_rules) {
      const regex = new RegExp(rule.pattern, CONVERSATION_STATE_SCHEMA.globals.flags);
      const match = userMessage.match(regex);
      if (match) {
        breakdown.paralinguistic.push({
          id: rule.id,
          matched: match[0],
          boost: rule.state_boost
        });
      }
    }
    
    // Sentence form
    for (const hint of CONVERSATION_STATE_SCHEMA.sentence_form_hints) {
      const regex = new RegExp(hint.pattern, CONVERSATION_STATE_SCHEMA.globals.flags);
      const match = userMessage.match(regex);
      if (match) {
        breakdown.sentenceForm.push({
          id: hint.id,
          matched: match[0],
          boosts: hint.boost_clusters
        });
      }
    }
    
    // Discourse markers
    for (const marker of CONVERSATION_STATE_SCHEMA.discourse_markers) {
      const regex = new RegExp(marker.pattern, CONVERSATION_STATE_SCHEMA.globals.flags);
      const match = userMessage.match(regex);
      if (match) {
        breakdown.discourseMarkers.push({
          id: marker.id,
          matched: match[0],
          boosts: marker.boost_clusters
        });
      }
    }
    
    // Cluster patterns
    for (const cluster of CONVERSATION_STATE_SCHEMA.clusters) {
      for (const subState of cluster.sub_states) {
        for (const pattern of subState.regex) {
          const regex = new RegExp(pattern, CONVERSATION_STATE_SCHEMA.globals.flags);
          const match = userMessage.match(regex);
          if (match) {
            breakdown.clusterPatterns.push({
              cluster: cluster.id,
              subState: subState.id,
              matched: match[0],
              weight: cluster.weight
            });
          }
        }
      }
    }
    
    return breakdown;
  }
}
