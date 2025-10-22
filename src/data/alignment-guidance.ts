/**
 * Alignment Guidance Data
 * Provides think/act/react guidance for staying in alignment with personality types
 */

export const mbtiAlignmentGuidance: Record<string, { think: string; act: string; react: string }> = {
  enfj: {
    think: "Frame challenges as opportunities to empower others. When making decisions, ask: 'How will this create growth for everyone involved?' Trust your intuitive read of people's potential.",
    act: "Lead by example rather than dictating. Create space for others to voice their needs. Schedule dedicated time for your own renewal - your influence multiplies when you're resourced.",
    react: "When feeling overwhelmed by others' emotions, pause to distinguish what's yours from what you've absorbed. Name the pattern you're seeing rather than taking responsibility for fixing everything."
  },
  enfp: {
    think: "Honor your authentic enthusiasm while testing ideas against your core values. Ask: 'Does this align with what truly matters to me?' Let your curiosity lead, but use values as your compass.",
    act: "Start new projects with defined completion criteria. Create accountability structures that feel playful, not restrictive. Build in reflection time to integrate your explorations.",
    react: "When scattered, return to your 'why' - your deepest values. When others question your approach, explain the vision behind your enthusiasm rather than defending the details."
  },
  entj: {
    think: "Balance strategic thinking with emotional intelligence. Before pushing forward, ask: 'Who needs to be brought along, and how can I honor their pace?' See collaboration as strategic advantage, not inefficiency.",
    act: "Set ambitious goals while building in feedback loops. Delegate with clear outcomes but flexible methods. Pause to appreciate progress, not just identify gaps.",
    react: "When frustrated by inefficiency, redirect that energy into systems improvement. When challenged, listen for the wisdom in resistance rather than viewing it as obstacle."
  },
  entp: {
    think: "Channel your innovative thinking toward problems that matter to you long-term. Ask: 'What would I regret not pursuing?' Balance exploring all angles with committing to a direction.",
    act: "Choose one or two key projects to take from concept to completion. Build bridges between your ideas and others' implementation skills. Document your insights for future reference.",
    react: "When bored, look deeper rather than moving on - mastery brings new challenges. When others don't see your vision, adjust your communication rather than dismissing their perspective."
  },
  infj: {
    think: "Trust your profound insights while accepting that transformation takes time. Ask: 'What small step honors both my vision and current reality?' Your ideals guide you, but patience sustains your mission.",
    act: "Share your vision in digestible pieces. Create boundaries that protect your energy for your true priorities. Take tangible action on your insights rather than perfecting the vision.",
    react: "When the world feels misaligned with your ideals, focus on the one person or situation where you can make a difference. When hurt, communicate your needs directly rather than withdrawing completely."
  },
  infp: {
    think: "Honor the depth of your inner world while engaging with outer reality. Ask: 'How can I express this feeling or value through action today?' Your authenticity is your gift - share it.",
    act: "Choose one creative project and commit to small, regular progress. Find communities that share your values. Translate feelings into words or art to process and share them.",
    react: "When overwhelmed by the gap between ideal and real, focus on one aligned action you can take. When criticized, distinguish feedback on your work from attacks on your worth."
  },
  intj: {
    think: "Balance your strategic vision with present-moment awareness. Ask: 'How can I communicate this insight in a way others can hear?' Your vision is valuable - make it accessible.",
    act: "Build systems that account for human factors, not just logical efficiency. Seek input from diverse perspectives before finalizing plans. Share your reasoning, not just your conclusions.",
    react: "When others don't understand your vision, explain your thought process rather than dismissing their confusion. When emotions arise, name them as data rather than viewing them as obstacles."
  },
  intp: {
    think: "Channel your analytical brilliance toward problems that create real-world impact. Ask: 'What would make this theory actionable?' Your insights deserve to see daylight.",
    act: "Set external deadlines for your explorations. Share works-in-progress rather than waiting for perfection. Collaborate with implementers who can ground your ideas.",
    react: "When lost in analysis, ask: 'What's the minimum viable next step?' When others challenge your logic, stay curious about their reasoning rather than defending your position."
  },
  esfj: {
    think: "Your care for others is a strength - ensure you're also on your own care list. Ask: 'Am I giving from fullness or depletion?' Your worth exists independent of your usefulness.",
    act: "Practice saying 'no' to requests that don't align with your priorities. Build reciprocal relationships where receiving feels as natural as giving. Celebrate your contributions without needing external validation.",
    react: "When feeling unappreciated, communicate your needs directly rather than giving more to earn recognition. When criticized, separate feedback about your actions from your value as a person."
  },
  esfp: {
    think: "Honor your present-moment joy while building toward your future. Ask: 'How can I enjoy the journey AND create what I need long-term?' Fun and planning can coexist.",
    act: "Set up automatic systems for future needs (savings, health, planning). Find ways to make necessary tasks playful. Balance spontaneity with a few non-negotiable commitments.",
    react: "When avoiding difficult emotions, pause to feel them fully before moving on - processing them prevents their return. When bored with routine, look for ways to innovate within structure."
  },
  estj: {
    think: "Balance your results-focus with relationship-building. Ask: 'How can we achieve this goal while strengthening the team?' Efficiency includes people feeling valued.",
    act: "Create systems that allow for flexibility within structure. Seek input on how to improve processes. Recognize effort and creativity, not just results.",
    react: "When others resist your approach, get curious about their concerns rather than pushing harder. When things don't go as planned, adapt the strategy while maintaining the  vision."
  },
  estp: {
    think: "Channel your action-orientation into strategic impact. Ask: 'What risk is worth taking, and what needs more planning?' Your boldness is most powerful when directed wisely.",
    act: "Balance immediate action with strategic pauses. Build in reflection time after intense activity. Find challenges that require both courage and preparation.",
    react: "When restless, choose calculated risks over impulsive ones. When others want to slow down, consider what you might gain from their perspective before pushing forward."
  },
  isfj: {
    think: "Your dedication to others is admirable - ensure it includes yourself. Ask: 'Am I maintaining boundaries that allow sustainable service?' Preservation isn't selfishness.",
    act: "Communicate your needs directly rather than expecting others to notice. Say 'no' to requests that would overextend you. Take breaks before burnout, not after.",
    react: "When feeling taken for granted, speak up rather than increasing your efforts. When change is needed, remember that your loyalty can extend to new approaches."
  },
  isfp: {
    think: "Honor your authentic expression while engaging with the world's needs. Ask: 'How can I share my art/craft/perspective in a way that sustains me?' Your sensitivity is strength.",
    act: "Create regular time for your creative expression. Find communities that appreciate your unique perspective. Take small steps to share your work more widely.",
    react: "When criticized, distinguish feedback on your work from attacks on your authentic self. When confined, find creative freedom within constraints before abandoning ship."
  },
  istp: {
    think: "Your problem-solving is most powerful when connected to purpose. Ask: 'What challenge would be worth my full engagement?' Direct your mastery toward what matters.",
    act: "Take on projects that require both technical skill and strategic thinking. Share your expertise through teaching or documentation. Balance solo work with collaborative challenges.",
    react: "When bored, seek depth in current challenges before jumping ship. When others need emotional support, offer practical help - that's your natural language of care."
  },
  istj: {
    think: "Your reliability is your superpower - ensure it serves your priorities, not just others' demands. Ask: 'Is this commitment aligned with my values and capacity?' Duty includes self-duty.",
    act: "Build in regular reviews of your commitments to ensure they still serve you. Create systems for efficiency that include rest and renewal. Document lessons learned to improve processes.",
    react: "When overwhelmed by responsibilities, identify what can be delegated, declined, or delayed. When change is needed, analyze the benefits of new approaches with the same rigor you apply to current methods."
  }
};

