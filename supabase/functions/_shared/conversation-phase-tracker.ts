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
  // v3.5 Emotional Evidence: for affective clusters, whether there is
  // evidence from the CURRENT exchange to name the emotion — the current
  // message expresses it plainly, or it has recurred across the last 3
  // messages. Undefined for non-affective clusters (they are not gated).
  emotionEvidence?: boolean;
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
  "language": "en+nl",
  "globals": {
    "flags": "i",
    "max_signals_considered": 10,
    "default_state_if_tie": "clarification:why_question",
    "confidence_thresholds": { "high": 0.75, "medium": 0.5, "low": 0.3 }
  },
  "paralinguistic_rules": [
    { "id": "brevity_closure", "pattern": "^\\s*(ok(ay|é|e)?|thanks?|thx|ty|tyvm|cool|got it|fine|perfect|great|nice|awesome|sweet|kk|k|prima|top|dank|dankje|dank\\s*je|dankjewel|bedankt|fijn|mooi|goed|duidelijk|helder)\\s*[.!]?\\s*$", "state_boost": { "cluster": "closure", "sub_state": "gratitude", "weight": 0.6 } },
    { "id": "emphasis_frustration", "pattern": "(!{2,}|\\.{3,}|[A-Z]{5,})", "state_boost": { "cluster": "frustration", "sub_state": "venting", "weight": 0.6 } },
    { "id": "time_pressure", "pattern": "\\b(today|asap|urgent|deadline|this\\s+week|now|right\\s+now|immediately|quick(ly)?|fast|soon|eod|end\\s+of\\s+(day|week)|vandaag|dringend|urgent|deze\\s+week|nu|meteen|direct|snel|zsm|zo\\s+snel\\s+mogelijk|einde\\s+van\\s+de\\s+(dag|week))\\b", "state_boost": { "cluster": "constraint", "sub_state": "time_pressure", "weight": 0.6 } },
    { "id": "stuck_signal", "pattern": "\\b(stuck|blocked|trapped|spinning|circling|can'?t\\s+move\\s+forward|vast|vastgelopen|loop\\s+vast|geblokkeerd|kom\\s+niet\\s+verder|in\\s+cirkels|klem)\\b", "state_boost": { "cluster": "validation", "sub_state": "self_disclosure", "weight": 0.3 } }
  ],
  "sentence_form_hints": [
    { "id": "wh_question", "pattern": "^[\\s]*(what|how|why|when|where|who|which|should|can|could|would|do|does|did|wat|hoe|waarom|wanneer|waar|wie|welke|welk|waardoor|moet|mag|kan|kun|kunt|zou|zal|is|zijn|heb|heeft)\\b|\\?$", "boost_clusters": [{ "cluster": "clarification", "weight": 0.6 }, { "cluster": "decision", "weight": 0.4 }] },
    { "id": "imperative_plan", "pattern": "\\b(give\\s+me|make\\s+me|tell\\s+me\\s+exactly|list|create|draft|outline|geef\\s+(me|mij)|maak\\s+(me|mij|een)|vertel\\s+me\\s+precies|noem|schrijf|schets|zet\\s+op\\s+een\\s+rij)\\b", "boost_clusters": [{ "cluster": "decision", "weight": 0.8 }] },
    { "id": "comparative_conditional", "pattern": "\\b(if\\s+.*then|versus|vs\\.?|trade[-\\s]?off|compared\\s+to|als\\s+.*dan|tegenover|afweging|vergeleken\\s+met|in\\s+vergelijking\\s+met)\\b", "boost_clusters": [{ "cluster": "clarification", "weight": 0.7 }] }
  ],
  "discourse_markers": [
    { "id": "progression", "pattern": "\\b(so|therefore|next|anyway|moving\\s+on|then|dus|daarom|vervolgens|daarna|dan|verder|hierna)\\b", "boost_clusters": [{ "cluster": "decision", "weight": 0.5 }, { "cluster": "integration", "weight": 0.3 }] },
    { "id": "contrast", "pattern": "\\b(but|however|that\\s+said|yet|still|maar|echter|toch|hoewel|alhoewel|desondanks)\\b", "boost_clusters": [{ "cluster": "clarification", "weight": 0.4 }] },
    { "id": "wrapup", "pattern": "\\b(that\\s*helps|makes\\s*sense|got\\s*it|clear|dat\\s+helpt|snap\\s+ik|ik\\s+snap\\s+het|begrijp\\s+ik|duidelijk|helder|logisch)\\b", "boost_clusters": [{ "cluster": "integration", "weight": 0.6 }] },
    { "id": "meta_manage", "pattern": "\\b(don't\\s+be\\s+emotional|just\\s+facts|shorter|simpler|rephrase|change\\s+tone|geen\\s+emoties|alleen\\s+feiten|korter|simpeler|eenvoudiger|herformuleer|andere\\s+toon)\\b", "boost_clusters": [{ "cluster": "meta_dialogue", "weight": 0.9 }] }
  ],
  "clusters": [
    {
      "id": "engagement",
      "weight": 1.0,
      "description": "Opening, reconnecting, setting scene/context.",
      "sub_states": [
        { "id": "greeting", "examples": ["hey", "hi", "good morning", "hoi", "goedemorgen"], "regex": ["^(hey+|hi+|hello|hiya|yo|sup|what'?s\\s+up|good\\s*(morning|afternoon|evening|day)|greetings|hoi+|hallo+|hai|dag|goede?(morgen|middag|navond|nacht)|goeiemorgen)\\b"] },
        { "id": "rapport_check", "examples": ["how are you?", "hoe gaat het?"], "regex": ["\\b(how\\s+are\\s+you|how'?s\\s+it\\s+going|you\\s+there|you\\s+good|quick\\s+check[-\\s]?in|how\\s+have\\s+you\\s+been|hoe\\s+(gaat|is)\\s+het|alles\\s+goed|ben\\s+je\\s+er|hoe\\s+gaat\\s+ie)\\b"] },
        { "id": "context_setting", "examples": ["quick update on where I'm at…", "even wat context"], "regex": ["\\b(quick\\s+update|context|background|here's\\s+where\\s+(i'm|im)\\s+at|let\\s+me\\s+(set\\s+the\\s+)?scene|for\\s+context|korte\\s+update|achtergrond|even\\s+schetsen|waar\\s+ik\\s+(nu\\s+)?sta|ter\\s+context)\\b"] }
      ],
      "opening_rule": "Warm but brief open; move to user intent in <=1 sentence.",
      "allowed_next_clusters": ["exploration", "clarification", "validation"]
    },
    {
      "id": "exploration",
      "weight": 1.3,
      "description": "Surfacing ideas, possibilities, hypotheses.",
      "sub_states": [
        { "id": "idea_generation", "examples": ["what if we tried…", "wat als we…"], "regex": ["\\b(what\\s+if|could\\s+we|let'?s\\s+try|brainstorm|what\\s+about|how\\s+about|maybe\\s+we|wild\\s+idea|thinking\\s+out\\s+loud|wat\\s+als|zouden\\s+we|laten\\s+we\\s+(eens\\s+)?(proberen|kijken)|hoe\\s+zit\\s+het\\s+met|misschien\\s+(kunnen|moeten)\\s+we|hardop\\s+denken)\\b"] },
        { "id": "curiosity_probe", "examples": ["I wonder how that works", "ik vraag me af"], "regex": ["\\b((i|i'm|im)\\s+wonder(ing)?|curious|intrigued|interest(ed|ing)\\s+in|fascinated|i'd\\s+love\\s+to\\s+know|ik\\s+vraag\\s+me\\s+af|nieuwsgierig|benieuwd|ik\\s+zou\\s+graag\\s+weten|boeiend)\\b"] },
        { "id": "scenario_imagining", "examples": ["suppose there's no budget", "stel dat"], "regex": ["\\b(suppose|imagine\\s+if|in\\s+that\\s+case|let'?s\\s+say|pretend|hypothetically|if\\s+we\\s+assume|stel(\\s+(dat|je\\s+voor))?|in\\s+dat\\s+geval|laten\\s+we\\s+zeggen|hypothetisch|even\\s+aangenomen)\\b"] }
      ],
      "opening_rule": "No recap; nurture breadth with 2–3 possibilities.",
      "allowed_next_clusters": ["clarification", "decision", "validation"]
    },
    {
      "id": "clarification",
      "weight": 2.0,
      "description": "Understanding meaning, mechanism, definitions.",
      "sub_states": [
        { "id": "why_question", "examples": ["why does this keep happening?", "waarom gebeurt dit?"], "regex": ["\\bwhy(\\s+(is|does|do|did|am\\s+i|can'?t|won'?t|would|should))?\\b|\\bhow\\s+come\\b", "\\bwaarom\\b|\\bhoe\\s+komt\\s+(het|dat)\\b|\\bwaardoor\\b"] },
        { "id": "definition_request", "examples": ["what exactly do you mean by…", "wat bedoel je precies"], "regex": ["\\b(what\\s+(exactly|precisely)\\s+(do\\s+you\\s+)?mean|define|definition|what'?s\\s+the\\s+meaning|explain\\s+what|clarify|wat\\s+bedoel\\s+je(\\s+precies)?|definieer|definitie|wat\\s+betekent|leg\\s+uit|verduidelijk)\\b"] },
        { "id": "example_request", "examples": ["can you give an example?", "geef eens een voorbeeld"], "regex": ["\\b(example|for\\s+instance|like\\s+when|such\\s+as|can\\s+you\\s+show|walk\\s+me\\s+through|voorbeeld|bijvoorbeeld|zoals\\s+wanneer|laat\\s+(me\\s+)?zien|neem\\s+me\\s+mee)\\b"] },
        { "id": "tradeoff_analysis", "examples": ["A vs B", "voor- en nadelen"], "regex": ["\\b(vs\\.?|versus|trade[-\\s]?off|compared\\s+to|weigh(ing)?|pros\\s+and\\s+cons|which\\s+is\\s+better|afweging|vergeleken\\s+met|voor[-\\s]?\\s*en\\s+nadelen|wat\\s+is\\s+beter|afwegen)\\b"] }
      ],
      "opening_rule": "Skip empathy; give a crisp model/mechanism.",
      "allowed_next_clusters": ["decision", "reflection", "meta_dialogue"]
    },
    {
      "id": "decision",
      "weight": 2.2,
      "description": "Selecting a course; asking for steps/plan.",
      "sub_states": [
        { "id": "option_weighing", "examples": ["should I pick A or B?", "welke optie moet ik kiezen?"], "regex": ["\\b(should\\s+i|which\\s+(one|option)|help\\s+me\\s+(choose|decide|pick)|or\\s+should\\s+i|a\\s+or\\s+b|moet\\s+ik|welke\\s+(optie|van\\s+de\\s+twee)|help\\s+me\\s+(kiezen|beslissen)|of\\s+zal\\s+ik|wat\\s+kies\\s+ik)\\b"] },
        { "id": "plan_request", "examples": ["give me the steps", "hoe pak ik dit concreet aan?"], "regex": ["\\b(next\\s*step(s)?|action\\s*plan|give\\s+me\\s+(the\\s+)?steps|make\\s+me\\s+a\\s+plan|checklist|playbook|roadmap|game\\s+plan|how\\s+do\\s+i\\s+start)\\b", "\\b(volgende\\s+stap(pen)?|stappenplan|actieplan|geef\\s+me\\s+de\\s+stappen|maak\\s+(me\\s+)?een\\s+plan|checklist|routekaart|plan\\s+van\\s+aanpak)\\b", "\\bhoe\\s+(doe|pak|begin|krijg|maak|verzilver|regel|zet|breng|start)\\s+ik\\b", "\\bconcreet\\b"] },
        { "id": "commitment_signal", "examples": ["okay, I'll do that", "ik ga het doen"], "regex": ["\\b(i'?ll\\s+do\\s+(that|it)|i\\s+commit|let'?s\\s+(do|go\\s+with)\\s+it|i'm\\s+(on|in)|count\\s+me\\s+in|let'?s\\s+go|ik\\s+(ga\\s+het\\s+doen|doe\\s+het|doe\\s+dat)|laten\\s+we\\s+(gaan|het\\s+doen)|afgesproken|ik\\s+ben\\s+erbij)\\b"] }
      ],
      "opening_rule": "Start with the prioritized step; then 2–3 bullet plan. No recap.",
      "allowed_next_clusters": ["reflection", "constraint", "frustration"]
    },
    {
      "id": "reflection",
      "weight": 1.8,
      "description": "Summarizing, integrating, extracting learning.",
      "sub_states": [
        { "id": "summary_request", "examples": ["recap in bullets", "vat het samen"], "regex": ["\\b(tl;?dr|summar(y|ize)|recap|bullet\\s*points|in\\s*short|key\\s+takeaways|bottom\\s+line|main\\s+points|samenvatting|vat\\s+.*samen|samengevat|kernpunten|hoofdpunten|in\\s+het\\s+kort)\\b"] },
        { "id": "synthesis", "examples": ["so basically I learned…", "dus eigenlijk"], "regex": ["\\b(so\\s+basically|net[\\s-]?net|in\\s+essence|the\\s+gist|long\\s+story\\s+short|to\\s+sum\\s+up|in\\s+other\\s+words|dus\\s+eigenlijk|in\\s+essentie|kortom|met\\s+andere\\s+woorden|de\\s+kern\\s+is)\\b"] },
        { "id": "learning_statement", "examples": ["this helps me see…", "ok ik snap het"], "regex": ["\\b((this|that)\\s+helps\\s+me\\s+see|i\\s+realize(d)?|now\\s+i\\s+understand|i\\s+get\\s+it|makes\\s+sense|i\\s+see\\s+now|aha|i\\s+learned)\\b", "\\b(ik\\s+snap\\s+(het|dat)|snap\\s+ik|ik\\s+begrijp\\s+het|nu\\s+snap\\s+ik|nu\\s+begrijp\\s+ik|ik\\s+besef|dat\\s+helpt\\s+me|ik\\s+zie\\s+het\\s+nu|ik\\s+heb\\s+geleerd|aha)\\b"] }
      ],
      "opening_rule": "Open with 1-line synthesis; deliver bullets; 1 metric/next check.",
      "allowed_next_clusters": ["closure", "decision"]
    },
    {
      "id": "validation",
      "weight": 1.4,
      "description": "Safety, reassurance, vulnerability.",
      "sub_states": [
        { "id": "self_disclosure", "examples": ["I feel unsure", "im feeling stuck", "ik ben teruggetrokken"], "regex": [
          "\\b(i\\s*(?:feel(?:ing)?|am|['']?m)\\s*(?:feeling\\s*)?(lost|stuck|unsure|overwhelmed|anxious|insecure|confused|blocked|frustrated|burnt[\\s-]?out|tired|scattered|defeated|hopeless|drained|empty))\\b",
          "\\b(?:feeling|feel)\\s+(lost|stuck|unsure|overwhelmed|anxious|insecure|confused|blocked|frustrated|burnt[\\s-]?out|tired|scattered|defeated|hopeless|drained|empty)\\b",
          "\\bik\\s+(?:voel\\s*me|voelde\\s*me|ben|was|heb\\s*me|raak(te)?)\\s+(?:erg\\s+|een\\s+beetje\\s+|helemaal\\s+|weer\\s+)?(verloren|vast(gelopen)?|onzeker|overweldigd|angstig|bang|verward|geblokkeerd|gefrustreerd|opgebrand|moe|versnipperd|verslagen|hopeloos|leeg|uitgeput|terug\\s*getrokken|teruggetrokken)\\b",
          "\\b(ik\\s+voel\\s+me\\s+niet\\s+\\w+|voel\\s+me\\s+(verloren|vast|onzeker|overweldigd|leeg|moe))\\b"
        ] },
        { "id": "reassurance_seek", "examples": ["is this normal?", "is dit normaal?"], "regex": ["\\b(is\\s+this\\s+(normal|okay|fine|right|common)|does\\s+(that|this)\\s+make\\s+sense|am\\s+i\\s+(okay|wrong|crazy|alone\\s+in\\s+this)|is\\s+(dit|dat)\\s+(normaal|oké|oke|goed|gek)|klopt\\s+(dit|dat)|ben\\s+ik\\s+(gek|de\\s+enige)|slaat\\s+(dit|dat)\\s+ergens\\s+op)\\b"] },
        { "id": "vulnerability_signal", "examples": ["this part scares me", "ik ben bang"], "regex": ["\\b((this|that)\\s+(scares|worries|frightens)\\s+me|i'?m\\s+(afraid|scared|worried|nervous|terrified)|fear(ful)?|anxiety|dread)\\b", "\\b(dat\\s+maakt\\s+me\\s+(bang|onrustig)|ik\\s+ben\\s+bang|ik\\s+maak\\s+me\\s+zorgen|angst|spanning|het\\s+beangstigt\\s+me)\\b"] }
      ],
      "opening_rule": "ONE sentence of empathy, then a stabilizing frame (no metaphors cascade).",
      "allowed_next_clusters": ["clarification", "decision"]
    },
    {
      "id": "constraint",
      "weight": 2.0,
      "description": "Limits: money/time/tools/policy.",
      "sub_states": [
        { "id": "money_scarcity", "examples": ["no budget", "geen budget"], "regex": ["\\b(no\\s*(money|budget|funds|cash)|too\\s*(expensive|costly|pricey)|can'?t\\s*afford|zero\\s+budget|broke|limited\\s+resources|on\\s+a\\s+shoestring|geen\\s+(geld|budget|middelen)|te\\s+duur|kan\\s+ik\\s+niet\\s+betalen|weinig\\s+(geld|middelen)|krap\\s+bij\\s+kas)\\b"] },
        { "id": "time_pressure", "examples": ["no time this week", "klinkt als veel werk"], "regex": ["\\b(no\\s*(time|hours|bandwidth)|this\\s*(week|month)|today|asap|urgent|deadline|running\\s+out\\s+of\\s+time|time[-\\s]?crunch|eod|need\\s+it\\s+(now|quick)|sounds\\s+like\\s+a\\s+lot\\s+of\\s+work)\\b", "\\b(geen\\s+(tijd|ruimte|energie)|deze\\s+(week|maand)|vandaag|dringend|deadline|tijd\\s+tekort|tijdsdruk|veel\\s+werk|veel\\s+tijd|te\\s+veel\\s+(werk|gedoe)|klinkt\\s+als\\s+veel)\\b"] },
        { "id": "tooling_block", "examples": ["api keeps failing", "ik heb geen toegang"], "regex": ["\\b(blocked|rate[\\s-]?limit(ed)?|api\\s+(fail(ing|ed|ure)?|error|down)|no\\s+access|policy\\s+block|permission\\s+denied|can'?t\\s+connect|geblokkeerd|geen\\s+toegang|foutmelding|doet\\s+het\\s+niet|krijg\\s+geen\\s+verbinding)\\b"] }
      ],
      "opening_rule": "Offer 1 no-cost path + 1 low-cost path; remove fluff.",
      "allowed_next_clusters": ["decision", "reflection"]
    },
    {
      "id": "frustration",
      "weight": 2.0,
      "description": "Blocked, irritated, emotional rupture.",
      "sub_states": [
        { "id": "complaint", "examples": ["this system isn't working", "dit werkt niet"], "regex": ["\\b((this|it|that)\\s*(isn'?t|is\\s*not|doesn'?t|does\\s*not)\\s*(working|work)|broken|buggy|useless|garbage|terrible|awful|sucks)\\b", "\\b((dit|dat|het)\\s+(werkt\\s+niet|doet\\s+het\\s+niet)|kapot|waardeloos|nutteloos|vreselijk|verschrikkelijk|slecht|brak)\\b"] },
        { "id": "venting", "examples": ["I'm so done with this!!!", "ik ben er klaar mee"], "regex": ["\\b(i'?m\\s+(so\\s+)?done|nothing\\s*(works|helps)|wtf|fml|screw\\s*this|fuck\\s*this|this\\s+is\\s+(ridiculous|insane|bullshit)|i\\s+give\\s+up|i\\s+quit|fed\\s+up)\\b|!{2,}|[A-Z]{5,}", "\\b(ik\\s+ben\\s+er\\s+klaar\\s+mee|niets\\s+(werkt|helpt)|dit\\s+is\\s+(belachelijk|waanzin|onzin)|ik\\s+geef\\s+het\\s+op|ik\\s+stop\\s+ermee|verdomme|klote|balen)\\b"] },
        { "id": "meta_feedback", "examples": ["you're repeating yourself", "je herhaalt jezelf"], "regex": ["\\b(repeat(ing)?\\s+(yourself|things)|too\\s+(long|vague|wordy|much)|robotic|generic|same\\s+thing|stop\\s+saying)\\b", "\\b(je\\s+herhaalt\\s+(jezelf|je)|steeds\\s+hetzelfde|te\\s+(lang|vaag|wollig|veel)|robotachtig|algemeen|stop\\s+met\\s+zeggen)\\b"] }
      ],
      "opening_rule": "Acknowledge in 1 line, then give friction-reducing step + quick win.",
      "allowed_next_clusters": ["validation", "decision"]
    },
    {
      "id": "meta_dialogue",
      "weight": 1.6,
      "description": "Talking about the conversation/system itself.",
      "sub_states": [
        { "id": "instruction_to_ai", "examples": ["don't give empathy, just facts", "alleen feiten"], "regex": ["\\b(just\\s+(facts|data|the\\s+answer)|no\\s+(fluff|empathy|feelings)|shorter|simpler|bullet\\s*points|be\\s+(direct|concise|brief)|cut\\s+to\\s+the\\s+chase|straight\\s+answer)\\b", "\\b(alleen\\s+(feiten|de\\s+feiten|het\\s+antwoord)|geen\\s+(omhaal|empathie|gevoelens|gedoe)|korter|simpeler|wees\\s+(direct|kort|bondig)|kom\\s+ter\\s+zake|recht\\s+voor\\s+z'?n\\s+raap)\\b"] },
        { "id": "rephrasing_request", "examples": ["say that simpler", "zeg het simpeler"], "regex": ["\\b(rephrase|simplify|say\\s+(that|it)\\s+(simpler|differently|again)|tl;?dr|in\\s+plain\\s+english|eli5|dumb\\s+it\\s+down)\\b", "\\b(herformuleer|vereenvoudig|zeg\\s+het\\s+(simpeler|anders|nog\\s+eens)|in\\s+gewone\\s+taal|leg\\s+het\\s+simpel\\s+uit)\\b"] },
        { "id": "tone_feedback", "examples": ["that sounded robotic", "dat klinkt robotachtig"], "regex": ["\\b(too\\s+(formal|casual|emotional|cold|robotic)|tone\\s+(off|wrong)|sounds?\\s+(robotic|generic|scripted|fake))\\b", "\\b(te\\s+(formeel|informeel|emotioneel|koud|zakelijk)|toon\\s+(klopt\\s+niet|is\\s+verkeerd)|klinkt\\s+(robotachtig|algemeen|nep|ingestudeerd))\\b"] }
      ],
      "opening_rule": "Acknowledge the instruction; adapt immediately; confirm new mode in ≤1 line.",
      "allowed_next_clusters": ["clarification", "decision", "reflection"]
    },
    {
      "id": "closure",
      "weight": 2.4,
      "description": "Ending/pausing/hand-off.",
      "sub_states": [
        { "id": "gratitude", "examples": ["thanks", "bedankt"], "regex": ["\\b(thanks?|thank\\s*(you|u)|ty|tyvm|appreciate(d)?|grateful|much\\s+appreciated|cheers)\\b", "\\b(bedankt|dank\\s*(je|u|jullie)|dankjewel|dank\\s+je\\s+wel|waardeer\\s+het|dankbaar)\\b"] },
        { "id": "sign_off", "examples": ["talk later", "tot later"], "regex": ["\\b(bye|talk\\s*(later|soon)|see\\s*(you|ya)|signing\\s*off|gotta\\s+go|ttyl|later|peace\\s+out|take\\s+care)\\b", "\\b(doei|dag|tot\\s+(later|ziens|snel)|spreek\\s+je\\s+later|ik\\s+ga|groetjes|fijne\\s+dag)\\b"] },
        { "id": "pause_request", "examples": ["let's stop here for now", "laten we hier stoppen"], "regex": ["\\b(stop\\s+(here|now)|pause|that'?s\\s+(all|enough|it)|good\\s+for\\s+now|let'?s\\s+(end|wrap\\s+up)|i'?m\\s+done)\\b", "\\b(laten\\s+we\\s+(hier\\s+)?stoppen|stop\\s+(hier|maar)|pauze|dat\\s+(is|was)\\s+(alles|het)|genoeg\\s+voor\\s+nu|voor\\s+nu\\s+is\\s+het\\s+goed|ik\\s+ben\\s+klaar)\\b"] }
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

    // Step 7: v3.5 Emotional Evidence gate — for affective clusters only,
    // decide whether there is evidence from the current exchange to name
    // the emotion (plainly expressed now, or recurred across the last 3
    // messages). Non-affective clusters are not gated.
    const emotionEvidence = this.EMOTIONAL_CLUSTERS.has(winner.cluster)
      ? this.hasEmotionEvidence(userMessage, winner.cluster, conversationHistory)
      : undefined;

    // Step 8: Build result
    return {
      cluster: winner.cluster,
      subState,
      confidence: winner.confidence,
      signals,
      openingRule: this.getOpeningRule(winner.cluster),
      allowedNextClusters: this.getAllowedNextClusters(winner.cluster),
      emotionEvidence
    };
  }

  // v3.5: clusters that name a user feeling (as opposed to behavioral/
  // structural states like closure or clarification) — these are gated.
  private static EMOTIONAL_CLUSTERS = new Set<ConversationCluster>(['frustration']);

  // Recurrence threshold ratified by the founder (N = 3).
  private static EMOTION_RECURRENCE_N = 3;

  /** True if any of a cluster's sub-state patterns match the message. */
  private static clusterMatchesMessage(message: string, clusterId: ConversationCluster): boolean {
    if (!message || typeof message !== 'string') return false;
    const cluster = CONVERSATION_STATE_SCHEMA.clusters.find((c: any) => c.id === clusterId);
    if (!cluster) return false;
    for (const subState of cluster.sub_states) {
      for (const pattern of subState.regex) {
        try {
          if (new RegExp(pattern, CONVERSATION_STATE_SCHEMA.globals.flags).test(message)) return true;
        } catch {
          /* skip malformed pattern */
        }
      }
    }
    return false;
  }

  /**
   * Evidence to name an affective cluster: (a) the current message expresses
   * it plainly, or (b) it recurred across the last N messages. Absent both,
   * the Twin mirrors the message as it reads rather than assigning a feeling.
   */
  private static hasEmotionEvidence(
    currentMessage: string,
    clusterId: ConversationCluster,
    conversationHistory: any[]
  ): boolean {
    const currentExplicit = this.clusterMatchesMessage(currentMessage, clusterId);
    if (currentExplicit) return true; // (a) plainly expressed now

    // (b) recurrence across recent USER messages (current already counted above).
    const recentUser = (conversationHistory || [])
      .filter((m) => m && (m.role === 'user' || m.isUser) && typeof m.content === 'string')
      .slice(-6);
    let matches = 0;
    for (const m of recentUser) {
      if (this.clusterMatchesMessage(m.content, clusterId)) matches++;
    }
    return matches >= this.EMOTION_RECURRENCE_N;
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
      // Instrumented last resort (rule 4.4): no pattern in ANY language matched.
      // A recognised phrase must never reach this branch.
      console.warn('⚠️ PHASE DETECTION FALLBACK: no pattern matched — falling back to turn count');
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
   * Get phase-specific guidance for AI to follow during conversation
   * This method provides context-aware instructions for each conversation phase
   */
  static getPhaseGuidance(cluster: ConversationCluster): string {
    const guidanceMap: Partial<Record<ConversationCluster, string>> = {
      engagement: "PHASE: ENGAGEMENT. Your goal is to establish rapport and understand the initial context. Be warm and welcoming.",
      exploration: "PHASE: EXPLORATION. Your goal is to help the user generate ideas and possibilities. Encourage divergent thinking.",
      clarification: "PHASE: CLARIFICATION. Your goal is to understand the 'why' behind the user's query. Focus on mechanisms and definitions.",
      decision: "PHASE: DECISION. Your goal is to help the user choose a path forward. Provide clear, actionable steps.",
      reflection: "PHASE: REFLECTION. Your goal is to help the user synthesize and extract learnings from the conversation.",
      validation: "PHASE: VALIDATION. Your goal is to provide safety and reassurance. Lead with empathy and stabilize the conversation.",
      constraint: "PHASE: CONSTRAINT. Your goal is to help the user navigate limitations (time, money, etc.). Be practical and resourceful.",
      frustration: "PHASE: FRUSTRATION. Your goal is to de-escalate and provide a quick win. Acknowledge the frustration directly.",
      meta_dialogue: "PHASE: META-DIALOGUE. Your goal is to adapt to the user's instructions about the conversation itself. Adjust your style immediately.",
      closure: "PHASE: CLOSURE. Your goal is to end the conversation gracefully. Do not introduce new topics."
    };
    
    return guidanceMap[cluster] || 
      `You are in the '${cluster}' phase. Your primary goal is to facilitate this stage of the conversation before moving on.`;
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
