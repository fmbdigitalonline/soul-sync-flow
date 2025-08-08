
import React from 'react';
import { motion } from "@/lib/framer-motion";

interface BlueprintInsightProps {
  blueprintData: any;
  getUserType: () => string;
}

export const BlueprintInsight: React.FC<BlueprintInsightProps> = ({
  blueprintData,
  getUserType
}) => {
  if (!blueprintData) return null;

  return (
    <motion.div 
      className="bg-card/60 backdrop-blur-sm rounded-xl p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-xs text-soul-purple font-medium">
        🧬 Personalizing for your {getUserType()} nature...
      </p>
    </motion.div>
  );
};
