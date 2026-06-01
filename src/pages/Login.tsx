// ============================================
// PÁGINA DE LOGIN - SUPABASE AUTH
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, User, PiggyBank, TrendingUp, Target, Mail, Check, Eye, EyeOff, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification, NOTIFICATION_MESSAGES } from '@/hooks/useNotification';
import { 
  validate, 
  loginSchema, 
  registerSchema,
  ValidationError,
} from '@/lib/validators';

// ============================================
// COMPONENTE
// ============================================

const Login = () => {
  // Estados do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estados para recuperação de senha
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  
  // Hooks
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, isLoading, error: authError } = useAuth();
  const { success, error: notifyError, info } = useNotification();

  // ==========================================
  // HANDLERS
  // ==========================================

  const clearErrors = () => {
    setErrors({});
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    // Validar dados
    const validation = validate(loginSchema, { email, password });
    if (validation.success === false) {
      setErrors(validation.errors);
      return;
    }

    try {
      await signIn(email, password);
      success(
        NOTIFICATION_MESSAGES.auth.loginSuccess.title,
        NOTIFICATION_MESSAGES.auth.loginSuccess.message
      );
      navigate('/');
    } catch (err) {
      // Erro já tratado pelo AuthContext
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    // Validar dados
    const validation = validate(registerSchema, { 
      name, 
      email, 
      password, 
      confirmPassword 
    });
    
    if (validation.success === false) {
      setErrors(validation.errors);
      return;
    }

    try {
      await signUp(email, password, name);
      // Se chegou aqui sem erro, o cadastro foi bem-sucedido e login automático
      success(
        'Conta criada com sucesso!',
        'Bem-vindo ao Fin\'nally!'
      );
      navigate('/');
    } catch (err: any) {
      // Verificar se é o erro de confirmação de email
      if (err?.code === 'EMAIL_CONFIRMATION_REQUIRED') {
        info(
          '📧 Verifique seu email',
          err.message
        );
        // Limpar formulário
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
      // Outros erros já tratados pelo AuthContext
    }
  };

  const handleForgotPassword = () => {
    setRecoveryEmail(email); // Preencher com o email já digitado
    setShowForgotPassword(true);
    setRecoverySent(false);
  };

  const handleSendRecoveryEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recoveryEmail || !recoveryEmail.includes('@')) {
      notifyError('Email inválido', 'Digite um email válido');
      return;
    }

    setIsRecovering(true);
    try {
      await resetPassword(recoveryEmail);
      setRecoverySent(true);
      success(
        'Email enviado!',
        'Verifique sua caixa de entrada para redefinir sua senha'
      );
    } catch (err: any) {
      notifyError(
        'Erro ao enviar email',
        err.message || 'Tente novamente mais tarde'
      );
    } finally {
      setIsRecovering(false);
    }
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setRecoveryEmail('');
    setRecoverySent(false);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-black p-4 overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(270,60%,10%)]/20 via-transparent to-[hsl(270,60%,10%)]/20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(270,70%,15%)]/10 to-transparent pointer-events-none" />
      
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
        <motion.div
          className="absolute -top-40 right-1/4 w-[600px] h-[600px] bg-[hsl(270,70%,45%)]/8 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.06, 0.12, 0.06],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] bg-[hsl(270,75%,40%)]/7 rounded-full blur-[90px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 0.5, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md z-10"
      >
        {/* Logo and branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-4"
        >
          <motion.img
            src="/logo.png"
            alt="Fin'nally Logo"
            className="w-43 h-40 mx-auto mb-4 object-contain"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          />
          <p className="text-sm text-gray-400">
            Gestão financeira feita para você realizar seus sonhos
          </p>
        </motion.div>

        {/* Main card */}
        <motion.div
          className="backdrop-blur-xl bg-[hsl(240,10%,6%)]/90 rounded-3xl shadow-lg border border-[hsl(240,10%,15%)] p-8"
          style={{ boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.5)" }}
        >
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-[hsl(240,10%,8%)] p-1 rounded-xl">
              <TabsTrigger 
                value="login"
                className="rounded-lg data-[state=active]:bg-[hsl(240,10%,12%)] data-[state=active]:shadow-md transition-all duration-300"
              >
                <Lock className="w-4 h-4 mr-2" />
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="cadastro"
                className="rounded-lg data-[state=active]:bg-[hsl(240,10%,12%)] data-[state=active]:shadow-md transition-all duration-300"
              >
                <User className="w-4 h-4 mr-2" />
                Cadastro
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {/* LOGIN TAB */}
              <TabsContent value="login">
                <motion.form
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleLogin}
                  className="space-y-5"
                >
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[hsl(270,91%,65%)] transition-colors" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Digite seu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-12 bg-[hsl(240,10%,8%)] border-[hsl(240,10%,15%)] focus:border-[hsl(270,91%,65%)] focus:ring-2 focus:ring-[hsl(270,91%,65%)]/20 rounded-xl transition-all duration-300"
                        required
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">
                      Senha
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[hsl(270,91%,65%)] transition-colors" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 pr-12 h-12 bg-[hsl(240,10%,8%)] border-[hsl(240,10%,15%)] focus:border-[hsl(270,91%,65%)] focus:ring-2 focus:ring-[hsl(270,91%,65%)]/20 rounded-xl transition-all duration-300"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>

                  {/* Forgot Password */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-[hsl(270,91%,65%)] hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>

                  {/* Auth Error */}
                  {authError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-red-900/20 border border-red-800 text-red-400 text-sm"
                    >
                      {authError}
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
                      >
                        <PiggyBank className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </motion.form>
              </TabsContent>

              {/* CADASTRO TAB */}
              <TabsContent value="cadastro">
                <motion.form
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleRegister}
                  className="space-y-5"
                >
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-sm font-medium">
                      Nome completo
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[hsl(270,91%,65%)] transition-colors" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Digite seu nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-12 h-12 bg-[hsl(240,10%,8%)] border-[hsl(240,10%,15%)] focus:border-[hsl(270,91%,65%)] focus:ring-2 focus:ring-[hsl(270,91%,65%)]/20 rounded-xl transition-all duration-300"
                        required
                        autoComplete="name"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[hsl(270,91%,65%)] transition-colors" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Digite seu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-12 bg-[hsl(240,10%,8%)] border-[hsl(240,10%,15%)] focus:border-[hsl(270,91%,65%)] focus:ring-2 focus:ring-[hsl(270,91%,65%)]/20 rounded-xl transition-all duration-300"
                        required
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm font-medium">
                      Senha
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[hsl(270,91%,65%)] transition-colors" />
                      <Input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Crie uma senha segura"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 pr-12 h-12 bg-[hsl(240,10%,8%)] border-[hsl(240,10%,15%)] focus:border-[hsl(270,91%,65%)] focus:ring-2 focus:ring-[hsl(270,91%,65%)]/20 rounded-xl transition-all duration-300"
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                    )}
                    <p className="text-gray-500 text-xs">
                      Mínimo 8 caracteres com letras maiúsculas, minúsculas e números
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password" className="text-sm font-medium">
                      Confirmar senha
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[hsl(270,91%,65%)] transition-colors" />
                      <Input
                        id="register-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirme sua senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-12 h-12 bg-[hsl(240,10%,8%)] border-[hsl(240,10%,15%)] focus:border-[hsl(270,91%,65%)] focus:ring-2 focus:ring-[hsl(270,91%,65%)]/20 rounded-xl transition-all duration-300"
                        required
                        autoComplete="new-password"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Auth Error */}
                  {authError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-red-900/20 border border-red-800 text-red-400 text-sm"
                    >
                      {authError}
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
                      >
                        <PiggyBank className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Criar conta
                      </>
                    )}
                  </Button>
                </motion.form>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-500 mt-6"
        >
          Desenvolvido com 💜 Front-End TDE II
        </motion.p>
      </motion.div>

      {/* Modal de Recuperação de Senha */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={closeForgotPassword}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-[hsl(240,10%,6%)] rounded-3xl border border-[hsl(240,10%,15%)] p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botão Fechar */}
              <button
                onClick={closeForgotPassword}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              {!recoverySent ? (
                <>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[hsl(270,91%,65%)]/20 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-[hsl(270,91%,65%)]" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Recuperar Senha</h2>
                    <p className="text-sm text-gray-400">
                      Digite seu email para receber um link de recuperação de senha
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSendRecoveryEmail} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="recovery-email" className="text-sm font-medium">
                        Email
                      </Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[hsl(270,91%,65%)] transition-colors" />
                        <Input
                          id="recovery-email"
                          type="email"
                          placeholder="Digite seu email"
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          className="pl-12 h-12 bg-[hsl(240,10%,8%)] border-[hsl(240,10%,15%)] focus:border-[hsl(270,91%,65%)] focus:ring-2 focus:ring-[hsl(270,91%,65%)]/20 rounded-xl transition-all duration-300"
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isRecovering}
                      className="w-full h-12 bg-gradient-to-r from-[hsl(270,91%,65%)] to-[hsl(25,95%,60%)] hover:from-[hsl(270,91%,70%)] hover:to-[hsl(25,95%,65%)] text-white rounded-xl font-medium shadow-lg transition-all duration-300 disabled:opacity-50"
                    >
                      {isRecovering ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Mail className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        'Enviar link de recuperação'
                      )}
                    </Button>
                  </form>

                  {/* Voltar */}
                  <button
                    onClick={closeForgotPassword}
                    className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao login
                  </button>
                </>
              ) : (
                <>
                  {/* Sucesso */}
                  <div className="text-center py-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center"
                    >
                      <Check className="w-10 h-10 text-green-400" />
                    </motion.div>
                    <h2 className="text-xl font-bold text-white mb-2">Email Enviado!</h2>
                    <p className="text-sm text-gray-400 mb-6">
                      Verifique sua caixa de entrada em <span className="text-white font-medium">{recoveryEmail}</span> para redefinir sua senha.
                    </p>
                    <Button
                      onClick={closeForgotPassword}
                      className="w-full h-12 bg-[hsl(240,10%,12%)] hover:bg-[hsl(240,10%,15%)] text-white rounded-xl font-medium transition-all duration-300"
                    >
                      Voltar ao login
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
