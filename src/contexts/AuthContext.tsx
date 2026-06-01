// ============================================
// CONTEXTO DE AUTENTICAÇÃO COM SUPABASE AUTH
// ============================================

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as SupabaseUser, Session, AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthError } from '@/lib/validators';
import type { User, AuthState } from '@/types';

// ============================================
// TIPOS
// ============================================

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: { name?: string; avatarUrl?: string }) => Promise<void>;
}

// ============================================
// CONTEXTO
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// HELPERS
// ============================================

const mapSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
    avatarUrl: supabaseUser.user_metadata?.avatar_url,
    createdAt: supabaseUser.created_at,
  };
};

const handleAuthError = (error: SupabaseAuthError): never => {
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': 'Email ou senha incorretos',
    'Email not confirmed': 'Confirme seu email antes de fazer login',
    'User already registered': 'Este email já está cadastrado',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
    'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos',
    'Invalid email': 'Email inválido',
  };

  const message = errorMessages[error.message] || error.message || 'Erro de autenticação';
  throw new AuthError(message, error.code || 'AUTH_ERROR');
};

// ============================================
// PROVIDER
// ============================================

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Inicializar sessão
  useEffect(() => {
    if (!supabase) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Supabase não configurado',
      }));
      return;
    }

    // Verificar sessão existente
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        setState({
          user: mapSupabaseUser(session?.user ?? null),
          isAuthenticated: !!session,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Erro ao verificar sessão',
        });
      }
    };

    initSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          user: mapSupabaseUser(session?.user ?? null),
          isAuthenticated: !!session,
          isLoading: false,
          error: null,
        }));

        // Limpar dados locais no logout
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('wishboard-data');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign In
  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      throw new AuthError('Supabase não configurado', 'NO_SUPABASE');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) handleAuthError(error);

      setState({
        user: mapSupabaseUser(data.user),
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof AuthError ? error.message : 'Erro ao fazer login';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  // Sign Up
  const signUp = useCallback(async (email: string, password: string, name: string) => {
    if (!supabase) {
      throw new AuthError('Supabase não configurado', 'NO_SUPABASE');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            full_name: name,
          },
          // URL de redirecionamento após confirmação de email
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) handleAuthError(error);

      // Se o email precisa de confirmação (confirmação habilitada no Supabase)
      if (data.user && !data.session) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
        // Lança erro especial para indicar que precisa confirmar email
        throw new AuthError(
          'Verifique seu email para concluir o cadastro.',
          'EMAIL_CONFIRMATION_REQUIRED'
        );
      }

      setState({
        user: mapSupabaseUser(data.user),
        isAuthenticated: !!data.session,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof AuthError ? error.message : 'Erro ao criar conta';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  // Sign Out
  const signOut = useCallback(async () => {
    if (!supabase) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao fazer logout',
      }));
    }
  }, []);

  // Reset Password
  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) {
      throw new AuthError('Supabase não configurado', 'NO_SUPABASE');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) handleAuthError(error);
  }, []);

  // Update Profile
  const updateProfile = useCallback(async (data: { name?: string; avatarUrl?: string }) => {
    if (!supabase) {
      throw new AuthError('Supabase não configurado', 'NO_SUPABASE');
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        name: data.name,
        full_name: data.name,
        avatar_url: data.avatarUrl,
      },
    });

    if (error) handleAuthError(error);

    // Atualizar estado local
    setState(prev => ({
      ...prev,
      user: prev.user ? {
        ...prev.user,
        name: data.name ?? prev.user.name,
        avatarUrl: data.avatarUrl ?? prev.user.avatarUrl,
      } : null,
    }));
  }, []);

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

// ============================================
// COMPONENTE DE PROTEÇÃO DE ROTA
// ============================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // O redirecionamento será feito pelo App.tsx
  }

  return <>{children}</>;
};

export default AuthContext;
