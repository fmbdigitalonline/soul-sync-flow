
import React from 'react';
import { motion } from "@/lib/framer-motion";
import { useLanguage } from '@/contexts/LanguageContext';
import { safeInterpolateTranslation } from '@/utils/translation-utils';

const FALLBACK_KEY = 'blueprint.insight.personalizing';
const FALLBACK_TEMPLATE = 'Personalizing for your {userType} nature…';

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
  const raw = t(FALLBACK_KEY);
  // If i18n loader hasn't resolved this key it returns the key itself —
  // fall back to a plain English template so users never see a raw key.
  const template = raw === FALLBACK_KEY ? FALLBACK_TEMPLATE : raw;

  return (
    <motion.div 
      className="bg-card/60 backdrop-blur-sm rounded-xl p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-xs text-soul-purple font-medium">
        {safeInterpolateTranslation(template, { userType: getUserType() })}
      </p>
    </motion.div>
  );
};
