import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { state, login, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      await login(email, password);
    }
  };

  return (
    <div className="auth-form">
      <h2>Sign In to StreamPlatform</h2>
      
      {state.error && (
        <div className="error-message">
          {state.error}
          <button onClick={clearError} className="close-error">×</button>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={state.isLoading || !email || !password}
        >
          {state.isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      
      <div className="auth-links">
        <button 
          type="button" 
          className="link-button"
          onClick={() => {/* TODO: Implement forgot password */}}
        >
          Forgot Password?
        </button>
        
        <div className="auth-switch">
          Don't have an account?{' '}
          <button 
            type="button" 
            className="link-button"
            onClick={onSwitchToRegister}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}