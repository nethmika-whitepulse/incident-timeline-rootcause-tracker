import { Navigate } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Still checking localStorage — render a minimal spinner so the page doesn't
  // flash to /login for an already-authenticated user on hard refresh
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // No valid user — redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // Authenticated — render the page
  return children;
}
