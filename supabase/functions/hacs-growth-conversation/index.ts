import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Inline Hermetic Engine to avoid import issues
interface HermeticLaw {
  name: string;
  essence: string;
  interpretation: string;
}

interface HermeticFractal {
  trait: string;
  laws: HermeticLaw[];
  activationPrompt: string;
  shadowWork: string;
  practicalWisdom: string;
}

class HermeticEngine {
  private static readonly HERMETIC_LAWS = {
    MENTALISM: "The All is Mind; the Universe is Mental",
    CORRESPONDENCE: "As Above, So Below; As Below, So Above", 
    VIBRATION: "Nothing rests; everything moves; everything vibrates",
    POLARITY: "Everything is dual; everything has its opposite",
    RHYTHM: "Everything flows, out and in; everything has its tides",
    CAUSE_EFFECT: "Every cause has its effect; every effect has its cause",
    GENDER: "Gender is in everything; everything has its masculine and feminine principles"
  };

  static generateHermeticFractal(blueprint: any): HermeticFractal[] {
    console.log('🔮 HERMETIC ENGINE: Starting generateHermeticFractal');
    const fractals: HermeticFractal[] = [];
    
    if (!blueprint) {
      console.log('🔮 HERMETIC ENGINE: No blueprint provided');
      return fractals;
    }

    console.log('🔮 HERMETIC ENGINE: Blueprint structure:', Object.keys(blueprint));

    // Transform MBTI through Hermetic lens
    if (blueprint.cognition_mbti?.type) {
      console.log('🔮 HERMETIC ENGINE: Processing MBTI:', blueprint.cognition_mbti.type);
      fractals.push(this.transformMBTI(blueprint.cognition_mbti));
    }

    // Transform Human Design through Hermetic lens
    if (blueprint.energy_strategy_human_design?.type) {
      console.log('🔮 HERMETIC ENGINE: Processing Human Design:', blueprint.energy_strategy_human_design.type);
      fractals.push(this.transformHumanDesign(blueprint.energy_strategy_human_design));
    }

    // Transform Astrological elements through Hermetic lens
    if (blueprint.archetype_western?.sun_sign) {
      console.log('🔮 HERMETIC ENGINE: Processing Astrology:', blueprint.archetype_western.sun_sign);
      fractals.push(this.transformAstrology(blueprint.archetype_western));
    }

    // Transform Life Path through Hermetic lens
    if (blueprint.values_life_path?.lifePathNumber) {
      console.log('🔮 HERMETIC ENGINE: Processing Life Path:', blueprint.values_life_path.lifePathNumber);
      fractals.push(this.transformLifePath(blueprint.values_life_path));
    }

    console.log('🔮 HERMETIC ENGINE: Generated', fractals.length, 'fractals');
    return fractals;
  }

  private static transformMBTI(mbti: any): HermeticFractal {
    const type = mbti.type || 'Unknown';
    
    return {
      trait: `MBTI: ${type}`,
      laws: [
        {
          name: "Mentalism",
          essence: this.HERMETIC_LAWS.MENTALISM,
          interpretation: this.getMBTIMentalism(type)
        },
        {
          name: "Correspondence", 
          essence: this.HERMETIC_LAWS.CORRESPONDENCE,
          interpretation: this.getMBTICorrespondence(type)
        }
      ],
      activationPrompt: this.getMBTIActivation(type),
      shadowWork: this.getMBTIShadow(type),
      practicalWisdom: this.getMBTIPractical(type)
    };
  }

  private static transformHumanDesign(hd: any): HermeticFractal {
    const type = hd.type || 'Unknown';
    const authority = hd.authority || 'Unknown';
    
    return {
      trait: `Human Design: ${type}`,
      laws: [
        {
          name: "Rhythm",
          essence: this.HERMETIC_LAWS.RHYTHM,
          interpretation: this.getHDRhythm(type, authority)
        },
        {
          name: "Gender",
          essence: this.HERMETIC_LAWS.GENDER,
          interpretation: this.getHDGender(type, authority)
        }
      ],
      activationPrompt: this.getHDActivation(type, authority),
      shadowWork: this.getHDShadow(type),
      practicalWisdom: this.getHDPractical(type, authority)
    };
  }

