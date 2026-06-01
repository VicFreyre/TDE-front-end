// ============================================
// TIPOS CENTRALIZADOS DO WISHBOARD
// ============================================

// ============================================
// TIPOS DE DOMÍNIO
// ============================================

export type PaymentMethod = 'debit' | 'credit' | 'cash';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id: string;
  amount: number;
  date: string;
  categoryId: string;
  description?: string;
  paymentMethod: PaymentMethod;
  createdAt?: string;
  updatedAt?: string;
}

export interface Income {
  id: string;
  amount: number;
  date: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Goal {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  savedAmount: number;
  deadline?: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSettings {
  monthlyBudget: number;
  currentBalance: number;
}

export interface WishboardData {
  categories: Category[];
  expenses: Expense[];
  goals: Goal[];
  incomes: Income[];
  monthlyBudget: number;
  currentBalance: number;
}

// ============================================
// TIPOS DE AUTENTICAÇÃO
// ============================================

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// TIPOS DE API / RESPOSTA
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  success: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================
// TIPOS DE UI / NOTIFICAÇÕES
// ============================================

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

// ============================================
// TIPOS DE OPERAÇÕES
// ============================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface OperationState {
  status: LoadingState;
  error: string | null;
}

// ============================================
// TIPOS DE FORMULÁRIO
// ============================================

export type CreateExpenseInput = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateExpenseInput = Partial<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>>;

export type CreateIncomeInput = Omit<Income, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateIncomeInput = Partial<Omit<Income, 'id' | 'createdAt' | 'updatedAt'>>;

export type CreateGoalInput = Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateGoalInput = Partial<Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>>;

export type CreateCategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCategoryInput = Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>;

// ============================================
// TIPOS DE DATABASE (Supabase)
// ============================================

export interface DbCategory {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbExpense {
  id: string;
  user_id: string;
  amount: number;
  date: string;
  category_id: string;
  description?: string;
  payment_method: PaymentMethod;
  created_at?: string;
  updated_at?: string;
}

export interface DbIncome {
  id: string;
  user_id: string;
  amount: number;
  date: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbGoal {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  target_amount: number;
  saved_amount: number;
  deadline?: string;
  color: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbSettings {
  user_id: string;
  monthly_budget: number;
  current_balance: number;
}

// ============================================
// MAPPERS (DB <-> Domain)
// ============================================

export const mapDbCategoryToCategory = (db: DbCategory): Category => ({
  id: db.id,
  name: db.name,
  icon: db.icon,
  color: db.color,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

export const mapDbExpenseToExpense = (db: DbExpense): Expense => ({
  id: db.id,
  amount: db.amount,
  date: db.date,
  categoryId: db.category_id,
  description: db.description,
  paymentMethod: db.payment_method,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

export const mapDbIncomeToIncome = (db: DbIncome): Income => ({
  id: db.id,
  amount: db.amount,
  date: db.date,
  description: db.description,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

export const mapDbGoalToGoal = (db: DbGoal): Goal => ({
  id: db.id,
  name: db.name,
  icon: db.icon,
  targetAmount: db.target_amount,
  savedAmount: db.saved_amount,
  deadline: db.deadline,
  color: db.color,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});
