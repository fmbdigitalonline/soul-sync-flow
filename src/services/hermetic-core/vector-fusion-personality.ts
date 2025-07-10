// VFP - Vector-Fusion Personality Graph
// 128-dimensional personality vector processing and fusion

export interface PersonalityVector {
  id: string;
  userId: string;
  vector: number[]; // 128-dimensional
  source: 'mbti' | 'big5' | 'enneagram' | 'astrology' | 'humanDesign' | 'synthesized';
  timestamp: Date;
  confidence: number;
  metadata: {
    encoderVersion: string;
    frameworkWeights: Record<string, number>;
    calibrationParams?: Record<string, any>;
  };
}

export interface VectorSimilarity {
  vectorId1: string;
  vectorId2: string;
  similarity: number;
  dimensions: number[];
  significantDifferences: number[];
}

export interface VectorFusion {
  id: string;
  sourceVectors: string[];
  fusedVector: number[];
  fusionMethod: 'weighted_average' | 'dimensional_max' | 'consensus' | 'adaptive';
  confidence: number;
  coherenceScore: number;
  timestamp: Date;
}

export interface DimensionMapping {
  dimension: number;
  semanticLabel: string;
  frameworkMappings: Record<string, string>;
  importance: number;
  stability: number;
}

class VectorFusionPersonality {
  private vectorDatabase: Map<string, PersonalityVector> = new Map();
  private fusionHistory: VectorFusion[] = [];
  private dimensionMappings: Map<number, DimensionMapping> = new Map();
  private calibrationMatrix: number[][] = [];
  private encoderVersion: string = 'vfp-1.2.0';
  private listeners: ((vector: PersonalityVector) => void)[] = [];

  constructor() {
    this.initializeDimensionMappings();
    this.initializeCalibrationMatrix();
  }

