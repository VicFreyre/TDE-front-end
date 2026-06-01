import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, 
  Calendar as CalendarIcon, 
  Filter,
  Search,
  CreditCard,
  Banknote,
  Wallet
} from 'lucide-react';
import { useWishboard } from '@/hooks/useWishboard';
import { formatCurrency, PaymentMethod, getPaymentMethodLabel, getPaymentMethodColor } from '@/lib/store';
import { ExpenseItem } from '@/components/shared/ExpenseItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função auxiliar para converter string yyyy-MM-dd para Date local
const parseLocalDate = (dateStr: string): Date | undefined => {
  if (!dateStr) return undefined;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const Expenses = () => {
  const { 
    expenses, 
    categories, 
    addExpense, 
    deleteExpense,
    getCategoryById,
    getMonthlyExpenses,
    getExpensesByPaymentMethod
  } = useWishboard();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    description: '',
    paymentMethod: 'debit' as PaymentMethod,
  });

  const [year, month] = selectedMonth.split('-').map(Number);
  
  const monthlyExpenses = useMemo(() => {
    return getMonthlyExpenses(year, month - 1);
  }, [year, month, getMonthlyExpenses]);

  const filteredExpenses = useMemo(() => {
    return monthlyExpenses
      .filter(expense => {
        const category = getCategoryById(expense.categoryId);
        const matchesSearch = 
          expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || expense.categoryId === filterCategory;
        const matchesPayment = filterPayment === 'all' || expense.paymentMethod === filterPayment;
        return matchesSearch && matchesCategory && matchesPayment;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [monthlyExpenses, searchTerm, filterCategory, filterPayment, getCategoryById]);

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const paymentBreakdown = getExpensesByPaymentMethod(monthlyExpenses);

  // Paginação
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredExpenses, currentPage]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterPayment, selectedMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.categoryId) return;

    // Criar data local sem conversão de timezone
    const [year, month, day] = formData.date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 12, 0, 0);

    addExpense({
      amount: parseFloat(formData.amount),
      date: localDate.toISOString(),
      categoryId: formData.categoryId,
      description: formData.description,
      paymentMethod: formData.paymentMethod,
    });

    setFormData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      categoryId: '',
      description: '',
      paymentMethod: 'debit',
    });
    setIsDialogOpen(false);
  };

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

  const paymentMethods: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { value: 'debit', label: 'Débito', icon: <CreditCard className="w-4 h-4" /> },
    { value: 'credit', label: 'Crédito', icon: <CreditCard className="w-4 h-4" /> },
    { value: 'cash', label: 'Espécie', icon: <Banknote className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gastos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas despesas mensais
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
              <PlusCircle className="w-4 h-4" />
              Novo Gasto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Gasto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  className="text-lg font-semibold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(parseLocalDate(formData.date)!, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={parseLocalDate(formData.date)}
                      onSelect={(date) => setFormData({ ...formData, date: date ? format(date, 'yyyy-MM-dd') : '' })}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <CategoryIcon iconName={cat.icon} color={cat.color} size="sm" />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Método de Pagamento</Label>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: method.value })}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                        formData.paymentMethod === method.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-muted-foreground/50 text-muted-foreground'
                      }`}
                    >
                      {method.icon}
                      <span className="text-xs font-medium">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  placeholder="Ex: Almoço com amigos"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Adicionar Gasto
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Payment Method Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        {paymentMethods.map((method) => (
          <div 
            key={method.value}
            className="glass-card p-4 flex flex-col items-center justify-center text-center"
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
              style={{ backgroundColor: `${getPaymentMethodColor(method.value)}20` }}
            >
              <div style={{ color: getPaymentMethodColor(method.value) }}>
                {method.icon}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{method.label}</p>
            <p className="text-lg font-bold" style={{ color: getPaymentMethodColor(method.value) }}>
              {formatCurrency(paymentBreakdown[method.value] || 0)}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-4"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar gastos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-48">
                <CalendarIcon className="w-4 h-4 mr-2" />
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
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <CategoryIcon iconName={cat.icon} color={cat.color} size="sm" />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPayment} onValueChange={setFilterPayment}>
              <SelectTrigger className="w-full sm:w-48">
                <Wallet className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos métodos</SelectItem>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <div className="flex items-center gap-2">
                      {method.icon}
                      {method.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-5 flex items-center justify-between"
      >
        <div>
          <p className="text-sm text-muted-foreground">Total do período</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Transações</p>
          <p className="text-2xl font-bold text-foreground">{filteredExpenses.length}</p>
        </div>
      </motion.div>

      {/* Expenses List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredExpenses.length > 0 ? (
            <>
              <div className="space-y-2">
                {paginatedExpenses.map((expense, index) => (
                  <ExpenseItem
                    key={expense.id}
                    expense={expense}
                    category={getCategoryById(expense.categoryId)}
                    index={index}
                    onDelete={() => deleteExpense(expense.id)}
                    showPaymentMethod
                  />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages} ({filteredExpenses.length} itens)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center text-muted-foreground"
            >
              <p className="text-lg">Nenhum gasto encontrado</p>
              <p className="text-sm mt-1">Adicione seu primeiro gasto clicando no botão acima</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Expenses;