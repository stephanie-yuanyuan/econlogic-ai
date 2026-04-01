import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const AuthGuard = () => {
  const { session, isLoading } = useAuthStore();

  // Loading state — show skeleton
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded-xl w-1/3" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
          <div className="h-64 bg-slate-100 rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  // No session — redirect to login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated — render child routes
  return <Outlet />;
};

export default AuthGuard;
