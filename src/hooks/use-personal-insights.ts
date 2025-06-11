
export interface MoodEntry {
  id: string;
  mood: string;
  energy: string;
  timestamp: Date;
}

export interface ReflectionEntry {
  id: string;
  prompt: string;
  response: string;
  timestamp: Date;
}

export interface InsightEntry {
  id: string;
  content: string;
  tags: string[];
  timestamp: Date;
}

export interface WeeklyInsight {
  moodTrends: {
    dominantMood: string;
    energyPattern: string;
    moodCount: Record<string, number>;
  };
  reflectionThemes: string[];
  insightTags: string[];
  growthPatterns: string[];
  weeklyScore: number;
}

export const usePersonalInsights = () => {
  const saveMoodEntry = (mood: string, energy: string) => {
    const entry: MoodEntry = {
      id: Date.now().toString(),
      mood,
      energy,
      timestamp: new Date(),
    };
    
    const existingEntries = JSON.parse(localStorage.getItem('soulguide_moods') || '[]');
    const updatedEntries = [...existingEntries, entry];
    localStorage.setItem('soulguide_moods', JSON.stringify(updatedEntries));
    
    console.log('Mood entry saved:', entry);
  };

  const saveReflectionEntry = (prompt: string, response: string) => {
    const entry: ReflectionEntry = {
      id: Date.now().toString(),
      prompt,
      response,
      timestamp: new Date(),
    };
    
    const existingEntries = JSON.parse(localStorage.getItem('soulguide_reflections') || '[]');
    const updatedEntries = [...existingEntries, entry];
    localStorage.setItem('soulguide_reflections', JSON.stringify(updatedEntries));
    
    console.log('Reflection entry saved:', entry);
  };

  const saveInsightEntry = (content: string, tags: string[]) => {
    const entry: InsightEntry = {
      id: Date.now().toString(),
      content,
      tags,
      timestamp: new Date(),
    };
    
    const existingEntries = JSON.parse(localStorage.getItem('soulguide_insights') || '[]');
    const updatedEntries = [...existingEntries, entry];
    localStorage.setItem('soulguide_insights', JSON.stringify(updatedEntries));
    
    console.log('Insight entry saved:', entry);
  };

  const generateWeeklyInsights = (): WeeklyInsight => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get this week's data
    const moods: MoodEntry[] = JSON.parse(localStorage.getItem('soulguide_moods') || '[]')
      .filter((entry: MoodEntry) => new Date(entry.timestamp) >= weekAgo);
    
    const reflections: ReflectionEntry[] = JSON.parse(localStorage.getItem('soulguide_reflections') || '[]')
      .filter((entry: ReflectionEntry) => new Date(entry.timestamp) >= weekAgo);
    
    const insights: InsightEntry[] = JSON.parse(localStorage.getItem('soulguide_insights') || '[]')
      .filter((entry: InsightEntry) => new Date(entry.timestamp) >= weekAgo);

    // Analyze mood trends
    const moodCount: Record<string, number> = {};
    const energyCount: Record<string, number> = {};
    
    moods.forEach(mood => {
      moodCount[mood.mood] = (moodCount[mood.mood] || 0) + 1;
      energyCount[mood.energy] = (energyCount[mood.energy] || 0) + 1;
    });

    const dominantMood = Object.keys(moodCount).reduce((a, b) => 
      moodCount[a] > moodCount[b] ? a : b, 'Neutral');
    
    const dominantEnergy = Object.keys(energyCount).reduce((a, b) => 
      energyCount[a] > energyCount[b] ? a : b, 'Steady');

    // Extract themes from reflections
    const reflectionThemes = reflections.map(r => r.prompt.split('?')[0]);

    // Get insight tags
    const allInsightTags = insights.flatMap(i => i.tags);
    const uniqueInsightTags = [...new Set(allInsightTags)];

    // Calculate weekly score (simple algorithm)
    const weeklyScore = Math.min(100, 
      (moods.length * 10) + 
      (reflections.length * 15) + 
      (insights.length * 20)
    );

    return {
      moodTrends: {
        dominantMood,
        energyPattern: dominantEnergy,
        moodCount,
      },
      reflectionThemes: reflectionThemes.slice(0, 3),
      insightTags: uniqueInsightTags.slice(0, 5),
      growthPatterns: ["Self-awareness increasing", "Consistency building"],
      weeklyScore,
    };
  };

  return {
    saveMoodEntry,
    saveReflectionEntry,
    saveInsightEntry,
    generateWeeklyInsights,
  };
};
