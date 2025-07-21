
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { MBTISelector } from './MBTISelector';

interface BirthDataFormProps {
  onSubmit: (data: {
    full_name: string;
    preferred_name?: string;
    birth_date: string;
    birth_time_local: string;
    birth_location: string;
    personality?: string;
  }) => void;
  className?: string;
}

export const BirthDataForm: React.FC<BirthDataFormProps> = ({ onSubmit, className }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    preferred_name: '',
    birth_date: '',
    birth_time_local: '',
    birth_location: '',
    personality: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.birth_date) {
      newErrors.birth_date = 'Birth date is required';
    }

    if (!formData.birth_time_local) {
      newErrors.birth_time_local = 'Birth time is required for accurate calculations';
    }

    if (!formData.birth_location.trim()) {
      newErrors.birth_location = 'Birth location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        full_name: formData.full_name.trim(),
        preferred_name: formData.preferred_name.trim() || undefined,
        birth_date: formData.birth_date,
        birth_time_local: formData.birth_time_local,
        birth_location: formData.birth_location.trim(),
        personality: formData.personality || undefined
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-soul-purple">Create Your Soul Blueprint</CardTitle>
        <CardDescription className="text-gray-400">
          We'll automatically calculate your accurate timezone from your birth location - no need to know UTC offsets!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name" className="flex items-center gap-2 text-gray-300">
                <User className="w-4 h-4" />
                Full Name *
              </Label>
              <Input
                id="full_name"
                type="text"
                placeholder="Your complete legal name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className={`mt-1 bg-gray-800 border-gray-700 text-white ${errors.full_name ? 'border-red-500' : ''}`}
              />
              {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
            </div>

            <div>
              <Label htmlFor="preferred_name" className="flex items-center gap-2 text-gray-300">
                <User className="w-4 h-4" />
                Preferred Name (Optional)
              </Label>
              <Input
                id="preferred_name"
                type="text"
                placeholder="What you'd like to be called"
                value={formData.preferred_name}
                onChange={(e) => handleInputChange('preferred_name', e.target.value)}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          {/* Birth Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="birth_date" className="flex items-center gap-2 text-gray-300">
                <Calendar className="w-4 h-4" />
                Birth Date *
              </Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleInputChange('birth_date', e.target.value)}
                className={`mt-1 bg-gray-800 border-gray-700 text-white ${errors.birth_date ? 'border-red-500' : ''}`}
              />
              {errors.birth_date && <p className="text-red-500 text-sm mt-1">{errors.birth_date}</p>}
            </div>

            <div>
              <Label htmlFor="birth_time_local" className="flex items-center gap-2 text-gray-300">
                <Clock className="w-4 h-4" />
                Birth Time (Local Time) *
              </Label>
              <Input
                id="birth_time_local"
                type="time"
                value={formData.birth_time_local}
                onChange={(e) => handleInputChange('birth_time_local', e.target.value)}
                className={`mt-1 bg-gray-800 border-gray-700 text-white ${errors.birth_time_local ? 'border-red-500' : ''}`}
              />
              <p className="text-sm text-gray-400 mt-1">
                Enter the local time where you were born - we'll automatically handle timezone conversion
              </p>
              {errors.birth_time_local && <p className="text-red-500 text-sm mt-1">{errors.birth_time_local}</p>}
            </div>

            <div>
              <Label htmlFor="birth_location" className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4" />
                Birth Location *
              </Label>
              <Input
                id="birth_location"
                type="text"
                placeholder="City, Country (e.g., Paramaribo, Suriname)"
                value={formData.birth_location}
                onChange={(e) => handleInputChange('birth_location', e.target.value)}
                className={`mt-1 bg-gray-800 border-gray-700 text-white ${errors.birth_location ? 'border-red-500' : ''}`}
              />
              <p className="text-sm text-gray-400 mt-1">
                We'll automatically find the exact coordinates and historical timezone
              </p>
              {errors.birth_location && <p className="text-red-500 text-sm mt-1">{errors.birth_location}</p>}
            </div>
          </div>

          {/* MBTI Selector */}
          <div>
            <Label className="text-gray-300 mb-3 block">
              Personality Type (Optional)
            </Label>
            <MBTISelector
              value={formData.personality}
              onChange={(value) => handleInputChange('personality', value)}
            />
            <p className="text-sm text-gray-400 mt-2">
              This helps personalize your AI Soul Coach interactions
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-soul-purple hover:bg-soul-purple/80 text-white py-3 text-lg font-semibold"
          >
            Generate My Soul Blueprint
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