export const sunSignAlignmentGuidance: Record<string, { think: string; act: string; react: string }> = {
  aries: {
    think: "Frame challenges as adventures that fuel your pioneering spirit. View obstacles as opportunities to demonstrate your courage and leadership abilities.",
    act: "Channel your natural initiative into purposeful action. Start projects with enthusiasm but build sustainable momentum rather than burning out quickly.",
    react: "When frustrated, pause before acting. Your impulsive nature is a strength when directed wisely - use it to seize opportunities, not create unnecessary conflicts."
  },
  taurus: {
    think: "Ground decisions in practical wisdom and long-term value. Trust your ability to build lasting foundations through patient, steady effort.",
    act: "Move forward with deliberate purpose. Your strength lies in consistent progress - embrace the process rather than rushing toward results.",
    react: "When change feels threatening, remember that flexibility and stability can coexist. Adapt your approach while staying true to your core values."
  },
  gemini: {
    think: "Embrace your curiosity as a superpower. Connect diverse ideas and perspectives to create innovative solutions that others might miss.",
    act: "Channel your mental agility into focused projects. Complete key initiatives before jumping to the next exciting idea.",
    react: "When overwhelmed by options, pause to clarify your priorities. Your versatility is most powerful when directed toward meaningful goals."
  },
  cancer: {
    think: "Trust your emotional intelligence as a guide. Your intuition about people and situations is a gift - honor it while balancing with logic.",
    act: "Create nurturing environments that support growth - both yours and others'. Your caring nature is a strength when you also care for yourself.",
    react: "When hurt, allow yourself to feel without building walls. Process emotions constructively, then extend the same compassion to others that you need for yourself."
  },
  leo: {
    think: "Recognize your natural leadership as a responsibility to uplift others. True greatness comes from empowering those around you to shine.",
    act: "Lead with authentic confidence, not ego. Share the spotlight generously - your light doesn't diminish when others shine alongside you.",
    react: "When pride is wounded, remember that vulnerability is strength. Admit mistakes gracefully and use criticism as fuel for growth, not defensiveness."
  },
  virgo: {
    think: "Channel your analytical gifts toward improvement, not perfection. Excellence comes from consistent effort, not flawless execution.",
    act: "Serve others through your expertise while honoring your own needs. Your helpful nature is most sustainable when you maintain healthy boundaries.",
    react: "When critical thoughts arise, direct them constructively. Practice the same patience with yourself and others that you'd show a cherished friend."
  },
  libra: {
    think: "Seek harmony without sacrificing authenticity. True balance includes honoring your own needs alongside others' perspectives.",
    act: "Make decisions with confidence, even when perfection isn't possible. Your gift for seeing all sides is valuable - don't let it paralyze your action.",
    react: "When conflict arises, address it directly with grace. Avoiding discord often creates more imbalance than honest, respectful communication."
  },
  scorpio: {
    think: "Embrace your intensity as transformative power. Your depth allows profound understanding - use it to heal and empower rather than control.",
    act: "Pursue your goals with focused determination while remaining open to unexpected paths. Your resilience is a gift when paired with flexibility.",
    react: "When trust is broken, allow time for healing without closing off entirely. Your capacity for deep connection is worth the vulnerability it requires."
  },
  sagittarius: {
    think: "View life as an expansive journey of growth and discovery. Your optimism and wisdom-seeking nature inspire others - share your vision generously.",
    act: "Pursue adventure with purpose. Your freedom-loving spirit thrives when you commit to meaningful goals that expand your horizons.",
    react: "When restrained, look for growth opportunities within limitations. True freedom comes from mastery, not escape - embrace the discipline that supports your independence."
  },
  capricorn: {
    think: "Recognize that sustainable success includes joy and connection. Your ambition is most fulfilling when it serves a purpose beyond achievement.",
    act: "Build your legacy with patience and integrity. Your natural discipline creates lasting impact - trust the process even when results aren't immediate.",
    react: "When setbacks occur, view them as valuable lessons rather than failures. Your resilience grows stronger each time you adapt and persevere."
  },
  aquarius: {
    think: "Honor your unique perspective as a gift to humanity. Your innovative vision helps others see new possibilities - trust your unconventional insights.",
    act: "Create change that benefits the collective while staying true to your authentic self. Your individuality and humanitarian values can coexist beautifully.",
    react: "When life slows down, use the time for reflection rather than restless impatience. View delays as opportunities to refine your vision before taking bold action."
  },
  pisces: {
    think: "Trust your intuitive wisdom while maintaining healthy boundaries. Your empathy is a superpower when you also protect your own energy.",
    act: "Bring your creative visions into reality through consistent, grounded action. Your dreams deserve practical steps that make them tangible.",
    react: "When overwhelmed by others' emotions, practice discernment. You can be compassionate without absorbing every feeling around you - your wellbeing matters too."
  }
};

