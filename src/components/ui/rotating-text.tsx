import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface RotatingTextProps {
  texts: string[];
  interval?: number;
  className?: string;
}

export const RotatingText: React.FC<RotatingTextProps> = ({ texts, interval = 4000, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (texts.length <= 1) return;

    const timer = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % texts.length);
        setIsVisible(true);
      }, 200); // Half second for fade out/in
    }, interval);

    return () => clearInterval(timer);
  }, [texts.length, interval]);

  if (texts.length === 0) return null;

  return (
    <div className={cn("transition-opacity duration-200 mt-6 text-sm", className)}>
      <span className={cn("transition-opacity duration-200", isVisible ? "opacity-100" : "opacity-0")}>
        "{texts[currentIndex]}"
      </span>
    </div>
  );
};
