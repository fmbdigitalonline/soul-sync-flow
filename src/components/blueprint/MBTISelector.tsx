
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MBTISelectorProps {
  value: string;
  onChange: (value: string) => void;
}

// MBTI type descriptions
const mbtiDescriptions: Record<string, { title: string; description: string; traits: string[] }> = {
  INFJ: {
    title: "The Counselor",
    description: "Seek meaning and connection in ideas, relationships, and material possessions.",
    traits: ["Insightful", "Idealistic", "Deep"]
  },
  INFP: {
    title: "The Mediator",
    description: "Idealistic, loyal to their values and to people who are important to them.",
    traits: ["Empathetic", "Creative", "Authentic"]
  },
  INTJ: {
    title: "The Architect",
    description: "Have original minds and great drive for implementing their ideas and achieving goals.",
    traits: ["Strategic", "Analytical", "Independent"]
  },
  INTP: {
    title: "The Thinker",
    description: "Seek to develop logical explanations for everything that interests them.",
    traits: ["Logical", "Theoretical", "Inventive"]
  },
  ENFJ: {
    title: "The Giver",
    description: "Charismatic and inspiring leaders, able to mesmerize listeners.",
    traits: ["Charismatic", "Supportive", "Empathetic"]
  },
  ENFP: {
    title: "The Champion",
    description: "Warmly enthusiastic and imaginative. See life as full of possibilities.",
    traits: ["Enthusiastic", "Innovative", "Expressive"]
  },
  ENTJ: {
    title: "The Commander",
    description: "Frank, decisive, assume leadership readily. Quickly see patterns in external events.",
    traits: ["Decisive", "Strategic", "Driven"]
  },
  ENTP: {
    title: "The Visionary",
    description: "Quick, ingenious, stimulating, alert, and outspoken. Resourceful in solving challenging problems.",
    traits: ["Innovative", "Analytical", "Adaptable"]
  },
  ISFJ: {
    title: "The Protector",
    description: "Quiet, friendly, responsible, and conscientious. Committed and steady in meeting obligations.",
    traits: ["Reliable", "Observant", "Supportive"]
  },
  ISFP: {
    title: "The Composer",
    description: "Friendly, sensitive, and kind. Enjoy the present moment, what's going on around them.",
    traits: ["Artistic", "Adaptable", "Sensitive"]
  },
  ISTJ: {
    title: "The Inspector",
    description: "Quiet, serious, earn success by thoroughness and dependability.",
    traits: ["Orderly", "Practical", "Logical"]
  },
  ISTP: {
    title: "The Craftsman",
    description: "Tolerant and flexible, quiet observers until a problem appears, then act quickly to find workable solutions.",
    traits: ["Practical", "Adaptable", "Logical"]
  },
  ESFJ: {
    title: "The Provider",
    description: "Warmhearted, conscientious, and cooperative. Value security and stability.",
    traits: ["Organized", "Nurturing", "Traditional"]
  },
  ESFP: {
    title: "The Performer",
    description: "Outgoing, friendly, and accepting. Exuberant lovers of life, people, and material comforts.",
    traits: ["Spontaneous", "Energetic", "Fun-loving"]
  },
  ESTJ: {
    title: "The Supervisor",
    description: "Practical, matter-of-fact, with a natural head for business or mechanics.",
    traits: ["Structured", "Efficient", "Practical"]
  },
  ESTP: {
    title: "The Dynamo",
    description: "Flexible and tolerant, take a pragmatic approach focused on immediate results.",
    traits: ["Energetic", "Action-oriented", "Adaptable"]
  }
};

export const MBTISelector: React.FC<MBTISelectorProps> = ({ value, onChange }) => {
  const [type, setType] = useState(value);
  
  // Split MBTI into its four dimensions
  const iE = type[0]; // Introversion/Extroversion
  const sN = type[1]; // Sensing/Intuition
  const tF = type[2]; // Thinking/Feeling
  const jP = type[3]; // Judging/Perceiving
  
  // Handle selection for individual dimensions
  const handleDimensionChange = (dimension: number, newValue: string) => {
    const currentChars = type.split('');
    currentChars[dimension] = newValue;
    const newType = currentChars.join('');
    setType(newType);
    onChange(newType);
  };
  
  return (
    <div className="space-y-6">
      {/* Current type display */}
      <div className="bg-card border border-border p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium font-cormorant">{type} - {mbtiDescriptions[type]?.title || "Personality Type"}</h3>
            <p className="text-muted-foreground text-sm mt-1 font-inter">{mbtiDescriptions[type]?.description}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          {mbtiDescriptions[type]?.traits.map((trait, i) => (
            <span 
              key={i}
              className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>
      
      {/* Selector for each dimension */}
      <div className="space-y-4">
        <Tabs defaultValue={iE} onValueChange={(v) => handleDimensionChange(0, v)} className="w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium font-inter">Extroversion vs. Introversion</span>
            <TabsList className="grid w-36 grid-cols-2">
              <TabsTrigger value="E">E</TabsTrigger>
              <TabsTrigger value="I">I</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="E" className="p-2 rounded text-xs text-muted-foreground font-inter">
            Extroverted - Gains energy from social interaction
          </TabsContent>
          <TabsContent value="I" className="p-2 rounded text-xs text-muted-foreground font-inter">
            Introverted - Gains energy from solitary time and reflection
          </TabsContent>
        </Tabs>
        
        <Tabs defaultValue={sN} onValueChange={(v) => handleDimensionChange(1, v)} className="w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium font-inter">Sensing vs. Intuition</span>
            <TabsList className="grid w-36 grid-cols-2">
              <TabsTrigger value="S">S</TabsTrigger>
              <TabsTrigger value="N">N</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="S" className="p-2 rounded text-xs text-muted-foreground font-inter">
            Sensing - Focuses on concrete facts and present details
          </TabsContent>
          <TabsContent value="N" className="p-2 rounded text-xs text-muted-foreground font-inter">
            Intuition - Focuses on patterns, possibilities, and future implications
          </TabsContent>
        </Tabs>
        
        <Tabs defaultValue={tF} onValueChange={(v) => handleDimensionChange(2, v)} className="w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium font-inter">Thinking vs. Feeling</span>
            <TabsList className="grid w-36 grid-cols-2">
              <TabsTrigger value="T">T</TabsTrigger>
              <TabsTrigger value="F">F</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="T" className="p-2 rounded text-xs text-muted-foreground font-inter">
            Thinking - Makes decisions based on logic and objective analysis
          </TabsContent>
          <TabsContent value="F" className="p-2 rounded text-xs text-muted-foreground font-inter">
            Feeling - Makes decisions based on values and subjective impact
          </TabsContent>
        </Tabs>
        
        <Tabs defaultValue={jP} onValueChange={(v) => handleDimensionChange(3, v)} className="w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium font-inter">Judging vs. Perceiving</span>
            <TabsList className="grid w-36 grid-cols-2">
              <TabsTrigger value="J">J</TabsTrigger>
              <TabsTrigger value="P">P</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="J" className="p-2 rounded text-xs text-muted-foreground font-inter">
            Judging - Prefers structure, planning, and firm decisions
          </TabsContent>
          <TabsContent value="P" className="p-2 rounded text-xs text-muted-foreground font-inter">
            Perceiving - Prefers flexibility, adaptability, and keeping options open
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
