import React, { useMemo } from 'react';
import { Transaction, FamilyMember, ThemeColor } from '../types';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  CreditCard, 
  MoreHorizontal,
  Calendar
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { formatDate, getTodayString } from '../utils/dateUtils';

interface Props {
  transactions: Transaction[];
  members: FamilyMember[];
  themeColor: ThemeColor;
}

export const Dashboard: React.FC<Props> = ({ transactions, members, themeColor }) => {
  // --- Cálculos Estatísticos (Memoized) ---
  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    
    // Calculate Total Registered Expenses (for display) and Paid Expenses (for balance)
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const totalExpense = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);
    const paidExpense = expenseTransactions.filter(t => t.isPaid).reduce((acc, t) => acc + t.amount, 0);
    
    const investment = transactions.filter(t => t.type === 'investment').reduce((acc, t) => acc + t.amount, 0);
    
    // Balance only subtracts PAID expenses
    const balance = income - paidExpense - investment;
    
    const today = getTodayString();
    const upcoming = transactions.filter(t => t.type === 'expense' && !t.isPaid && t.dueDate && t.dueDate >= today).length;

    return { income, expense: totalExpense, investment, balance, upcoming };
  }, [transactions]);

  const billsDueIn7Days = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const todayStr = getTodayString();
    const nextWeekStr = nextWeek.toISOString().split('T')[0]; // ISO is fine for comparison here as long as we compare YYYY-MM-DD

    return transactions.filter(t => {
      if (t.type !== 'expense' || t.isPaid || !t.dueDate) return false;
      return t.dueDate >= todayStr && t.dueDate <= nextWeekStr;
    }).length;
  }, [transactions]);

  const topExpenses = useMemo(() => {
    return [...transactions]
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  const categoryData = useMemo(() => {
    const data = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const cat = String(t.category);
        acc[cat] = (acc[cat] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
    
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => Number(b.value) - Number(a.value));
  }, [transactions]);

  // Dynamic Theme Logic
  const getThemeColors = () => {
    switch (themeColor) {
      case 'emerald': return { bg: 'bg-emerald-600', text: 'text-emerald-500', alertBorder: 'border-emerald-500', alertIcon: 'text-emerald-600', alertBg: 'bg-emerald-100', glow: 'bg-emerald-500' };
      case 'blue': return { bg: 'bg-blue-600', text: 'text-blue-500', alertBorder: 'border-blue-500', alertIcon: 'text-blue-600', alertBg: 'bg-blue-100', glow: 'bg-blue-500' };
      case 'rose': return { bg: 'bg-rose-600', text: 'text-rose-500', alertBorder: 'border-rose-500', alertIcon: 'text-rose-600', alertBg: 'bg-rose-100', glow: 'bg-rose-500' };
      case 'violet': return { bg: 'bg-violet-600', text: 'text-violet-500', alertBorder: 'border-violet-500', alertIcon: 'text-violet-600', alertBg: 'bg-violet-100', glow: 'bg-violet-500' };
      case 'slate': return { bg: 'bg-slate-700', text: 'text-slate-500', alertBorder: 'border-slate-500', alertIcon: 'text-slate-600', alertBg: 'bg-slate-200', glow: 'bg-white' };
      case 'amber': 
      default: return { bg: 'bg-amber-500', text: 'text-amber-500', alertBorder: 'border-amber-500', alertIcon: 'text-amber-600', alertBg: 'bg-amber-100', glow: 'bg-amber-500' };
    }
  };
  
  const theme = getThemeColors();

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#ec4899'];

  // --- Formatter Helper ---
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 pb-8">
      
      {/* 1. Notification Banner (Slide In) */}
      {billsDueIn7Days > 0 && (
        <div className="animate-in slide-in-from-top-4 fade-in duration-700">
          <div className={`bg-gradient-to-r from-slate-50 to-white border-l-4 ${theme.alertBorder} rounded-r-xl p-4 shadow-sm flex items-start gap-3`}>
            <div className={`${theme.alertBg} p-2 rounded-full shrink-0`}>
              <AlertCircle size={20} className={theme.alertIcon} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Atenção Necessária</h4>
              <p className="text-sm text-slate-600 mt-1">
                Você possui <strong className={theme.text}>{billsDueIn7Days} contas</strong> vencendo nos próximos 7 dias. Verifique seus pagamentos para evitar juros.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Hero Cards Grid (Staggered Animation) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Balance Card (Main - Span 4/12 or 5/12) */}
        <div className="md:col-span-5 lg:col-span-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="h-full bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-300 transition-transform hover:-translate-y-1 duration-300">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-600 rounded-full blur-[80px] opacity-40"></div>
            <div className={`absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 ${theme.glow} rounded-full blur-[80px] opacity-20`}></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 font-medium text-sm tracking-wider uppercase mb-1">Saldo Familiar Total</p>
                  <h2 className="text-4xl font-extrabold tracking-tight">{formatCurrency(stats.balance)}</h2>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                   <CreditCard className={theme.text === 'text-white' ? 'text-white' : themeColor === 'slate' ? 'text-white' : theme.text} size={24} />
                </div>
              </div>

              <div className="mt-8 space-y-1">
                <div className="flex justify-between items-end text-sm">
                   <span className="text-slate-400">Status</span>
                   <span className={`font-semibold tracking-widest ${themeColor === 'slate' ? 'text-white' : theme.text}`}>PREMIUM</span>
                </div>
                <p className="font-bold text-lg">Todas as Carteiras</p>
              </div>
            </div>
          </div>
        </div>

        {/* Small Summary Cards (Span 8/12 or 7/12) */}
        <div className="md:col-span-7 lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Income */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between animate-in slide-in-from-bottom-4 fade-in duration-500 delay-75 hover:shadow-md transition-all group col-span-1 sm:col-span-1">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition-colors">
                <ArrowUpRight className="text-emerald-500" size={24} />
              </div>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg">+ Receita</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Entradas</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.income)}</p>
            </div>
          </div>

          {/* Expense */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between animate-in slide-in-from-bottom-4 fade-in duration-500 delay-150 hover:shadow-md transition-all group col-span-1 sm:col-span-1">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-50 rounded-2xl group-hover:bg-rose-100 transition-colors">
                <ArrowDownRight className="text-rose-500" size={24} />
              </div>
              <span className="text-xs font-bold bg-rose-50 text-rose-600 px-2 py-1 rounded-lg">- Despesa</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Saídas</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.expense)}</p>
            </div>
          </div>

          {/* Investment */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200 hover:shadow-md transition-all group col-span-2 sm:col-span-1">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                <TrendingUp className="text-indigo-500" size={24} />
              </div>
              <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">Investido</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Patrimônio</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.investment)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        
        {/* Top Expenses List */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Wallet className={theme.text} size={20} />
              Maiores Gastos
            </h3>
            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={20} /></button>
          </div>
          
          <div className="space-y-4 flex-1">
            {topExpenses.length > 0 ? topExpenses.map((t, idx) => (
              <div key={t.id} className="flex items-center justify-between group p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-default">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0 group-hover:bg-white group-hover:${theme.text} group-hover:shadow-sm transition-colors`}>
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-700 truncate">{t.description}</p>
                    <p className="text-xs text-slate-500 font-medium">{t.category}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-800 text-sm whitespace-nowrap">{formatCurrency(t.amount)}</span>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <Wallet size={32} className="mb-2 opacity-20" />
                Nenhuma despesa ainda.
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Bills List */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-500 flex flex-col">
           <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Calendar className="text-rose-500" size={20} />
              Próximas Contas
            </h3>
            {stats.upcoming > 0 && (
              <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {stats.upcoming}
              </span>
            )}
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            {transactions.filter(t => t.type === 'expense' && !t.isPaid).length > 0 ? (
               transactions
                .filter(t => t.type === 'expense' && !t.isPaid)
                .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map(t => {
                  const isLate = t.dueDate && new Date(t.dueDate) < new Date(new Date().setHours(0,0,0,0));
                  return (
                    <div key={t.id} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${isLate ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                      <div className={`p-2 rounded-xl shrink-0 ${isLate ? 'bg-rose-200 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                        <Clock size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm truncate ${isLate ? 'text-rose-700' : 'text-slate-700'}`}>{t.description}</p>
                        <p className={`text-xs font-medium ${isLate ? 'text-rose-500' : 'text-slate-400'}`}>
                          {isLate ? 'Vencida: ' : 'Vence: '} 
                          {t.dueDate ? formatDate(t.dueDate) : 'S/D'}
                        </p>
                      </div>
                      <div className="text-right">
                         <p className="font-bold text-slate-800">{formatCurrency(t.amount)}</p>
                      </div>
                    </div>
                  );
                })
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm py-8">
                <div className="bg-emerald-50 p-4 rounded-full mb-3">
                   <TrendingUp size={24} className="text-emerald-500" />
                </div>
                <p className="text-emerald-600 font-medium">Tudo em dia!</p>
                <p>Nenhuma conta pendente.</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Chart */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-700 flex flex-col">
           <h3 className="font-bold text-slate-800 mb-2 text-lg">Por Categoria</h3>
           <p className="text-slate-400 text-xs mb-6">Distribuição dos seus gastos</p>
           
           <div className="flex-1 min-h-[200px] flex items-center justify-center relative">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      cornerRadius={8}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px', backgroundColor: '#fff'}}
                      formatter={(value: number) => [formatCurrency(value), '']}
                      itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                 <div className="text-center text-slate-400 text-sm">Sem dados</div>
              )}
               {/* Center Text */}
               {categoryData.length > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-slate-800">{Math.round(((categoryData[0]?.value || 0) / stats.expense) * 100) || 0}%</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{categoryData[0]?.name.slice(0,10)}</span>
                </div>
              )}
           </div>

           {/* Custom Legend */}
           <div className="grid grid-cols-2 gap-2 mt-4">
              {categoryData.slice(0, 4).map((c, i) => (
                <div key={c.name} className="flex items-center gap-2 text-xs text-slate-600">
                   <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                   <span className="truncate flex-1">{c.name}</span>
                   <span className="font-bold">{Math.round((c.value / stats.expense) * 100)}%</span>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};