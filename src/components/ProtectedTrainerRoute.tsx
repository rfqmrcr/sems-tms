import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTrainer } from '@/contexts/TrainerContext';

interface ProtectedTrainerRouteProps {
  children: React.ReactNode;
}

export const ProtectedTrainerRoute: React.FC<ProtectedTrainerRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { isTrainer, loading: trainerLoading } = useTrainer();

  if (authLoading || trainerLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isTrainer) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
