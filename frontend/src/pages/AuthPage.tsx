import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (mode === 'login') {
    return <LoginForm onSwitchToRegister={() => setMode('register')} />;
  }

  return <RegisterForm onSwitchToLogin={() => setMode('login')} />;
}