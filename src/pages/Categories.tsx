import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, 
  Trash2,
  Edit3,
  Tags
} from 'lucide-react';
import { useWishboard } from '@/hooks/useWishboard';
import { Category } from '@/lib/store';
import { CategoryIcon, iconOptions, iconNamesInPortuguese } from '@/components/shared/CategoryIcon';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

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

const Categories = () => {
  const { categories, addCategory, updateCategory, deleteCategory, expenses } = useWishboard();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Receipt',
    color: 'category-food',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      icon: 'Receipt',
      color: 'category-food',
    });
    setEditingCategory(null);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
    } else {
      addCategory(formData);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    // Check if category has expenses
    const hasExpenses = expenses.some(e => e.categoryId === id);
    if (hasExpenses) {
      alert('Esta categoria possui gastos associados e não pode ser excluída.');
      return;
    }
    deleteCategory(id);
  };

  const getCategoryExpenseCount = (categoryId: string) => {
    return expenses.filter(e => e.categoryId === categoryId).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categorias</h1>
          <p className="text-muted-foreground mt-1">
            Organize seus gastos por categoria
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="w-4 h-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Ex: Alimentação"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
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
                  <SelectContent>
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

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Categories Grid */}
      <AnimatePresence mode="popLayout">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category, index) => {
              const expenseCount = getCategoryExpenseCount(category.id);
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-5 group hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div 
                      className="p-3 rounded-xl transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `hsl(var(--${category.color}) / 0.1)` }}
                    >
                      <CategoryIcon 
                        iconName={category.icon} 
                        color={category.color}
                        size="lg"
                      />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(category)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        disabled={expenseCount > 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-foreground mt-4">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {expenseCount} {expenseCount === 1 ? 'gasto' : 'gastos'}
                  </p>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card py-16 text-center"
          >
            <Tags className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-lg text-muted-foreground">Nenhuma categoria criada</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crie categorias para organizar seus gastos
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Categories;
