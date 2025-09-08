import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface MBTISelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const MBTISelector: React.FC<MBTISelectorProps> = ({ value, onChange }) => {
  const { t } = useLanguage();
  const [type, setType] = useState(value);
  
  // Get MBTI data from translations
  const getMBTITypeData = (mbtiType: string) => {
    return t(`personality.mbti.types.${mbtiType}`) as any;
  };
  
  // Split MBTI into its four dimensions
  const iE = type[0]; // Introversion/Extroversion
  const sN = type[1]; // Sensing/Intuition
  const tF = type[2]; // Thinking/Feeling
  const jP = type[3]; // Judging/Perceiving

  const handleDimensionChange = (dimension: number, newValue: string) => {
    const newType = type.split('');
    newType[dimension] = newValue;
    const result = newType.join('');
    setType(result);
    onChange(result);
  };

  const typeData = getMBTITypeData(type);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Current Type Display */}
      <Card className="border-2 border-soul-purple/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-soul-purple">{type}</CardTitle>
            <Badge variant="secondary" className="bg-soul-purple/10 text-soul-purple">
              Current Selection
            </Badge>
          </div>
          <CardDescription className="text-lg font-semibold">
            {typeData?.title || 'Select your type'}
          </CardDescription>
        </CardHeader>
        {typeData && (
          <CardContent>
            <p className="text-gray-600 mb-4">{typeData.description}</p>
            <div className="flex flex-wrap gap-2">
              {typeData.traits?.map((trait: string, index: number) => (
                <Badge key={index} variant="outline" className="border-soul-purple/30 text-soul-purple">
                  {trait}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Dimension Selection Tabs */}
      <Tabs defaultValue="ie" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ie">E/I</TabsTrigger>
          <TabsTrigger value="sn">S/N</TabsTrigger>
          <TabsTrigger value="tf">T/F</TabsTrigger>
          <TabsTrigger value="jp">J/P</TabsTrigger>
        </TabsList>

        {/* Extroversion/Introversion */}
        <TabsContent value="ie" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${iE === 'E' ? 'ring-2 ring-soul-purple' : ''}`}
              onClick={() => handleDimensionChange(0, 'E')}
            >
              <CardHeader>
                <CardTitle className="text-soul-purple">
                  {t('personality.mbti.dimensions.extroversion.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{t('personality.mbti.dimensions.extroversion.description')}</p>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${iE === 'I' ? 'ring-2 ring-soul-purple' : ''}`}
              onClick={() => handleDimensionChange(0, 'I')}
            >
              <CardHeader>
                <CardTitle className="text-soul-purple">
                  {t('personality.mbti.dimensions.introversion.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{t('personality.mbti.dimensions.introversion.description')}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sensing/Intuition */}
        <TabsContent value="sn" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${sN === 'S' ? 'ring-2 ring-soul-purple' : ''}`}
              onClick={() => handleDimensionChange(1, 'S')}
            >
              <CardHeader>
                <CardTitle className="text-soul-purple">
                  {t('personality.mbti.dimensions.sensing.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{t('personality.mbti.dimensions.sensing.description')}</p>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${sN === 'N' ? 'ring-2 ring-soul-purple' : ''}`}
              onClick={() => handleDimensionChange(1, 'N')}
            >
              <CardHeader>
                <CardTitle className="text-soul-purple">
                  {t('personality.mbti.dimensions.intuition.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{t('personality.mbti.dimensions.intuition.description')}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Thinking/Feeling */}
        <TabsContent value="tf" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${tF === 'T' ? 'ring-2 ring-soul-purple' : ''}`}
              onClick={() => handleDimensionChange(2, 'T')}
            >
              <CardHeader>
                <CardTitle className="text-soul-purple">
                  {t('personality.mbti.dimensions.thinking.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{t('personality.mbti.dimensions.thinking.description')}</p>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${tF === 'F' ? 'ring-2 ring-soul-purple' : ''}`}
              onClick={() => handleDimensionChange(2, 'F')}
            >
              <CardHeader>
                <CardTitle className="text-soul-purple">
                  {t('personality.mbti.dimensions.feeling.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{t('personality.mbti.dimensions.feeling.description')}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Judging/Perceiving */}
        <TabsContent value="jp" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${jP === 'J' ? 'ring-2 ring-soul-purple' : ''}`}
              onClick={() => handleDimensionChange(3, 'J')}
            >
              <CardHeader>
                <CardTitle className="text-soul-purple">
                  {t('personality.mbti.dimensions.judging.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{t('personality.mbti.dimensions.judging.description')}</p>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${jP === 'P' ? 'ring-2 ring-soul-purple' : ''}`}
              onClick={() => handleDimensionChange(3, 'P')}
            >
              <CardHeader>
                <CardTitle className="text-soul-purple">
                  {t('personality.mbti.dimensions.perceiving.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{t('personality.mbti.dimensions.perceiving.description')}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};