// ============================================
// COMPONENTES DE FEEDBACK VISUAL
// ============================================

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// ============================================
// LOADING SKELETON PARA CARDS
// ============================================

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`rounded-xl bg-[hsl(240,10%,8%)] border border-[hsl(240,10%,15%)] p-6 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-5 w-24 bg-gray-800" />
      <Skeleton className="h-10 w-10 rounded-full bg-gray-800" />
    </div>
    <Skeleton className="h-8 w-32 bg-gray-800 mb-2" />
    <Skeleton className="h-4 w-20 bg-gray-800" />
  </div>
);

// ============================================
// LOADING SKELETON PARA LISTA
// ============================================

export const ListItemSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-[hsl(240,10%,8%)] border border-[hsl(240,10%,15%)]">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full bg-gray-800" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 bg-gray-800" />
        <Skeleton className="h-3 w-20 bg-gray-800" />
      </div>
    </div>
    <Skeleton className="h-5 w-24 bg-gray-800" />
  </div>
);

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <ListItemSkeleton key={i} />
    ))}
  </div>
);

// ============================================
// LOADING SKELETON PARA GRÁFICOS
// ============================================

export const ChartSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`rounded-xl bg-[hsl(240,10%,8%)] border border-[hsl(240,10%,15%)] p-6 ${className}`}>
    <Skeleton className="h-5 w-32 bg-gray-800 mb-4" />
    <div className="flex items-end justify-center gap-2 h-40">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="w-8 bg-gray-800" 
          style={{ height: `${Math.random() * 80 + 20}%` }}
        />
      ))}
    </div>
  </div>
);

// ============================================
// ESTADO DE ERRO
// ============================================

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Algo deu errado',
  message = 'Não foi possível carregar os dados',
  onRetry,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center p-8 text-center"
  >
    <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center mb-4">
      <AlertTriangle className="w-8 h-8 text-red-400" />
    </div>
    <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm mb-4 max-w-sm">{message}</p>
    {onRetry && (
      <Button
        variant="outline"
        onClick={onRetry}
        className="gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Tentar novamente
      </Button>
    )}
  </motion.div>
);

// ============================================
// ESTADO OFFLINE
// ============================================

export const OfflineState: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="fixed top-0 left-0 right-0 z-50 bg-yellow-900/90 backdrop-blur-sm py-2 px-4"
  >
    <div className="flex items-center justify-center gap-2 text-yellow-200 text-sm">
      <WifiOff className="w-4 h-4" />
      <span>Você está offline. Algumas funcionalidades podem estar indisponíveis.</span>
    </div>
  </motion.div>
);

// ============================================
// ESTADO VAZIO
// ============================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center p-8 text-center"
  >
    {icon && (
      <div className="w-16 h-16 rounded-full bg-[hsl(240,10%,12%)] flex items-center justify-center mb-4 text-gray-400">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
    {description && (
      <p className="text-gray-400 text-sm mb-4 max-w-sm">{description}</p>
    )}
    {action && (
      <Button onClick={action.onClick} className="gap-2">
        {action.label}
      </Button>
    )}
  </motion.div>
);

// ============================================
// LOADING SPINNER INLINE
// ============================================

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`animate-spin rounded-full border-t-2 border-b-2 border-purple-500 ${sizeClasses[size]}`} />
  );
};

// ============================================
// CONFIRMAÇÃO DE AÇÃO DESTRUTIVA
// ============================================

interface ConfirmDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar exclusão',
  description = 'Esta ação não pode ser desfeita. Tem certeza que deseja continuar?',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[hsl(240,10%,8%)] border border-[hsl(240,10%,15%)] rounded-2xl p-6 max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-900/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-white">{title}</h3>
        </div>
        <p className="text-gray-400 text-sm mb-6">{description}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Excluir'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default {
  CardSkeleton,
  ListItemSkeleton,
  ListSkeleton,
  ChartSkeleton,
  ErrorState,
  OfflineState,
  EmptyState,
  LoadingSpinner,
  ConfirmDelete,
};
