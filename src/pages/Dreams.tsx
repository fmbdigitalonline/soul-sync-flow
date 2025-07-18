
import React, { useState, useEffect } from 'react';
import { DreamCreationForm } from '@/components/dream/DreamCreationForm';
import { DreamsList } from '@/components/dream/DreamsList';
import { DreamDecomposition } from '@/components/dream/DreamDecomposition';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, Target } from 'lucide-react';
import { toast } from 'sonner';

interface Dream {
  id: string;
  title: string;
  description: string;
  category: string;
  timeframe: string;
  importance_level: string;
  created_at: string;
}

export default function Dreams() {
  const { user } = useAuth();
  const [showCreationForm, setShowCreationForm] = useState(false);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [showDecomposition, setShowDecomposition] = useState(false);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dreams from database
  useEffect(() => {
    if (user?.id) {
      fetchDreams();
    }
  }, [user?.id]);

  const fetchDreams = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_dreams')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching dreams:', error);
        toast.error('Failed to load dreams');
      } else {
        setDreams(data || []);
      }
    } catch (error) {
      console.error('Error fetching dreams:', error);
      toast.error('Failed to load dreams');
    } finally {
      setLoading(false);
    }
  };

  const handleDreamCreated = () => {
    setShowCreationForm(false);
    fetchDreams(); // Refresh the dreams list
    toast.success('Dream created successfully!');
  };

  const handleDreamSelect = (dream: Dream) => {
    setSelectedDream(dream);
    setShowDecomposition(true);
  };

  const handleBackToDreams = () => {
    setShowDecomposition(false);
    setSelectedDream(null);
  };

  if (showDecomposition && selectedDream) {
    return (
      <DreamDecomposition
        dream={selectedDream}
        onBack={handleBackToDreams}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-soul-purple/5 via-white to-soul-teal/5 mobile-container">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-soul-purple mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dreams...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-purple/5 via-white to-soul-teal/5 mobile-container">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center animate-pulse-soft">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="font-cormorant text-3xl font-bold text-gray-800 mb-2">
            Dreams & Goals Creator
          </h1>
          
          <p className="font-inter text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Share your deepest aspirations and let's discover what truly lights up your soul
          </p>

          {/* Personalization Note */}
          <div className="bg-soul-purple/10 rounded-xl p-4 border border-soul-purple/20 max-w-md mx-auto">
            <p className="font-inter text-sm text-soul-purple font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              This journey will be optimized for your unique nature
            </p>
          </div>
        </div>

        {showCreationForm ? (
          <Card className="p-6">
            <DreamCreationForm
              onDreamCreated={handleDreamCreated}
              onCancel={() => setShowCreationForm(false)}
            />
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Create New Dream Button */}
            <div className="text-center">
              <Button
                onClick={() => setShowCreationForm(true)}
                className="bg-gradient-to-r from-soul-purple to-soul-teal text-white px-8 py-3 rounded-xl font-cormorant font-medium text-lg hover:shadow-lg transition-all duration-200"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Create Your Dream Journey
              </Button>
            </div>

            {/* Alternative Discovery Options */}
            <div className="space-y-4">
              <p className="font-cormorant text-lg text-center text-gray-700 font-medium">
                Or explore with your dream guide
              </p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Button
                  variant="outline"
                  className="font-inter p-4 h-auto flex items-center gap-3 hover:bg-soul-purple/5 border-soul-purple/20 transition-colors"
                >
                  <Heart className="h-5 w-5 text-soul-purple" />
                  <div className="text-left">
                    <p className="font-cormorant font-semibold text-soul-purple">Start Heart-Centered Discovery</p>
                    <p className="font-inter text-xs text-gray-600">Explore what truly resonates</p>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="font-inter p-4 h-auto flex items-center gap-3 hover:bg-soul-teal/5 border-soul-teal/20 transition-colors"
                >
                  <Target className="h-5 w-5 text-soul-teal" />
                  <div className="text-left">
                    <p className="font-cormorant font-semibold text-soul-teal">View Your Journey</p>
                    <p className="font-inter text-xs text-gray-600">See your progress and path</p>
                  </div>
                </Button>
              </div>
            </div>

            {/* Dreams List */}
            {dreams && dreams.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-cormorant text-xl font-semibold text-gray-800">
                  Your Dreams Journey
                </h2>
                <DreamsList 
                  dreams={dreams} 
                  onDreamSelect={handleDreamSelect}
                />
              </div>
            )}

            {/* Empty State */}
            {dreams.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="font-inter text-sm text-gray-600">
                  No dreams created yet. Start by creating your first dream journey above.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
