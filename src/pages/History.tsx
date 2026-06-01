import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Legend,
  ComposedChart
} from 'recharts';
import { CalendarDays, TrendingUp, TrendingDown, CreditCard, Banknote, ArrowDownCircle, ArrowUpCircle, GitCompare } from 'lucide-react';
import { useWishboard } from '@/hooks/useWishboard';
import { formatCurrency, getPaymentMethodColor, getPaymentMethodLabel } from '@/lib/store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const History = () => {
  const { getYearlyExpenses, getMonthlyExpenses, getExpensesByCategory, monthlyBudget, incomes } = useWishboard();
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [evolutionView, setEvolutionView] = useState<'gastos' | 'ganhos' | 'comparativo'>('gastos');
  
  const yearlyExpenses = useMemo(() => {
    const expenses = getYearlyExpenses(parseInt(selectedYear));
    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number);
      return expenses.filter(e => {
        const date = new Date(e.date);
        return date.getFullYear() === year && date.getMonth() === month - 1;
      });
    }
    return expenses;
  }, [selectedYear, selectedMonth, getYearlyExpenses]);

  const monthlyData = useMemo(() => {
    if (selectedMonth) {
      // If a specific month is selected, show only that month
      const [year, month] = selectedMonth.split('-').map(Number);
      const monthIndex = month - 1;
      const monthExpenses = yearlyExpenses.filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === monthIndex;
      });
      const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      const balance = monthlyBudget - total;
      
      const debit = monthExpenses.filter(e => e.paymentMethod === 'debit').reduce((sum, e) => sum + e.amount, 0);
      const credit = monthExpenses.filter(e => e.paymentMethod === 'credit').reduce((sum, e) => sum + e.amount, 0);
      const cash = monthExpenses.filter(e => e.paymentMethod === 'cash').reduce((sum, e) => sum + e.amount, 0);
      
      return [{
        month: MONTHS[monthIndex],
        monthIndex,
        total,
        budget: monthlyBudget,
        balance,
        count: monthExpenses.length,
        debit,
        credit,
        cash,
        changePercent: 0,
      }];
    }
    
    // Show all months of the year
    const data = MONTHS.map((month, index) => {
      const monthExpenses = yearlyExpenses.filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === index;
      });
      const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      const balance = monthlyBudget - total;
      
      // Payment method breakdown per month
      const debit = monthExpenses.filter(e => e.paymentMethod === 'debit').reduce((sum, e) => sum + e.amount, 0);
      const credit = monthExpenses.filter(e => e.paymentMethod === 'credit').reduce((sum, e) => sum + e.amount, 0);
      const cash = monthExpenses.filter(e => e.paymentMethod === 'cash').reduce((sum, e) => sum + e.amount, 0);
      
      // Calculate percentage change from previous month
      let changePercent = 0;
      if (index > 0) {
        const prevMonthExpenses = yearlyExpenses.filter(e => {
          const date = new Date(e.date);
          return date.getMonth() === index - 1;
        });
        const prevTotal = prevMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
        if (prevTotal > 0) {
          changePercent = ((total - prevTotal) / prevTotal) * 100;
        }
      }
      
      return {
        month,
        monthIndex: index,
        total,
        budget: monthlyBudget,
        balance,
        count: monthExpenses.length,
        debit,
        credit,
        cash,
        changePercent,
      };
    });
    return data;
  }, [yearlyExpenses, monthlyBudget, selectedMonth]);

  // Dados mensais de receitas
  const monthlyIncomeData = useMemo(() => {
    const yearIncomes = incomes.filter(i => {
      const date = new Date(i.date);
      return date.getFullYear() === parseInt(selectedYear);
    });

    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number);
      const monthIndex = month - 1;
      const monthIncomes = yearIncomes.filter(i => {
        const date = new Date(i.date);
        return date.getMonth() === monthIndex;
      });
      const total = monthIncomes.reduce((sum, i) => sum + i.amount, 0);
      
      return [{
        month: MONTHS[monthIndex],
        monthIndex,
        total,
        count: monthIncomes.length,
        changePercent: 0,
      }];
    }

    return MONTHS.map((month, index) => {
      const monthIncomes = yearIncomes.filter(i => {
        const date = new Date(i.date);
        return date.getMonth() === index;
      });
      const total = monthIncomes.reduce((sum, i) => sum + i.amount, 0);
      
      let changePercent = 0;
      if (index > 0) {
        const prevMonthIncomes = yearIncomes.filter(i => {
          const date = new Date(i.date);
          return date.getMonth() === index - 1;
        });
        const prevTotal = prevMonthIncomes.reduce((sum, i) => sum + i.amount, 0);
        if (prevTotal > 0) {
          changePercent = ((total - prevTotal) / prevTotal) * 100;
        }
      }
      
      return {
        month,
        monthIndex: index,
        total,
        count: monthIncomes.length,
        changePercent,
      };
    });
  }, [incomes, selectedYear, selectedMonth]);

  // Dados combinados para comparativo
  const combinedData = useMemo(() => {
    return monthlyData.map((expense, index) => ({
      month: expense.month,
      monthIndex: expense.monthIndex,
      gastos: expense.total,
      ganhos: monthlyIncomeData[index]?.total || 0,
      saldo: (monthlyIncomeData[index]?.total || 0) - expense.total,
    }));
  }, [monthlyData, monthlyIncomeData]);

  const yearlyIncomeTotal = monthlyIncomeData.reduce((sum, m) => sum + m.total, 0);

  const yearlyTotal = yearlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const yearlyAverage = yearlyTotal / 12;
  const categoryBreakdown = getExpensesByCategory(yearlyExpenses);

  const pieData = categoryBreakdown.map((item, index) => ({
    name: item.category.name,
    value: item.total,
    color: CHART_COLORS[index % CHART_COLORS.length],
    percentage: ((item.total / yearlyTotal) * 100).toFixed(1),
  }));

  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i.toString());
    }
    return years;
  }, [currentYear]);

  // Find best and worst months
  const sortedMonths = [...monthlyData].filter(m => m.total > 0).sort((a, b) => a.total - b.total);
  const bestMonth = sortedMonths[0];
  const worstMonth = sortedMonths[sortedMonths.length - 1];

  // Payment method totals
  const totalDebit = yearlyExpenses.filter(e => e.paymentMethod === 'debit').reduce((sum, e) => sum + e.amount, 0);
  const totalCredit = yearlyExpenses.filter(e => e.paymentMethod === 'credit').reduce((sum, e) => sum + e.amount, 0);
  const totalCash = yearlyExpenses.filter(e => e.paymentMethod === 'cash').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Histórico {selectedMonth ? 'Mensal' : 'Anual'}</h1>
          <p className="text-muted-foreground mt-1">
            Análise completa dos seus gastos
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={(value) => { setSelectedYear(value); setSelectedMonth(null); }}>
            <SelectTrigger className="w-40">
              <CalendarDays className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedMonth || 'all'} onValueChange={(value) => setSelectedMonth(value === 'all' ? null : value)}>
            <SelectTrigger className="w-48">
              <CalendarDays className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Todos os meses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os meses</SelectItem>
              {MONTHS.map((month, index) => (
                <SelectItem key={index} value={`${selectedYear}-${String(index + 1).padStart(2, '0')}`}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Total Anual</p>
          <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(yearlyTotal)}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Média Mensal</p>
          <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(yearlyAverage)}</p>
        </div>
        {bestMonth && (
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="w-4 h-4 text-success" />
              Menor Gasto
            </div>
            <p className="text-2xl font-bold text-success mt-1">{MONTHS[bestMonth.monthIndex]}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(bestMonth.total)}</p>
          </div>
        )}
        {worstMonth && (
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-warning" />
              Maior Gasto
            </div>
            <p className="text-2xl font-bold text-warning mt-1">{MONTHS[worstMonth.monthIndex]}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(worstMonth.total)}</p>
          </div>
        )}
      </motion.div>

      {/* Payment Method Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
            style={{ backgroundColor: `${getPaymentMethodColor('debit')}20` }}
          >
            <CreditCard className="w-5 h-5" style={{ color: getPaymentMethodColor('debit') }} />
          </div>
          <p className="text-xs text-muted-foreground">Débito</p>
          <p className="text-lg font-bold" style={{ color: getPaymentMethodColor('debit') }}>
            {formatCurrency(totalDebit)}
          </p>
        </div>
        <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
            style={{ backgroundColor: `${getPaymentMethodColor('credit')}20` }}
          >
            <CreditCard className="w-5 h-5" style={{ color: getPaymentMethodColor('credit') }} />
          </div>
          <p className="text-xs text-muted-foreground">Crédito</p>
          <p className="text-lg font-bold" style={{ color: getPaymentMethodColor('credit') }}>
            {formatCurrency(totalCredit)}
          </p>
        </div>
        <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
            style={{ backgroundColor: `${getPaymentMethodColor('cash')}20` }}
          >
            <Banknote className="w-5 h-5" style={{ color: getPaymentMethodColor('cash') }} />
          </div>
          <p className="text-xs text-muted-foreground">Espécie</p>
          <p className="text-lg font-bold" style={{ color: getPaymentMethodColor('cash') }}>
            {formatCurrency(totalCash)}
          </p>
        </div>
      </motion.div>

      {/* Charts */}
      <Tabs defaultValue="stacked" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="stacked">Por Método</TabsTrigger>
          <TabsTrigger value="area">Evolução</TabsTrigger>
          <TabsTrigger value="pie">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="stacked">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold mb-6">Gastos por Método de Pagamento</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barCategoryGap="15%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ payload, label }) => {
                      if (payload && payload.length > 0) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card px-4 py-3 rounded-lg shadow-lg border border-border">
                            <p className="font-semibold mb-2">{label}</p>
                            <div className="space-y-1 text-sm">
                              <p style={{ color: getPaymentMethodColor('debit') }}>
                                Débito: {formatCurrency(data.debit)}
                              </p>
                              <p style={{ color: getPaymentMethodColor('credit') }}>
                                Crédito: {formatCurrency(data.credit)}
                              </p>
                              <p style={{ color: getPaymentMethodColor('cash') }}>
                                Espécie: {formatCurrency(data.cash)}
                              </p>
                              <p className="text-foreground font-medium pt-1 border-t border-border mt-2">
                                Total: {formatCurrency(data.total)}
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    formatter={(value) => {
                      const labels: Record<string, string> = { debit: 'Débito', credit: 'Crédito', cash: 'Espécie' };
                      return <span className="text-muted-foreground text-sm">{labels[value] || value}</span>;
                    }}
                  />
                  <Bar dataKey="debit" stackId="a" fill={getPaymentMethodColor('debit')} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="credit" stackId="a" fill={getPaymentMethodColor('credit')} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="cash" stackId="a" fill={getPaymentMethodColor('cash')} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="area">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            {/* Seletor de visualização */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-lg font-semibold">
                {evolutionView === 'gastos' && 'Evolução dos Gastos'}
                {evolutionView === 'ganhos' && 'Evolução dos Ganhos'}
                {evolutionView === 'comparativo' && 'Gastos vs Ganhos'}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setEvolutionView('gastos')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    evolutionView === 'gastos' 
                      ? 'bg-destructive/20 text-destructive border border-destructive/30' 
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  Gastos
                </button>
                <button
                  onClick={() => setEvolutionView('ganhos')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    evolutionView === 'ganhos' 
                      ? 'bg-success/20 text-success border border-success/30' 
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  Ganhos
                </button>
                <button
                  onClick={() => setEvolutionView('comparativo')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    evolutionView === 'comparativo' 
                      ? 'bg-primary/20 text-primary border border-primary/30' 
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <GitCompare className="w-4 h-4" />
                  Comparar
                </button>
              </div>
            </div>

            {/* Gráfico de Gastos */}
            {evolutionView === 'gastos' && (
              <>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ payload, label }) => {
                          if (payload && payload.length > 0) {
                            const data = payload[0].payload;
                            const isPositive = data.changePercent < 0;
                            return (
                              <div className="bg-card px-4 py-3 rounded-lg shadow-lg border border-border">
                                <p className="font-semibold">{label}</p>
                                <p className="text-destructive">Gasto: {formatCurrency(data.total)}</p>
                                {monthlyBudget > 0 && (
                                  <p className="text-muted-foreground">Orçamento: {formatCurrency(data.budget)}</p>
                                )}
                                {data.changePercent !== 0 && (
                                  <p className={isPositive ? 'text-success' : 'text-destructive'} style={{ marginTop: '4px' }}>
                                    {isPositive ? '↓' : '↑'} {Math.abs(data.changePercent).toFixed(1)}% vs mês anterior
                                  </p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      {monthlyBudget > 0 && (
                        <Area 
                          type="monotone"
                          dataKey="budget" 
                          stroke="hsl(var(--muted-foreground))" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          fill="url(#colorBudget)"
                        />
                      )}
                      <Area 
                        type="monotone"
                        dataKey="total" 
                        stroke="hsl(var(--destructive))" 
                        strokeWidth={3}
                        fill="url(#colorTotal)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <span className="text-muted-foreground">Gastos</span>
                  </div>
                  {monthlyBudget > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-muted-foreground" style={{ width: '12px' }} />
                      <span className="text-muted-foreground">Orçamento</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Gráfico de Ganhos */}
            {evolutionView === 'ganhos' && (
              <>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyIncomeData}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ payload, label }) => {
                          if (payload && payload.length > 0) {
                            const data = payload[0].payload;
                            const isPositive = data.changePercent > 0;
                            return (
                              <div className="bg-card px-4 py-3 rounded-lg shadow-lg border border-border">
                                <p className="font-semibold">{label}</p>
                                <p className="text-success">Ganho: {formatCurrency(data.total)}</p>
                                <p className="text-muted-foreground text-sm">{data.count} receita(s)</p>
                                {data.changePercent !== 0 && (
                                  <p className={isPositive ? 'text-success' : 'text-destructive'} style={{ marginTop: '4px' }}>
                                    {isPositive ? '↑' : '↓'} {Math.abs(data.changePercent).toFixed(1)}% vs mês anterior
                                  </p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone"
                        dataKey="total" 
                        stroke="hsl(var(--success))" 
                        strokeWidth={3}
                        fill="url(#colorIncome)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-muted-foreground">Ganhos</span>
                  </div>
                  <div className="text-muted-foreground">
                    Total no ano: <span className="text-success font-semibold">{formatCurrency(yearlyIncomeTotal)}</span>
                  </div>
                </div>
              </>
            )}

            {/* Gráfico Comparativo */}
            {evolutionView === 'comparativo' && (
              <>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={combinedData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ payload, label }) => {
                          if (payload && payload.length > 0) {
                            const data = payload[0].payload;
                            const saldoPositivo = data.saldo >= 0;
                            return (
                              <div className="bg-card px-4 py-3 rounded-lg shadow-lg border border-border">
                                <p className="font-semibold mb-2">{label}</p>
                                <p className="text-success">Ganhos: {formatCurrency(data.ganhos)}</p>
                                <p className="text-destructive">Gastos: {formatCurrency(data.gastos)}</p>
                                <p className={`font-medium pt-2 mt-2 border-t border-border ${saldoPositivo ? 'text-success' : 'text-destructive'}`}>
                                  Saldo: {saldoPositivo ? '+' : ''}{formatCurrency(data.saldo)}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="ganhos" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} opacity={0.8} />
                      <Bar dataKey="gastos" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} opacity={0.8} />
                      <Line 
                        type="monotone" 
                        dataKey="saldo" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-success" />
                    <span className="text-muted-foreground">Ganhos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-destructive" />
                    <span className="text-muted-foreground">Gastos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 rounded bg-primary" />
                    <span className="text-muted-foreground">Saldo</span>
                  </div>
                </div>
                {/* Resumo comparativo */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Total Ganhos</p>
                    <p className="text-lg font-bold text-success">{formatCurrency(yearlyIncomeTotal)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Total Gastos</p>
                    <p className="text-lg font-bold text-destructive">{formatCurrency(yearlyTotal)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Balanço Anual</p>
                    <p className={`text-lg font-bold ${yearlyIncomeTotal - yearlyTotal >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {yearlyIncomeTotal - yearlyTotal >= 0 ? '+' : ''}{formatCurrency(yearlyIncomeTotal - yearlyTotal)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="pie">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold mb-6">Distribuição por Categoria</h2>
            {pieData.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={110}
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
                              <div className="bg-card px-4 py-3 rounded-lg shadow-lg border border-border">
                                <p className="font-semibold">{data.name}</p>
                                <p className="text-primary font-medium">{formatCurrency(data.value)}</p>
                                <p className="text-muted-foreground text-sm">{data.percentage}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  <h3 className="font-medium text-muted-foreground mb-4">Ranking de Gastos</h3>
                  {categoryBreakdown.slice(0, 8).map((item, index) => (
                    <div 
                      key={item.category.id} 
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-muted-foreground w-6">
                          #{index + 1}
                        </span>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span className="font-medium">{item.category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(item.total)}</p>
                        <p className="text-xs text-muted-foreground">
                          {((item.total / yearlyTotal) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-60 flex items-center justify-center text-muted-foreground">
                <p>Nenhum dado disponível para este ano</p>
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default History;