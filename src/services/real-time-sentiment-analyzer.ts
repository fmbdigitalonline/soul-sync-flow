
interface SentimentAnalysisResult {
  score: number; // -1 to 1
  confidence: number;
  emotions: Record<string, number>;
  complexity: number;
  wordCount: number;
}

class RealTimeSentimentAnalyzer {
  private positiveWords = new Set([
    'amazing', 'awesome', 'beautiful', 'brilliant', 'excellent', 'fantastic', 'good', 'great', 
    'happy', 'incredible', 'joy', 'love', 'magnificent', 'outstanding', 'perfect', 'pleased',
    'positive', 'satisfied', 'successful', 'superb', 'wonderful', 'excited', 'motivated',
    'confident', 'optimistic', 'grateful', 'blessed', 'thrilled', 'delighted', 'ecstatic'
  ]);

  private negativeWords = new Set([
    'awful', 'bad', 'disappointed', 'disgusting', 'frustrated', 'hate', 'horrible', 'miserable',
    'negative', 'pathetic', 'sad', 'terrible', 'tragic', 'ugly', 'unacceptable', 'unfortunate',
    'upset', 'useless', 'worried', 'angry', 'stressed', 'anxious', 'depressed', 'confused',
    'overwhelmed', 'exhausted', 'devastated', 'furious', 'bitter', 'resentful'
  ]);

  private intensifiers = new Set([
    'very', 'extremely', 'incredibly', 'absolutely', 'completely', 'totally', 'utterly',
    'quite', 'rather', 'fairly', 'somewhat', 'really', 'truly', 'deeply', 'highly'
  ]);

  private negators = new Set([
    'not', 'no', 'never', 'nothing', 'neither', 'nobody', 'nowhere', 'none', 'hardly', 'barely'
  ]);

  private emotionPatterns = {
    joy: ['happy', 'joy', 'excited', 'thrilled', 'elated', 'cheerful', 'delighted'],
    anger: ['angry', 'furious', 'mad', 'irritated', 'frustrated', 'annoyed', 'livid'],
    sadness: ['sad', 'depressed', 'miserable', 'gloomy', 'melancholy', 'sorrowful'],
    fear: ['afraid', 'scared', 'anxious', 'worried', 'nervous', 'terrified', 'panic'],
    surprise: ['surprised', 'amazed', 'astonished', 'shocked', 'stunned', 'bewildered'],
    disgust: ['disgusted', 'revolted', 'repulsed', 'sickened', 'appalled']
  };

