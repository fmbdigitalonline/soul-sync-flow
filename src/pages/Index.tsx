
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useQuery } from "@tanstack/react-query";
import { blueprintService } from "@/services/blueprint-service";
import { hermeticPersonalityReportService } from "@/services/hermetic-personality-report-service";
import { useStewardIntroductionTrigger } from '@/hooks/use-steward-introduction-trigger';
import { StewardIntroductionPopup } from '@/components/steward/StewardIntroductionPopup';

export default function Index() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [hasPersonalityReport, setHasPersonalityReport] = useState(false);

  // Add steward introduction trigger
  const { isIntroductionActive } = useStewardIntroductionTrigger();

  useEffect(() => {
    const checkExistingReport = async () => {
      if (user) {
        // Simple check for personality report
        try {
          const { data } = await hermeticPersonalityReportService.getPersonalityReport(user.id);
          setHasPersonalityReport(!!data);
        } catch (error) {
          console.error('Error checking personality report:', error);
          setHasPersonalityReport(false);
        }
      }
    };

    checkExistingReport();
  }, [user]);

  // Early return if still loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-soul-black to-soul-purple/10 text-white">
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-4">{t('index.welcome')}</h1>
          <p className="mb-4">{t('index.loading')}</p>
          <Skeleton className="w-[150px] h-[30px] rounded-md mb-2" />
          <Skeleton className="h-[20px] rounded-md mb-1" />
          <Skeleton className="h-[20px] rounded-md mb-1" />
          <Skeleton className="h-[20px] rounded-md mb-1" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-soul-black to-soul-purple/10 text-white">
      {/* Steward Introduction Popup */}
      <StewardIntroductionPopup />
      
      {/* Blur background when introduction is active */}
      <div className={isIntroductionActive ? 'filter blur-sm' : ''}>
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-4">{t('index.welcome')}</h1>
          {user ? (
            <>
              <p className="mb-4">
                {t('index.welcomeBack')} {user.email}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('index.yourBlueprint')}</CardTitle>
                    <CardDescription>{t('index.blueprintDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{t('index.blueprintContent')}</p>
                    <Button asChild>
                      <Link to="/blueprint">{t('index.viewBlueprint')}</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('index.yourGrowthProgram')}</CardTitle>
                    <CardDescription>{t('index.growthProgramDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{t('index.growthProgramContent')}</p>
                    <Button asChild>
                      <Link to="/growth">{t('index.viewGrowthProgram')}</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('index.yourCommunity')}</CardTitle>
                    <CardDescription>{t('index.communityDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{t('index.communityContent')}</p>
                    <Button asChild>
                      <Link to="/community">{t('index.joinCommunity')}</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <>
              <p className="mb-4">{t('index.notLoggedIn')}</p>
              <Button asChild>
                <Link to="/auth">{t('index.signIn')}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