// Moon Sign Alignment (Emotional/Inner World)
export const moonSignAlignmentGuidance: Record<string, { think: string; act: string; react: string }> = {
  aries: {
    think: "Honor your need for emotional independence and spontaneity. Quick emotional responses are natural - channel them constructively.",
    act: "Create outlets for emotional energy through physical activity. Your feelings need movement and action to process healthily.",
    react: "When emotionally triggered, pause before responding. Your instinct to react immediately can be transformed into passionate, purposeful expression."
  },
  taurus: {
    think: "Trust your need for emotional stability and comfort. Your feelings develop slowly and run deep - this steadiness is your strength.",
    act: "Build environments that nurture your emotional well-being. Invest in routines and surroundings that provide consistent comfort.",
    react: "When emotional security is threatened, resist the urge to become rigid. Flexibility in your approach doesn't mean abandoning your core needs."
  },
  gemini: {
    think: "Embrace your need to process emotions mentally. Talking and journaling help you understand your feelings - this is your natural path to emotional clarity.",
    act: "Connect with others when processing emotions. Your feelings become clearer through dialogue and diverse perspectives.",
    react: "When emotions intensify, avoid intellectualizing them away. Allow yourself to feel deeply even when it's uncomfortable or illogical."
  },
  cancer: {
    think: "Honor the depth of your emotional sensitivity as wisdom. Your feelings are valid indicators of what matters most to you.",
    act: "Create safe spaces for emotional expression. Nurture yourself with the same care you offer others.",
    react: "When emotions overwhelm, remember past times you've navigated difficult feelings. Your emotional resilience is stronger than you realize."
  },
  leo: {
    think: "Recognize your need for emotional warmth and appreciation. Your feelings are naturally dramatic - this isn't a flaw, it's authentic expression.",
    act: "Express emotions creatively and generously. Your emotional openness inspires others to be brave with their feelings too.",
    react: "When feeling unappreciated, remember your inherent worth isn't defined by external validation. Shine from within regardless of others' responses."
  },
  virgo: {
    think: "Notice your tendency to analyze feelings rather than simply feel them. Emotions don't need to be 'fixed' - they need to be acknowledged.",
    act: "Create practical rituals for emotional self-care. Your feelings benefit from organized, consistent attention to your well-being.",
    react: "When anxious, focus on what you can control without trying to perfect your emotional state. Accept feelings as they are."
  },
  libra: {
    think: "Recognize your need for emotional harmony and partnership. Your feelings seek balance - this is natural, not indecisive.",
    act: "Share your emotions openly with trusted others. Your feelings become clearer through relationship and reflection.",
    react: "When facing emotional conflict, don't sacrifice your truth for peace. Authentic harmony includes your honest feelings."
  },
  scorpio: {
    think: "Trust the intensity and depth of your emotional life. Your capacity for profound feeling is a gift, not a burden.",
    act: "Allow emotional transformation to happen naturally. Your feelings have cycles - honor the death and rebirth process.",
    react: "When emotions become overwhelming, practice vulnerability. Sharing your depths with trusted others brings healing, not weakness."
  },
  sagittarius: {
    think: "Honor your need for emotional freedom and optimism. Your feelings seek expansion and meaning - this quest is valid.",
    act: "Explore emotions through adventure and philosophy. Your feelings benefit from context and perspective.",
    react: "When emotions feel heavy, resist the urge to escape immediately. Sometimes sitting with difficult feelings opens unexpected wisdom."
  },
  capricorn: {
    think: "Acknowledge your need for emotional structure and control. Allowing vulnerability doesn't mean losing your composure.",
    act: "Build sustainable emotional practices. Your feelings benefit from the same discipline and patience you apply to goals.",
    react: "When emotions surface at 'inconvenient' times, remember that feelings don't follow schedules. Make space for them anyway."
  },
  aquarius: {
    think: "Honor your unique emotional landscape. Your feelings may seem detached to others, but your way of processing is equally valid.",
    act: "Connect emotions to larger purposes and communities. Your feelings become meaningful when linked to collective values.",
    react: "When emotions feel confusing, remember you don't have to understand them intellectually. Sometimes feeling is enough."
  },
  pisces: {
    think: "Trust your deep emotional and psychic sensitivity. Your porous boundaries allow profound connection - protect them wisely.",
    act: "Create art and beauty from your emotions. Your feelings become medicine for others through creative expression.",
    react: "When absorbing others' emotions, practice discernment and grounding. Your empathy is powerful when you maintain your own center."
  }
};

