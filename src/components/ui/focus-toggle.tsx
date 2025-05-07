
import * as React from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FocusToggleProps {
  className?: string;
}

export const FocusToggle = ({ className }: FocusToggleProps) => {
  const [focusMode, setFocusMode] = React.useState(false);
  const { toast } = useToast();

  const toggleFocusMode = (checked: boolean) => {
    setFocusMode(checked);
    document.body.classList.toggle('focus-mode', checked);
    
    toast({
      title: checked ? "Focus mode enabled" : "Focus mode disabled",
      description: checked 
        ? "Using Lexend font for improved reading" 
        : "Switched back to standard font",
      duration: 2000,
    });
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Switch 
        id="focus-mode" 
        checked={focusMode}
        onCheckedChange={toggleFocusMode}
      />
      <Label htmlFor="focus-mode" className="flex items-center gap-1.5 cursor-pointer font-ui">
        <BookOpen className="h-4 w-4" />
        <span>Focus Mode</span>
      </Label>
    </div>
  );
}

function cn(...inputs: (string | undefined)[]) {
  return inputs.filter(Boolean).join(" ");
}
