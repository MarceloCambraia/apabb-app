import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Skeleton } from '@/components/ui/skeleton';

export function RequireVolunteerAdmin({ adminOnly = false }: { adminOnly?: boolean }) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isVolunteerCoordinator, loading } = useUserRole();
  const location = useLocation();

  if (authLoading || loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (adminOnly ? !isAdmin : !(isAdmin || isVolunteerCoordinator)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
