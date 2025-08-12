
import React from 'react';
import { motion } from "@/lib/framer-motion";
import { useLanguage } from '@/contexts/LanguageContext';
import { safeInterpolateTranslation } from '@/utils/translation-utils';

interface BlueprintInsightProps {
  blueprintData: any;
  getUserType: () => string;
}

export const BlueprintInsight: React.FC<BlueprintInsightProps> = ({
  blueprintData,
  getUserType
}) => {
  if (!blueprintData) return null;

  const { t } = useLanguage();

  return (
    <motion.div 
      className="bg-card/60 backdrop-blur-sm rounded-xl p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-xs text-soul-purple font-medium">
        {safeInterpolateTranslation(t('blueprint.insight.personalizing'), { userType: getUserType() })}
      </p>
    </motion.div>
  );
};