  // Initialize semantic dimension mappings
  private initializeDimensionMappings(): void {
    const mappings: DimensionMapping[] = [
      // Core Big5 dimensions (0-19)
      { dimension: 0, semanticLabel: 'extraversion_core', frameworkMappings: { big5: 'extraversion', mbti: 'E_I' }, importance: 0.9, stability: 0.8 },
      { dimension: 1, semanticLabel: 'openness_core', frameworkMappings: { big5: 'openness', mbti: 'N_S' }, importance: 0.85, stability: 0.75 },
      { dimension: 2, semanticLabel: 'conscientiousness_core', frameworkMappings: { big5: 'conscientiousness', mbti: 'J_P' }, importance: 0.9, stability: 0.85 },
      { dimension: 3, semanticLabel: 'agreeableness_core', frameworkMappings: { big5: 'agreeableness', mbti: 'T_F' }, importance: 0.8, stability: 0.7 },
      { dimension: 4, semanticLabel: 'neuroticism_core', frameworkMappings: { big5: 'neuroticism' }, importance: 0.85, stability: 0.6 },
      
      // MBTI-specific dimensions (20-35)
      { dimension: 20, semanticLabel: 'mbti_extraversion', frameworkMappings: { mbti: 'extraversion' }, importance: 0.8, stability: 0.75 },
      { dimension: 21, semanticLabel: 'mbti_sensing', frameworkMappings: { mbti: 'sensing' }, importance: 0.75, stability: 0.7 },
      { dimension: 22, semanticLabel: 'mbti_thinking', frameworkMappings: { mbti: 'thinking' }, importance: 0.8, stability: 0.75 },
      { dimension: 23, semanticLabel: 'mbti_judging', frameworkMappings: { mbti: 'judging' }, importance: 0.75, stability: 0.8 },
      
      // Enneagram dimensions (36-44)
      { dimension: 36, semanticLabel: 'enneagram_gut', frameworkMappings: { enneagram: 'gut_triad' }, importance: 0.7, stability: 0.8 },
      { dimension: 37, semanticLabel: 'enneagram_heart', frameworkMappings: { enneagram: 'heart_triad' }, importance: 0.7, stability: 0.75 },
      { dimension: 38, semanticLabel: 'enneagram_head', frameworkMappings: { enneagram: 'head_triad' }, importance: 0.7, stability: 0.8 },
      
      // Astrological dimensions (45-60)
      { dimension: 45, semanticLabel: 'fire_element', frameworkMappings: { astrology: 'fire_energy' }, importance: 0.5, stability: 0.6 },
      { dimension: 46, semanticLabel: 'earth_element', frameworkMappings: { astrology: 'earth_stability' }, importance: 0.5, stability: 0.7 },
      { dimension: 47, semanticLabel: 'air_element', frameworkMappings: { astrology: 'air_communication' }, importance: 0.5, stability: 0.6 },
      { dimension: 48, semanticLabel: 'water_element', frameworkMappings: { astrology: 'water_emotion' }, importance: 0.5, stability: 0.65 },
      
      // Human Design dimensions (61-75)
      { dimension: 61, semanticLabel: 'hd_type_generator', frameworkMappings: { humanDesign: 'generator_energy' }, importance: 0.6, stability: 0.8 },
      { dimension: 62, semanticLabel: 'hd_type_projector', frameworkMappings: { humanDesign: 'projector_guidance' }, importance: 0.6, stability: 0.8 },
      { dimension: 63, semanticLabel: 'hd_type_manifestor', frameworkMappings: { humanDesign: 'manifestor_initiative' }, importance: 0.6, stability: 0.8 },
      { dimension: 64, semanticLabel: 'hd_type_reflector', frameworkMappings: { humanDesign: 'reflector_sensitivity' }, importance: 0.6, stability: 0.8 },
      
      // Cross-framework synthesis dimensions (76-95)
      { dimension: 76, semanticLabel: 'leadership_composite', frameworkMappings: {}, importance: 0.7, stability: 0.75 },
      { dimension: 77, semanticLabel: 'creativity_composite', frameworkMappings: {}, importance: 0.7, stability: 0.7 },
      { dimension: 78, semanticLabel: 'analytical_composite', frameworkMappings: {}, importance: 0.75, stability: 0.8 },
      { dimension: 79, semanticLabel: 'social_composite', frameworkMappings: {}, importance: 0.8, stability: 0.75 },
      { dimension: 80, semanticLabel: 'emotional_composite', frameworkMappings: {}, importance: 0.8, stability: 0.65 },
      
      // Dynamic adaptation dimensions (96-115)
      { dimension: 96, semanticLabel: 'context_professional', frameworkMappings: {}, importance: 0.6, stability: 0.5 },
      { dimension: 97, semanticLabel: 'context_personal', frameworkMappings: {}, importance: 0.6, stability: 0.5 },
      { dimension: 98, semanticLabel: 'stress_response', frameworkMappings: {}, importance: 0.7, stability: 0.6 },
      { dimension: 99, semanticLabel: 'growth_potential', frameworkMappings: {}, importance: 0.75, stability: 0.4 },
      
      // Meta-cognitive dimensions (116-127)
      { dimension: 116, semanticLabel: 'self_awareness', frameworkMappings: {}, importance: 0.8, stability: 0.7 },
      { dimension: 117, semanticLabel: 'adaptability', frameworkMappings: {}, importance: 0.75, stability: 0.6 },
      { dimension: 118, semanticLabel: 'coherence_factor', frameworkMappings: {}, importance: 0.9, stability: 0.8 },
      { dimension: 119, semanticLabel: 'learning_style', frameworkMappings: {}, importance: 0.7, stability: 0.75 },
      { dimension: 120, semanticLabel: 'communication_preference', frameworkMappings: {}, importance: 0.75, stability: 0.7 },
      
      // Reserved for future expansion (121-127)
      { dimension: 127, semanticLabel: 'meta_confidence', frameworkMappings: {}, importance: 1.0, stability: 0.9 }
    ];

    mappings.forEach(mapping => {
      this.dimensionMappings.set(mapping.dimension, mapping);
    });

    console.log(`🔢 VFP: Initialized ${mappings.length} dimension mappings`);
  }