// Rising Sign Alignment (Public Persona/First Impressions)
export const risingSignAlignmentGuidance: Record<string, { think: string; act: string; react: string }> = {
  aries: {
    think: "Recognize that your natural directness is a strength. Own your bold first impression - it attracts those who value authenticity.",
    act: "Lead from the front. People expect you to take initiative - step into that role with confidence.",
    react: "When others seem intimidated, soften your approach without diminishing your energy. Your presence can inspire rather than overwhelm."
  },
  taurus: {
    think: "Trust that your calm, grounded presence creates safety for others. Your steady energy is a gift in chaotic environments.",
    act: "Move at your natural pace. Your deliberate approach builds trust - don't rush to meet others' expectations.",
    react: "When pressured to move faster, hold your ground graciously. Your timing is usually better than the urgency around you."
  },
  gemini: {
    think: "Embrace your natural curiosity and adaptability. Your versatile energy helps others feel comfortable and engaged.",
    act: "Share your diverse interests openly. Your multi-faceted nature is attractive, not scattered.",
    react: "When others want you to 'pick one thing,' remind them that integration is also a valuable skill. Your breadth has purpose."
  },
  cancer: {
    think: "Honor your instinct to create welcoming, nurturing environments. Your caring presence is often the first thing people notice.",
    act: "Lead with empathy. Your emotional intelligence creates instant rapport - trust this natural gift.",
    react: "When protecting yourself with a 'shell,' remember that selective vulnerability attracts genuine connections. You can be both safe and open."
  },
  leo: {
    think: "Own your natural charisma and warmth. Your radiant presence lights up rooms - this isn't arrogance, it's authenticity.",
    act: "Express yourself boldly. People expect confidence from you - deliver it with generosity rather than ego.",
    react: "When attention feels overwhelming, remember you set the tone. You can be magnetic without being 'on' all the time."
  },
  virgo: {
    think: "Recognize that your attention to detail creates positive first impressions. People sense your care and competence immediately.",
    act: "Present yourself with intention. Your natural polish and helpfulness open doors - own this strength.",
    react: "When perfectionism surfaces in social situations, remember that authenticity trumps perfection. Your 'imperfect' self is more relatable."
  },
  libra: {
    think: "Trust your natural grace and diplomacy. Your ability to make others feel valued is a profound gift.",
    act: "Create harmony in your environment. Your aesthetic sense and social skills naturally draw people in.",
    react: "When people-pleasing tendencies arise, remember that authentic connection requires your true opinions. Harmony includes your voice."
  },
  scorpio: {
    think: "Embrace your intense, magnetic presence. Your depth and mystery intrigue others - this isn't intimidating, it's compelling.",
    act: "Allow your power to show naturally. Your presence commands respect - no need to prove or hide it.",
    react: "When others seem put off by your intensity, remember it's a filter. Those who matter will appreciate your depth."
  },
  sagittarius: {
    think: "Celebrate your adventurous, philosophical energy. Your enthusiasm and honesty create refreshing first impressions.",
    act: "Share your optimism and vision freely. Your expansive energy gives others permission to dream bigger.",
    react: "When your bluntness offends, practice diplomacy without losing honesty. Truth can be delivered with tact."
  },
  capricorn: {
    think: "Own your natural authority and competence. Your serious demeanor conveys reliability - people trust you quickly.",
    act: "Lead with quiet confidence. Your composed presence commands respect without demanding it.",
    react: "When others misread your reserve as coldness, let your actions demonstrate warmth. Your integrity speaks louder than your words."
  },
  aquarius: {
    think: "Embrace your unique, unconventional energy. Your individuality attracts kindred spirits - the 'right' people appreciate your quirks.",
    act: "Show up authentically, even when it feels strange. Your originality is memorable and valuable.",
    react: "When feeling like an outsider, remember that pioneers always seem different at first. Your uniqueness has purpose."
  },
  pisces: {
    think: "Trust your dreamy, intuitive presence. Your gentle energy creates a sense of magic and possibility for others.",
    act: "Allow your creativity and compassion to shine. Your artistic, empathetic nature is your calling card.",
    react: "When the world feels too harsh, establish boundaries without building walls. Your sensitivity is strength when protected wisely."
  }
};

