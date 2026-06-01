import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, 
  Calendar as CalendarIcon, 
  Search,
  TrendingUp,
  Trash2
} from 'lucide-react';
import { useWishboard } from '@/hooks/useWishboard';
import { formatCurrency, formatDate } from '@/lib/store';
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
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função auxiliar para converter string yyyy-MM-dd para Date local
const parseLocalDate = (dateStr: string): Date | undefined => {
  if (!dateStr) return undefined;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

interface IncomeItemProps {
  income: {
    id: string;
    amount: number;
    date: string;
    description?: string;
  };
  index: number;
  onDelete?: () => void;
}

const IncomeItem = ({ income, index, onDelete }: IncomeItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center justify-between p-4 rounded-xl bg-card/50 hover:bg-card transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-success/10">
          <TrendingUp className="w-5 h-5 text-success" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground">
            {income.description || 'Ganho'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(income.date)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-bold text-success">
          +{formatCurrency(income.amount)}
        </span>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};

const Incomes = () => {
  const { 
    incomes, 
    addIncome, 
    deleteIncome
  } = useWishboard();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
    description: '',
  });

  const [year, month] = selectedMonth.split('-').map(Number);
  
  const monthlyIncomes = useMemo(() => {
    return incomes.filter(income => {
      const date = new Date(income.date);
      return date.getFullYear() === year && date.getMonth() === month - 1;
    });
  }, [incomes, year, month]);

  const filteredIncomes = useMemo(() => {
    return monthlyIncomes
      .filter(income => {
        const matchesSearch = 
          income.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          'Ganho'.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [monthlyIncomes, searchTerm]);

  const totalIncomes = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);

  // Paginação
  const totalPages = Math.ceil(filteredIncomes.length / itemsPerPage);
  const paginatedIncomes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredIncomes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredIncomes, currentPage]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) return;

    // Criar data local sem conversão de timezone
    const [year, month, day] = formData.date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 12, 0, 0);

    addIncome({
      amount: parseFloat(formData.amount),
      date: localDate.toISOString(),
      description: formData.description,
    });

    setFormData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ganhos</h1>
          <p className="text-muted-foreground mt-1">
            Histórico de entradas de dinheiro
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-success hover:bg-success/90 text-success-foreground shadow-lg">
              <PlusCircle className="w-4 h-4" />
              Novo Ganho
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Ganho</DialogTitle>
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
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  placeholder="Ex: Salário, Freelance, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full bg-success hover:bg-success/90 text-success-foreground">
                Adicionar Ganho
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ganhos..."
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
          <p className="text-2xl font-bold text-success">{formatCurrency(totalIncomes)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Transações</p>
          <p className="text-2xl font-bold text-foreground">{filteredIncomes.length}</p>
        </div>
      </motion.div>

      {/* Incomes List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredIncomes.length > 0 ? (
            <>
              <div className="space-y-2">
                {paginatedIncomes.map((income, index) => (
                  <IncomeItem
                    key={income.id}
                    income={income}
                    index={index}
                    onDelete={() => deleteIncome(income.id)}
                  />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages} ({filteredIncomes.length} itens)
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
              <p className="text-lg">Nenhum ganho encontrado</p>
              <p className="text-sm mt-1">Adicione seu primeiro ganho clicando no botão acima</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Incomes;



