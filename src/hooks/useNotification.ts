// ============================================
// HOOK DE NOTIFICAÇÕES
// ============================================

import { useCallback } from 'react';
import { toast } from 'sonner';
import type { NotificationType } from '@/types';

// ============================================
// TIPOS
// ============================================

interface NotificationOptions {
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface UseNotificationReturn {
  notify: (type: NotificationType, options: NotificationOptions) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => Promise<T>;
  dismiss: (id?: string | number) => void;
}

// ============================================
// CONSTANTES
// ============================================

const DEFAULT_DURATION = 4000;

const ICONS = {
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
};

// ============================================
// HOOK
// ============================================

export const useNotification = (): UseNotificationReturn => {
  // Notificação genérica
  const notify = useCallback((type: NotificationType, options: NotificationOptions) => {
    const { title, message, duration = DEFAULT_DURATION, action } = options;
    
    const toastOptions = {
      description: message,
      duration,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    };
    
    switch (type) {
      case 'success':
        toast.success(title, toastOptions);
        break;
      case 'error':
        toast.error(title, {
          ...toastOptions,
          duration: duration || 6000, // Erros ficam mais tempo
        });
        break;
      case 'warning':
        toast.warning(title, toastOptions);
        break;
      case 'info':
        toast.info(title, toastOptions);
        break;
    }
  }, []);

  // Atalhos
  const success = useCallback((title: string, message?: string) => {
    notify('success', { title, message });
  }, [notify]);

  const error = useCallback((title: string, message?: string) => {
    notify('error', { title, message });
  }, [notify]);

  const warning = useCallback((title: string, message?: string) => {
    notify('warning', { title, message });
  }, [notify]);

  const info = useCallback((title: string, message?: string) => {
    notify('info', { title, message });
  }, [notify]);

  // Toast com promise
  const promiseToast = useCallback(<T,>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ): Promise<T> => {
    toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
    return promise;
  }, []);

  // Dismiss
  const dismiss = useCallback((id?: string | number) => {
    toast.dismiss(id);
  }, []);

  return {
    notify,
    success,
    error,
    warning,
    info,
    promise: promiseToast,
    dismiss,
  };
};

// ============================================
// MENSAGENS PRÉ-DEFINIDAS
// ============================================

export const NOTIFICATION_MESSAGES = {
  // Despesas
  expense: {
    added: { title: 'Despesa registrada', message: 'Sua despesa foi salva com sucesso' },
    updated: { title: 'Despesa atualizada', message: 'As alterações foram salvas' },
    deleted: { title: 'Despesa removida', message: 'A despesa foi excluída' },
    error: { title: 'Erro ao salvar despesa', message: 'Tente novamente mais tarde' },
  },
  // Receitas
  income: {
    added: { title: 'Receita registrada', message: 'Sua receita foi salva com sucesso' },
    updated: { title: 'Receita atualizada', message: 'As alterações foram salvas' },
    deleted: { title: 'Receita removida', message: 'A receita foi excluída' },
    error: { title: 'Erro ao salvar receita', message: 'Tente novamente mais tarde' },
  },
  // Metas
  goal: {
    added: { title: 'Meta criada', message: 'Sua meta foi salva com sucesso' },
    updated: { title: 'Meta atualizada', message: 'As alterações foram salvas' },
    deleted: { title: 'Meta removida', message: 'A meta foi excluída' },
    completed: { title: '🎉 Meta alcançada!', message: 'Parabéns! Você atingiu sua meta' },
    error: { title: 'Erro ao salvar meta', message: 'Tente novamente mais tarde' },
  },
  // Categorias
  category: {
    added: { title: 'Categoria criada', message: 'A categoria foi salva com sucesso' },
    updated: { title: 'Categoria atualizada', message: 'As alterações foram salvas' },
    deleted: { title: 'Categoria removida', message: 'A categoria foi excluída' },
    error: { title: 'Erro ao salvar categoria', message: 'Tente novamente mais tarde' },
  },
  // Auth
  auth: {
    loginSuccess: { title: 'Bem-vindo!', message: 'Login realizado com sucesso' },
    loginError: { title: 'Erro no login', message: 'Verifique suas credenciais' },
    logoutSuccess: { title: 'Até logo!', message: 'Você foi desconectado' },
    registerSuccess: { title: 'Conta criada!', message: 'Verifique seu email para confirmar' },
    registerError: { title: 'Erro ao criar conta', message: 'Tente novamente' },
    passwordReset: { title: 'Email enviado', message: 'Verifique sua caixa de entrada' },
  },
  // Sistema
  system: {
    networkError: { title: 'Sem conexão', message: 'Verifique sua internet' },
    syncError: { title: 'Erro de sincronização', message: 'Os dados serão salvos quando reconectar' },
    syncSuccess: { title: 'Sincronizado', message: 'Seus dados estão atualizados' },
    validationError: { title: 'Dados inválidos', message: 'Verifique os campos do formulário' },
  },
} as const;

export default useNotification;