// Life Path Number Alignment
export const lifePathAlignmentGuidance: Record<string, { think: string; act: string; react: string }> = {
  "1": {
    think: "Embrace your pioneering spirit and natural leadership. Your path requires independence and innovation - trust your unique vision.",
    act: "Take initiative boldly. Your life purpose involves creating new paths, not following existing ones.",
    react: "When facing resistance, remember that leaders often walk alone initially. Your originality will eventually inspire others to follow."
  },
  "2": {
    think: "Honor your gift for diplomacy and partnership. Your path involves creating harmony and supporting others' success.",
    act: "Build bridges between people and ideas. Your collaborative nature creates powerful synergies.",
    react: "When conflict arises, use your natural mediation skills. Your sensitivity to others' needs is your superpower."
  },
  "3": {
    think: "Celebrate your creative self-expression and joy. Your path involves inspiring others through art, communication, and optimism.",
    act: "Share your gifts generously. Your creativity and enthusiasm uplift entire communities.",
    react: "When creative blocks occur, play and experiment. Your path requires joy, not perfection."
  },
  "4": {
    think: "Trust your ability to build lasting foundations. Your path involves creating stability and systems that serve others long-term.",
    act: "Work with discipline and integrity. Your patient, methodical approach creates enduring results.",
    react: "When progress feels slow, remember that you're building something that will outlast you. Trust the process."
  },
  "5": {
    think: "Embrace change and adventure as your classroom. Your path involves experiencing freedom and teaching others through your diverse experiences.",
    act: "Seek variety and growth. Your life purpose requires exploration, not settling into comfortable routines.",
    react: "When restlessness strikes, channel it into constructive change. Your need for freedom is wisdom, not restlessness."
  },
  "6": {
    think: "Honor your nurturing, responsible nature. Your path involves creating harmony and caring for others through service and healing.",
    act: "Care for your community. Your gifts of compassion and practical support heal and uplift.",
    react: "When overwhelmed by others' needs, remember that self-care enables better service. You can't pour from an empty cup."
  },
  "7": {
    think: "Trust your analytical, spiritual seeking. Your path involves deep understanding and sharing wisdom gained through introspection.",
    act: "Pursue truth and knowledge. Your insights benefit others when you emerge from solitude to teach.",
    react: "When feeling isolated, remember that your need for alone time is part of your wisdom-gathering process. Honor it."
  },
  "8": {
    think: "Embrace your natural power and ability to manifest. Your path involves material mastery and using abundance to create positive change.",
    act: "Build wealth and influence with integrity. Your success should benefit the collective, not just yourself.",
    react: "When facing financial challenges, remember they're tests of character. Your resilience and wisdom grow through these experiences."
  },
  "9": {
    think: "Honor your humanitarian vision and compassion. Your path involves completion, wisdom, and serving the greater good.",
    act: "Give generously and let go gracefully. Your purpose involves helping others while releasing attachment to outcomes.",
    react: "When endings occur, trust they make space for new beginnings. Your wisdom comes through cycles of release and renewal."
  }
};

