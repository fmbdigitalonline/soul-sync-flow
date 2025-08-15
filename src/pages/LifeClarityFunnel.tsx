import { useNavigate } from "react-router-dom";
import { LifeClarityAssessment } from "@/components/funnel/LifeClarityAssessment";
import { storeFunnelData } from "@/utils/funnel-data";

const LifeClarityFunnel = () => {
  const navigate = useNavigate();

  const handleComplete = (funnelData: any) => {
    // Store funnel data using the utility
    storeFunnelData(funnelData);
    
    // Navigate to auth with funnel completion indicator
    navigate("/auth?from=funnel");
  };

  return <LifeClarityAssessment onComplete={handleComplete} />;
};

export default LifeClarityFunnel;