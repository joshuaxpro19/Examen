import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { useAuth } from '../context/AuthContext';

export function AuthPage() {
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (mode === 'login') {
    return <LoginForm onSwitchToRegister={() => setMode('register')} />;
  }

  return <RegisterForm onSwitchToLogin={() => setMode('login')} />;
}