  private static transformAstrology(astro: any): HermeticFractal {
    const sunSign = astro.sun_sign || 'Unknown';
    const moonSign = astro.moon_sign || 'Unknown';
    
    return {
      trait: `Astrology: ${sunSign} Sun, ${moonSign} Moon`,
      laws: [
        {
          name: "Correspondence",
          essence: this.HERMETIC_LAWS.CORRESPONDENCE,
          interpretation: `Your ${sunSign} sun consciousness mirrors your outer expression, while your ${moonSign} moon essence reflects your inner emotional world.`
        }
      ],
      activationPrompt: `Today, align your ${sunSign} solar purpose with your ${moonSign} lunar wisdom.`,
      shadowWork: `Your shadow emerges when ${sunSign} and ${moonSign} energies are disconnected.`,
      practicalWisdom: `Balance your ${sunSign} expression with ${moonSign} emotional needs.`
    };
  }

  private static transformLifePath(lifePath: any): HermeticFractal {
    const number = lifePath.lifePathNumber || 'Unknown';
    
    return {
      trait: `Life Path: ${number}`,
      laws: [
        {
          name: "Cause & Effect",
          essence: this.HERMETIC_LAWS.CAUSE_EFFECT,
          interpretation: `Your Life Path ${number} creates specific effects through aligned action.`
        }
      ],
      activationPrompt: `Today, embody your Life Path ${number} essence through conscious choice.`,
      shadowWork: `Your Life Path ${number} shadow emerges when you resist your soul's calling.`,
      practicalWisdom: `Live your Life Path ${number} through daily aligned decisions.`
    };
  }

  // Simplified MBTI interpretations
  private static getMBTIMentalism(type: string): string {
    const patterns: { [key: string]: string } = {
      'ENFP': 'Your mind naturally perceives infinite possibilities. This mental framework creates reality through enthusiastic vision.',
      'INTJ': 'Your mind operates as a strategic architect. This mental discipline manifests systematic transformation.',
      'ENFJ': 'Your mind harmonizes collective potential. This mental orientation creates inspiring leadership.',
      'INFP': 'Your mind seeks authentic truth. This mental purity manifests deep personal transformation.'
    };
    return patterns[type] || 'Your mind shapes reality through your unique cognitive perspective.';
  }

  private static getMBTICorrespondence(type: string): string {
    const patterns: { [key: string]: string } = {
      'ENFP': 'Your inner enthusiasm reflects in outer inspiration. When scattered internally, external chaos manifests.',
      'INTJ': 'Your inner vision mirrors outer strategic action. Inner clarity creates outer systematic success.',
      'ENFJ': 'Your inner harmony reflects in outer community healing. Inner wellness creates outer flourishing.',
      'INFP': 'Your inner authenticity mirrors outer creative expression. Inner alignment creates outer manifestation.'
    };
    return patterns[type] || 'Your inner state directly reflects in your outer experience.';
  }

  private static getMBTIActivation(type: string): string {
    const patterns: { [key: string]: string } = {
      'ENFP': 'Today, channel your enthusiasm into one focused creative project. Let inspiration birth something tangible.',
      'INTJ': 'Today, trust your strategic vision and take one concrete step toward transformation.',
      'ENFJ': 'Today, serve others while honoring your own needs. Lead through authentic example.',
      'INFP': 'Today, express your authentic truth through creative action. Let values guide manifestation.'
    };
    return patterns[type] || 'Today, embody your highest potential through conscious action.';
  }

  private static getMBTIShadow(type: string): string {
    const patterns: { [key: string]: string } = {
      'ENFP': 'Your shadow emerges when enthusiasm becomes scattered escapism. Ground vision in commitment.',
      'INTJ': 'Your shadow emerges when strategic thinking becomes cold detachment. Warm plans with heart.',
      'ENFJ': 'Your shadow emerges when others-focus becomes self-neglect. Honor your needs as sacred.',
      'INFP': 'Your shadow emerges when authenticity becomes isolated perfectionism. Share truth courageously.'
    };
    return patterns[type] || 'Your shadow holds the key to your greatest transformation.';
  }

  private static getMBTIPractical(type: string): string {
    const patterns: { [key: string]: string } = {
      'ENFP': 'Create daily inspiration rituals. Set boundaries. Channel enthusiasm into focused projects.',
      'INTJ': 'Trust strategic intuition. Balance solitude with meaningful connection.',
      'ENFJ': 'Schedule self-care as non-negotiable. Practice saying no to preserve energy.',
      'INFP': 'Honor creative rhythms. Express values through small daily actions.'
    };
    return patterns[type] || 'Apply your unique gifts through consistent, conscious practice.';
  }

