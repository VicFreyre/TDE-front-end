// ============================================
// CLIENTE SUPABASE SEGURO
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================
// CONFIGURAÇÃO
// ============================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar variáveis de ambiente em desenvolvimento
const validateEnvVars = (): boolean => {
  const missing: string[] = [];
  
  if (!SUPABASE_URL) missing.push('VITE_SUPABASE_URL');
  if (!SUPABASE_ANON_KEY) missing.push('VITE_SUPABASE_ANON_KEY');
  
  if (missing.length > 0) {
    if (import.meta.env.DEV) {
      console.error(
        `⚠️ Variáveis de ambiente faltando: ${missing.join(', ')}\n` +
        'Crie um arquivo .env na raiz do projeto com as variáveis necessárias.\n' +
        'Veja .env.example para referência.'
      );
    }
    return false;
  }
  
  return true;
};

// ============================================
// CLIENTE SINGLETON
// ============================================

let supabaseClient: SupabaseClient | null = null;

const createSupabaseClient = (): SupabaseClient | null => {
  if (!validateEnvVars()) {
    return null;
  }
  
  try {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: localStorage,
        storageKey: 'wishboard-auth',
      },
      global: {
        headers: {
          'X-Client-Info': 'wishboard-web',
        },
      },
    });
    
    if (import.meta.env.DEV) {
      console.log('✓ Supabase inicializado');
    }
    
    return client;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('✗ Erro ao criar cliente Supabase:', error);
    }
    return null;
  }
};

// Inicializar cliente
supabaseClient = createSupabaseClient();

// ============================================
// EXPORTS
// ============================================

export const supabase = supabaseClient;

/**
 * Verifica se o Supabase está configurado e disponível
 */
export const isSupabaseConfigured = (): boolean => {
  return supabaseClient !== null;
};

/**
 * Obtém o usuário autenticado atual
 * Retorna null se não autenticado
 */
export const getCurrentUser = async () => {
  if (!supabaseClient) return null;
  
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  
  if (error || !user) return null;
  
  return user;
};

/**
 * Obtém o ID do usuário autenticado
 * Lança erro se não autenticado
 */
export const requireUserId = async (): Promise<string> => {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }
  
  return user.id;
};

