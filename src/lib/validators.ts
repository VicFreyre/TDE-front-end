// ============================================
// VALIDADORES COM ZOD
// ============================================

import { z } from 'zod';

// ============================================
// SCHEMAS BASE
// ============================================

// UUID v4 pattern
const uuidSchema = z.string().uuid('ID inválido');

// Data no formato ISO
const dateSchema = z.string().refine(
  (date) => !isNaN(Date.parse(date)),
  { message: 'Data inválida' }
);

// Valor monetário (positivo, máximo 2 casas decimais)
const moneySchema = z.number()
  .positive('Valor deve ser positivo')
  .max(999999999.99, 'Valor muito alto')
  .refine(
    (val) => Number.isFinite(val) && Math.round(val * 100) / 100 === val,
    { message: 'Valor deve ter no máximo 2 casas decimais' }
  );

// String sanitizada (sem HTML, tamanho limitado)
const sanitizedString = (maxLength: number = 255) => 
  z.string()
    .max(maxLength, `Máximo de ${maxLength} caracteres`)
    .transform((val) => val.trim())
    .refine(
      (val) => !/<[^>]*>/g.test(val),
      { message: 'Caracteres HTML não permitidos' }
    );

// Cor hexadecimal
const hexColorSchema = z.string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Cor hexadecimal inválida');

// Método de pagamento
const paymentMethodSchema = z.enum(['debit', 'credit', 'cash'], {
  errorMap: () => ({ message: 'Método de pagamento inválido' }),
});

// ============================================
// SCHEMAS DE DOMÍNIO
// ============================================

// Category
export const categorySchema = z.object({
  id: uuidSchema,
  name: sanitizedString(100),
  icon: sanitizedString(50),
  color: hexColorSchema,
});

export const createCategorySchema = categorySchema.omit({ id: true });
export const updateCategorySchema = createCategorySchema.partial();

// Expense
export const expenseSchema = z.object({
  id: uuidSchema,
  amount: moneySchema,
  date: dateSchema,
  categoryId: uuidSchema,
  description: sanitizedString(500).optional(),
  paymentMethod: paymentMethodSchema,
});

export const createExpenseSchema = expenseSchema.omit({ id: true });
export const updateExpenseSchema = createExpenseSchema.partial();

// Income
export const incomeSchema = z.object({
  id: uuidSchema,
  amount: moneySchema,
  date: dateSchema,
  description: sanitizedString(500).optional(),
});

export const createIncomeSchema = incomeSchema.omit({ id: true });
export const updateIncomeSchema = createIncomeSchema.partial();

// Goal
export const goalSchema = z.object({
  id: uuidSchema,
  name: sanitizedString(100),
  icon: sanitizedString(50),
  targetAmount: moneySchema,
  savedAmount: z.number().min(0, 'Valor não pode ser negativo'),
  deadline: dateSchema.optional(),
  color: hexColorSchema,
});

export const createGoalSchema = goalSchema.omit({ id: true });
export const updateGoalSchema = createGoalSchema.partial();

// Settings
export const settingsSchema = z.object({
  monthlyBudget: z.number().min(0, 'Orçamento não pode ser negativo'),
  currentBalance: z.number(),
});

// ============================================
// SCHEMAS DE AUTENTICAÇÃO
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(72, 'Senha muito longa'),
});

export const registerSchema = z.object({
  name: sanitizedString(100),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(72, 'Senha muito longa')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter letras maiúsculas, minúsculas e números'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

// ============================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================

export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

/**
 * Valida dados usando um schema Zod
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return { success: false, errors };
}

/**
 * Valida e lança exceção se inválido
 */
export function validateOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  errorMessage: string = 'Dados inválidos'
): T {
  const result = validate(schema, data);
  
  if (result.success === false) {
    const firstError = Object.values(result.errors)[0] as string;
    throw new ValidationError(firstError || errorMessage, result.errors);
  }
  
  return result.data;
}

// ============================================
// CLASSES DE ERRO CUSTOMIZADAS
// ============================================

export class ValidationError extends Error {
  public readonly code = 'VALIDATION_ERROR';
  public readonly errors: Record<string, string>;

  constructor(message: string, errors: Record<string, string> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class AuthError extends Error {
  public readonly code: string;

  constructor(message: string, code: string = 'AUTH_ERROR') {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

export class DatabaseError extends Error {
  public readonly code: string;
  public readonly originalError?: unknown;

  constructor(message: string, code: string = 'DATABASE_ERROR', originalError?: unknown) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.originalError = originalError;
  }
}

export class NetworkError extends Error {
  public readonly code = 'NETWORK_ERROR';
  public readonly isRetryable: boolean;

  constructor(message: string, isRetryable: boolean = true) {
    super(message);
    this.name = 'NetworkError';
    this.isRetryable = isRetryable;
  }
}

// ============================================
// SANITIZAÇÃO
// ============================================

/**
 * Remove caracteres HTML perigosos
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitiza string para uso seguro
 */
export function sanitizeString(input: string, maxLength: number = 255): string {
  return input.trim().substring(0, maxLength);
}

/**
 * Valida e normaliza valor monetário
 */
export function normalizeMoneyValue(value: number): number {
  return Math.round(value * 100) / 100;
}

// ============================================
// TIPOS INFERIDOS DOS SCHEMAS
// ============================================

export type CategoryInput = z.infer<typeof createCategorySchema>;
export type ExpenseInput = z.infer<typeof createExpenseSchema>;
export type IncomeInput = z.infer<typeof createIncomeSchema>;
export type GoalInput = z.infer<typeof createGoalSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