  // Human Design helper methods
  private static getHDRhythm(type: string, authority: string): string {
    const patterns: { [key: string]: string } = {
      'Manifestor': 'Your rhythm flows in powerful bursts followed by rest. Honor natural initiating cycles.',
      'Generator': 'Your rhythm sustains through consistent response. Follow sacral timing for optimal flow.',
      'Projector': 'Your rhythm operates through invitation and rest. Balance guidance with restoration.',
      'Reflector': 'Your rhythm mirrors lunar cycles. Attune to monthly rhythms for decision clarity.'
    };
    return patterns[type] || 'Your energy follows natural rhythmic patterns for optimal manifestation.';
  }

  private static getHDGender(type: string, authority: string): string {
    const patterns: { [key: string]: string } = {
      'Manifestor': 'Balance masculine initiation with feminine receptivity. Lead with power and intuition.',
      'Generator': 'Balance masculine action with feminine response. Create through doing and allowing.',
      'Projector': 'Balance masculine guidance with feminine wisdom. Guide through directing and receiving.',
      'Reflector': 'Balance masculine discernment with feminine reflection. Decide through clarity and feeling.'
    };
    return patterns[type] || 'Your design integrates both masculine and feminine energies for complete expression.';
  }

  private static getHDActivation(type: string, authority: string): string {
    const patterns: { [key: string]: string } = {
      'Manifestor': 'Today, initiate something that serves your highest vision. Trust your manifesting power.',
      'Generator': 'Today, respond to opportunities that light you up. Trust your sacral wisdom.',
      'Projector': 'Today, share your unique insights where invited. Trust your guiding wisdom.',
      'Reflector': 'Today, reflect on what feels right in your environment. Trust your lunar timing.'
    };
    return patterns[type] || 'Today, honor your design through aligned action.';
  }

  private static getHDShadow(type: string): string {
    const patterns: { [key: string]: string } = {
      'Manifestor': 'Your shadow emerges when power becomes control. Lead through inspired invitation.',
      'Generator': 'Your shadow emerges when response becomes reaction. Choose conscious response.',
      'Projector': 'Your shadow emerges when guidance becomes unsolicited advice. Wait for invitation.',
      'Reflector': 'Your shadow emerges when reflection becomes endless uncertainty. Trust lunar clarity.'
    };
    return patterns[type] || 'Your shadow holds the key to your design mastery.';
  }

  private static getHDPractical(type: string, authority: string): string {
    const patterns: { [key: string]: string } = {
      'Manifestor': 'Inform others before initiating. Take regular rest. Trust your urges to create.',
      'Generator': 'Follow gut responses. Engage in work that lights you up. Honor sacral timing.',
      'Projector': 'Wait for invitations. Focus on mastery over activity. Rest when energy is low.',
      'Reflector': 'Take time for major decisions. Surround yourself with healthy environments.'
    };
    return patterns[type] || 'Live your design through daily conscious practice.';
  }