  // Initialize calibration matrix for cross-framework alignment
  private initializeCalibrationMatrix(): void {
    // Create 128x128 calibration matrix
    this.calibrationMatrix = Array(128).fill(0).map(() => Array(128).fill(0));
    
    // Initialize identity matrix
    for (let i = 0; i < 128; i++) {
      this.calibrationMatrix[i][i] = 1.0;
    }
    
    // Add correlation weights for related dimensions
    this.addDimensionCorrelations();
    
    console.log('🔢 VFP: Initialized 128x128 calibration matrix');
  }

  // Add known correlations between dimensions
  private addDimensionCorrelations(): void {
    const correlations = [
      // Big5 to MBTI correlations
      { dim1: 0, dim2: 20, correlation: 0.85 }, // extraversion
      { dim1: 1, dim2: 21, correlation: -0.75 }, // openness to sensing (inverse)
      { dim1: 2, dim2: 23, correlation: 0.8 }, // conscientiousness to judging
      { dim1: 3, dim2: 22, correlation: -0.7 }, // agreeableness to thinking (inverse)
      
      // Cross-framework composites
      { dim1: 76, dim2: 0, correlation: 0.6 }, // leadership composite to extraversion
      { dim1: 77, dim2: 1, correlation: 0.7 }, // creativity to openness
      { dim1: 78, dim2: 22, correlation: 0.65 }, // analytical to thinking
      { dim1: 79, dim2: 0, correlation: 0.8 }, // social to extraversion
      { dim1: 80, dim2: 4, correlation: 0.5 }, // emotional to neuroticism
    ];

    correlations.forEach(({ dim1, dim2, correlation }) => {
      this.calibrationMatrix[dim1][dim2] = correlation;
      this.calibrationMatrix[dim2][dim1] = correlation; // Symmetric
    });
  }

  // Encode personality data to 128D vector
  encodePersonalityVector(
    personalityData: Record<string, any>,
    source: PersonalityVector['source'],
    userId: string
  ): PersonalityVector {
    const vector = new Array(128).fill(0);
    const confidence = this.calculateEncodingConfidence(personalityData, source);

    // Encode based on source framework
    switch (source) {
      case 'big5':
        this.encodeBig5(personalityData, vector);
        break;
      case 'mbti':
        this.encodeMBTI(personalityData, vector);
        break;
      case 'enneagram':
        this.encodeEnneagram(personalityData, vector);
        break;
      case 'astrology':
        this.encodeAstrology(personalityData, vector);
        break;
      case 'humanDesign':
        this.encodeHumanDesign(personalityData, vector);
        break;
      default:
        console.warn(`🔢 VFP: Unknown source framework: ${source}`);
    }

    // Apply calibration matrix
    const calibratedVector = this.applyCalibrataion(vector);

    // Create vector object
    const personalityVector: PersonalityVector = {
      id: `vector_${userId}_${source}_${Date.now()}`,
      userId,
      vector: calibratedVector,
      source,
      timestamp: new Date(),
      confidence,
      metadata: {
        encoderVersion: this.encoderVersion,
        frameworkWeights: this.getFrameworkWeights(source),
        calibrationParams: { matrixVersion: '1.0' }
      }
    };

    // Store and notify
    this.vectorDatabase.set(personalityVector.id, personalityVector);
    this.notifyListeners(personalityVector);

    console.log(`🔢 VFP: Encoded ${source} vector for user ${userId} (confidence: ${confidence.toFixed(2)})`);
    return personalityVector;
  }

  // Framework-specific encoding methods
  private encodeBig5(data: any, vector: number[]): void {
    const big5Mapping = {
      extraversion: 0,
      openness: 1,
      conscientiousness: 2,
      agreeableness: 3,
      neuroticism: 4
    };

    Object.entries(big5Mapping).forEach(([trait, dimension]) => {
      const value = data[trait];
      if (typeof value === 'number') {
        vector[dimension] = Math.max(0, Math.min(1, value));
        
        // Add to composite dimensions
        this.updateCompositeDimensions(vector, trait, value);
      }
    });
  }