// Human Design Type Alignment
export const humanDesignTypeAlignmentGuidance: Record<string, { think: string; act: string; react: string }> = {
  manifestor: {
    think: "Own your power to initiate and impact. Your energy naturally creates change - inform others to minimize resistance.",
    act: "Act on your urges when they arise. Your initiating force is meant to start new cycles - don't wait for permission.",
    react: "When others resist your initiatives, remember to inform before acting. Communication bridges your powerful energy with others' need for preparation."
  },
  generator: {
    think: "Trust your gut response as your compass. Your satisfaction comes from doing work you love - wait for things to respond to.",
    act: "Respond to opportunities rather than initiating. Your powerful sustained energy thrives when applied to what lights you up.",
    react: "When frustrated, it's a sign you're forcing rather than responding. Pause and wait for something that genuinely excites you."
  },
  "manifesting generator": {
    think: "Embrace your multi-passionate nature and quick responses. Your path involves mastering multiple interests through efficient action.",
    act: "Respond quickly and course-correct as needed. Your speed and versatility are gifts - skip steps that don't serve.",
    react: "When others say you're 'doing too much,' check if you're truly satisfied. Your energy naturally handles more than most - trust your capacity."
  },
  projector: {
    think: "Recognize your gift for seeing systems and guiding others. Your wisdom is most powerful when invited, not imposed.",
    act: "Wait for recognition and invitation. Your insights are valued when others are ready to receive them.",
    react: "When feeling bitter or unrecognized, ask if you're sharing guidance without being invited. Your worth isn't diminished by waiting."
  },
  reflector: {
    think: "Honor your unique ability to mirror community health. Your consistency is your strength - give yourself lunar cycles to make decisions.",
    act: "Take time before committing. Your wisdom requires space to sample environments and people fully.",
    react: "When pressured to decide quickly, hold your ground. Your deliberation protects you and ensures wise choices."
  }
};

