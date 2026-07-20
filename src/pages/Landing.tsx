import React from "react";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { PageContainer, PageSection } from "@/components/Layout/PageContainer";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Landing — the signed-out entry at `/` (Constitution v3.1: Index retires
 * only after the reunion lives). Returning, signed-in users are routed
 * straight into the Twin conversation by HomeGate; this is the small public
 * welcome that replaces Index's signed-out job — welcome + the two ways in.
 * Everything Index did for signed-in users now lives in the reunion and the
 * Coach OS, so nothing is lost by retiring it.
 */
const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <MainLayout hideNav>
      <PageContainer
        maxWidth="saas"
        className="min-h-screen flex flex-col justify-center items-center text-center bg-gradient-to-br from-background via-accent/5 to-primary/5 px-4"
      >
        <PageSection className="space-y-6 max-w-xl">
          <h1 className="text-4xl sm:text-5xl font-bold font-cormorant gradient-text">
            {t("index.welcomePlain")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("index.landingSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Button
              onClick={() => navigate("/get-started")}
              size="lg"
              className="font-inter h-touch px-8"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              {t("index.getStarted")}
            </Button>
            <Button asChild variant="outline" size="lg" className="font-inter h-touch px-8">
              <Link to="/auth">
                <LogIn className="h-5 w-5 mr-2" />
                {t("auth.signIn")}
              </Link>
            </Button>
          </div>
        </PageSection>
      </PageContainer>
    </MainLayout>
  );
};

export default Landing;