  // Advanced n-gram analysis for context
  private analyzeNGrams(words: string[], n: number): Map<string, number> {
    const ngrams = new Map<string, number>();
    for (let i = 0; i <= words.length - n; i++) {
      const ngram = words.slice(i, i + n).join(' ');
      ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1);
    }
    return ngrams;
  }

  // Calculate sentence complexity for confidence scoring
  private calculateComplexity(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = text.split(/\s+/).length / sentences.length;
    const punctuationDensity = (text.match(/[,.;:!?]/g) || []).length / text.length;
    
    return Math.min(1, (avgWordsPerSentence / 20) + punctuationDensity * 10);
  }

  // Detect emotional patterns in text
  private analyzeEmotions(words: string[]): Record<string, number> {
    const emotions: Record<string, number> = {};
    
    for (const [emotion, patterns] of Object.entries(this.emotionPatterns)) {
      let score = 0;
      for (const word of words) {
        if (patterns.some(pattern => word.toLowerCase().includes(pattern))) {
          score += 1;
        }
      }
      emotions[emotion] = score / words.length;
    }
    
    return emotions;
  }

  // Real-time contextual sentiment analysis
  analyzeSentiment(text: string): SentimentAnalysisResult {
    console.log(`🧠 Analyzing sentiment for text: "${text.substring(0, 50)}..."`);
    
    if (!text || text.trim().length === 0) {
      return {
        score: 0,
        confidence: 0,
        emotions: {},
        complexity: 0,
        wordCount: 0
      };
    }

    // Preprocessing
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);

    const wordCount = words.length;
    const complexity = this.calculateComplexity(text);
    
    // Analyze bigrams and trigrams for context
    const bigrams = this.analyzeNGrams(words, 2);
    const trigrams = this.analyzeNGrams(words, 3);
    
    let score = 0;
    let intensityMultiplier = 1;
    let negationActive = false;
    let confidenceFactors: number[] = [];
    
    // Advanced sentiment scoring with context awareness
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const prevWord = i > 0 ? words[i - 1] : '';
      const nextWord = i < words.length - 1 ? words[i + 1] : '';
      
      // Check for negation context (2-word window)
      if (this.negators.has(word) || this.negators.has(prevWord)) {
        negationActive = true;
        confidenceFactors.push(0.8); // Negation reduces confidence
      }
      
      // Check for intensifiers
      if (this.intensifiers.has(word)) {
        intensityMultiplier *= 1.5;
        confidenceFactors.push(0.9);
      }
      
      // Sentiment scoring with context
      let wordScore = 0;
      if (this.positiveWords.has(word)) {
        wordScore = 1 * intensityMultiplier;
        confidenceFactors.push(0.9);
      } else if (this.negativeWords.has(word)) {
        wordScore = -1 * intensityMultiplier;
        confidenceFactors.push(0.9);
      }
      
      // Apply negation
      if (negationActive && wordScore !== 0) {
        wordScore *= -0.8; // Reverse and reduce intensity
        negationActive = false; // Reset after applying
      }
      
      score += wordScore;
      
      // Reset multipliers
      if (wordScore !== 0) {
        intensityMultiplier = 1;
      }
    }
    
    // Normalize score
    const normalizedScore = wordCount > 0 ? Math.max(-1, Math.min(1, score / Math.sqrt(wordCount))) : 0;
    
    // Calculate confidence based on multiple factors
    const baseConfidence = Math.min(wordCount / 10, 1); // More words = higher confidence
    const complexityFactor = 1 - (complexity * 0.3); // Complex text = lower confidence
    const contextFactor = confidenceFactors.length > 0 
      ? confidenceFactors.reduce((a, b) => a + b, 0) / confidenceFactors.length 
      : 0.5;
    
    const confidence = Math.max(0.1, Math.min(0.95, baseConfidence * complexityFactor * contextFactor));
    
    // Analyze emotions
    const emotions = this.analyzeEmotions(words);
    
    const result: SentimentAnalysisResult = {
      score: Number(normalizedScore.toFixed(3)),
      confidence: Number(confidence.toFixed(3)),
      emotions,
      complexity: Number(complexity.toFixed(3)),
      wordCount
    };
    
    console.log(`🧠 Sentiment analysis result:`, result);
    return result;
  }

  // Batch analyze multiple texts with temporal weighting
  analyzeBatch(texts: Array<{ text: string; timestamp: string }>): SentimentAnalysisResult {
    if (texts.length === 0) {
      return { score: 0, confidence: 0, emotions: {}, complexity: 0, wordCount: 0 };
    }

    const now = new Date().getTime();
    let weightedScore = 0;
    let totalWeight = 0;
    let allEmotions: Record<string, number[]> = {};
    let totalWordCount = 0;
    let avgComplexity = 0;

    for (const { text, timestamp } of texts) {
      const analysis = this.analyzeSentiment(text);
      
      // Calculate temporal weight (more recent = higher weight)
      const age = (now - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24); // days
      const timeWeight = Math.exp(-age / 30); // Exponential decay over 30 days
      
      weightedScore += analysis.score * analysis.confidence * timeWeight;
      totalWeight += analysis.confidence * timeWeight;
      totalWordCount += analysis.wordCount;
      avgComplexity += analysis.complexity;
      
      // Aggregate emotions
      for (const [emotion, value] of Object.entries(analysis.emotions)) {
        if (!allEmotions[emotion]) allEmotions[emotion] = [];
        allEmotions[emotion].push(value * timeWeight);
      }
    }

    // Calculate final aggregated emotions
    const finalEmotions: Record<string, number> = {};
    for (const [emotion, values] of Object.entries(allEmotions)) {
      finalEmotions[emotion] = values.reduce((a, b) => a + b, 0) / values.length;
    }

    return {
      score: totalWeight > 0 ? weightedScore / totalWeight : 0,
      confidence: Math.min(0.95, totalWeight / texts.length),
      emotions: finalEmotions,
      complexity: avgComplexity / texts.length,
      wordCount: totalWordCount
    };
  }
}

export const realTimeSentimentAnalyzer = new RealTimeSentimentAnalyzer();
