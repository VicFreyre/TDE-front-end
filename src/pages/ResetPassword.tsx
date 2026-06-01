// ============================================
// PÁGINA DE REDEFINIÇÃO DE SENHA
// ============================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useNotification } from '@/hooks/useNotification';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();

  // Verificar se há uma sessão válida de recuperação
  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) {
        setError('Supabase não configurado');
        setIsCheckingSession(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setIsValidSession(true);
        } else {
          // Tentar recuperar do hash da URL (para links de email)
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (!error) {
              setIsValidSession(true);
              // Limpar hash da URL
              window.history.replaceState(null, '', window.location.pathname);
            } else {
              setError('Link de recuperação inválido ou expirado');
            }
          } else {
            setError('Link de recuperação inválido ou expirado');
          }
        }
      } catch (err) {
        setError('Erro ao verificar sessão');
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (!supabase) {
      setError('Supabase não configurado');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setIsSuccess(true);
      success('Senha alterada!', 'Sua senha foi redefinida com sucesso');
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha');
      notifyError('Erro', err.message || 'Não foi possível redefinir a senha');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="text-gray-400 text-sm">Verificando link...</p>
        </div>
      </div>
    );
  }

  // Error state - link inválido
  if (!isValidSession && !isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Link Inválido</h1>
          <p className="text-gray-400 mb-6">
            {error || 'Este link de recuperação é inválido ou expirou. Solicite um novo link de recuperação.'}
          </p>
          <Button
            onClick={() => navigate('/login')}
            className="w-full h-12 bg-gradient-to-r from-[hsl(270,91%,65%)] to-[hsl(25,95%,60%)] hover:from-[hsl(270,91%,70%)] hover:to-[hsl(25,95%,65%)] text-white rounded-xl font-medium"
          >
            Voltar ao Login
          </Button>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
          >
            <Check className="w-10 h-10 text-green-400" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">Senha Redefinida!</h1>
          <p className="text-gray-400 mb-6">
            Sua senha foi alterada com sucesso. Você será redirecionado para o login...
          </p>
          <Button
            onClick={() => navigate('/login')}
            className="w-full h-12 bg-[hsl(240,10%,12%)] hover:bg-[hsl(240,10%,15%)] text-white rounded-xl font-medium"
          >
            Ir para Login
          </Button>
        </motion.div>
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-black p-4 overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(270,60%,10%)]/20 via-transparent to-[hsl(270,60%,10%)]/20 pointer-events-none" />
      
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[hsl(270,80%,50%)]/10 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.08, 0.15, 0.08],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md z-10"
      >
        {/* Logo */}
        <motion.div className="text-center mb-8">
          <motion.img
            src="/logo.png"
            alt="Fin'nally Logo"
            className="w-32 h-32 mx-auto mb-4 object-contain"
          />
        </motion.div>

        {/* Card */}
        <motion.div
          className="backdrop-blur-xl bg-[hsl(240,10%,6%)]/90 rounded-3xl shadow-lg border border-[hsl(240,10%,15%)] p-8"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[hsl(270,91%,65%)]/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-[hsl(270,91%,65%)]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Nova Senha</h1>
            <p className="text-sm text-gray-400">
              Digite sua nova senha abaixo
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Nova Senha
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[hsl(270,91%,65%)] transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 bg-[hsl(240,10%,8%)] border-[hsl(240,10%,15%)] focus:border-[hsl(270,91%,65%)] focus:ring-2 focus:ring-[hsl(270,91%,65%)]/20 rounded-xl transition-all duration-300"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Senha
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[hsl(270,91%,65%)] transition-colors" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirme sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-12 h-12 bg-[hsl(240,10%,8%)] border-[hsl(240,10%,15%)] focus:border-[hsl(270,91%,65%)] focus:ring-2 focus:ring-[hsl(270,91%,65%)]/20 rounded-xl transition-all duration-300"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-900/20 border border-red-800 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-[hsl(270,91%,65%)] to-[hsl(25,95%,60%)] hover:from-[hsl(270,91%,70%)] hover:to-[hsl(25,95%,65%)] text-white rounded-xl font-medium shadow-lg shadow-[hsl(270,91%,65%)]/40 transition-all duration-300 hover:shadow-xl hover:shadow-[hsl(270,91%,65%)]/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                'Redefinir Senha'
              )}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
