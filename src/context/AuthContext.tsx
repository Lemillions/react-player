import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Profile } from '../types';
import { authAPI } from '../services/api';

interface AuthState {
  user: User | null;
  profiles: Profile[];
  currentProfile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_PROFILES'; payload: Profile[] }
  | { type: 'SET_CURRENT_PROFILE'; payload: Profile | null }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  profiles: [],
  currentProfile: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  setCurrentProfile: (profile: Profile | null) => void;
  clearError: () => void;
} | null>(null);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        profiles: action.payload.user.profiles || [],
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        profiles: [],
        currentProfile: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
      };
    case 'SET_PROFILES':
      return { ...state, profiles: action.payload };
    case 'SET_CURRENT_PROFILE':
      return { ...state, currentProfile: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          if (response.success && response.data) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user: response.data, token }
            });
          } else {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authAPI.login({ email, password });
      if (response.success) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: response.user, token: response.token }
        });
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: response.message || 'Login failed' });
      }
    } catch (error: any) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.message || 'Network error'
      });
    }
  };

  const register = async (email: string, password: string, name: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authAPI.register({ email, password, name });
      if (response.success) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: response.user, token: response.token }
        });
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: response.message || 'Registration failed' });
      }
    } catch (error: any) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.message || 'Network error'
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('current_profile');
    dispatch({ type: 'LOGOUT' });
  };

  const setCurrentProfile = (profile: Profile | null) => {
    if (profile) {
      localStorage.setItem('current_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('current_profile');
    }
    dispatch({ type: 'SET_CURRENT_PROFILE', payload: profile });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        setCurrentProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}