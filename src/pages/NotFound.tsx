
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { GradientButton } from "@/components/ui/gradient-button";
import StarField from "@/components/ui/star-field";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <StarField />
      <CosmicCard className="max-w-md w-full text-center p-8" floating glow>
        <h1 className="text-6xl font-bold font-display mb-4">
          <span className="gradient-text">404</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          It seems your soul journey has led you off the path
        </p>
        <GradientButton onClick={() => navigate("/")} className="w-full">
          Return to Your Journey
        </GradientButton>
      </CosmicCard>
    </div>
  );
};

export default NotFound;
