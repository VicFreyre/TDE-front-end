import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Target,
  Tags,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Github,
  Linkedin,
  LogOut,
  FileSpreadsheet,
  Settings,
  Trash2,
  X,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useWishboard } from '@/hooks/useWishboard';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/incomes', label: 'Ganhos', icon: TrendingUp },
  { path: '/expenses', label: 'Gastos', icon: Wallet },
  { path: '/goals', label: 'Metas', icon: Target },
  { path: '/categories', label: 'Categorias', icon: Tags },
  { path: '/history', label: 'Histórico', icon: CalendarDays },
  { path: '/import-export', label: 'Importar/Exportar', icon: FileSpreadsheet },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
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
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden lg:flex flex-col min-h-screen bg-sidebar border-r border-sidebar-border p-4 relative"
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-card border border-border shadow-lg hover:bg-muted z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </Button>

      {/* Logo */}
      <div
        className={cn(
          'flex items-center justify-center px-4 py-3 mb-2',
          isCollapsed && 'px-2'
        )}
      >
        <img
          src="/logo.png"
          alt="Fin'nally Logo"
          className={cn(
            'object-contain transition-transform duration-300 drop-shadow-lg',
            isCollapsed
              ? 'w-10 h-10 scale-[1.3]'
              : 'w-16 h-16 scale-[1.75]'
          )}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'nav-item relative',
                isActive && 'active',
                isCollapsed && 'justify-center px-2'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-gradient-to-r from-[hsl(270,91%,65%)]/10 to-[hsl(25,95%,60%)]/10 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}

              <Icon
                className="w-5 h-5 relative z-10 shrink-0"
                style={isActive ? { color: 'hsl(270, 91%, 65%)' } : {}}
              />

              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="relative z-10 font-medium whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 pt-2 pb-4 space-y-3"
        >
          <Button
            variant="ghost"
            onClick={() => setIsSettingsOpen(true)}
            className="w-full -mt-1 justify-start text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors border-b border-sidebar-border pb-3"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>

          <p className="text-xs text-muted-foreground">
            Front-End{' '}
            <span className="text-pink-500 font-semibold">
              TDE II
            </span>
          </p>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/VicFreyre/TDE-front-end"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:text-pink-400 transition-colors"
              title="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>

         
          </div>
        </motion.div>
      )}

      {/* Modal de Configurações */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setIsSettingsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-[hsl(240,10%,6%)] border border-[hsl(240,10%,15%)] rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[hsl(240,10%,15%)]">
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
              <div className="p-5 space-y-3">
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
    </motion.aside>
  );
};
