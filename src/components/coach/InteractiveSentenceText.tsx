import React from "react";
import { cn } from "@/lib/utils";

interface InteractiveSentenceTextProps {
  text: string;
  selectedSentence: string | null;
  onSentenceSelect: (sentence: string | null) => void;
  disabled?: boolean;
}

// Parse text into sentences, handling common abbreviations
const splitIntoSentences = (text: string): string[] => {
  if (!text) return [];
  
  // Simple sentence splitting - capital letter to punctuation
  // This regex handles most cases while keeping it simple
  const sentences = text.match(/[A-Z][^.!?]*[.!?]+(?:\s|$)|[A-Z][^.!?]*$/g);
  
  if (!sentences) {
    // If no sentences found, return the whole text as one piece
    return [text];
  }
  
  return sentences.map(s => s.trim()).filter(s => s.length > 0);
};

export const InteractiveSentenceText: React.FC<InteractiveSentenceTextProps> = ({
  text,
  selectedSentence,
  onSentenceSelect,
  disabled = false,
}) => {
  const sentences = splitIntoSentences(text);
  
  // If we couldn't parse into sentences, just render plain text
  if (sentences.length <= 1 && sentences[0] === text) {
    return (
      <span className="text-sm leading-relaxed whitespace-pre-wrap text-left">
        {text}
      </span>
    );
  }

  const handleClick = (sentence: string) => {
    if (disabled) return;
    // Toggle selection - if same sentence clicked, deselect
    onSentenceSelect(sentence === selectedSentence ? null : sentence);
  };

  return (
    <span className="text-sm leading-relaxed whitespace-pre-wrap text-left">
      {sentences.map((sentence, index) => {
        const isSelected = selectedSentence === sentence;
        
        return (
          <React.Fragment key={index}>
            <span
              onClick={() => handleClick(sentence)}
              className={cn(
                "cursor-pointer transition-colors duration-200 rounded px-0.5 -mx-0.5",
                disabled && "cursor-default",
                !disabled && !isSelected && "hover:bg-soul-purple/10",
                isSelected && "bg-soul-purple/20"
              )}
            >
              {sentence}
            </span>
            {index < sentences.length - 1 && " "}
          </React.Fragment>
        );
      })}
    </span>
  );
};
