
import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SoulOrb } from "@/components/ui/soul-orb";

const ProtectedRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, loading, isNewUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if not authenticated
        navigate("/auth", { state: { from: location.pathname }, replace: true });
      } else if (isNewUser && location.pathname !== "/onboarding") {
        // Redirect new users to onboarding if they try to access other protected routes
        navigate("/onboarding", { replace: true });
      }
    }
  }, [user, loading, navigate, location.pathname, isNewUser]);

  if (loading) {
    // Show loading state
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <SoulOrb size="lg" stage="generating" />
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
