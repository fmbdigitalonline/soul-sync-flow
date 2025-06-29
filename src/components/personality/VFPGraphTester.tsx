
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { usePersonalityFusion } from '@/hooks/use-personality-fusion';
import { VFPGraphVisualization } from './VFPGraphVisualization';
import { Loader2, Play, RotateCcw } from 'lucide-react';

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const VFPGraphTester: React.FC = () => {
  const [mbtiType, setMbtiType] = useState<string>('');
  const [humanDesignGates, setHumanDesignGates] = useState<string>('');
  const [sunSign, setSunSign] = useState<string>('');
  const [moonSign, setMoonSign] = useState<string>('');
  const [ascendant, setAscendant] = useState<string>('');
  const [lifePathNumber, setLifePathNumber] = useState<string>('');

  const {
    fusionVector,
    conflicts,
    isGenerating,
    error,
    generateFusion,
    loadExistingFusion,
    provideFeedback
  } = usePersonalityFusion();

  const handleGenerate = async () => {
    if (!mbtiType || !sunSign || !moonSign) {
      alert('Please fill in at least MBTI type, Sun sign, and Moon sign');
      return;
    }

    const gates = humanDesignGates
      .split(',')
      .map(g => parseInt(g.trim()))
      .filter(g => !isNaN(g) && g >= 1 && g <= 64);

    const astrologyData = {
      sunSign: ZODIAC_SIGNS.indexOf(sunSign) + 1,
      moonSign: ZODIAC_SIGNS.indexOf(moonSign) + 1,
      ascendant: ascendant ? ZODIAC_SIGNS.indexOf(ascendant) + 1 : 1,
      lifePathNumber: parseInt(lifePathNumber) || 1
    };

    await generateFusion(mbtiType, gates, astrologyData);
  };

  const handleReset = () => {
    setMbtiType('');
    setHumanDesignGates('');
    setSunSign('');
    setMoonSign('');
    setAscendant('');
    setLifePathNumber('');
  };

  const handleResolveConflict = (conflictId: number) => {
    console.log('Resolving conflict:', conflictId);
    // In a real implementation, this would open a dialog or form
    alert(`Conflict resolution for dimension ${conflictId} - this would open a resolution dialog`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="w-5 h-5" />
            <span>VFP-Graph Test Interface</span>
            <Badge variant="secondary">Production Ready</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="mbti">MBTI Type *</Label>
                <Select value={mbtiType} onValueChange={setMbtiType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select MBTI type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MBTI_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="gates">Human Design Gates</Label>
                <Input
                  id="gates"
                  placeholder="e.g., 1,2,15,31 (comma-separated)"
                  value={humanDesignGates}
                  onChange={(e) => setHumanDesignGates(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="lifePathNumber">Life Path Number</Label>
                <Input
                  id="lifePathNumber"
                  type="number"
                  min="1"
                  max="9"
                  placeholder="1-9"
                  value={lifePathNumber}
                  onChange={(e) => setLifePathNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="sunSign">Sun Sign *</Label>
                <Select value={sunSign} onValueChange={setSunSign}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sun sign" />
                  </SelectTrigger>
                  <SelectContent>
                    {ZODIAC_SIGNS.map(sign => (
                      <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="moonSign">Moon Sign *</Label>
                <Select value={moonSign} onValueChange={setMoonSign}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select moon sign" />
                  </SelectTrigger>
                  <SelectContent>
                    {ZODIAC_SIGNS.map(sign => (
                      <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ascendant">Ascendant</Label>
                <Select value={ascendant} onValueChange={setAscendant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ascendant (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {ZODIAC_SIGNS.map(sign => (
                      <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !mbtiType || !sunSign || !moonSign}
              className="flex items-center space-x-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>Generate VFP-Graph</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </Button>

            <Button
              variant="outline"
              onClick={loadExistingFusion}
            >
              Load Existing
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">Error: {error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {fusionVector && (
        <VFPGraphVisualization
          fusionVector={fusionVector}
          conflicts={conflicts || undefined}
          onFeedback={provideFeedback}
          onResolveConflict={handleResolveConflict}
        />
      )}
    </div>
  );
};
