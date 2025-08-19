import React, { useState } from 'react';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';
import '../components/Auth/Auth.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      {isLogin ? (
        <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  );
}