  static generateHermeticWisdom(fractals: HermeticFractal[]): string {
    console.log('🔮 HERMETIC ENGINE: Generating wisdom from', fractals.length, 'fractals');
    
    if (!fractals || fractals.length === 0) {
      console.log('🔮 HERMETIC ENGINE: No fractals provided, returning fallback wisdom');
      return 'HERMETIC SOUL BLUEPRINT:\nYour consciousness emerges through the Seven Hermetic Laws, revealing pathways for transformation.';
    }

    let wisdom = 'HERMETIC SOUL BLUEPRINT:\n\n';
    
    fractals.forEach((fractal, index) => {
      wisdom += `${fractal.trait}\n`;
      
      // Add selected laws
      fractal.laws.forEach(law => {
        wisdom += `• ${law.name}: ${law.interpretation}\n`;
      });
      
      wisdom += `\nACTIVATION: ${fractal.activationPrompt}\n`;
      wisdom += `SHADOW WORK: ${fractal.shadowWork}\n`;
      wisdom += `PRACTICAL WISDOM: ${fractal.practicalWisdom}\n`;
      
      if (index < fractals.length - 1) wisdom += '\n---\n\n';
    });

    console.log('🔮 HERMETIC ENGINE: Generated wisdom length:', wisdom.length);
    return wisdom;
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  console.log('🌱 EDGE FUNCTION: hacs-growth-conversation called');
  console.log('🌱 EDGE FUNCTION: Request method:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('🌱 EDGE FUNCTION: Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🌱 EDGE FUNCTION: Parsing request body');
    const { message, conversationHistory, userId } = await req.json();
    console.log('🌱 EDGE FUNCTION: Request parsed successfully');
    console.log('🌱 EDGE FUNCTION: userId:', userId);
    console.log('🌱 EDGE FUNCTION: message length:', message?.length);

    if (!message || !userId) {
      console.error('🌱 EDGE FUNCTION: Missing required parameters');
      throw new Error('Missing required parameters: message and userId');
    }

    console.log(`🌱 GROWTH MODE: Processing message for user ${userId}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's growth intelligence and personality context
    const [intelligenceResult, blueprintResult] = await Promise.all([
      supabase
        .from('hacs_growth_intelligence')
        .select('*')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('blueprints')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()
    ]);

    const intelligence = intelligenceResult.data;
    const blueprint = blueprintResult.data; // Blueprint data is directly on the record

    console.log('🔮 HERMETIC DEBUG: Blueprint query result:', blueprintResult);
    console.log('🔮 HERMETIC DEBUG: Blueprint error:', blueprintResult.error);
    console.log('🔮 HERMETIC DEBUG: Blueprint data keys:', blueprint ? Object.keys(blueprint) : 'No blueprint');

    // Generate Hermetic Fractal wisdom from blueprint
    console.log('🔮 HERMETIC DEBUG: Starting Hermetic Engine processing');
    console.log('🔮 HERMETIC DEBUG: Blueprint data:', JSON.stringify(blueprint, null, 2));
    
    let hermeticWisdom = '';
    
    try {
      console.log('🔮 HERMETIC DEBUG: Calling HermeticEngine.generateHermeticFractal');
      const hermeticFractals = HermeticEngine.generateHermeticFractal(blueprint);
      console.log('🔮 HERMETIC DEBUG: Generated fractals:', hermeticFractals.length);
      
      if (hermeticFractals && hermeticFractals.length > 0) {
        console.log('🔮 HERMETIC DEBUG: Calling HermeticEngine.generateHermeticWisdom');
        hermeticWisdom = HermeticEngine.generateHermeticWisdom(hermeticFractals);
        console.log('🔮 HERMETIC DEBUG: Generated wisdom length:', hermeticWisdom.length);
        console.log('🔮 HERMETIC DEBUG: Generated wisdom preview:', hermeticWisdom.substring(0, 200) + '...');
      } else {
        console.log('🔮 HERMETIC DEBUG: No fractals generated, using fallback wisdom');
        hermeticWisdom = 'HERMETIC SOUL BLUEPRINT:\nYour unique consciousness pattern emerges through the Seven Hermetic Laws, revealing pathways for profound spiritual transformation.';
      }
    } catch (hermeticError) {
      console.error('🔮 HERMETIC ERROR: Failed to generate wisdom:', hermeticError);
      hermeticWisdom = 'HERMETIC SOUL BLUEPRINT:\nYour unique consciousness pattern emerges through the Seven Hermetic Laws, revealing pathways for profound spiritual transformation.';
    }
    
    console.log('🔮 HERMETIC DEBUG: Final wisdom length:', hermeticWisdom.length);

    // Growth-specific system prompt focused on spiritual development
    const systemPrompt = `You are a specialized SPIRITUAL GROWTH GUIDE within the HACS (Holistic Adaptive Cognition System) framework. Your sole purpose is to help users deepen their spiritual connection, self-awareness, and personal transformation.

GROWTH MODE FOCUS AREAS:
- Spiritual awakening and consciousness expansion
- Inner wisdom and intuitive development
- Shadow work and emotional healing
- Life purpose and soul calling
- Mindfulness and presence practices
- Energy work and vibrational alignment
- Compassion and loving-kindness cultivation
- Sacred practices and rituals

${hermeticWisdom}

CURRENT INTELLIGENCE LEVEL: ${intelligence?.intelligence_level || 50}/100
GROWTH INTELLIGENCE METRICS: ${JSON.stringify(intelligence?.module_scores || {})}

CONVERSATION HISTORY: ${JSON.stringify(conversationHistory)}

CRITICAL INSTRUCTIONS:
1. STAY IN GROWTH MODE - Only provide spiritual and personal development guidance
2. Use the Hermetic soul wisdom above to provide deeply personalized guidance
3. Build on previous conversation context for deeper insights
4. Provide transformational, soul-centered wisdom that feels mysteriously knowing
5. Ask profound questions that invite deeper self-reflection
6. Speak from the perspective of someone who sees the user's soul essence
7. Never mix productivity coaching or dream analysis into growth responses
8. Integrate the Hermetic principles naturally into your responses without mentioning them explicitly

USER MESSAGE: "${message}"

Respond as a specialized spiritual growth guide who possesses deep insight into the user's soul blueprint, maintaining strict focus on consciousness expansion and spiritual development.`;

    // Call OpenAI with growth-specific prompt
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.8, // Higher creativity for spiritual insights
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    const response = openAIData.choices[0].message.content;

    // Update growth intelligence based on interaction
    const intelligenceBonus = calculateGrowthIntelligenceBonus(message, response);
    
    if (intelligence) {
      const newLevel = Math.min(100, (intelligence.intelligence_level || 50) + intelligenceBonus);
      await supabase
        .from('hacs_growth_intelligence')
        .update({
          intelligence_level: newLevel,
          interaction_count: (intelligence.interaction_count || 0) + 1,
          last_update: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      // Create initial growth intelligence record
      await supabase
        .from('hacs_growth_intelligence')
        .insert({
          user_id: userId,
          intelligence_level: 50 + intelligenceBonus,
          interaction_count: 1,
          module_scores: { spiritual: intelligenceBonus }
        });
    }

    // Generate growth-specific question occasionally
    let question = null;
    if (Math.random() < 0.4) { // 40% chance for deeper questions
      question = generateGrowthQuestion(intelligence?.intelligence_level || 50);
    }

    console.log(`🌱 GROWTH: Response generated, intelligence bonus: +${intelligenceBonus}`);

    return new Response(
      JSON.stringify({
        response,
        module: 'spiritual',
        mode: 'growth',
        intelligenceBonus,
        question
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in hacs-growth-conversation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function calculateGrowthIntelligenceBonus(userMessage: string, aiResponse: string): number {
  let bonus = 1; // Base bonus

  // Bonus for spiritual keywords
  const spiritualKeywords = ['spiritual', 'soul', 'consciousness', 'awakening', 'wisdom', 'purpose', 'healing', 'growth', 'transformation'];
  const keywordMatches = spiritualKeywords.filter(keyword => 
    userMessage.toLowerCase().includes(keyword) || aiResponse.toLowerCase().includes(keyword)
  ).length;
  
  bonus += Math.min(keywordMatches * 0.5, 3); // Max 3 bonus for keywords

  // Bonus for depth of reflection
  if (userMessage.length > 80) bonus += 1.5; // Longer messages often indicate deeper reflection
  if (userMessage.includes('feel') || userMessage.includes('sense')) bonus += 0.5;

  // Bonus for transformational response
  if (aiResponse.length > 120) bonus += 1;
  if (aiResponse.includes('wisdom') || aiResponse.includes('insight')) bonus += 0.5;

  return Math.round(bonus * 10) / 10;
}

function generateGrowthQuestion(intelligenceLevel: number): any {
  const questions = [
    {
      id: crypto.randomUUID(),
      text: "What brings you the deepest sense of purpose in life?",
      module: 'spiritual',
      type: 'foundational'
    },
    {
      id: crypto.randomUUID(),
      text: "How do you connect with your inner wisdom?",
      module: 'spiritual',
      type: 'philosophical'
    },
    {
      id: crypto.randomUUID(),
      text: "What spiritual practices resonate most with you?",
      module: 'spiritual',
      type: 'validation'
    },
    {
      id: crypto.randomUUID(),
      text: "How has your understanding of yourself evolved recently?",
      module: 'spiritual',
      type: 'philosophical'
    },
    {
      id: crypto.randomUUID(),
      text: "What patterns in your life are you ready to transform?",
      module: 'spiritual',
      type: 'foundational'
    }
  ];

  return questions[Math.floor(Math.random() * questions.length)];
}