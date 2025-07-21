
import React from 'react';
import { Button } from '@/components/ui/button';

interface MBTISelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

export const MBTISelector: React.FC<MBTISelectorProps> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-4 gap-space-sm">
      {MBTI_TYPES.map((type) => (
        <Button
          key={type}
          type="button"
          variant={value === type ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(value === type ? '' : type)}
          className="text-caption-sm font-cormorant"
        >
          {type}
        </Button>
      ))}
    </div>
  );
};
