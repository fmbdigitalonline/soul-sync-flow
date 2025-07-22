
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const ProtectedRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  // If the user is not authenticated and the auth check is complete, redirect to login
  if (!loading && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If we're still loading, we can show a loading state here if needed
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-soul-purple"></div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">{t('system.authenticating')}</p>
        </div>
      </div>
    );
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
