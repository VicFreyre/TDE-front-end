# 📊 Fin'Nally – Documentação Completa do Projeto

**Disciplina:** Programação Frontend  
**Professor:** Leonardo Silva Nunes  
**Equipe:** Dannyelen Christinna Dourado Garcez, Maria Victoria Freyre Reis, Arligton Costa Tavares Junior, Jefferson Freitas Dos Santos, Marcus Vinícius Costa Pachêco

---

## 📖 Índice

1. [Proposta da Aplicação](#proposta)
2. [Estrutura Geral do Projeto](#estrutura)
3. [Arquitetura e Tecnologias](#arquitetura)
4. [Backend (Node.js + TypeScript)](#backend)
5. [Banco de Dados (Supabase/PostgreSQL)](#banco-de-dados)
6. [Frontend (React + TypeScript)](#frontend)
7. [Fluxo de Dados](#fluxo-dados)
8. [Como Rodar o Projeto](#rodando)

---

## <a id="proposta"></a>🎯 Proposta da Aplicação: Fin'Nally

### O que é Fin'Nally?

**Fin'Nally – Gestão Financeira Pessoal de Forma Inteligente** é uma plataforma web inovadora que resolve um problema crítico no Brasil: o endividamento pessoal e a falta de controle financeiro.

### Problema Identificado

- Brasil é um dos países com **maior índice de endividamento pessoal** do mundo
- Milhões de famílias enfrentam dificuldades por **falta de planejamento e controle de gastos**
- Gastos passam despercebidos sem ferramentas acessíveis e visuais
- Metas financeiras não são cumpridas
- Decisões financeiras são tomadas sem embasamento

### Solução: Fin'Nally

Uma plataforma **centralizadora de dados financeiros** que oferece:

✅ **Dashboard intuitivo** com visualização de saldo, gastos e metas  
✅ **Gráficos interativos** para análise mensal e anual  
✅ **Registro de ganhos e gastos** com categorização automática  
✅ **Metas financeiras** com acompanhamento de progresso  
✅ **Mascote Fin** - personagem inteligente que oferece insights personalizados  
✅ **Dark mode moderno** com paleta roxo/azul e verde neon  

### Público-Alvo

- Jovens adultos iniciando vida financeira
- Profissionais que buscam melhor controle de gastos
- Pessoas que desejam atingir metas financeiras
- Qualquer pessoa que queira organizar suas finanças pessoais

### Diferenciais Inovadores

1. **Mascote Fin** - Personagem interativo que analisa dados e oferece insights
2. **Interface Visual Moderna** - Dark mode com gráficos em tempo real
3. **Análise Comparativa** - Comparação entre períodos para identificar padrões
4. **Roadmap Evolutivo** - Futuras integrações com automações (n8n) e bot WhatsApp

---

## <a id="estrutura"></a>📁 Estrutura Geral do Projeto

```
wishboard-your-financial-dreams-main/
│
├── 📦 Arquivos Raiz
│   ├── package.json              # Dependências do Frontend
│   ├── vite.config.ts            # Configuração do build tool
│   ├── tsconfig.json             # Configuração TypeScript
│   ├── tailwind.config.ts         # Configuração do Tailwind CSS
│   ├── index.html                # Arquivo HTML principal
│   └── vercel.json               # Deploy Vercel
│
├── 📂 /server
│   ├── index.ts                  # Arquivo principal do servidor
│   ├── finChat.ts                # Integração com IA (Mascote Fin)
│   ├── package.json              # Dependências do Backend
│   └── tsconfig.json             # Configuração TypeScript do backend
│
├── 📂 /src (FRONTEND - FOCO PRINCIPAL)
│   ├── main.tsx                  # Ponto de entrada React
│   ├── App.tsx                   # Componente raiz com rotas
│   ├── index.css                 # Estilos globais
│   ├── App.css                   # Estilos da aplicação
│   │
│   ├── 📂 /components
│   │   ├── FinChat.tsx           # Componente do mascote Fin
│   │   ├── NavLink.tsx           # Link de navegação
│   │   │
│   │   ├── 📂 /layout
│   │   │   ├── AppLayout.tsx     # Layout principal da app
│   │   │   ├── Sidebar.tsx       # Menu lateral
│   │   │   └── BottomNav.tsx     # Navegação inferior (mobile)
│   │   │
│   │   ├── 📂 /shared
│   │   │   ├── CategoryIcon.tsx  # Ícone de categoria
│   │   │   ├── ExpenseItem.tsx   # Item de despesa
│   │   │   ├── GoalCard.tsx      # Card de meta financeira
│   │   │   ├── MascotInsights.tsx # Insights do mascote
│   │   │   ├── ProgressBar.tsx   # Barra de progresso
│   │   │   └── StatCard.tsx      # Card de estatísticas
│   │   │
│   │   ├── 📂 /ui (ShadCN UI Components)
│   │   │   ├── button.tsx        # Componente Button
│   │   │   ├── card.tsx          # Componente Card
│   │   │   ├── dialog.tsx        # Modal
│   │   │   ├── input.tsx         # Input field
│   │   │   ├── select.tsx        # Select dropdown
│   │   │   ├── form.tsx          # Formulários
│   │   │   ├── chart.tsx         # Gráficos
│   │   │   ├── tabs.tsx          # Abas
│   │   │   └── ... (30+ componentes reutilizáveis)
│   │   │
│   │   ├── 📂 /feedback
│   │   │   └── index.tsx         # Componente de feedback
│   │
│   ├── 📂 /contexts
│   │   └── AuthContext.tsx       # Contexto de autenticação com Supabase
│   │
│   ├── 📂 /hooks
│   │   ├── useWishboard.ts       # Hook principal de dados
│   │   ├── useNotification.ts    # Hook de notificações
│   │   └── use-mobile.tsx        # Hook para detecção mobile
│   │
│   ├── 📂 /lib
│   │   ├── supabase.ts           # Cliente Supabase
│   │   ├── supabaseStore.ts      # Lógica de dados com Supabase
│   │   ├── store.ts              # Re-exportações e formatadores
│   │   ├── database.ts           # Funções de banco de dados
│   │   ├── utils.ts              # Funções utilitárias
│   │   └── validators.ts         # Validações de dados
│   │
│   ├── 📂 /pages
│   │   ├── Dashboard.tsx         # Dashboard principal
│   │   ├── Expenses.tsx          # Página de despesas
│   │   ├── Incomes.tsx           # Página de receitas
│   │   ├── Goals.tsx             # Página de metas
│   │   ├── Categories.tsx        # Página de categorias
│   │   ├── History.tsx           # Histórico de transações
│   │   ├── ImportExport.tsx      # Importar/exportar dados
│   │   ├── Login.tsx             # Página de login
│   │   ├── ResetPassword.tsx     # Recuperação de senha
│   │   ├── NotFound.tsx          # Página 404
│   │   └── Index.tsx             # Página inicial
│   │
│   └── 📂 /types
│       └── index.ts              # Tipos TypeScript centralizados
│
├── 📂 /supabase
│   └── 📂 /migrations
│       └── 001_create_tables_and_rls.sql  # Scripts de banco de dados
│
├── 📂 /public
│   └── robots.txt
│
└── README.md, SUPABASE_SETUP.md

```

---

## <a id="arquitetura"></a>🏗️ Arquitetura e Tecnologias

### Stack Tecnológico

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | React 18.3 + TypeScript 5.8 |
| **Build Tool** | Vite 5.4 |
| **Styling** | Tailwind CSS 3.4 + ShadCN UI |
| **Backend** | Node.js + TypeScript |
| **Banco de Dados** | Supabase (PostgreSQL) |
| **Autenticação** | Supabase Auth |
| **API Client** | Supabase JS SDK |
| **State Management** | React Query + Context API |
| **Componentes UI** | Radix UI (base do ShadCN UI) |
| **Gráficos** | Recharts 2.15 |
| **Animações** | Framer Motion 12.24 |
| **Forms** | React Hook Form + Zod |
| **Ícones** | Lucide React |
| **Notificações** | Sonner + React Toaster |
| **Hospedagem** | Vercel (Frontend) + Supabase (Backend/DB) |

### Arquitetura em Camadas

```
┌─────────────────────────────────────────┐
│         Camada de Apresentação          │
│    (React Components + UI/ShadCN)       │
│  Dashboard, Expenses, Goals, History    │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│       Camada de Lógica de Estado        │
│  Contexts (Auth), Hooks (useWishboard)  │
│     React Query para caching            │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│     Camada de Acesso a Dados            │
│  lib/supabaseStore.ts (CRUD operations) │
│  lib/supabase.ts (Cliente Supabase)     │
│  lib/validators.ts (Validações)        │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│       Camada de Persistência            │
│    Supabase + PostgreSQL Database       │
│  (Row Level Security - RLS habilitado)  │
└─────────────────────────────────────────┘
```

---

## <a id="backend"></a>⚙️ Backend (Node.js + TypeScript)

### Localização
```
/server/
├── index.ts           # Servidor principal
├── finChat.ts         # Integração IA (Mascote Fin)
├── package.json       # Dependências
└── tsconfig.json      # Config TypeScript
```

### Responsabilidades do Backend

O backend atua como **intermediário** entre o frontend e o banco de dados, oferecendo:

1. **Autenticação e Segurança**
   - Gerenciamento de sessões
   - Validação de tokens JWT
   - Row Level Security (RLS)

2. **Processamento de Dados**
   - Validação de entrada
   - Cálculos financeiros (saldos, totais)
   - Geração de insights

3. **Integração com IA**
   - Mascote Fin via `finChat.ts`
   - Análise de padrões de gastos
   - Geração de recomendações personalizadas

4. **Operações CRUD**
   - Create, Read, Update, Delete para todas as entidades
   - Transações seguras no banco

### API Endpoints (Supabase RPC Functions)

```typescript
// Não há endpoints HTTP tradicionais
// Supabase RPC functions são usadas via SDK

// Exemplos de operações:
supabase
  .from('expenses')
  .insert({ amount: 100, categoryId: 'uuid', date: '2024-06-01' })
  .select()

supabase
  .from('goals')
  .update({ savedAmount: savedAmount + amount })
  .eq('id', goalId)
  .select()

supabase.rpc('calculate_monthly_summary', { user_id: userId })
```

### Fluxo de Autenticação

```
┌─────────────────┐
│   Frontend      │
│ (React)         │
└────────┬────────┘
         │ Email + Password
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Supabase Auth  │──────│ PostgreSQL DB    │
│  (JWT Token)    │      │ (users table)    │
└────────┬────────┘      └──────────────────┘
         │ Token JWT
         ▼
┌─────────────────┐
│   Frontend      │
│ (Armazenado)    │
└─────────────────┘
```

### Integração com Mascote Fin (finChat.ts)

```typescript
// finChat.ts - Processamento de dados para insights
// Utiliza Google Generative AI API

interface FinAnalysis {
  insights: string;           // Análise inteligente
  recommendation: string;     // Recomendação personalizadas
  warningLevel: 'low' | 'medium' | 'high';
  trend: 'improving' | 'stable' | 'declining';
}

// O mascote analisa:
// - Padrões de gastos mensais
// - Categorias com maior gasto
// - Métodos de pagamento utilizados
// - Progresso das metas
// - Comparação com períodos anteriores
```

---

## <a id="banco-de-dados"></a>💾 Banco de Dados (Supabase/PostgreSQL)

### Diagrama de Entidades (ER)

```
┌─────────────────────────────┐
│       auth.users            │ (Supabase Auth)
│ ─────────────────────────── │
│ id (UUID) PK                │
│ email (TEXT)                │
│ user_metadata (JSONB)       │
└────────────┬────────────────┘
             │ FK
             ▼
┌─────────────────────────────┐
│        settings             │ (Configurações do usuário)
│ ─────────────────────────── │
│ user_id (UUID) PK,FK        │
│ monthly_budget (DECIMAL)    │
│ current_balance (DECIMAL)   │
│ created_at (TIMESTAMP)      │
│ updated_at (TIMESTAMP)      │
└─────────────────────────────┘

         FK                FK               FK
         │                 │                │
┌────────▼─────────┐ ┌─────▼──────────┐ ┌─▼──────────────┐
│   categories     │ │   expenses     │ │    incomes     │
│ ──────────────── │ │ ─────────────  │ │ ──────────────  │
│ id (UUID) PK     │ │ id (UUID) PK   │ │ id (UUID) PK   │
│ user_id FK       │ │ user_id FK     │ │ user_id FK     │
│ name (VARCHAR)   │ │ amount (DEC)   │ │ amount (DEC)   │
│ icon (VARCHAR)   │ │ date (DATE)    │ │ date (DATE)    │
│ color (VARCHAR)  │ │ category_id FK │ │ description    │
│ created_at       │ │ description    │ │ created_at     │
│ updated_at       │ │ payment_method │ │ updated_at     │
└──────────────────┘ │ created_at     │ └────────────────┘
                     │ updated_at     │
                     └────────────────┘
                             │ FK
                             ▼
                     ┌─────────────────┐
                     │     goals       │
                     │ ─────────────── │
                     │ id (UUID) PK    │
                     │ user_id FK      │
                     │ name (VARCHAR)  │
                     │ icon (VARCHAR)  │
                     │ target_amount   │
                     │ saved_amount    │
                     │ deadline (DATE) │
                     │ color (VARCHAR) │
                     │ created_at      │
                     │ updated_at      │
                     └─────────────────┘
```

### Tabelas Principais

#### 1. **categories** - Categorias de transações

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  color VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Usuário só pode ver suas próprias categorias
```

**Exemplo de dados:**
```json
{
  "id": "uuid-123",
  "user_id": "user-uuid",
  "name": "Alimentação",
  "icon": "🍔",
  "color": "#FF6B6B",
  "created_at": "2024-06-01T10:00:00Z"
}
```

#### 2. **expenses** - Despesas/Gastos

```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  date DATE NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  description VARCHAR(500),
  payment_method VARCHAR(20) CHECK (payment_method IN ('debit', 'credit', 'cash')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Usuário só pode ver/editar suas despesas
-- Índices: user_id, category_id, date para queries rápidas
```

**Exemplo:**
```json
{
  "id": "uuid-456",
  "user_id": "user-uuid",
  "amount": 45.50,
  "date": "2024-06-15",
  "category_id": "uuid-123",
  "description": "Almoço no restaurante",
  "payment_method": "debit",
  "created_at": "2024-06-15T12:30:00Z"
}
```

#### 3. **incomes** - Receitas/Ganhos

```sql
CREATE TABLE incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  date DATE NOT NULL,
  description VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Usuário só pode ver/editar suas receitas
```

**Exemplo:**
```json
{
  "id": "uuid-789",
  "user_id": "user-uuid",
  "amount": 3000.00,
  "date": "2024-06-01",
  "description": "Salário mensal",
  "created_at": "2024-06-01T08:00:00Z"
}
```

#### 4. **goals** - Metas Financeiras

```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL CHECK (target_amount >= 0),
  saved_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (saved_amount >= 0),
  deadline DATE,
  color VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Usuário só pode ver/editar suas metas
-- Cálculo automático de progresso: (saved_amount / target_amount) * 100
```

**Exemplo:**
```json
{
  "id": "uuid-xyz",
  "user_id": "user-uuid",
  "name": "Viagem para Cancun",
  "icon": "✈️",
  "target_amount": 5000.00,
  "saved_amount": 2500.00,
  "deadline": "2024-12-31",
  "color": "#4ECDC4",
  "progress": 50  // Calculado no frontend: 2500/5000
}
```

#### 5. **settings** - Configurações do Usuário

```sql
CREATE TABLE settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_budget DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (monthly_budget >= 0),
  current_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Usuário só pode ver/editar suas próprias configurações
```

### Segurança: Row Level Security (RLS)

**RLS garante que:**
- Cada usuário só acessa seus próprios dados
- Impossível burlar segurança pelo banco
- Operações não autenticadas são bloqueadas

```sql
-- Exemplo de política RLS para expenses
CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- auth.uid() retorna o ID do usuário autenticado
-- Comparamos com user_id da linha de dados
```

### Performance e Índices

```sql
-- Índices criados para otimizar queries frequentes
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_incomes_user_id ON incomes(user_id);
CREATE INDEX idx_goals_user_id ON goals(user_id);
```

---

## <a id="frontend"></a>🎨 Frontend (React + TypeScript)

### Visão Geral da Arquitetura Frontend

```
React App
│
├── Context API
│   └── AuthContext (Autenticação + User)
│
├── Custom Hooks
│   ├── useWishboard (Dados financeiros)
│   ├── useNotification (Notificações)
│   └── use-mobile (Detecção responsivo)
│
├── React Query
│   └── Caching + Sincronização dados
│
├── Components
│   ├── Layout (Sidebar, BottomNav)
│   ├── Pages (Dashboard, Expenses, etc)
│   ├── Shared (Cards, Icons, etc)
│   └── UI (ShadCN Components)
│
└── Utilities
    ├── supabase.ts (Cliente)
    ├── supabaseStore.ts (CRUD)
    ├── validators.ts (Validação)
    └── store.ts (Re-exportações)
```

### 1. Sistema de Autenticação (AuthContext)

**Arquivo:** `src/contexts/AuthContext.tsx`

```typescript
// Funções disponíveis:
interface AuthContextType {
  // Estado
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Ações
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: { name?: string; avatarUrl?: string }) => Promise<void>;
}
```

**Fluxo de Autenticação:**

```
1. Usuário acessa /login
2. Insere email e senha
3. Clica "Entrar"
   │
   ▼
4. AuthContext.signIn() é chamado
   │
   ▼
5. Supabase.auth.signInWithPassword() autentica
   │
   ▼
6. JWT Token retornado
   │
   ▼
7. Token armazenado no localStorage
   │
   ▼
8. useAuth() hook atualiza estado
   │
   ▼
9. Componente ProtectedRoute verifica isAuthenticated
   │
   ▼
10. Usuário redirecionado para Dashboard ✅
```

### 2. Hook Principal: useWishboard

**Arquivo:** `src/hooks/useWishboard.ts`

Este é o **coração da aplicação**, gerenciando todos os dados financeiros.

```typescript
const {
  // Dados
  data,              // Todos os dados consolidados
  categories,        // Array de categorias
  expenses,          // Array de despesas
  goals,             // Array de metas
  incomes,           // Array de receitas
  monthlyBudget,     // Orçamento mensal
  currentBalance,    // Saldo atual
  
  // Estados
  isLoading,         // Carregando dados?
  isSaving,          // Salvando dados?
  error,             // Erro?
  
  // Operações de Despesas
  addExpense,        // Adicionar despesa
  updateExpense,     // Editar despesa
  deleteExpense,     // Deletar despesa
  
  // Operações de Receitas
  addIncome,         // Adicionar receita
  deleteIncome,      // Deletar receita
  
  // Operações de Metas
  addGoal,           // Criar meta
  updateGoal,        // Editar meta
  deleteGoal,        // Deletar meta
  
  // Operações de Categorias
  addCategory,       // Criar categoria
  updateCategory,    // Editar categoria
  deleteCategory,    // Deletar categoria
  
  // Funções de Análise
  getMonthlyExpenses,        // Gastos do mês atual
  getExpensesByCategory,     // Agrupado por categoria
  getExpensesByPaymentMethod,// Agrupado por método pagamento
  getCategoryById,           // Buscar categoria
  
  // Sincronização
  refreshData,       // Recarregar dados do Supabase
} = useWishboard();
```

**Fluxo de Dados:**

```
useWishboard()
│
├─ useState → Estado local (data, isLoading, etc)
├─ useAuth → Pega user_id do contexto
├─ useNotification → Para mostrar toasts
│
└─ useEffect → Carrega dados do Supabase na montagem
   │
   ▼ Chama loadDataFromSupabase(userId)
   │
   ▼ Faz queries ao Supabase:
   │  - Pega todas as categorias do usuário
   │  - Pega todas as despesas do usuário
   │  - Pega todas as receitas do usuário
   │  - Pega todas as metas do usuário
   │  - Pega configurações do usuário
   │
   ▼ Normaliza dados
   │
   ▼ Atualiza estado local
   │
   ▼ Componentes se re-renderizam com novos dados
```

### 3. Estrutura de Páginas

#### **Dashboard** - Página Principal
- Mostra resumo de saldo, gastos do mês, metas
- Gráficos de gastos por categoria (Pie Chart)
- Gráficos de gastos por método de pagamento (Bar Chart)
- Listagem das ultimas transações
- Acesso rápido para adicionar receita

```
┌──────────────────────────────────────────┐
│  Bem-vindo, [Nome]!                      │
├──────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐          │
│ │ Saldo       │ │ Gastos Mês  │          │
│ │ R$ 5.000    │ │ R$ 1.200    │          │
│ └─────────────┘ └─────────────┘          │
├──────────────────────────────────────────┤
│ Gastos por Categoria (Gráfico Pizza)     │
├──────────────────────────────────────────┤
│ Gastos por Método (Gráfico Barras)       │
├──────────────────────────────────────────┤
│ Metas Ativas                             │
│ ┌──────────────────────────────────────┐ │
│ │ 🏖️ Viagem: 50% completa              │ │
│ │ ⚡ Iphone: 25% completo              │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

#### **Expenses** - Gerenciar Despesas
- Listar todas as despesas com filtros
- Adicionar nova despesa (form modal)
- Editar despesa existente
- Deletar despesa
- Filtros: por data, categoria, método pagamento

#### **Incomes** - Gerenciar Receitas
- Listar todas as receitas
- Adicionar receita
- Deletar receita

#### **Goals** - Gerenciar Metas
- Listar metas com progresso visual
- Criar nova meta
- Editar meta
- Deletar meta
- Atualizar saved_amount

#### **History** - Histórico de Transações
- Visualizar todas as transações (despesas + receitas)
- Filtros avançados (data range, categoria, valor)
- Gráficos de tendência mensal/anual

#### **ImportExport** - Importar/Exportar Dados
- Exportar dados como XLSX/CSV
- Importar dados de arquivo

#### **Login/ResetPassword**
- Autenticação
- Recuperação de senha

### 4. Componentes Principais

#### **ShadCN UI - Sistema de Componentes**

ShadCN UI fornece componentes reutilizáveis construídos sobre Radix UI:

```typescript
// Exemplos de uso
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// No componente:
<Button onClick={handleClick} variant="default">
  Adicionar Despesa
</Button>

<Card>
  <h3>Título do Card</h3>
  <p>Conteúdo aqui</p>
</Card>

<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Modal</Button>
  </DialogTrigger>
  <DialogContent>
    {/* Conteúdo do modal */}
  </DialogContent>
</Dialog>
```

#### **Componentes Customizados**

**StatCard** - Card de estatísticas
```typescript
<StatCard
  label="Saldo"
  value={currentBalance}
  icon={Wallet}
  trend="up"
/>
```

**GoalCard** - Card de meta financeira
```typescript
<GoalCard
  goal={goal}
  onUpdate={updateGoal}
  onDelete={deleteGoal}
/>
```

**ExpenseItem** - Item de despesa
```typescript
<ExpenseItem
  expense={expense}
  category={getCategoryById(expense.categoryId)}
  onEdit={updateExpense}
  onDelete={deleteExpense}
/>
```

### 5. Tipos TypeScript Centralizados

**Arquivo:** `src/types/index.ts`

```typescript
// Tipos de Domínio
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

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface WishboardData {
  categories: Category[];
  expenses: Expense[];
  goals: Goal[];
  incomes: Income[];
  monthlyBudget: number;
  currentBalance: number;
}
```

### 6. Validações (Zod + React Hook Form)

```typescript
// Exemplo: Validação de forma de despesa
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const expenseSchema = z.object({
  amount: z.number().positive('Valor deve ser positivo'),
  date: z.string().refine(date => new Date(date) <= new Date(), {
    message: 'Data não pode ser no futuro',
  }),
  categoryId: z.string().uuid('Categoria inválida'),
  description: z.string().optional(),
  paymentMethod: z.enum(['debit', 'credit', 'cash']),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

const form = useForm<ExpenseFormData>({
  resolver: zodResolver(expenseSchema),
});
```

### 7. Styling com Tailwind CSS + Dark Mode

```typescript
// Tailwind + Next Themes para Dark Mode
import { ThemeProvider } from 'next-themes';

// No componente:
<div className="bg-black dark:bg-slate-950 text-white">
  <h1 className="text-3xl font-bold text-purple-500">Fin'Nally</h1>
  <p className="text-gray-400">Gestão financeira inteligente</p>
</div>

// Cores principais:
// Fundo: #1A1A2E (bg-black)
// Destaque: #00C896 (verde neon)
// Roxo: #7B61FF
// Branco: #FFFFFF
```

### 8. Gráficos com Recharts

```typescript
import { PieChart, Pie, BarChart, Bar, LineChart, Line } from 'recharts';

// Gráfico de Pizza (Gastos por Categoria)
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={expensesByCategory}
      dataKey="amount"
      nameKey="categoryName"
      cx="50%"
      cy="50%"
      fill="#8884d8"
    >
      {expensesByCategory.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
      ))}
    </Pie>
    <Tooltip formatter={value => `R$ ${value.toFixed(2)}`} />
  </PieChart>
</ResponsiveContainer>

// Gráfico de Barras (Gastos por Método)
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={expensesByPaymentMethod}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="paymentMethod" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="amount" fill="#8884d8" />
  </BarChart>
</ResponsiveContainer>
```

### 9. Formulários com React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';

const form = useForm({
  resolver: zodResolver(expenseSchema),
  defaultValues: {
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    paymentMethod: 'debit',
  }
});

const onSubmit = async (data) => {
  await addExpense(data);
  form.reset();
};

return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valor</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <Button type="submit">Adicionar</Button>
    </form>
  </Form>
);
```

### 10. React Query para Caching

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query para buscar dados
const { data, isLoading } = useQuery({
  queryKey: ['expenses', userId],
  queryFn: () => loadExpensesFromSupabase(userId),
  staleTime: 5 * 60 * 1000, // 5 minutos
});

// Mutation para adicionar dados
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: (newExpense) => addExpenseToSupabase(newExpense),
  onSuccess: () => {
    // Invalida cache para forçar re-fetch
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
  }
});
```

---

## <a id="fluxo-dados"></a>🔄 Fluxo de Dados Completo

### Exemplo: Adicionar uma Despesa

```
1. USUÁRIO INTERAGE
   └─ Clica em "Adicionar Despesa"

2. FRONTEND - COMPONENTE
   ├─ Abre Dialog/Modal
   └─ Exibe Formulário de Despesa

3. USUÁRIO PREENCHE FORM
   ├─ Valor: R$ 45,50
   ├─ Data: 15/06/2024
   ├─ Categoria: Alimentação
   ├─ Descrição: Almoço
   └─ Método: Débito

4. USUÁRIO CLICA "SALVAR"
   └─ form.handleSubmit() acionado

5. VALIDAÇÃO (ZOD)
   ├─ Valida tipo de dados
   ├─ Valida limites (amount > 0)
   ├─ Valida format datas
   └─ Se erro → Mostra mensagem de validação no form

6. SE VÁLIDO → FRONTEND - HOOK
   └─ useWishboard().addExpense(formData) chamado

7. FRONTEND - SUPABASE STORE
   ├─ Chama supabaseStore.addExpense()
   └─ Faz INSERT no Supabase

8. SUPABASE (BACKEND)
   ├─ Recebe INSERT
   ├─ Valida RLS (auth.uid() == user_id)
   ├─ Valida constraints (CHECK amount >= 0)
   ├─ Valida foreign key (category_id existe)
   └─ Se OK → Insere na tabela expenses

9. RESPOSTA SUPABASE
   ├─ Retorna nova linha com ID gerado
   └─ Retorna para frontend

10. FRONTEND - ATUALIZAÇÃO DE ESTADO
    ├─ useWishboard atualiza estado local
    ├─ React Query invalida cache
    ├─ Componentes se re-renderizam
    └─ Nova despesa aparece na lista

11. NOTIFICAÇÃO AO USUÁRIO
    ├─ Toast verde "Despesa adicionada com sucesso!"
    └─ Modal fecha

12. DADOS PERSISTEM
    └─ Na próxima abertura, dados carregam do Supabase
```

### Fluxo de Sincronização em Tempo Real

```
┌─────────────────┐
│  Frontend       │
│  App.tsx        │
└────────┬────────┘
         │ Na montagem
         ▼
┌─────────────────────────────────────┐
│  AuthContext                        │
│  - Verifica sessão do usuário       │
│  - Carrega user_id                  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  useWishboard Hook                  │
│  useEffect → loadDataFromSupabase()  │
└────────┬────────────────────────────┘
         │
         ├─ Supabase.from('categories').select()
         ├─ Supabase.from('expenses').select()
         ├─ Supabase.from('incomes').select()
         ├─ Supabase.from('goals').select()
         └─ Supabase.from('settings').select()
         │
         ▼
┌─────────────────┐
│  Supabase API   │
│  (PostgreSQL)   │
└────────┬────────┘
         │
         ▼ RLS Verifica: auth.uid() == user_id
         │
         ▼
┌──────────────────────────────────────┐
│  Dados do usuário retornam           │
│  - Categorias                        │
│  - Despesas                          │
│  - Receitas                          │
│  - Metas                             │
│  - Configurações                     │
└──────────────────┬───────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  Frontend setState() │
         │  Atualiza UI        │
         └─────────────────────┘
```

---

## <a id="rodando"></a>🚀 Como Rodar o Projeto

### Pré-requisitos

- Node.js 18+ e npm/bun
- Conta Supabase (free tier serve)
- Git

### Passo 1: Clonar e Instalar Dependências

```bash
# Clonar repositório
git clone [seu-repo]
cd wishboard-your-financial-dreams-main

# Instalar dependências frontend
npm install
# ou
bun install

# Instalar dependências backend
cd server
npm install
cd ..
```

### Passo 2: Configurar Variáveis de Ambiente

Criar arquivo `.env.local` na raiz:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

Criar arquivo `server/.env`:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
GOOGLE_API_KEY=sua-chave-google-generative-ai
```

### Passo 3: Executar Migrations SQL

1. Ir para Supabase Dashboard
2. SQL Editor
3. Copiar e colar conteúdo de `supabase/migrations/001_create_tables_and_rls.sql`
4. Executar

### Passo 4: Rodar Desenvolvimento

```bash
# Terminal 1 - Frontend (port 5173)
npm run dev

# Terminal 2 - Backend (port 3000)
cd server
npm run dev
```

### Passo 5: Acessar

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Build para Produção

```bash
# Frontend
npm run build

# Backend
cd server
npm run build
```

---

## 📚 Conceitos Chave Aprendidos

### 1. **Arquitetura em Camadas**
- Separação clara de responsabilidades
- Frontend (apresentação)
- Backend (lógica)
- Banco de dados (persistência)

### 2. **TypeScript**
- Type safety em todo o projeto
- Interfaces bem definidas
- Menos bugs em produção

### 3. **React Modernos**
- Hooks customizados
- Context API para estado global
- React Query para data fetching
- Componentes funcionais

### 4. **Segurança**
- Autenticação com JWT (Supabase)
- Row Level Security (RLS) no banco
- Validação em frontend e backend
- Proteção de rotas

### 5. **UX/UI**
- Dark mode moderno
- Componentes reutilizáveis (ShadCN UI)
- Responsivo (mobile + desktop)
- Gráficos interativos (Recharts)

### 6. **Database Design**
- Normalização de dados
- Foreign keys
- Constraints
- Índices para performance

### 7. **CI/CD**
- Vercel para deploy automático
- Supabase para backend/DB hospedado

---

## 🎓 Resumo Final

**Fin'Nally** é uma aplicação moderna que demonstra:

✅ **Full-stack development** (Frontend + Backend + Database)  
✅ **Type-safety** com TypeScript  
✅ **Arquitetura escalável** e bem organizada  
✅ **Segurança** em todas as camadas  
✅ **UX/UI** profissional e intuitiva  
✅ **Performance** com caching e otimizações  
✅ **Real-world problem solving** (gestão financeira pessoal)  

A aplicação resolve um problema real (endividamento no Brasil) utilizando tecnologias modernas e boas práticas de desenvolvimento profissional.

---

**Documento preparado para disciplina de Programação Frontend**  
**Data:** 01/06/2026
