
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useHACSIntelligenceDiagnostics } from '@/hooks/use-hacs-intelligence-diagnostics';
import { useLanguage } from '@/contexts/LanguageContext';

interface HACSLoadingDiagnosticsProps {
  showOnlyWhenIssues?: boolean;
}

export const HACSLoadingDiagnostics: React.FC<HACSLoadingDiagnosticsProps> = ({ 
  showOnlyWhenIssues = true 
}) => {
  const diagnostics = useHACSIntelligenceDiagnostics();
  const { t } = useLanguage();

  // Only show if there are issues and showOnlyWhenIssues is true
  if (showOnlyWhenIssues && diagnostics.errors.length === 0 && diagnostics.diagnosticsComplete) {
    return null;
  }

  const getStatusIcon = (exists: boolean, loading: boolean) => {
    if (loading) return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    return exists ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-cormorant">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          {t('system.soulSystemDiagnostics')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center justify-between p-2 rounded bg-white/60">
            <span className="font-inter">{t('system.soulIntelligence')}</span>
            {getStatusIcon(diagnostics.hacsIntelligenceExists, diagnostics.hacsIntelligenceLoading)}
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-white/60">
            <span className="font-inter">User Blueprint</span>
            {getStatusIcon(diagnostics.userBlueprintExists, false)}
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-white/60">
            <span className="font-inter">Blueprint Record</span>
            {getStatusIcon(diagnostics.blueprintRecordExists, false)}
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-white/60">
            <span className="font-inter">Steward Intro Status</span>
            <span className="text-xs text-gray-600">
              {diagnostics.stewardIntroductionCompleted === null 
                ? 'Unknown' 
                : diagnostics.stewardIntroductionCompleted ? 'Completed' : 'Pending'
              }
            </span>
          </div>
        </div>

        {diagnostics.errors.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <div className="font-medium text-red-800 font-inter text-sm mb-2">Issues Detected:</div>
            <ul className="text-xs text-red-700 space-y-1 font-inter">
              {diagnostics.errors.map((error, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!diagnostics.diagnosticsComplete && (
          <div className="text-center py-2">
            <Loader2 className="h-4 w-4 animate-spin mx-auto text-blue-500" />
            <span className="text-sm text-gray-600 font-inter">Running diagnostics...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
