import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, 
  Target,
  Trash2,
  Edit3,
  Plus,
  Minus,
  CalendarIcon
} from 'lucide-react';
import { useWishboard } from '@/hooks/useWishboard';
import { formatCurrency } from '@/lib/store';
import { GoalCard } from '@/components/shared/GoalCard';
import { CategoryIcon, iconOptions, iconNamesInPortuguese } from '@/components/shared/CategoryIcon';
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
  DialogFooter,
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
import { Goal } from '@/lib/store';

// Função auxiliar para converter string yyyy-MM-dd para Date local
const parseLocalDate = (dateStr: string): Date | undefined => {
  if (!dateStr) return undefined;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const colorOptions = [
  { value: 'category-food', label: 'Laranja' },
  { value: 'category-coral', label: 'Coral' },
  { value: 'category-peach', label: 'Pêssego' },
  { value: 'category-amber', label: 'Âmbar' },
  { value: 'category-education', label: 'Dourado' },
  { value: 'category-lime', label: 'Verde-Limão' },
  { value: 'category-housing', label: 'Verde' },
  { value: 'category-emerald', label: 'Esmeralda' },
  { value: 'category-mint', label: 'Menta' },
  { value: 'category-teal', label: 'Verde-água' },
  { value: 'category-cyan', label: 'Ciano Claro' },
  { value: 'category-bills', label: 'Turquesa' },
  { value: 'category-sky', label: 'Azul Céu' },
  { value: 'category-transport', label: 'Azul' },
  { value: 'category-indigo', label: 'Índigo' },
  { value: 'category-navy', label: 'Azul Marinho' },
  { value: 'category-leisure', label: 'Roxo' },
  { value: 'category-violet', label: 'Violeta' },
  { value: 'category-lavender', label: 'Lavanda' },
  { value: 'category-fuchsia', label: 'Fúcsia' },
  { value: 'category-shopping', label: 'Rosa' },
  { value: 'category-rose', label: 'Rosa Claro' },
  { value: 'category-health', label: 'Vermelho' },
  { value: 'category-olive', label: 'Oliva' },
];

const Goals = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useWishboard();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Target',
    targetAmount: '',
    savedAmount: '',
    deadline: '',
    color: 'category-transport',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      icon: 'Target',
      targetAmount: '',
      savedAmount: '',
      deadline: '',
      color: 'category-transport',
    });
  };
  const handleOpenEditDialog = (goal: Goal) => {
    setFormData({
      name: goal.name,
      icon: goal.icon,
      targetAmount: goal.targetAmount.toString(),
      savedAmount: goal.savedAmount.toString(),
      deadline: goal.deadline || '',
      color: goal.color,
    });
    setSelectedGoal(goal);
    setIsDetailDialogOpen(false);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !formData.name || !formData.targetAmount) return;

    updateGoal(selectedGoal.id, {
      name: formData.name,
      icon: formData.icon,
      targetAmount: parseFloat(formData.targetAmount),
      savedAmount: parseFloat(formData.savedAmount) || 0,
      deadline: formData.deadline || undefined,
      color: formData.color,
    });

    resetForm();
    setIsEditDialogOpen(false);
    setSelectedGoal(null);
  };
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount) return;

    addGoal({
      name: formData.name,
      icon: formData.icon,
      targetAmount: parseFloat(formData.targetAmount),
      savedAmount: parseFloat(formData.savedAmount) || 0,
      deadline: formData.deadline || undefined,
      color: formData.color,
    });

    resetForm();
    setIsCreateDialogOpen(false);
  };

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDetailDialogOpen(true);
  };

  const handleDeposit = (isDeposit: boolean) => {
    if (!selectedGoal || !depositAmount) return;
    
    const amount = parseFloat(depositAmount);
    const newSavedAmount = isDeposit 
      ? selectedGoal.savedAmount + amount
      : Math.max(0, selectedGoal.savedAmount - amount);

    updateGoal(selectedGoal.id, { savedAmount: newSavedAmount });
    setSelectedGoal({ ...selectedGoal, savedAmount: newSavedAmount });
    setDepositAmount('');
  };

  const handleDeleteGoal = () => {
    if (!selectedGoal) return;
    deleteGoal(selectedGoal.id);
    setIsDetailDialogOpen(false);
    setSelectedGoal(null);
  };

  const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const completedGoals = goals.filter(g => g.savedAmount >= g.targetAmount).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Metas</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe seus objetivos financeiros
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="w-4 h-4" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Nova Meta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Meta</Label>
                <Input
                  id="name"
                  placeholder="Ex: Viagem para Europa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ícone</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <CategoryIcon iconName={formData.icon} color={formData.color} size="sm" />
                          <span>{iconNamesInPortuguese[formData.icon] || formData.icon}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          <div className="flex items-center gap-2">
                            <CategoryIcon iconName={icon} color={formData.color} size="sm" />
                            {iconNamesInPortuguese[icon] || icon}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => setFormData({ ...formData, color: value })}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: `hsl(var(--${formData.color}))` }}
                          />
                          {colorOptions.find(c => c.value === formData.color)?.label}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: `hsl(var(--${color.value}))` }}
                            />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Valor da Meta</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="savedAmount">Valor Inicial (opcional)</Label>
                <Input
                  id="savedAmount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.savedAmount}
                  onChange={(e) => setFormData({ ...formData, savedAmount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Prazo (opcional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.deadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.deadline ? format(parseLocalDate(formData.deadline)!, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={parseLocalDate(formData.deadline)}
                      onSelect={(date) => setFormData({ ...formData, deadline: date ? format(date, 'yyyy-MM-dd') : '' })}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Criar Meta
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Summary */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="glass-card p-5 text-center">
          <p className="text-sm text-muted-foreground">Total Economizado</p>
          <p className="text-2xl font-bold gradient-text-primary mt-1">{formatCurrency(totalSaved)}</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-sm text-muted-foreground">Meta Total</p>
          <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalTarget)}</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-sm text-muted-foreground">Metas Concluídas</p>
          <p className="text-2xl font-bold gradient-text-secondary mt-1">{completedGoals}/{goals.length}</p>
        </div>
      </motion.div>

      {/* Goals Grid */}
      <AnimatePresence mode="popLayout">
        {goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal, index) => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                index={index}
                onClick={() => handleGoalClick(goal)}
              />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card py-16 text-center"
          >
            <Target className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-lg text-muted-foreground">Nenhuma meta criada ainda</p>
            <p className="text-sm text-muted-foreground mt-1">
              Comece a planejar seus sonhos!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedGoal && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-${selectedGoal.color}/10`}>
                    <CategoryIcon 
                      iconName={selectedGoal.icon} 
                      color={selectedGoal.color}
                      size="lg"
                    />
                  </div>
                  {selectedGoal.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Economizado</p>
                  <p className="text-3xl font-bold gradient-text-primary">
                    {formatCurrency(selectedGoal.savedAmount)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    de {formatCurrency(selectedGoal.targetAmount)}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Depositar / Retirar</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Valor"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeposit(true)}
                      disabled={!depositAmount}
                      className="shrink-0 border-success text-success hover:bg-success/10"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeposit(false)}
                      disabled={!depositAmount}
                      className="shrink-0 border-destructive text-destructive hover:bg-destructive/10"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={handleDeleteGoal}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Meta
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOpenEditDialog(selectedGoal)}
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          resetForm();
          setSelectedGoal(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Meta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome da Meta</Label>
              <Input
                id="edit-name"
                placeholder="Ex: Viagem para Europa"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ícone</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <CategoryIcon iconName={formData.icon} color={formData.color} size="sm" />
                        <span>{iconNamesInPortuguese[formData.icon] || formData.icon}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center gap-2">
                          <CategoryIcon iconName={icon} color={formData.color} size="sm" />
                          {iconNamesInPortuguese[icon] || icon}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData({ ...formData, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: `hsl(var(--${formData.color}))` }}
                        />
                        {colorOptions.find(c => c.value === formData.color)?.label}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: `hsl(var(--${color.value}))` }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-targetAmount">Valor da Meta</Label>
              <Input
                id="edit-targetAmount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-savedAmount">Valor Já Economizado</Label>
              <Input
                id="edit-savedAmount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.savedAmount}
                onChange={(e) => setFormData({ ...formData, savedAmount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-deadline">Prazo (opcional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.deadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.deadline ? format(parseLocalDate(formData.deadline)!, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={parseLocalDate(formData.deadline)}
                    onSelect={(date) => setFormData({ ...formData, deadline: date ? format(date, 'yyyy-MM-dd') : '' })}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Salvar Alterações
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Goals;
