import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [validationError, setValidationError] = useState('');
  const { state, register, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }
    
    setValidationError('');
    
    if (email && password && name) {
      await register(email, password, name);
    }
  };

  const error = state.error || validationError;

  return (
    <div className="auth-form">
      <h2>Join StreamPlatform</h2>
      
      {error && (
        <div className="error-message">
          {error}
          <button 
            onClick={() => {
              clearError();
              setValidationError('');
            }} 
            className="close-error"
          >
            ×
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>
        
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
            placeholder="Create a password (min 6 characters)"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={state.isLoading || !email || !password || !name || !confirmPassword}
        >
          {state.isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      
      <div className="auth-links">        
        <div className="auth-switch">
          Already have an account?{' '}
          <button 
            type="button" 
            className="link-button"
            onClick={onSwitchToLogin}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}