
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TooltipLabelProps {
  label: string;
  tooltipContent?: string;
}

const TooltipLabel: React.FC<TooltipLabelProps> = ({ label, tooltipContent }) => {
  return (
    <div className="flex items-center">
      <span className="text-muted-foreground">{label}:</span>
      {tooltipContent && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 ml-1 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{tooltipContent}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default TooltipLabel;
