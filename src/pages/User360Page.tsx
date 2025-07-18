
import React from 'react';
import User360Dashboard from '@/components/User360Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const User360Page: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <User360Dashboard />;
};

export default User360Page;
