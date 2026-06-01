// ============================================
// PÁGINA DE IMPORTAR/EXPORTAR DADOS
// ============================================

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileDown,
  FileUp,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useWishboard } from '@/hooks/useWishboard';
import { useNotification } from '@/hooks/useNotification';
import { formatCurrency, supabaseHelpers } from '@/lib/supabaseStore';
import type { Category } from '@/types';

const ImportExport = () => {
  const { 
    expenses, 
    incomes, 
    goals, 
    categories, 
    currentBalance,
    refreshData,
  } = useWishboard();
  
  const { success, error: notifyError, info } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    errors: string[];
  } | null>(null);

  // ==========================================
  // EXPORTAR RELATÓRIO
  // ==========================================
  
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const workbook = XLSX.utils.book_new();
      
      // ---- ABA: Resumo ----
      const resumoData = [
        ['RELATÓRIO FINANCEIRO - FIN\'NALLY'],
        [''],
        ['Data de Geração:', new Date().toLocaleDateString('pt-BR')],
        [''],
        ['RESUMO GERAL'],
        ['Saldo Atual:', formatCurrency(currentBalance)],
        ['Total de Despesas:', formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))],
        ['Total de Receitas:', formatCurrency(incomes.reduce((sum, i) => sum + i.amount, 0))],
        ['Metas Ativas:', goals.length],
        ['Categorias:', categories.length],
        [''],
        ['METAS'],
        ['Nome', 'Valor Alvo', 'Valor Guardado', 'Progresso', 'Prazo'],
        ...goals.map(g => [
          g.name,
          formatCurrency(g.targetAmount),
          formatCurrency(g.savedAmount),
          `${((g.savedAmount / g.targetAmount) * 100).toFixed(1)}%`,
          g.deadline ? new Date(g.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'
        ])
      ];
      const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
      wsResumo['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, wsResumo, 'Resumo');
      
      // ---- ABA: Despesas ----
      const despesasHeader = ['Data', 'Descrição', 'Valor', 'Categoria', 'Método de Pagamento'];
      const despesasData = expenses.map(e => {
        const category = categories.find(c => c.id === e.categoryId);
        const paymentMethodLabels: Record<string, string> = {
          'debit': 'Débito',
          'credit': 'Crédito',
          'cash': 'Dinheiro'
        };
        return [
          new Date(e.date).toLocaleDateString('pt-BR'),
          e.description || '-',
          e.amount,
          category?.name || 'Sem categoria',
          paymentMethodLabels[e.paymentMethod] || e.paymentMethod
        ];
      });
      const wsDespesas = XLSX.utils.aoa_to_sheet([despesasHeader, ...despesasData]);
      wsDespesas['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(workbook, wsDespesas, 'Despesas');
      
      // ---- ABA: Receitas ----
      const receitasHeader = ['Data', 'Descrição', 'Valor'];
      const receitasData = incomes.map(i => [
        new Date(i.date).toLocaleDateString('pt-BR'),
        i.description || '-',
        i.amount
      ]);
      const wsReceitas = XLSX.utils.aoa_to_sheet([receitasHeader, ...receitasData]);
      wsReceitas['!cols'] = [{ wch: 12 }, { wch: 40 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, wsReceitas, 'Receitas');
      
      // ---- ABA: Categorias ----
      const categoriasHeader = ['Nome'];
      const categoriasData = categories.map(c => [c.name]);
      const wsCategorias = XLSX.utils.aoa_to_sheet([categoriasHeader, ...categoriasData]);
      wsCategorias['!cols'] = [{ wch: 30 }];
      XLSX.utils.book_append_sheet(workbook, wsCategorias, 'Categorias');
      
      // ---- ABA: Metas ----
      const metasHeader = ['Nome', 'Valor Alvo', 'Valor Guardado', 'Prazo'];
      const metasData = goals.map(g => [
        g.name,
        g.targetAmount,
        g.savedAmount,
        g.deadline || ''
      ]);
      const wsMetas = XLSX.utils.aoa_to_sheet([metasHeader, ...metasData]);
      wsMetas['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, wsMetas, 'Metas');
      
      // Gerar arquivo
      const fileName = `finnally_relatorio_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      success('Relatório exportado!', `Arquivo ${fileName} baixado com sucesso`);
    } catch (err) {
      notifyError('Erro ao exportar', 'Não foi possível gerar o relatório');
    } finally {
      setIsExporting(false);
    }
  };

  // ==========================================
  // BAIXAR MODELO DE IMPORTAÇÃO
  // ==========================================
  
  const handleDownloadTemplate = () => {
    const workbook = XLSX.utils.book_new();
    
    // ---- Modelo: Despesas ----
    const despesasHeader = ['Data (DD/MM/AAAA)', 'Descrição', 'Valor', 'Categoria', 'Método de Pagamento (debit/credit/cash)'];
    const despesasExemplo = [
      ['01/01/2026', 'Supermercado', '150.00', 'Alimentação', 'debit'],
      ['02/01/2026', 'Uber', '25.50', 'Transporte', 'credit'],
    ];
    const wsDespesas = XLSX.utils.aoa_to_sheet([despesasHeader, ...despesasExemplo]);
    wsDespesas['!cols'] = [{ wch: 18 }, { wch: 30 }, { wch: 12 }, { wch: 20 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(workbook, wsDespesas, 'Despesas');
    
    // ---- Modelo: Receitas ----
    const receitasHeader = ['Data (DD/MM/AAAA)', 'Descrição', 'Valor'];
    const receitasExemplo = [
      ['05/01/2026', 'Salário', '5000.00'],
      ['10/01/2026', 'Freelance', '800.00'],
    ];
    const wsReceitas = XLSX.utils.aoa_to_sheet([receitasHeader, ...receitasExemplo]);
    wsReceitas['!cols'] = [{ wch: 18 }, { wch: 40 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, wsReceitas, 'Receitas');
    
    // ---- Modelo: Categorias ----
    const categoriasHeader = ['Nome'];
    const categoriasExemplo = [
      ['Alimentação'],
      ['Transporte'],
    ];
    const wsCategorias = XLSX.utils.aoa_to_sheet([categoriasHeader, ...categoriasExemplo]);
    wsCategorias['!cols'] = [{ wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, wsCategorias, 'Categorias');
    
    // ---- Modelo: Metas ----
    const metasHeader = ['Nome', 'Valor Alvo', 'Valor Inicial Guardado', 'Prazo (DD/MM/AAAA)'];
    const metasExemplo = [
      ['Viagem', '5000.00', '500.00', '01/12/2026'],
      ['iPhone', '8000.00', '0.00', ''],
    ];
    const wsMetas = XLSX.utils.aoa_to_sheet([metasHeader, ...metasExemplo]);
    wsMetas['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 22 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(workbook, wsMetas, 'Metas');
    
    // ---- Instruções ----
    const instrucoes = [
      ['INSTRUÇÕES DE IMPORTAÇÃO'],
      [''],
      ['1. Preencha as abas com seus dados seguindo o formato dos exemplos'],
      ['2. Não altere os cabeçalhos (primeira linha de cada aba)'],
      ['3. Você pode apagar as linhas de exemplo antes de importar'],
      ['4. Formatos aceitos:'],
      ['   - Data: DD/MM/AAAA (ex: 01/01/2026)'],
      ['   - Valor: número com ponto decimal (ex: 150.00)'],
      ['   - Método de Pagamento: debit, credit ou cash'],
      [''],
      ['5. Para despesas, a categoria deve existir ou será ignorada'],
      ['6. Importe as categorias primeiro se precisar de novas'],
      ['7. Categorias e Metas importadas usam ícone e cor padrão (🧾 laranja)'],
      [''],
      ['DICA: Comece importando Categorias, depois Receitas/Despesas e por fim Metas'],
    ];
    const wsInstrucoes = XLSX.utils.aoa_to_sheet(instrucoes);
    wsInstrucoes['!cols'] = [{ wch: 70 }];
    XLSX.utils.book_append_sheet(workbook, wsInstrucoes, 'Instruções');
    
    XLSX.writeFile(workbook, 'finnally_modelo_importacao.xlsx');
    info('Modelo baixado!', 'Preencha o arquivo e importe de volta');
  };

  // ==========================================
  // IMPORTAR DADOS
  // ==========================================
  
  const parseDate = (dateValue: string | number): string => {
    // Retorna data no formato YYYY-MM-DD (o banco espera DATE, não TIMESTAMP)
    const today = new Date().toISOString().split('T')[0];
    
    if (dateValue === null || dateValue === undefined || dateValue === '') return today;
    
    // Se for número, é um serial do Excel (dias desde 1899-12-30)
    if (typeof dateValue === 'number' || !isNaN(Number(dateValue))) {
      const excelSerial = Number(dateValue);
      // Números seriais do Excel válidos (entre 1900 e 2100 aproximadamente)
      if (excelSerial > 1 && excelSerial < 100000) {
        // Excel usa 1899-12-30 como data base (com bug do ano bissexto de 1900)
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + excelSerial * 24 * 60 * 60 * 1000);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    }
    
    const dateStr = String(dateValue);
    
    // Tenta converter DD/MM/AAAA para YYYY-MM-DD
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const d = day.padStart(2, '0');
      const m = month.padStart(2, '0');
      // Valida se a data é válida
      const testDate = new Date(`${year}-${m}-${d}`);
      if (!isNaN(testDate.getTime())) {
        return `${year}-${m}-${d}`;
      }
    }
    
    // Tenta usar como está (pode ser YYYY-MM-DD ou ISO)
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return today;
  };
  
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    setImportResult(null);
    
    const errors: string[] = [];
    let successCount = 0;
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      // Manter referência local de todas as categorias (existentes + novas)
      let allCategories: Category[] = [...categories];
      
      // ---- Importar Categorias primeiro (em lote) ----
      if (workbook.SheetNames.includes('Categorias')) {
        const sheet = workbook.Sheets['Categorias'];
        const rows = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });
        
        const newCategoriesToAdd: Array<{ name: string; icon: string; color: string }> = [];
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !row[0]) continue;
          
          const categoryName = String(row[0]).trim();
          const exists = allCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
          
          if (!exists) {
            newCategoriesToAdd.push({
              name: categoryName,
              icon: '🧾',
              color: '#f97316',
            });
          }
        }
        
        if (newCategoriesToAdd.length > 0) {
          try {
            const createdCategories = await supabaseHelpers.batchAddCategories(newCategoriesToAdd);
            allCategories = [...allCategories, ...createdCategories];
            successCount += createdCategories.length;
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
            console.error('Erro ao importar categorias:', err);
            errors.push(`Erro ao importar categorias: ${errorMsg}`);
          }
        }
      }
      
      // ---- Importar Receitas (em lote) ----
      if (workbook.SheetNames.includes('Receitas')) {
        const sheet = workbook.Sheets['Receitas'];
        const rows = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });
        
        const incomesToAdd: Array<{ date: string; description: string; amount: number }> = [];
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !row[2]) continue; // Precisa ter valor
          
          const amount = parseFloat(String(row[2]).replace(',', '.')) || 0;
          if (amount <= 0) {
            errors.push(`Receita linha ${i + 1}: valor inválido`);
            continue;
          }
          
          incomesToAdd.push({
            date: parseDate(row[0]),
            description: String(row[1] || 'Receita importada'),
            amount,
          });
        }
        
        if (incomesToAdd.length > 0) {
          try {
            console.log('Importando receitas:', JSON.stringify(incomesToAdd, null, 2));
            const createdIncomes = await supabaseHelpers.batchAddIncomes(incomesToAdd);
            successCount += createdIncomes.length;
            
            // Atualizar saldo
            const totalIncomes = incomesToAdd.reduce((sum, inc) => sum + inc.amount, 0);
            if (totalIncomes > 0) {
              await supabaseHelpers.updateSettings({ currentBalance: currentBalance + totalIncomes });
            }
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
            console.error('Erro ao importar receitas:', err);
            errors.push(`Erro ao importar receitas: ${errorMsg}`);
          }
        }
      }
      
      // ---- Importar Despesas (em lote) ----
      if (workbook.SheetNames.includes('Despesas')) {
        const sheet = workbook.Sheets['Despesas'];
        const rows = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });
        
        const expensesToAdd: Array<{ date: string; description: string; amount: number; categoryId: string; paymentMethod: 'debit' | 'credit' | 'cash' }> = [];
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !row[2]) continue; // Precisa ter valor
          
          const categoryName = String(row[3] || '').trim().toLowerCase();
          const category = allCategories.find(c => c.name.toLowerCase() === categoryName);
          
          if (!category) {
            errors.push(`Despesa linha ${i + 1}: categoria "${row[3]}" não encontrada`);
            continue;
          }
          
          const amount = parseFloat(String(row[2]).replace(',', '.')) || 0;
          if (amount <= 0) {
            errors.push(`Despesa linha ${i + 1}: valor inválido`);
            continue;
          }
          
          const paymentMethod = ['debit', 'credit', 'cash'].includes(String(row[4])) 
            ? String(row[4]) as 'debit' | 'credit' | 'cash'
            : 'debit';
          
          expensesToAdd.push({
            date: parseDate(row[0]),
            description: String(row[1] || 'Despesa importada'),
            amount,
            categoryId: category.id,
            paymentMethod,
          });
        }
        
        if (expensesToAdd.length > 0) {
          try {
            console.log('Importando despesas:', JSON.stringify(expensesToAdd, null, 2));
            const createdExpenses = await supabaseHelpers.batchAddExpenses(expensesToAdd);
            successCount += createdExpenses.length;
            
            // Atualizar saldo
            const totalExpenses = expensesToAdd.reduce((sum, exp) => sum + exp.amount, 0);
            if (totalExpenses > 0) {
              const currentSettings = await supabaseHelpers.getSettings();
              await supabaseHelpers.updateSettings({ currentBalance: currentSettings.currentBalance - totalExpenses });
            }
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
            console.error('Erro ao importar despesas:', err);
            errors.push(`Erro ao importar despesas: ${errorMsg}`);
          }
        }
      }
      
      // ---- Importar Metas (em lote) ----
      if (workbook.SheetNames.includes('Metas')) {
        const sheet = workbook.Sheets['Metas'];
        const rows = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });
        
        const goalsToAdd: Array<{ name: string; icon: string; targetAmount: number; savedAmount: number; deadline?: string; color: string }> = [];
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !row[0] || !row[1]) continue; // Precisa ter nome e valor alvo
          
          const targetAmount = parseFloat(String(row[1]).replace(',', '.')) || 0;
          if (targetAmount <= 0) {
            errors.push(`Meta linha ${i + 1}: valor alvo inválido`);
            continue;
          }
          
          goalsToAdd.push({
            name: String(row[0]),
            icon: '🧾',
            targetAmount,
            savedAmount: parseFloat(String(row[2] || '0').replace(',', '.')) || 0,
            deadline: row[3] ? parseDate(row[3]) : undefined,
            color: '#f97316',
          });
        }
        
        if (goalsToAdd.length > 0) {
          try {
            const createdGoals = await supabaseHelpers.batchAddGoals(goalsToAdd);
            successCount += createdGoals.length;
            
            // Atualizar saldo para valores guardados nas metas
            const totalSaved = goalsToAdd.reduce((sum, goal) => sum + goal.savedAmount, 0);
            if (totalSaved > 0) {
              const currentSettings = await supabaseHelpers.getSettings();
              await supabaseHelpers.updateSettings({ currentBalance: currentSettings.currentBalance - totalSaved });
            }
          } catch (err) {
            errors.push(`Erro ao importar metas em lote`);
          }
        }
      }
      
      setImportResult({ success: successCount, errors });
      
      if (successCount > 0 && errors.length === 0) {
        success('Importação concluída!', `${successCount} itens importados com sucesso`);
      } else if (successCount > 0) {
        info('Importação parcial', `${successCount} itens importados, ${errors.length} erros`);
      } else {
        notifyError('Erro na importação', 'Nenhum item foi importado');
      }
      
      // Recarregar dados após importação bem-sucedida
      if (successCount > 0) {
        await refreshData();
      }
      
    } catch (err) {
      notifyError('Erro ao ler arquivo', 'Verifique se o arquivo está no formato correto');
    } finally {
      setIsImporting(false);
      // Limpar input para permitir reimportar o mesmo arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Importar / Exportar</h1>
        <p className="text-muted-foreground mt-1">
          Exporte relatórios ou importe dados em massa via Excel
        </p>
      </motion.div>

      <Tabs defaultValue="export" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="export" className="gap-2">
            <FileDown className="w-4 h-4" />
            Exportar
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-2">
            <FileUp className="w-4 h-4" />
            Importar
          </TabsTrigger>
        </TabsList>

        {/* ---- EXPORTAR ---- */}
        <TabsContent value="export" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  Exportar Relatório
                </CardTitle>
                <CardDescription>
                  Baixe um arquivo Excel com todos os seus dados financeiros
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-primary">{expenses.length}</p>
                    <p className="text-xs text-muted-foreground">Despesas</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-success">{incomes.length}</p>
                    <p className="text-xs text-muted-foreground">Receitas</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-secondary">{goals.length}</p>
                    <p className="text-xs text-muted-foreground">Metas</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-warning">{categories.length}</p>
                    <p className="text-xs text-muted-foreground">Categorias</p>
                  </div>
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>O relatório inclui:</AlertTitle>
                  <AlertDescription>
                    Resumo geral, lista de despesas, receitas, categorias e metas com todos os detalhes.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleExport} 
                  disabled={isExporting}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando relatório...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4" />
                      Baixar Relatório Excel
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ---- IMPORTAR ---- */}
        <TabsContent value="import" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Card: Baixar Modelo */}
            <Card className="glass-card border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-secondary" />
                  1. Baixar Modelo
                </CardTitle>
                <CardDescription>
                  Baixe o modelo de importação com os campos obrigatórios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  onClick={handleDownloadTemplate}
                  className="gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  Baixar Modelo de Importação
                </Button>
              </CardContent>
            </Card>

            {/* Card: Importar Arquivo */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  2. Importar Arquivo
                </CardTitle>
                <CardDescription>
                  Selecione o arquivo Excel preenchido para importar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="default">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Importante</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                      <li>Importe <strong>categorias primeiro</strong> se precisar de novas</li>
                      <li>Despesas precisam de categorias existentes</li>
                      <li>Dados duplicados serão adicionados novamente</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImport}
                  className="hidden"
                  id="import-file"
                />
                
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importando dados...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Selecionar Arquivo Excel
                    </>
                  )}
                </Button>

                {/* Resultado da importação */}
                {importResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    {importResult.success > 0 && (
                      <Alert variant="default" className="border-success/50 bg-success/10">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <AlertTitle className="text-success">Sucesso</AlertTitle>
                        <AlertDescription>
                          {importResult.success} itens importados com sucesso!
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {importResult.errors.length > 0 && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erros ({importResult.errors.length})</AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc list-inside text-sm mt-2 max-h-32 overflow-y-auto">
                            {importResult.errors.map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImportExport;
