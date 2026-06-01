import { 
  UtensilsCrossed, 
  Car, 
  Home, 
  Gamepad2, 
  Heart, 
  GraduationCap, 
  ShoppingBag, 
  Receipt,
  Plane,
  Bike,
  Shield,
  Gift,
  Briefcase,
  Smartphone,
  Music,
  Coffee,
  Pizza,
  Bus,
  Train,
  Shirt,
  Watch,
  Dumbbell,
  Dog,
  Cat,
  Baby,
  Scissors,
  Sparkles,
  Tv,
  Film,
  Book,
  Wrench,
  Zap,
  Droplet,
  Wifi,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Car,
  Home,
  Gamepad2,
  Heart,
  GraduationCap,
  ShoppingBag,
  Receipt,
  Plane,
  Bike,
  Shield,
  Gift,
  Briefcase,
  Smartphone,
  Music,
  Coffee,
  Pizza,
  Bus,
  Train,
  Shirt,
  Watch,
  Dumbbell,
  Dog,
  Cat,
  Baby,
  Scissors,
  Sparkles,
  Tv,
  Film,
  Book,
  Wrench,
  Zap,
  Droplet,
  Wifi,
};

// Mapeamento de nomes em português
export const iconNamesInPortuguese: Record<string, string> = {
  UtensilsCrossed: 'Restaurante',
  Car: 'Carro',
  Home: 'Casa',
  Gamepad2: 'Jogos',
  Heart: 'Saúde',
  GraduationCap: 'Educação',
  ShoppingBag: 'Compras',
  Receipt: 'Recibo',
  Plane: 'Viagem',
  Bike: 'Bicicleta',
  Shield: 'Seguro',
  Gift: 'Presente',
  Briefcase: 'Trabalho',
  Smartphone: 'Celular',
  Music: 'Música',
  Coffee: 'Café',
  Pizza: 'Pizza',
  Bus: 'Ônibus',
  Train: 'Trem',
  Shirt: 'Roupas',
  Watch: 'Acessórios',
  Dumbbell: 'Academia',
  Dog: 'Pet (Cachorro)',
  Cat: 'Pet (Gato)',
  Baby: 'Bebê',
  Scissors: 'Salão/Beleza',
  Sparkles: 'Lazer',
  Tv: 'TV/Streaming',
  Film: 'Cinema',
  Book: 'Livros',
  Wrench: 'Manutenção',
  Zap: 'Energia',
  Droplet: 'Água',
  Wifi: 'Internet',
};

export const iconOptions = Object.keys(iconMap);

interface CategoryIconProps {
  iconName: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const CategoryIcon = ({ 
  iconName, 
  color = 'primary',
  size = 'md',
  className 
}: CategoryIconProps) => {
  const Icon = iconMap[iconName] || Receipt;

  return (
    <Icon className={cn(sizeClasses[size], className)} style={{ color: `hsl(var(--${color}))` }} />
  );
};

export const getCategoryIcon = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Receipt;
};
