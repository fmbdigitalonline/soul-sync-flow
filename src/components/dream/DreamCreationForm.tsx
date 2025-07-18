
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Sparkles, Target, Calendar, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface DreamCreationFormProps {
  onDreamCreated: () => void;
  onCancel: () => void;
}

export const DreamCreationForm: React.FC<DreamCreationFormProps> = ({
  onDreamCreated,
  onCancel
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    timeframe: '',
    importance: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('user_dreams')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          timeframe: formData.timeframe,
          importance_level: formData.importance,
          status: 'active'
        });

      if (error) throw error;

      toast.success('Dream created successfully!');
      onDreamCreated();
    } catch (error) {
      console.error('Error creating dream:', error);
      toast.error('Failed to create dream. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-cormorant text-2xl font-bold text-gray-800">
          Create Your Dream Journey
        </h2>
        <p className="font-inter text-sm text-gray-600">
          Let's bring your vision to life with a personalized roadmap
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dream Title */}
        <div className="space-y-2">
          <label className="font-inter text-sm font-medium text-gray-700 flex items-center gap-2">
            <Target className="h-4 w-4 text-soul-purple" />
            What's Your Dream?
          </label>
          <Input
            placeholder="e.g., Launch my creative coaching business"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="font-inter"
            required
          />
          <p className="font-inter text-xs text-gray-500">
            Describe your dream in one clear sentence
          </p>
        </div>

        {/* Dream Description */}
        <div className="space-y-2">
          <label className="font-inter text-sm font-medium text-gray-700 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-soul-purple" />
            Why is this important to you?
          </label>
          <Textarea
            placeholder="Share what this dream means to you and why you're called to pursue it..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="font-inter min-h-[100px]"
            required
          />
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <label className="font-inter text-sm font-medium text-gray-700 flex items-center gap-2">
            <Tag className="h-4 w-4 text-soul-purple" />
            Dream Category
          </label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
            <SelectTrigger className="font-inter">
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal_growth" className="font-inter">Personal Growth</SelectItem>
              <SelectItem value="career" className="font-inter">Career & Business</SelectItem>
              <SelectItem value="creativity" className="font-inter">Creative Expression</SelectItem>
              <SelectItem value="relationships" className="font-inter">Relationships</SelectItem>
              <SelectItem value="health_wellness" className="font-inter">Health & Wellness</SelectItem>
              <SelectItem value="spiritual" className="font-inter">Spiritual Development</SelectItem>
              <SelectItem value="adventure" className="font-inter">Adventure & Travel</SelectItem>
              <SelectItem value="contribution" className="font-inter">Service & Contribution</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Timeframe */}
        <div className="space-y-2">
          <label className="font-inter text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-soul-purple" />
            Target Timeline
          </label>
          <Select value={formData.timeframe} onValueChange={(value) => handleInputChange('timeframe', value)}>
            <SelectTrigger className="font-inter">
              <SelectValue placeholder="When do you want to achieve this?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1_month" className="font-inter">1 Month</SelectItem>
              <SelectItem value="3_months" className="font-inter">3 Months</SelectItem>
              <SelectItem value="6_months" className="font-inter">6 Months</SelectItem>
              <SelectItem value="1_year" className="font-inter">1 Year</SelectItem>
              <SelectItem value="2_years" className="font-inter">2+ Years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Importance Level */}
        <div className="space-y-2">
          <label className="font-inter text-sm font-medium text-gray-700">
            How important is this to you right now?
          </label>
          <Select value={formData.importance} onValueChange={(value) => handleInputChange('importance', value)}>
            <SelectTrigger className="font-inter">
              <SelectValue placeholder="Rate the importance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical" className="font-inter">Critical - This is my top priority</SelectItem>
              <SelectItem value="high" className="font-inter">High - Very important to me</SelectItem>
              <SelectItem value="medium" className="font-inter">Medium - Important but not urgent</SelectItem>
              <SelectItem value="low" className="font-inter">Low - Something I'd like to explore</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="font-inter flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="font-cormorant bg-gradient-to-r from-soul-purple to-soul-teal text-white flex-1 font-medium"
            disabled={isSubmitting || !formData.title || !formData.description}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </div>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Create Journey
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
