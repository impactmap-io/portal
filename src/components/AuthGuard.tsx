import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuthStore();

  useEffect(() => {
    if (!session && location.pathname !== '/login') {
      navigate('/login');
    } else if (session && location.pathname === '/login') {
      navigate('/');
    }
  }, [session, location.pathname, navigate]);

  if (!session && location.pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}