  private encodeMBTI(data: any, vector: number[]): void {
    const mbtiMapping = {
      extraversion: 20,
      sensing: 21,
      thinking: 22,
      judging: 23
    };

    Object.entries(mbtiMapping).forEach(([trait, dimension]) => {
      const value = data[trait];
      if (typeof value === 'number') {
        vector[dimension] = Math.max(0, Math.min(1, value));
        
        // Map to Big5 dimensions as well
        this.mapMBTItoBig5(vector, trait, value);
      }
    });
  }

  private encodeEnneagram(data: any, vector: number[]): void {
    // Encode enneagram type and wing information
    if (data.type) {
      const type = parseInt(data.type);
      if (type >= 1 && type <= 9) {
        // Map to triad dimensions
        if ([1, 8, 9].includes(type)) vector[36] = 0.8; // gut triad
        if ([2, 3, 4].includes(type)) vector[37] = 0.8; // heart triad
        if ([5, 6, 7].includes(type)) vector[38] = 0.8; // head triad
      }
    }

    // Encode specific enneagram traits
    if (data.wing) {
      const wingInfluence = data.wingStrength || 0.5;
      vector[39] = wingInfluence; // wing influence dimension
    }
  }

  private encodeAstrology(data: any, vector: number[]): void {
    // Encode elemental energies
    if (data.elements) {
      vector[45] = (data.elements.fire || 0) / 100;
      vector[46] = (data.elements.earth || 0) / 100;
      vector[47] = (data.elements.air || 0) / 100;
      vector[48] = (data.elements.water || 0) / 100;
    }

    // Encode modalities
    if (data.modalities) {
      vector[49] = (data.modalities.cardinal || 0) / 100;
      vector[50] = (data.modalities.fixed || 0) / 100;
      vector[51] = (data.modalities.mutable || 0) / 100;
    }
  }

  private encodeHumanDesign(data: any, vector: number[]): void {
    // Encode HD type
    const typeMapping = {
      'Generator': 61,
      'Projector': 62,
      'Manifestor': 63,
      'Reflector': 64
    };

    if (data.type && typeMapping[data.type as keyof typeof typeMapping]) {
      vector[typeMapping[data.type as keyof typeof typeMapping]] = 1.0;
    }

    // Encode authority
    if (data.authority) {
      vector[65] = this.encodeAuthority(data.authority);
    }

    // Encode strategy
    if (data.strategy) {
      vector[66] = this.encodeStrategy(data.strategy);
    }
  }

  // Helper methods for encoding
  private updateCompositeDimensions(vector: number[], trait: string, value: number): void {
    // Update cross-framework composite dimensions
    switch (trait) {
      case 'extraversion':
        vector[76] += value * 0.3; // leadership composite
        vector[79] += value * 0.4; // social composite
        break;
      case 'openness':
        vector[77] += value * 0.4; // creativity composite
        vector[99] += value * 0.3; // growth potential
        break;
      case 'conscientiousness':
        vector[78] += value * 0.3; // analytical composite
        vector[76] += value * 0.2; // leadership composite
        break;
      case 'neuroticism':
        vector[80] += value * 0.4; // emotional composite
        vector[98] += value * 0.3; // stress response
        break;
    }
  }

  private mapMBTItoBig5(vector: number[], mbtiTrait: string, value: number): void {
    // Map MBTI dimensions to Big5 equivalents
    const mappings = {
      extraversion: 0,
      sensing: 1, // inverse of openness
      thinking: 3, // inverse of agreeableness  
      judging: 2
    };

    if (mappings[mbtiTrait as keyof typeof mappings] !== undefined) {
      const big5Dim = mappings[mbtiTrait as keyof typeof mappings];
      const mappedValue = (mbtiTrait === 'sensing' || mbtiTrait === 'thinking') ? 1 - value : value;
      
      // Weighted average if dimension already has a value
      if (vector[big5Dim] > 0) {
        vector[big5Dim] = (vector[big5Dim] * 0.7) + (mappedValue * 0.3);
      } else {
        vector[big5Dim] = mappedValue;
      }
    }
  }

