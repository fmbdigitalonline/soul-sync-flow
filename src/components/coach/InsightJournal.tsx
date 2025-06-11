
import React, { useState } from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Save, Sparkles, Heart, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InsightJournalProps {
  onInsightSave: (insight: string, tags: string[]) => void;
}

export const InsightJournal: React.FC<InsightJournalProps> = ({ onInsightSave }) => {
  const [journalEntry, setJournalEntry] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  const insightTags = [
    "Breakthrough", "Pattern", "Gratitude", "Challenge", 
    "Growth", "Clarity", "Alignment", "Wisdom"
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSave = () => {
    if (journalEntry.trim()) {
      onInsightSave(journalEntry, selectedTags);
      setSaved(true);
      toast({
        title: "Insight journaled",
        description: "Your insight has been added to your personal database",
      });
      
      // Reset after 2 seconds
      setTimeout(() => {
        setJournalEntry("");
        setSelectedTags([]);
        setSaved(false);
      }, 2000);
    }
  };

  return (
    <CosmicCard className="p-4 mb-4">
      <h3 className="text-sm font-medium mb-3 flex items-center">
        <BookOpen className="h-4 w-4 mr-2 text-soul-purple" />
        Soul Insights Journal
      </h3>
      
      <div className="space-y-3">
        {!saved && (
          <>
            <Textarea
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder="Capture your insights, realizations, or aha moments..."
              className="min-h-20 text-sm"
            />
            
            <div>
              <p className="text-xs text-muted-foreground mb-2">Tag this insight:</p>
              <div className="flex flex-wrap gap-1">
                {insightTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="text-xs cursor-pointer hover:bg-soul-purple/20"
                    onClick={() => toggleTag(tag)}
                  >
                    {selectedTags.includes(tag) && <Sparkles className="h-3 w-3 mr-1" />}
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {journalEntry.trim() && (
              <Button
                size="sm"
                onClick={handleSave}
                className="w-full bg-soul-purple hover:bg-soul-purple/90"
              >
                <Save className="h-3 w-3 mr-2" />
                Save to Journal
              </Button>
            )}
          </>
        )}

        {saved && (
          <div className="flex items-center justify-center p-4 bg-green-50 rounded-md">
            <Check className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm text-green-700">Insight saved to your journal!</span>
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground mt-3">
        Your insights create a personal knowledge base for pattern recognition and growth tracking.
      </p>
    </CosmicCard>
  );
};