// Chinese Zodiac Alignment
export const chineseZodiacAlignmentGuidance: Record<string, { think: string; act: string; react: string }> = {
  rat: {
    think: "Trust your quick wit and resourcefulness. Your ability to spot opportunities others miss is your greatest asset.",
    act: "Move swiftly when opportunity appears. Your charm and intelligence open doors - use them wisely.",
    react: "When resources feel scarce, remember your innate ability to create abundance from little. Your cleverness has always seen you through."
  },
  ox: {
    think: "Honor your strength and methodical nature. Your patient determination achieves what flashier approaches cannot.",
    act: "Work steadily toward goals. Your reliable, persistent effort builds lasting success.",
    react: "When others rush past you, stay your course. Your thorough approach prevents mistakes that speed creates."
  },
  tiger: {
    think: "Embrace your brave, dynamic energy. Your courage and charisma naturally draw others to your cause.",
    act: "Lead with confidence and passion. Your bold actions inspire others to be brave too.",
    react: "When facing setbacks, channel frustration into renewed determination. Your resilience is as powerful as your initial courage."
  },
  rabbit: {
    think: "Trust your diplomatic, graceful nature. Your ability to navigate relationships with tact creates opportunities.",
    act: "Move with elegant wisdom. Your gentle approach achieves harmony where force would fail.",
    react: "When conflict arises, use your natural diplomacy. Your peaceful resolution skills are powerful tools."
  },
  dragon: {
    think: "Own your natural magnetism and vision. Your larger-than-life energy inspires others to dream bigger.",
    act: "Pursue your grand visions boldly. Your confidence and creativity make the impossible possible.",
    react: "When meeting resistance, remember that your intensity can overwhelm. Temper your fire with patience occasionally."
  },
  snake: {
    think: "Honor your wisdom and intuitive insight. Your ability to see beneath surfaces reveals hidden truths.",
    act: "Move with calculated precision. Your strategic mind creates elegant solutions.",
    react: "When others don't understand your methods, trust your inner knowing. Your mysterious ways serve a purpose."
  },
  horse: {
    think: "Celebrate your free spirit and enthusiasm. Your independent nature and energy inspire others to live more fully.",
    act: "Run toward your passions with vigor. Your adventurous spirit thrives when unrestrained.",
    react: "When feeling confined, find freedom within structure. Your independence can coexist with commitment when chosen consciously."
  },
  goat: {
    think: "Trust your creative, gentle nature. Your artistic sensibility and compassion bring beauty to the world.",
    act: "Create from the heart. Your authentic artistic expression touches souls.",
    react: "When practical demands overwhelm, remember that your creativity is practical - it heals and inspires."
  },
  monkey: {
    think: "Embrace your playful intelligence and adaptability. Your clever, curious nature solves problems creatively.",
    act: "Play with possibilities. Your mental agility and humor navigate challenges that confound others.",
    react: "When bored, channel restlessness into innovation. Your need for stimulation drives positive change."
  },
  rooster: {
    think: "Honor your precision and confidence. Your eye for detail and vocal nature ensure excellence.",
    act: "Speak your truth directly. Your honesty and standards elevate everyone around you.",
    react: "When criticism arises, remember that your high standards apply to yourself too. Practice self-compassion alongside your pursuit of excellence."
  },
  dog: {
    think: "Trust your loyal, just nature. Your integrity and protective instincts create safety for those you love.",
    act: "Stand up for what's right. Your moral courage and loyalty make you a trusted ally.",
    react: "When cynicism arises, reconnect with your innate faith in goodness. Your hope is contagious and needed."
  },
  pig: {
    think: "Celebrate your generous, authentic nature. Your sincerity and kindness create genuine connections.",
    act: "Give from the heart. Your compassion and enjoyment of life's pleasures bring joy to others.",
    react: "When others take advantage, set boundaries without losing your generous spirit. Your kindness is strength when protected."
  }
};
