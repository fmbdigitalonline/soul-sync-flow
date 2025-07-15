/**
 * Hermetic Fractal Blueprint Engine
 * Transforms personality blueprint data into consciousness activation wisdom
 * through the Seven Hermetic Laws
 */

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

export class HermeticEngine {
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
    const fractals: HermeticFractal[] = [];
    
    if (!blueprint) return fractals;

    // Transform MBTI through Hermetic lens
    if (blueprint.cognition_mbti?.type) {
      fractals.push(this.transformMBTI(blueprint.cognition_mbti));
    }

    // Transform Human Design through Hermetic lens
    if (blueprint.energy_strategy_human_design?.type) {
      fractals.push(this.transformHumanDesign(blueprint.energy_strategy_human_design));
    }

    // Transform Astrological elements through Hermetic lens
    if (blueprint.archetype_western?.sun_sign) {
      fractals.push(this.transformAstrology(blueprint.archetype_western));
    }

    // Transform Life Path through Hermetic lens
    if (blueprint.values_life_path?.lifePathNumber) {
      fractals.push(this.transformLifePath(blueprint.values_life_path));
    }

    return fractals;
  }

  private static transformMBTI(mbti: any): HermeticFractal {
    const type = mbti.type || 'Unknown';
    const preferences = mbti.preferences || {};
    
    return {
      trait: `MBTI: ${type}`,
      laws: [
        {
          name: "Mentalism",
          essence: this.HERMETIC_LAWS.MENTALISM,
          interpretation: this.getMBTIMentalism(type, preferences)
        },
        {
          name: "Correspondence", 
          essence: this.HERMETIC_LAWS.CORRESPONDENCE,
          interpretation: this.getMBTICorrespondence(type, preferences)
        },
        {
          name: "Vibration",
          essence: this.HERMETIC_LAWS.VIBRATION,
          interpretation: this.getMBTIVibration(type, preferences)
        },
        {
          name: "Polarity",
          essence: this.HERMETIC_LAWS.POLARITY,
          interpretation: this.getMBTIPolarity(type, preferences)
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
        },
        {
          name: "Cause & Effect",
          essence: this.HERMETIC_LAWS.CAUSE_EFFECT,
          interpretation: this.getHDCauseEffect(type, authority)
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
          interpretation: this.getAstroCorrespondence(sunSign, moonSign)
        },
        {
          name: "Vibration",
          essence: this.HERMETIC_LAWS.VIBRATION,
          interpretation: this.getAstroVibration(sunSign, moonSign)
        }
      ],
      activationPrompt: this.getAstroActivation(sunSign, moonSign),
      shadowWork: this.getAstroShadow(sunSign, moonSign),
      practicalWisdom: this.getAstroPractical(sunSign, moonSign)
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
          interpretation: this.getLifePathCauseEffect(number)
        },
        {
          name: "Rhythm",
          essence: this.HERMETIC_LAWS.RHYTHM,
          interpretation: this.getLifePathRhythm(number)
        }
      ],
      activationPrompt: this.getLifePathActivation(number),
      shadowWork: this.getLifePathShadow(number),
      practicalWisdom: this.getLifePathPractical(number)
    };
  }

  // MBTI Hermetic Interpretations
  private static getMBTIMentalism(type: string, prefs: any): string {
    const patterns = {
      'ENFP': 'Your mind naturally perceives infinite possibilities. This mental framework creates reality through enthusiastic vision.',
      'INTJ': 'Your mind operates as a strategic architect. This mental discipline manifests systematic transformation.',
      'ENFJ': 'Your mind harmonizes collective potential. This mental orientation creates inspiring leadership.',
      'INFP': 'Your mind seeks authentic truth. This mental purity manifests deep personal transformation.',
      'ENTP': 'Your mind generates innovative connections. This mental agility creates revolutionary possibilities.',
      'INTP': 'Your mind analyzes universal patterns. This mental precision manifests logical truth.',
      'ENTJ': 'Your mind structures efficient systems. This mental authority creates powerful manifestation.',
      'INFJ': 'Your mind perceives hidden patterns. This mental insight manifests transformative wisdom.'
    };
    return patterns[type] || 'Your mind shapes reality through your unique cognitive perspective.';
  }

  private static getMBTICorrespondence(type: string, prefs: any): string {
    const patterns = {
      'ENFP': 'Your inner enthusiasm reflects in outer inspiration. When you feel scattered internally, external chaos manifests.',
      'INTJ': 'Your inner vision mirrors outer strategic action. Inner clarity creates outer systematic success.',
      'ENFJ': 'Your inner harmony reflects in outer community healing. Inner emotional wellness creates outer relationship flourishing.',
      'INFP': 'Your inner authenticity mirrors outer creative expression. Inner alignment creates outer artistic manifestation.',
      'ENTP': 'Your inner curiosity reflects in outer innovative projects. Inner mental agility creates outer adaptability.',
      'INTP': 'Your inner logic mirrors outer analytical precision. Inner understanding creates outer systematic truth.',
      'ENTJ': 'Your inner determination reflects in outer leadership achievement. Inner confidence creates outer authority.',
      'INFJ': 'Your inner knowing mirrors outer transformative guidance. Inner wisdom creates outer healing influence.'
    };
    return patterns[type] || 'Your inner state directly reflects in your outer experience.';
  }

  private static getMBTIVibration(type: string, prefs: any): string {
    const patterns = {
      'ENFP': 'You vibrate at the frequency of possibility. Your energy naturally uplifts and inspires others.',
      'INTJ': 'You vibrate at the frequency of strategic wisdom. Your energy creates focused transformation.',
      'ENFJ': 'You vibrate at the frequency of collective healing. Your energy harmonizes and elevates communities.',
      'INFP': 'You vibrate at the frequency of authentic truth. Your energy creates deep personal resonance.',
      'ENTP': 'You vibrate at the frequency of creative innovation. Your energy generates dynamic possibilities.',
      'INTP': 'You vibrate at the frequency of logical precision. Your energy creates systematic understanding.',
      'ENTJ': 'You vibrate at the frequency of powerful manifestation. Your energy creates structured achievement.',
      'INFJ': 'You vibrate at the frequency of intuitive wisdom. Your energy creates transformative insights.'
    };
    return patterns[type] || 'Your unique vibrational frequency creates your distinctive energy signature.';
  }

  private static getMBTIPolarity(type: string, prefs: any): string {
    const patterns = {
      'ENFP': 'Integrate boundless enthusiasm with focused discipline. Balance external inspiration with internal reflection.',
      'INTJ': 'Integrate strategic thinking with intuitive wisdom. Balance systematic planning with spontaneous insight.',
      'ENFJ': 'Integrate others-focus with self-care. Balance giving energy with receiving nourishment.',
      'INFP': 'Integrate inner authenticity with outer expression. Balance private depth with public sharing.',
      'ENTP': 'Integrate innovative vision with practical implementation. Balance creative exploration with focused completion.',
      'INTP': 'Integrate logical analysis with emotional wisdom. Balance intellectual pursuit with heart connection.',
      'ENTJ': 'Integrate leadership authority with collaborative receptivity. Balance commanding presence with humble listening.',
      'INFJ': 'Integrate intuitive knowing with practical application. Balance inner vision with outer action.'
    };
    return patterns[type] || 'Balance your natural strengths with their complementary opposites.';
  }

  private static getMBTIActivation(type: string): string {
    const patterns = {
      'ENFP': 'Today, channel your enthusiasm into one focused creative project. Let your inspiration birth something tangible.',
      'INTJ': 'Today, trust your strategic vision and take one concrete step toward your long-term transformation.',
      'ENFJ': 'Today, serve others while honoring your own needs. Let your leadership inspire through authentic example.',
      'INFP': 'Today, express your authentic truth through creative action. Let your inner values guide outer manifestation.',
      'ENTP': 'Today, innovate with purpose. Let your creative connections serve meaningful transformation.',
      'INTP': 'Today, apply your analytical gifts to solve a real problem. Let your understanding create practical wisdom.',
      'ENTJ': 'Today, lead with both strength and compassion. Let your authority serve collective elevation.',
      'INFJ': 'Today, trust your intuitive guidance and act on your inner knowing. Let your wisdom illuminate the path.'
    };
    return patterns[type] || 'Today, embody your highest potential through conscious action.';
  }

  private static getMBTIShadow(type: string): string {
    const patterns = {
      'ENFP': 'Your shadow emerges when enthusiasm becomes scattered escapism. Ground your vision in practical commitment.',
      'INTJ': 'Your shadow emerges when strategic thinking becomes cold detachment. Warm your plans with heart wisdom.',
      'ENFJ': 'Your shadow emerges when others-focus becomes self-neglect. Honor your needs as sacred as others.',
      'INFP': 'Your shadow emerges when authenticity becomes isolated perfectionism. Share your truth with courageous vulnerability.',
      'ENTP': 'Your shadow emerges when innovation becomes restless avoidance. Deepen your creative commitment.',
      'INTP': 'Your shadow emerges when analysis becomes paralyzed overthinking. Trust your wisdom into action.',
      'ENTJ': 'Your shadow emerges when leadership becomes dominating control. Lead through inspiring empowerment.',
      'INFJ': 'Your shadow emerges when intuition becomes overwhelming sensitivity. Ground your insights in practical wisdom.'
    };
    return patterns[type] || 'Your shadow holds the key to your greatest transformation.';
  }

  private static getMBTIPractical(type: string): string {
    const patterns = {
      'ENFP': 'Create daily inspiration rituals. Set boundaries to protect your energy. Channel enthusiasm into focused projects.',
      'INTJ': 'Trust your strategic intuition. Take breaks from planning to receive insights. Balance solitude with meaningful connection.',
      'ENFJ': 'Schedule regular self-care as non-negotiable. Practice saying no to preserve energy for what matters most.',
      'INFP': 'Honor your creative rhythms. Set gentle boundaries. Express your values through small daily actions.',
      'ENTP': 'Finish one project before starting another. Practice mindful presence. Channel innovation into practical solutions.',
      'INTP': 'Set deadlines for analysis phases. Practice expressing feelings. Apply insights to real-world problems.',
      'ENTJ': 'Practice receptive listening. Delegate to develop others. Balance achievement with relationship nurturing.',
      'INFJ': 'Trust your intuitive timing. Practice grounding techniques. Share your insights with trusted individuals.'
    };
    return patterns[type] || 'Apply your unique gifts through consistent, conscious practice.';
  }

  // Human Design Hermetic Interpretations
  private static getHDRhythm(type: string, authority: string): string {
    const patterns = {
      'Manifestor': 'Your rhythm flows in powerful bursts followed by rest. Honor your natural initiating cycles.',
      'Generator': 'Your rhythm sustains through consistent response. Follow your sacral timing for optimal flow.',
      'Projector': 'Your rhythm operates through invitation and rest. Balance guidance periods with energy restoration.',
      'Reflector': 'Your rhythm mirrors lunar cycles. Attune to monthly rhythms for decision clarity.'
    };
    return patterns[type] || 'Your energy follows natural rhythmic patterns that create optimal manifestation.';
  }

  private static getHDGender(type: string, authority: string): string {
    const patterns = {
      'Manifestor': 'Balance masculine initiation with feminine receptivity. Lead with both power and intuition.',
      'Generator': 'Balance masculine action with feminine response. Create through both doing and allowing.',
      'Projector': 'Balance masculine guidance with feminine wisdom. Guide through both directing and receiving.',
      'Reflector': 'Balance masculine discernment with feminine reflection. Decide through both clarity and feeling.'
    };
    return patterns[type] || 'Your design integrates both masculine and feminine energies for complete expression.';
  }

  private static getHDCauseEffect(type: string, authority: string): string {
    const patterns = {
      'Manifestor': 'Your initiated actions create ripple effects. Use your manifesting power with conscious intention.',
      'Generator': 'Your responses create sustained manifestation. Choose your responses wisely for desired outcomes.',
      'Projector': 'Your guidance creates systematic improvement. Share wisdom that creates lasting transformation.',
      'Reflector': 'Your reflection creates community awareness. Your clarity creates collective understanding.'
    };
    return patterns[type] || 'Your design creates specific effects through aligned action.';
  }

  private static getHDActivation(type: string, authority: string): string {
    const patterns = {
      'Manifestor': 'Today, initiate something that serves your highest vision. Trust your power to create change.',
      'Generator': 'Today, respond to opportunities that light you up. Trust your sacral wisdom.',
      'Projector': 'Today, share your unique insights where invited. Trust your guiding wisdom.',
      'Reflector': 'Today, reflect on what feels right in your environment. Trust your lunar timing.'
    };
    return patterns[type] || 'Today, honor your design through aligned action.';
  }

  private static getHDShadow(type: string): string {
    const patterns = {
      'Manifestor': 'Your shadow emerges when power becomes control. Lead through inspired invitation.',
      'Generator': 'Your shadow emerges when response becomes reaction. Choose conscious response over automatic reaction.',
      'Projector': 'Your shadow emerges when guidance becomes unsolicited advice. Wait for invitation before sharing wisdom.',
      'Reflector': 'Your shadow emerges when reflection becomes endless uncertainty. Trust your lunar clarity cycles.'
    };
    return patterns[type] || 'Your shadow holds the key to your design mastery.';
  }

  private static getHDPractical(type: string, authority: string): string {
    const patterns = {
      'Manifestor': 'Inform others before initiating. Take regular rest periods. Trust your urges to create.',
      'Generator': 'Follow your gut responses. Engage in work that lights you up. Honor your sacral timing.',
      'Projector': 'Wait for invitations. Focus on mastery over activity. Rest when energy is low.',
      'Reflector': 'Take time for major decisions. Surround yourself with healthy environments. Trust your lunar wisdom.'
    };
    return patterns[type] || 'Live your design through daily conscious practice.';
  }

  // Astrology Hermetic Interpretations
  private static getAstroCorrespondence(sun: string, moon: string): string {
    return `Your ${sun} sun consciousness mirrors your outer expression, while your ${moon} moon essence reflects your inner emotional world. When these align, you experience authentic power.`;
  }

  private static getAstroVibration(sun: string, moon: string): string {
    return `Your ${sun} sun vibrates at the frequency of conscious expression, while your ${moon} moon resonates with subconscious emotional patterns. Harmonizing these creates your unique vibrational signature.`;
  }

  private static getAstroActivation(sun: string, moon: string): string {
    return `Today, embody your ${sun} sun consciousness while honoring your ${moon} moon wisdom. Let both aspects guide your authentic expression.`;
  }

  private static getAstroShadow(sun: string, moon: string): string {
    return `Your shadow emerges when your ${sun} sun ego overrides your ${moon} moon wisdom, or when emotional patterns eclipse conscious choice. Integration creates wholeness.`;
  }

  private static getAstroPractical(sun: string, moon: string): string {
    return `Express your ${sun} sun gifts through daily conscious action. Honor your ${moon} moon needs through emotional self-care. Balance both for optimal well-being.`;
  }

  // Life Path Hermetic Interpretations
  private static getLifePathCauseEffect(number: string): string {
    const patterns = {
      '1': 'Your leadership actions create pioneering opportunities. Lead by example to manifest your vision.',
      '2': 'Your cooperative actions create harmonious relationships. Collaborate to manifest collective success.',
      '3': 'Your creative actions create inspiring expression. Share your gifts to manifest joyful abundance.',
      '4': 'Your systematic actions create stable foundations. Build with integrity to manifest lasting success.',
      '5': 'Your adventurous actions create freedom and change. Embrace variety to manifest expansive growth.',
      '6': 'Your nurturing actions create healing and service. Care for others to manifest meaningful purpose.',
      '7': 'Your spiritual actions create wisdom and insight. Seek truth to manifest deeper understanding.',
      '8': 'Your ambitious actions create material success. Use power wisely to manifest abundance.',
      '9': 'Your humanitarian actions create universal service. Serve the greater good to manifest spiritual fulfillment.'
    };
    return patterns[number] || 'Your life path creates specific manifestation through aligned action.';
  }

  private static getLifePathRhythm(number: string): string {
    const patterns = {
      '1': 'Your rhythm flows through cycles of initiation and completion. Honor your pioneering timing.',
      '2': 'Your rhythm flows through cycles of cooperation and harmony. Honor your collaborative timing.',
      '3': 'Your rhythm flows through cycles of creativity and expression. Honor your artistic timing.',
      '4': 'Your rhythm flows through cycles of building and stability. Honor your systematic timing.',
      '5': 'Your rhythm flows through cycles of adventure and freedom. Honor your exploratory timing.',
      '6': 'Your rhythm flows through cycles of service and nurturing. Honor your caring timing.',
      '7': 'Your rhythm flows through cycles of study and wisdom. Honor your contemplative timing.',
      '8': 'Your rhythm flows through cycles of achievement and success. Honor your ambitious timing.',
      '9': 'Your rhythm flows through cycles of service and completion. Honor your humanitarian timing.'
    };
    return patterns[number] || 'Your life path follows natural rhythmic patterns for optimal manifestation.';
  }

  private static getLifePathActivation(number: string): string {
    const patterns = {
      '1': 'Today, initiate something that aligns with your pioneering vision. Lead with courage.',
      '2': 'Today, collaborate in ways that create harmony. Share your diplomatic gifts.',
      '3': 'Today, express your creativity in inspiring ways. Share your artistic vision.',
      '4': 'Today, build something that creates lasting value. Work with systematic dedication.',
      '5': 'Today, embrace adventure and explore new possibilities. Follow your freedom-seeking spirit.',
      '6': 'Today, serve others through your natural nurturing gifts. Create healing through care.',
      '7': 'Today, seek wisdom through study or contemplation. Trust your spiritual insights.',
      '8': 'Today, take action toward your material goals. Use your power for positive creation.',
      '9': 'Today, serve the greater good through your humanitarian gifts. Give with open heart.'
    };
    return patterns[number] || 'Today, embody your life path through conscious action.';
  }

  private static getLifePathShadow(number: string): string {
    const patterns = {
      '1': 'Your shadow emerges when leadership becomes domination. Lead through inspiring example.',
      '2': 'Your shadow emerges when cooperation becomes self-sacrifice. Honor your needs while serving others.',
      '3': 'Your shadow emerges when creativity becomes scattered expression. Focus your artistic gifts.',
      '4': 'Your shadow emerges when stability becomes rigid control. Build with flexible strength.',
      '5': 'Your shadow emerges when freedom becomes irresponsible escapism. Ground your adventures.',
      '6': 'Your shadow emerges when service becomes martyrdom. Care for yourself while caring for others.',
      '7': 'Your shadow emerges when wisdom becomes isolated intellectualism. Share your insights.',
      '8': 'Your shadow emerges when success becomes ruthless ambition. Use power with integrity.',
      '9': 'Your shadow emerges when service becomes overwhelming sacrifice. Serve with sustainable boundaries.'
    };
    return patterns[number] || 'Your shadow holds the key to your life path mastery.';
  }

  private static getLifePathPractical(number: string): string {
    const patterns = {
      '1': 'Take daily leadership actions. Practice confident decision-making. Initiate projects aligned with your vision.',
      '2': 'Practice collaboration and diplomacy. Create harmonious relationships. Mediate conflicts with wisdom.',
      '3': 'Express creativity daily. Share your gifts with others. Maintain optimistic perspective.',
      '4': 'Build systematic routines. Create stable foundations. Work with patient dedication.',
      '5': 'Embrace variety and change. Travel or explore new ideas. Maintain freedom within structure.',
      '6': 'Serve others through your natural gifts. Create nurturing environments. Practice self-care.',
      '7': 'Dedicate time to study and reflection. Trust your intuitive insights. Seek spiritual wisdom.',
      '8': 'Take strategic action toward goals. Use power responsibly. Create material abundance.',
      '9': 'Serve humanitarian causes. Practice compassion and forgiveness. Complete projects with wisdom.'
    };
    return patterns[number] || 'Live your life path through daily conscious practice.';
  }

  static generateHermeticWisdom(fractals: HermeticFractal[]): string {
    if (fractals.length === 0) return '';
    
    let wisdom = '\n🔮 HERMETIC SOUL WISDOM:\n';
    
    fractals.forEach(fractal => {
      wisdom += `\n${fractal.trait}:\n`;
      
      // Randomly select 2-3 laws for each fractal to keep response focused
      const selectedLaws = fractal.laws.slice(0, Math.floor(Math.random() * 2) + 2);
      
      selectedLaws.forEach(law => {
        wisdom += `• ${law.name}: ${law.interpretation}\n`;
      });
      
      wisdom += `✨ Activation: ${fractal.activationPrompt}\n`;
      wisdom += `🌑 Shadow Work: ${fractal.shadowWork}\n`;
      wisdom += `⚡ Practical: ${fractal.practicalWisdom}\n\n`;
    });
    
    return wisdom;
  }
}
