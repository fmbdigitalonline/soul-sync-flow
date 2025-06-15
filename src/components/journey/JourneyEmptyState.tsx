
import React from "react";
import { Target } from "lucide-react";

export const JourneyEmptyState: React.FC = () => {
  return (
    <div className="p-8 text-center">
      <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">No Active Dream Journey</h3>
      <p className="text-muted-foreground mb-6">
        Create your first dream to see your personalized journey map
      </p>
    </div>
  );
};
