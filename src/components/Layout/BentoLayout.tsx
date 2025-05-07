
import React from "react";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { FocusModeToggle } from "@/components/ui/focus-mode-toggle";
import { HighContrastToggle } from "@/components/ui/high-contrast-toggle";

interface BentoLayoutProps {
  children: React.ReactNode;
}

export const BentoLayout = ({ children }: BentoLayoutProps) => {
  const [focusMode, setFocusMode] = React.useState(false);
  const [highContrast, setHighContrast] = React.useState(false);
  
  // Apply focus mode to body
  React.useEffect(() => {
    if (focusMode) {
      document.body.classList.add('focus-mode');
    } else {
      document.body.classList.remove('focus-mode');
    }
    
    return () => {
      document.body.classList.remove('focus-mode');
    };
  }, [focusMode]);
  
  // Apply high contrast mode
  React.useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    return () => {
      document.documentElement.classList.remove('high-contrast');
    };
  }, [highContrast]);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="font-display font-semibold text-2xl">Blueprint</h1>
        <div className="flex items-center gap-2">
          <FocusModeToggle enabled={focusMode} onToggle={setFocusMode} />
          <HighContrastToggle enabled={highContrast} onToggle={setHighContrast} />
        </div>
      </header>
      
      <main className={cn("transition-all duration-150", focusMode ? "focus-mode" : "")}>
        {children}
      </main>
    </div>
  );
};

// Helper function to add CN to classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
