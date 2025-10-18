
import React from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { safeInterpolateTranslation } from "@/utils/translation-utils";

interface ReadyToBeginModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  estimatedDuration: string;
}

export const ReadyToBeginModal: React.FC<ReadyToBeginModalProps> = ({
  open,
  onConfirm,
  onCancel,
  estimatedDuration
}) => {
  const { t } = useLanguage();
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-xs w-full border border-slate-200">
        <div className="text-xl font-semibold mb-3 text-center">{t('modal.readyToBegin')}</div>
        <div className="text-gray-700 mb-4 text-center">
          {safeInterpolateTranslation(t('modal.sessionDuration'), { duration: estimatedDuration || "~30 mins" })}<br />
          {t('modal.coachGuide')}<br />
          {t('modal.readyToFocus')}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto sm:flex-1">{t('cancel')}</Button>
          <Button className="bg-soul-purple text-white w-full sm:w-auto sm:flex-1" onClick={onConfirm}>{t('modal.letsGo')}</Button>
        </div>
      </div>
    </div>
  );
};