  private encodeAuthority(authority: string): number {
    const authorityMapping = {
      'emotional': 0.8,
      'sacral': 0.6,
      'spleen': 0.4,
      'ego': 0.7,
      'self-projected': 0.5,
      'mental': 0.3,
      'lunar': 0.9
    };
    
    return authorityMapping[authority as keyof typeof authorityMapping] || 0.5;
  }

  private encodeStrategy(strategy: string): number {
    const strategyMapping = {
      'respond': 0.6,
      'wait for invitation': 0.8,
      'initiate': 0.9,
      'wait a lunar cycle': 1.0
    };
    
    return strategyMapping[strategy as keyof typeof strategyMapping] || 0.5;
  }

  // Apply calibration matrix to vector
  private applyCalibrataion(vector: number[]): number[] {
    const calibrated = new Array(128).fill(0);
    
    for (let i = 0; i < 128; i++) {
      for (let j = 0; j < 128; j++) {
        calibrated[i] += vector[j] * this.calibrationMatrix[i][j];
      }
      // Normalize to [0, 1] range
      calibrated[i] = Math.max(0, Math.min(1, calibrated[i]));
    }
    
    return calibrated;
  }

  // Fuse multiple personality vectors
  fuseVectors(
    vectorIds: string[],
    method: VectorFusion['fusionMethod'] = 'weighted_average'
  ): VectorFusion {
    const vectors = vectorIds.map(id => this.vectorDatabase.get(id)).filter(Boolean) as PersonalityVector[];
    
    if (vectors.length === 0) {
      throw new Error('No valid vectors found for fusion');
    }

    let fusedVector: number[];
    let confidence: number;

    switch (method) {
      case 'weighted_average':
        fusedVector = this.weightedAverageFusion(vectors);
        confidence = this.calculateFusionConfidence(vectors, 'weighted');
        break;
      case 'dimensional_max':
        fusedVector = this.dimensionalMaxFusion(vectors);
        confidence = this.calculateFusionConfidence(vectors, 'max');
        break;
      case 'consensus':
        fusedVector = this.consensusFusion(vectors);
        confidence = this.calculateFusionConfidence(vectors, 'consensus');
        break;
      case 'adaptive':
        fusedVector = this.adaptiveFusion(vectors);
        confidence = this.calculateFusionConfidence(vectors, 'adaptive');
        break;
      default:
        throw new Error(`Unknown fusion method: ${method}`);
    }

    const fusion: VectorFusion = {
      id: `fusion_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      sourceVectors: vectorIds,
      fusedVector,
      fusionMethod: method,
      confidence,
      coherenceScore: this.calculateCoherenceScore(fusedVector),
      timestamp: new Date()
    };

    this.fusionHistory.push(fusion);
    console.log(`🔢 VFP: Fused ${vectors.length} vectors using ${method} (coherence: ${fusion.coherenceScore.toFixed(2)})`);
    
    return fusion;
  }

  // Fusion methods
  private weightedAverageFusion(vectors: PersonalityVector[]): number[] {
    const fusedVector = new Array(128).fill(0);
    const totalWeight = vectors.reduce((sum, v) => sum + v.confidence, 0);

    for (let dim = 0; dim < 128; dim++) {
      let weightedSum = 0;
      
      vectors.forEach(vector => {
        weightedSum += vector.vector[dim] * vector.confidence;
      });
      
      fusedVector[dim] = totalWeight > 0 ? weightedSum / totalWeight : 0;
    }

    return fusedVector;
  }

  private dimensionalMaxFusion(vectors: PersonalityVector[]): number[] {
    const fusedVector = new Array(128).fill(0);

    for (let dim = 0; dim < 128; dim++) {
      // Take the maximum confident value for each dimension
      let maxValue = 0;
      let maxConfidence = 0;
      
      vectors.forEach(vector => {
        if (vector.confidence > maxConfidence) {
          maxValue = vector.vector[dim];
          maxConfidence = vector.confidence;
        }
      });
      
      fusedVector[dim] = maxValue;
    }

    return fusedVector;
  }

  private consensusFusion(vectors: PersonalityVector[]): number[] {
    const fusedVector = new Array(128).fill(0);

    for (let dim = 0; dim < 128; dim++) {
      const values = vectors.map(v => v.vector[dim]).sort((a, b) => a - b);
      
      // Use median for consensus
      const midIndex = Math.floor(values.length / 2);
      fusedVector[dim] = values.length % 2 === 0 
        ? (values[midIndex - 1] + values[midIndex]) / 2
        : values[midIndex];
    }

    return fusedVector;
  }

  private adaptiveFusion(vectors: PersonalityVector[]): number[] {
    const fusedVector = new Array(128).fill(0);

    for (let dim = 0; dim < 128; dim++) {
      const mapping = this.dimensionMappings.get(dim);
      const stability = mapping?.stability || 0.5;
      
      // Use weighted average for stable dimensions, consensus for unstable ones
      if (stability > 0.7) {
        // Weighted average for stable dimensions
        let weightedSum = 0;
        let totalWeight = 0;
        
        vectors.forEach(vector => {
          weightedSum += vector.vector[dim] * vector.confidence;
          totalWeight += vector.confidence;
        });
        
        fusedVector[dim] = totalWeight > 0 ? weightedSum / totalWeight : 0;
      } else {
        // Median for unstable dimensions
        const values = vectors.map(v => v.vector[dim]).sort((a, b) => a - b);
        const midIndex = Math.floor(values.length / 2);
        fusedVector[dim] = values.length % 2 === 0 
          ? (values[midIndex - 1] + values[midIndex]) / 2
          : values[midIndex];
      }
    }

    return fusedVector;
  }

  // Calculate vector similarity
  calculateSimilarity(vector1Id: string, vector2Id: string): VectorSimilarity | null {
    const v1 = this.vectorDatabase.get(vector1Id);
    const v2 = this.vectorDatabase.get(vector2Id);
    
    if (!v1 || !v2) return null;

    // Cosine similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < 128; i++) {
      dotProduct += v1.vector[i] * v2.vector[i];
      norm1 += v1.vector[i] * v1.vector[i];
      norm2 += v2.vector[i] * v2.vector[i];
    }
    
    const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    
    // Find significant differences
    const significantDifferences: number[] = [];
    const dimensions: number[] = [];
    
    for (let i = 0; i < 128; i++) {
      const diff = Math.abs(v1.vector[i] - v2.vector[i]);
      if (diff > 0.3) { // Threshold for significant difference
        significantDifferences.push(i);
      }
      if (diff < 0.1) { // Threshold for similarity
        dimensions.push(i);
      }
    }

    return {
      vectorId1: vector1Id,
      vectorId2: vector2Id,
      similarity: Math.max(0, Math.min(1, similarity)),
      dimensions,
      significantDifferences
    };
  }

  // Utility methods
  private calculateEncodingConfidence(data: Record<string, any>, source: string): number {
    const dataCompleteness = Object.keys(data).length / this.getExpectedFields(source);
    const sourceReliability = this.getSourceReliability(source);
    
    return Math.min(1.0, dataCompleteness * sourceReliability);
  }

  private calculateFusionConfidence(vectors: PersonalityVector[], method: string): number {
    const avgConfidence = vectors.reduce((sum, v) => sum + v.confidence, 0) / vectors.length;
    const methodBonus = {
      'weighted': 0.1,
      'max': 0.05,
      'consensus': 0.15,
      'adaptive': 0.2
    }[method] || 0;
    
    return Math.min(1.0, avgConfidence + methodBonus);
  }

  private calculateCoherenceScore(vector: number[]): number {
    // Calculate internal coherence of the vector
    let coherence = 0;
    let correlationSum = 0;
    let correlationCount = 0;
    
    // Check correlations between related dimensions
    for (let i = 0; i < 128; i++) {
      for (let j = i + 1; j < 128; j++) {
        const expectedCorrelation = this.calibrationMatrix[i][j];
        if (Math.abs(expectedCorrelation) > 0.1) {
          const actualCorrelation = vector[i] * vector[j];
          const coherenceContribution = 1 - Math.abs(expectedCorrelation - actualCorrelation);
          correlationSum += coherenceContribution;
          correlationCount++;
        }
      }
    }
    
    coherence = correlationCount > 0 ? correlationSum / correlationCount : 0.5;
    return Math.max(0, Math.min(1, coherence));
  }

  private getExpectedFields(source: string): number {
    const fieldCounts = {
      'big5': 5,
      'mbti': 4,
      'enneagram': 3,
      'astrology': 8,
      'humanDesign': 6
    };
    
    return fieldCounts[source as keyof typeof fieldCounts] || 5;
  }

  private getSourceReliability(source: string): number {
    const reliabilities = {
      'big5': 0.9,
      'mbti': 0.85,
      'enneagram': 0.8,
      'astrology': 0.6,
      'humanDesign': 0.75,
      'synthesized': 0.95
    };
    
    return reliabilities[source as keyof typeof reliabilities] || 0.7;
  }

  private getFrameworkWeights(source: string): Record<string, number> {
    const weights = {
      'big5': { reliability: 0.9, completeness: 1.0, stability: 0.85 },
      'mbti': { reliability: 0.85, completeness: 0.8, stability: 0.8 },
      'enneagram': { reliability: 0.8, completeness: 0.7, stability: 0.9 },
      'astrology': { reliability: 0.6, completeness: 0.9, stability: 0.6 },
      'humanDesign': { reliability: 0.75, completeness: 0.8, stability: 0.85 }
    };
    
    return weights[source as keyof typeof weights] || { reliability: 0.7, completeness: 0.7, stability: 0.7 };
  }

  // Public interface methods
  getUserVectors(userId: string): PersonalityVector[] {
    return Array.from(this.vectorDatabase.values()).filter(v => v.userId === userId);
  }

  getVector(vectorId: string): PersonalityVector | undefined {
    return this.vectorDatabase.get(vectorId);
  }

  getFusionHistory(): VectorFusion[] {
    return [...this.fusionHistory];
  }

  getDimensionMappings(): Map<number, DimensionMapping> {
    return new Map(this.dimensionMappings);
  }

  registerListener(listener: (vector: PersonalityVector) => void): void {
    this.listeners.push(listener);
  }

  private notifyListeners(vector: PersonalityVector): void {
    this.listeners.forEach(listener => {
      try {
        listener(vector);
      } catch (error) {
        console.error('🔢 VFP: Listener error:', error);
      }
    });
  }

  getStatus() {
    return {
      vectorCount: this.vectorDatabase.size,
      fusionCount: this.fusionHistory.length,
      dimensionMappings: this.dimensionMappings.size,
      encoderVersion: this.encoderVersion,
      calibrationMatrix: '128x128',
      isActive: true
    };
  }

  // Clear vectors for a user
  clearUserVectors(userId: string): void {
    const userVectorIds = Array.from(this.vectorDatabase.entries())
      .filter(([_, vector]) => vector.userId === userId)
      .map(([id, _]) => id);
    
    userVectorIds.forEach(id => this.vectorDatabase.delete(id));
    console.log(`🔢 VFP: Cleared ${userVectorIds.length} vectors for user ${userId}`);
  }
}

export const vectorFusionPersonality = new VectorFusionPersonality();