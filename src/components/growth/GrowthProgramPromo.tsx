
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GrowthProgramPromo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="bg-gradient-to-r from-soul-purple/10 to-soul-bright/10 border-soul-purple/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-soul-purple" />
            <CardTitle className="text-lg">Growth Programs</CardTitle>
            <Badge variant="secondary" className="bg-soul-purple/20 text-soul-purple">
              New
            </Badge>
          </div>
          <Sparkles className="h-5 w-5 text-soul-bright" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Start a personalized growth journey tailored to your unique blueprint. Focus on career, relationships, wellbeing, or any life area that matters to you.
        </p>
        <Button 
          onClick={() => navigate('/growth-program')}
          className="bg-soul-purple hover:bg-soul-purple/90"
        >
          Start Your Growth Journey
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};
