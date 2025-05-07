
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CosmicCard } from "@/components/ui/cosmic-card";
import MainLayout from "@/components/Layout/MainLayout";
import { Moon, Sun, ArrowUp, Hash, Zap, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data
const mockBlueprint = {
  name: "Sarah",
  astrology: {
    sun: {
      sign: "Leo",
      degree: "15°",
      element: "Fire",
      quality: "Fixed",
      description: "Confident, creative, and generous with a natural flair for leadership and self-expression."
    },
    moon: {
      sign: "Pisces",
      degree: "8°",
      element: "Water",
      quality: "Mutable",
      description: "Emotionally sensitive and intuitive with a deep connection to the collective unconscious."
    },
    rising: {
      sign: "Virgo",
      degree: "3°",
      element: "Earth",
      quality: "Mutable",
      description: "Presents as analytical, detail-oriented, and devoted to service and improvement."
    },
  },
  numerology: {
    lifePath: 7,
    description: "The seeker and intellectual who values knowledge, introspection, and spiritual wisdom."
  },
  humanDesign: {
    type: "Projector",
    strategy: "Wait for invitation",
    authority: "Emotional",
    definition: "Split",
    description: "Designed to guide and direct energy, rather than initiate. Works best when recognized and invited."
  },
  chineseZodiac: {
    sign: "Snake",
    element: "Fire",
    description: "Intuitive, wise, and naturally elegant with a mysterious quality that draws others in."
  },
  mbti: {
    type: "INFJ",
    title: "The Counselor",
    description: "Idealistic, organized, insightful, dependable, and naturally drawn to big ideas and human potential."
  }
};

const BlueprintCard = ({ 
  title, 
  icon: Icon, 
  iconColor,
  children,
}: { 
  title: string;
  icon: React.ElementType;
  iconColor?: string;
  children: React.ReactNode;
}) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <CosmicCard className="overflow-hidden">
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          <div className={cn("p-2 rounded-full", iconColor)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-medium font-display">{title}</h3>
        </div>
        <button className="p-1 hover:bg-muted rounded-full">
          <Info className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
      <div className={cn("pt-4", !expanded && "hidden")}>
        {children}
      </div>
    </CosmicCard>
  );
};

