import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingUp,
  Target, 
  CalendarDays,
  Settings,
  LogOut,
  Trash2,
  X,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useWishboard } from '@/hooks/useWishboard';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/expenses', label: 'Gastos', icon: Wallet },
  { path: '/incomes', label: 'Ganhos', icon: TrendingUp },
  { path: '/goals', label: 'Metas', icon: Target },
  { path: '/history', label: 'Histórico', icon: CalendarDays },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearAllData } = useWishboard();
  const { signOut } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem('wishboard-authenticated');
    localStorage.removeItem('wishboard-user');
    navigate('/login');
  };

  const handleResetAccount = async () => {
    setIsResetting(true);
    try {
      await clearAllData();
      setIsResetConfirmOpen(false);
      setIsSettingsOpen(false);
    } catch (error) {
      console.error('Erro ao resetar conta:', error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-50">
        <div className="flex items-center justify-around py-2 px-2 safe-area-inset-bottom">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center gap-1 py-2 px-3 min-w-[50px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBottomNav"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Icon 
                  className={cn(
                    'w-5 h-5 relative z-10 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )} 
                />
                <span 
                  className={cn(
                    'text-[10px] font-medium relative z-10 transition-colors',
                    isActive ? 'text-[hsl(270,91%,65%)]' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}

          {/* Botão de Configurações */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="relative flex flex-col items-center gap-1 py-2 px-3 min-w-[50px]"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">Config</span>
          </button>
        </div>
      </nav>

      {/* Modal de Configurações */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setIsSettingsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-[hsl(240,10%,6%)] border-t border-[hsl(240,10%,15%)] rounded-t-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 rounded-full bg-gray-600" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-4 border-b border-[hsl(240,10%,15%)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Configurações</h2>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Opções */}
              <div className="p-5 space-y-3 pb-8">
                {/* Resetar Conta */}
                <button
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 transition-colors group"
                >
                  <div className="p-2.5 rounded-xl bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                    <Trash2 className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-white">Resetar Conta</p>
                    <p className="text-sm text-gray-400">Apagar todos os dados da sua conta</p>
                  </div>
                </button>

                {/* Sair */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors group"
                >
                  <div className="p-2.5 rounded-xl bg-red-500/20 group-hover:bg-red-500/30 transition-colors">
                    <LogOut className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-white">Sair da Conta</p>
                    <p className="text-sm text-gray-400">Encerrar sua sessão atual</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Reset */}
      <AnimatePresence>
        {isResetConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => !isResetting && setIsResetConfirmOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-sm bg-[hsl(240,10%,6%)] border border-[hsl(240,10%,15%)] rounded-2xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Ícone de Alerta */}
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-red-500/20">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>

              {/* Título e Descrição */}
              <h3 className="text-xl font-bold text-white text-center mb-2">
                Resetar Conta?
              </h3>
              <p className="text-gray-400 text-sm text-center mb-6">
                Esta ação irá <span className="text-red-400 font-semibold">apagar permanentemente</span> todos os seus dados: gastos, receitas, metas e categorias. Esta ação não pode ser desfeita.
              </p>

              {/* Botões */}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsResetConfirmOpen(false)}
                  disabled={isResetting}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleResetAccount}
                  disabled={isResetting}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {isResetting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Resetar Tudo'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
