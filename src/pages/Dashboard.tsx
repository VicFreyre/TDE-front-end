import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Target,
  PlusCircle,
  ArrowRight,
  PiggyBank,
  CreditCard,
  Banknote,
  Calendar,
  Eye,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { useWishboard } from '@/hooks/useWishboard';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, getPaymentMethodLabel, getPaymentMethodColor } from '@/lib/store';
import { StatCard } from '@/components/shared/StatCard';
import { GoalCard } from '@/components/shared/GoalCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const CHART_COLORS = [
  'hsl(174, 72%, 50%)',
  'hsl(38, 92%, 55%)',
  'hsl(262, 83%, 58%)',
  'hsl(142, 72%, 45%)',
  'hsl(350, 80%, 55%)',
  'hsl(211, 96%, 48%)',
  'hsl(45, 93%, 47%)',
  'hsl(320, 70%, 55%)',
];

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    expenses, 
    goals, 
    categories,
    monthlyBudget,
    currentBalance,
    getMonthlyExpenses,
    getExpensesByCategory,
    getExpensesByPaymentMethod,
    getCategoryById,
    addIncome
  } = useWishboard();

  // Extrair primeiro nome do usuário
  const firstName = user?.name ? user.name.split(' ')[0] : '';

  const [isAddBalanceOpen, setIsAddBalanceOpen] = useState(false);
  const [isBalanceDetailsOpen, setIsBalanceDetailsOpen] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeDescription, setIncomeDescription] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [year, month] = selectedMonth.split('-').map(Number);
  const currentMonth = month - 1;
  const currentYear = year;

  const monthlyExpenses = useMemo(() => 
    getMonthlyExpenses(currentYear, currentMonth),
    [currentYear, currentMonth, getMonthlyExpenses]
  );

  const lastMonthExpenses = useMemo(() => {
    // Calcular mês e ano anterior corretamente
    let lastMonth = currentMonth - 1;
    let lastYear = currentYear;
    
    if (lastMonth < 0) {
      lastMonth = 11; // Dezembro
      lastYear = currentYear - 1;
    }
    
    return getMonthlyExpenses(lastYear, lastMonth);
  }, [currentYear, currentMonth, getMonthlyExpenses]);

  const totalThisMonth = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalLastMonth = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthlyChange = totalLastMonth > 0 
    ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 
    : 0;

  // Calcular saldo investido em metas
  const totalInvestedInGoals = useMemo(() => 
    goals.reduce((sum, g) => sum + g.savedAmount, 0),
    [goals]
  );

  // Saldo disponível (saldo atual - investido em metas)
  const availableBalance = currentBalance - totalInvestedInGoals;

  const categoryBreakdown = useMemo(() => 
    getExpensesByCategory(monthlyExpenses),
    [monthlyExpenses, getExpensesByCategory]
  );

  const paymentBreakdown = useMemo(() => 
    getExpensesByPaymentMethod(monthlyExpenses),
    [monthlyExpenses, getExpensesByPaymentMethod]
  );

  const pieData = categoryBreakdown.map((item, index) => ({
    name: item.category.name,
    value: item.total,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const paymentMethodData = [
    { name: 'Débito', value: paymentBreakdown.debit || 0, color: getPaymentMethodColor('debit') },
    { name: 'Crédito', value: paymentBreakdown.credit || 0, color: getPaymentMethodColor('credit') },
    { name: 'Espécie', value: paymentBreakdown.cash || 0, color: getPaymentMethodColor('cash') },
  ];

  const topGoals = goals.slice(0, 2);

  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      });
    }
    return options;
  }, []);

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeAmount) return;
    
    addIncome({
      amount: parseFloat(incomeAmount),
      date: new Date().toISOString(),
      description: incomeDescription || 'Depósito',
    });
    
    setIncomeAmount('');
    setIncomeDescription('');
    setIsAddBalanceOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {firstName ? (
              <>
                Olá, <motion.span
                  className="bg-gradient-to-r from-[hsl(270,91%,65%)] to-[hsl(25,95%,60%)] bg-clip-text text-transparent"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {firstName}
                </motion.span>!
              </>
            ) : 'Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral dos seus gastos
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-48">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
          <Dialog open={isAddBalanceOpen} onOpenChange={setIsAddBalanceOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-success/50 text-success hover:bg-success/10 hover:text-success">
                <PiggyBank className="w-4 h-4" />
                Adicionar Saldo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Saldo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddIncome} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="income-amount">Valor</Label>
                  <Input
                    id="income-amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(e.target.value)}
                    required
                    className="text-lg font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="income-description">Descrição (opcional)</Label>
                  <Input
                    id="income-description"
                    placeholder="Ex: Salário, Freelance, etc."
                    value={incomeDescription}
                    onChange={(e) => setIncomeDescription(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full bg-success hover:bg-success/90 text-success-foreground">
                  Adicionar Saldo
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog de Detalhes do Saldo */}
          <Dialog open={isBalanceDetailsOpen} onOpenChange={setIsBalanceDetailsOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  Detalhes do Saldo
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Saldo Total */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-success/20">
                        <Wallet className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Saldo Total</p>
                        <p className="text-2xl font-bold text-success">{formatCurrency(currentBalance)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divisão do Saldo */}
                <div className="space-y-3">
                  {/* Saldo Disponível */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Banknote className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Saldo Disponível</p>
                        <p className="text-xs text-muted-foreground">Livre para uso</p>
                      </div>
                    </div>
                    <p className={`text-lg font-semibold ${availableBalance >= 0 ? 'text-primary' : 'text-warning'}`}>
                      {formatCurrency(availableBalance)}
                    </p>
                  </div>

                  {/* Saldo em Metas */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary/10">
                        <Target className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Investido em Metas</p>
                        <p className="text-xs text-muted-foreground">{goals.length} meta{goals.length !== 1 ? 's' : ''} ativa{goals.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-secondary">
                      {formatCurrency(totalInvestedInGoals)}
                    </p>
                  </div>
                </div>

                {/* Lista de Metas com valores */}
                {goals.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Distribuição por Meta</p>
                    <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                      {goals.map((goal) => (
                        <div key={goal.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                          <span className="text-muted-foreground truncate max-w-[60%]">{goal.name}</span>
                          <span className="font-medium">{formatCurrency(goal.savedAmount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Barra de proporção */}
                {currentBalance > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Disponível ({((availableBalance / currentBalance) * 100).toFixed(0)}%)</span>
                      <span>Em Metas ({((totalInvestedInGoals / currentBalance) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                      <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${Math.max(0, (availableBalance / currentBalance) * 100)}%` }}
                      />
                      <div 
                        className="h-full bg-secondary transition-all duration-500" 
                        style={{ width: `${(totalInvestedInGoals / currentBalance) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

            <Link to="/expenses">
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                <PlusCircle className="w-4 h-4" />
                Novo Gasto
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card de Saldo Atual - Clicável */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0 }}
          className="stat-card cursor-pointer hover:scale-[1.02] transition-transform relative group"
          onClick={() => setIsBalanceDetailsOpen(true)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-2.5 rounded-xl ${currentBalance >= 0 ? 'bg-success/10' : 'bg-warning/10'}`}>
              <Wallet className={`w-5 h-5 ${currentBalance >= 0 ? 'text-success' : 'text-warning'}`} />
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="w-3.5 h-3.5" />
              <span>Ver </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Saldo Atual</p>
          <p className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-success' : 'text-warning'}`}>
            {formatCurrency(currentBalance)}
          </p>
          {totalInvestedInGoals > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(totalInvestedInGoals)} em metas
            </p>
          )}
        </motion.div>

        <StatCard
          title="Gasto Este Mês"
          value={formatCurrency(totalThisMonth)}
          icon={TrendingDown}
          trend={{ 
            value: Math.abs(monthlyChange), 
            isPositive: monthlyChange < 0 
          }}
          variant="primary"
          delay={0.1}
        />
        <StatCard
          title="Mês Anterior"
          value={formatCurrency(totalLastMonth)}
          icon={TrendingUp}
          variant="default"
          delay={0.2}
        />
        <StatCard
          title="Metas Ativas"
          value={goals.length.toString()}
          subtitle={`${goals.filter(g => (g.savedAmount / g.targetAmount) >= 1).length} concluídas`}
          icon={Target}
          variant="secondary"
          delay={0.3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart - Categories */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Gastos por Categoria</h2>
          {pieData.length > 0 ? (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ payload }) => {
                        if (payload && payload.length > 0) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-card px-3 py-2 rounded-lg shadow-lg border border-border">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-primary font-semibold">{formatCurrency(data.value)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryBreakdown.slice(0, 4).map((item, index) => (
                  <div key={item.category.id} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: CHART_COLORS[index] }}
                    />
                    <span className="text-muted-foreground truncate">{item.category.name}</span>
                    <span className="font-medium ml-auto">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-52 flex items-center justify-center text-muted-foreground">
              <p>Nenhum gasto registrado</p>
            </div>
          )}
        </motion.div>

        {/* Bar Chart - Payment Methods */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Gastos por Método</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentMethodData} layout="vertical" barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  content={({ payload, label }) => {
                    if (payload && payload.length > 0) {
                      return (
                        <div className="bg-card px-3 py-2 rounded-lg shadow-lg border border-border">
                          <p className="font-medium">{label}</p>
                          <p className="text-primary font-semibold">{formatCurrency(payload[0].value as number)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 6, 6, 0]}
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            {paymentMethodData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Goals */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Suas Metas</h2>
          <Link 
            to="/goals"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {topGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topGoals.map((goal, index) => (
              <GoalCard key={goal.id} goal={goal} index={index} />
            ))}
          </div>
        ) : (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
            <Target className="w-12 h-12 mb-3 opacity-50" />
            <p>Nenhuma meta criada ainda</p>
            <Link to="/goals">
              <Button variant="link" className="mt-2 text-primary">
                Criar primeira meta
              </Button>
            </Link>
          </div>
        )}
      </motion.div>

    </div>
  );
};

export default Dashboard;