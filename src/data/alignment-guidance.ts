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
    think: "Channel your pioneering energy into meaningful initiatives. Ask: 'Am I initiating with purpose or just for the thrill?' Your courage creates paths - choose destinations wisely.",
    act: "Start projects with clear outcomes. Build in check-ins before charging ahead. Balance bold moves with strategic pauses to assess impact.",
    react: "When impatient, redirect that energy into preparation rather than premature action. When others move slowly, consider what you might learn from their pace."
  },
  taurus: {
    think: "Your need for stability is wisdom - ensure it allows for necessary growth. Ask: 'Is this comfort serving my evolution or preventing it?' Security and change can coexist.",
    act: "Create change gradually, building new routines alongside old. Invest in quality and sustainability. Schedule regular 'comfort time' to resource yourself.",
    react: "When resistant to change, identify what you're protecting and whether it truly needs protection. When pushed to rush, stand your ground while staying open to the possibility."
  },
  gemini: {
    think: "Your curiosity is a gift - direct it toward depth as well as breadth. Ask: 'What deserves my sustained attention?' Not every interesting path needs to be walked.",
    act: "Choose 2-3 areas of focus and go deep. Schedule connection time with key relationships. Document your learning to see your growth.",
    react: "When scattered, return to your core interests. When bored, look for the unexplored depths in current pursuits before seeking new ones."
  },
  cancer: {
    think: "Your emotional intelligence is profound - use it to nurture yourself as well as others. Ask: 'Am I creating safe space for my own feelings?' Your cup needs filling too.",
    act: "Build boundaries that protect your emotional energy. Create regular self-care rituals. Express needs directly rather than expecting others to intuit them.",
    react: "When hurt, communicate rather than withdrawing. When emotionally flooded, create space to process before deciding or responding."
  },
  leo: {
    think: "Your natural radiance is most powerful when sourced from within. Ask: 'Am I creating from authentic joy or seeking validation?' Your light doesn't need permission to shine.",
    act: "Create for the joy of creation, not just applause. Share your gifts generously while maintaining healthy boundaries. Celebrate others' shine - it doesn't diminish yours.",
    react: "When feeling unappreciated, reconnect with your intrinsic worth. When challenged, lead with warmth and confidence rather than defensiveness."
  },
  virgo: {
    think: "Your eye for improvement is valuable - apply self-compassion to your process. Ask: 'Is this refinement serving excellence or perfectionism?' Progress over perfection.",
    act: "Set 'good enough' standards for non-critical tasks. Celebrate completion, not just flawless execution. Share your work before you think it's 'ready.'",
    react: "When self-critical, speak to yourself as you would a dear friend. When others make mistakes, remember that imperfection is part of growth."
  },
  libra: {
    think: "Your desire for harmony is admirable - ensure it doesn't silence your truth. Ask: 'Am I creating authentic peace or avoiding necessary conflict?' Your voice matters.",
    act: "Practice making decisions without seeking everyone's input. Express preferences early rather than going along to keep peace. Engage in healthy conflict that deepens connection.",
    react: "When people-pleasing, pause to identify your genuine preference. When conflict arises, see it as an opportunity for authentic resolution rather than a problem to smooth over."
  },
  scorpio: {
    think: "Your intensity is your power - wield it with awareness. Ask: 'Am I using this energy for transformation or control?' Depth and trust coexist.",
    act: "Practice vulnerability in safe relationships. Transform pain into purpose through creative expression. Share your insights to heal, not just to protect.",
    react: "When feeling betrayed, distinguish between protective boundaries and punitive walls. When others can't go as deep, honor their pace while honoring your need for depth."
  },
  sagittarius: {
    think: "Your quest for meaning is noble - ensure it includes presence. Ask: 'Am I seeking truth or avoiding current reality?' Wisdom requires being here now.",
    act: "Commit to people and projects long enough to go deep. Balance exploration with integration. Bring your philosophical insights into practical application.",
    react: "When restless, look for the undiscovered depths in your current situation before seeking new horizons. When others need you to land, honor their request while maintaining your essential freedom."
  },
  capricorn: {
    think: "Your ambition is admirable - ensure success includes joy. Ask: 'Am I climbing the right mountain for me?' Achievement and fulfillment can walk together.",
    act: "Build in celebration milestones, not just goals. Create systems that honor rest as productive. Connect with people for connection's sake, not just networking.",
    react: "When driving hard, check if it's toward your vision or away from fear of failure. When others want emotional connection, remember that vulnerability is strength, not weakness."
  },
  aquarius: {
    think: "Your vision for a better future is needed - ground it in present relationships. Ask: 'Am I connecting with the humans in front of me?' Innovation requires connection.",
    act: "Balance big-picture thinking with personal relationships. Translate your ideals into concrete next steps. Engage emotionally as well as intellectually.",
    react: "When feeling detached, reconnect with your body and present moment. When others don't share your vision, meet them where they are while holding your truth."
  },
  pisces: {
    think: "Your compassion is profound - protect your energy as fiercely as you serve others. Ask: 'Where do I end and others begin?' Boundaries enable sustainable compassion.",
    act: "Create daily grounding practices. Distinguish intuition from absorption of others' energy. Express your spiritual insights through tangible creative work.",
    react: "When overwhelmed by others' emotions, return to your own center. When wanting to escape, feel the feelings fully so they can transform and release."
  }
};