const Blueprint = () => {
  return (
    <MainLayout>
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-3xl font-bold font-display text-center mb-2">
          <span className="gradient-text">Your Soul Blueprint</span>
        </h1>
        <p className="text-center text-muted-foreground mb-6">
          Discover your unique cosmic design and inner strengths
        </p>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <CosmicCard glow>
              <div className="text-center">
                <h2 className="text-2xl font-bold font-display mb-2">{mockBlueprint.name}'s Blueprint</h2>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <div className="flex justify-center">
                      <div className="bg-amber-500 rounded-full p-2">
                        <Sun className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <p className="text-xs mt-1">Sun</p>
                    <p className="font-medium">{mockBlueprint.astrology.sun.sign}</p>
                  </div>
                  <div>
                    <div className="flex justify-center">
                      <div className="bg-indigo-500 rounded-full p-2">
                        <Moon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <p className="text-xs mt-1">Moon</p>
                    <p className="font-medium">{mockBlueprint.astrology.moon.sign}</p>
                  </div>
                  <div>
                    <div className="flex justify-center">
                      <div className="bg-emerald-500 rounded-full p-2">
                        <ArrowUp className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <p className="text-xs mt-1">Rising</p>
                    <p className="font-medium">{mockBlueprint.astrology.rising.sign}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div>
                    <div className="flex justify-center">
                      <div className="bg-purple-500 rounded-full p-2">
                        <Hash className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <p className="text-xs mt-1">Life Path</p>
                    <p className="font-medium">{mockBlueprint.numerology.lifePath}</p>
                  </div>
                  <div>
                    <div className="flex justify-center">
                      <div className="bg-soul-blue rounded-full p-2">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <p className="text-xs mt-1">Human Design</p>
                    <p className="font-medium">{mockBlueprint.humanDesign.type}</p>
                  </div>
                  <div>
                    <div className="flex justify-center">
                      <div className="bg-rose-500 rounded-full p-2">
                        <span className="text-white font-medium">MBTI</span>
                      </div>
                    </div>
                    <p className="text-xs mt-1">Personality</p>
                    <p className="font-medium">{mockBlueprint.mbti.type}</p>
                  </div>
                </div>
              </div>
            </CosmicCard>

            <div className="space-y-4">
              <h3 className="font-medium text-lg">Your Key Traits</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-sm font-medium">Creative</p>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-sm font-medium">Intuitive</p>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-sm font-medium">Analytical</p>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-sm font-medium">Sensitive</p>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-sm font-medium">Visionary</p>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-sm font-medium">Perfectionist</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            <BlueprintCard 
              title="Astrology" 
              icon={Sun}
              iconColor="bg-amber-500"
            >
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Sun Sign</span>
                    <span className="text-sm">{mockBlueprint.astrology.sun.sign} {mockBlueprint.astrology.sun.degree}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{mockBlueprint.astrology.sun.description}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Moon Sign</span>
                    <span className="text-sm">{mockBlueprint.astrology.moon.sign} {mockBlueprint.astrology.moon.degree}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{mockBlueprint.astrology.moon.description}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Rising Sign</span>
                    <span className="text-sm">{mockBlueprint.astrology.rising.sign} {mockBlueprint.astrology.rising.degree}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{mockBlueprint.astrology.rising.description}</p>
                </div>
              </div>
            </BlueprintCard>
            
            <BlueprintCard 
              title="Numerology" 
              icon={Hash}
              iconColor="bg-purple-500"
            >
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Life Path Number</span>
                    <span className="text-sm">{mockBlueprint.numerology.lifePath}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{mockBlueprint.numerology.description}</p>
                </div>
              </div>
            </BlueprintCard>
            
            <BlueprintCard 
              title="Human Design" 
              icon={Zap}
              iconColor="bg-soul-blue"
            >
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Type</span>
                    <span className="text-sm">{mockBlueprint.humanDesign.type}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Strategy</span>
                    <span className="text-sm">{mockBlueprint.humanDesign.strategy}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Authority</span>
                    <span className="text-sm">{mockBlueprint.humanDesign.authority}</span>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground pt-2">{mockBlueprint.humanDesign.description}</p>
              </div>
            </BlueprintCard>
            
            <BlueprintCard 
              title="MBTI Personality" 
              icon={() => <span className="text-white font-medium">MB</span>}
              iconColor="bg-rose-500"
            >
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Type</span>
                    <span className="text-sm">{mockBlueprint.mbti.type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{mockBlueprint.mbti.title}</p>
                </div>
                
                <p className="text-xs text-muted-foreground">{mockBlueprint.mbti.description}</p>
              </div>
            </BlueprintCard>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4">
            <CosmicCard>
              <h3 className="font-medium mb-3">Your Optimal Working Style</h3>
              <p className="text-sm text-muted-foreground">
                With your Leo Sun and Projector design, you thrive when given recognition for your guidance. 
                Your INFJ personality helps you see the big picture while your Virgo rising keeps you detail-oriented.
              </p>
              <div className="mt-4 space-y-2">
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-sm">✓ Work in focused bursts with clear recognition</p>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-sm">✓ Take time for creative visualization before action</p>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-sm">✓ Balance analytical planning with intuitive decision-making</p>
                </div>
              </div>
            </CosmicCard>
            
            <CosmicCard>
              <h3 className="font-medium mb-3">Your Natural Gifts</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Intuitive Understanding</p>
                  <p className="text-xs text-muted-foreground">Your Pisces Moon and INFJ personality give you natural insight into others' emotions and needs.</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Strategic Vision</p>
                  <p className="text-xs text-muted-foreground">Your Life Path 7 and Leo Sun help you see the bigger picture and lead with confidence.</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Practical Implementation</p>
                  <p className="text-xs text-muted-foreground">Your Virgo Rising gives you the detailed focus to bring your visions into reality.</p>
                </div>
              </div>
            </CosmicCard>
            
            <CosmicCard>
              <h3 className="font-medium mb-3">Growth Opportunities</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Balancing Analysis & Action</p>
                  <p className="text-xs text-muted-foreground">Practice moving from planning to action without overthinking.</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Setting Boundaries</p>
                  <p className="text-xs text-muted-foreground">Your sensitive nature needs clear boundaries to prevent emotional exhaustion.</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Accepting Imperfection</p>
                  <p className="text-xs text-muted-foreground">Release perfectionism and embrace the beauty in progress.</p>
                </div>
              </div>
            </CosmicCard>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Blueprint;
