import React, { useMemo, useState } from 'react';
import { Transaction, FamilyMember, ThemeColor } from '../types';
import { Wallet, ArrowUpRight, ArrowDownRight, TrendingUp, ShieldCheck, ChevronRight, Target, Check, X } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  members: FamilyMember[];
  onViewDetails: (memberId: string) => void;
  onUpdateMember: (id: string, updates: Partial<FamilyMember>) => void;
  themeColor: ThemeColor;
}

export const Wallets: React.FC<Props> = ({ transactions, members, onViewDetails, onUpdateMember, themeColor }) => {
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [tempBudget, setTempBudget] = useState<string>('');
  
  const walletsData = useMemo(() => {
    return members.map(member => {
      const memberTransactions = transactions.filter(t => t.memberId === member.id);
      
      const income = memberTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

      const expensesPaid = memberTransactions
        .filter(t => t.type === 'expense' && t.isPaid)
        .reduce((acc, t) => acc + t.amount, 0);
        
      const expensesTotal = memberTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

      const investments = memberTransactions
        .filter(t => t.type === 'investment')
        .reduce((acc, t) => acc + t.amount, 0);

      const balance = income - expensesPaid - investments;

      return {
        ...member,
        income,
        expensesPaid,
        expensesTotal,
        investments,
        balance
      };
    });
  }, [transactions, members]);

  const totalFamilyBalance = walletsData.reduce((acc, w) => acc + w.balance, 0);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Helper para gerar gradientes baseados na cor do avatar (que geralmente é uma classe bg-color-500)
  const getGradientClass = (bgClass: string) => {
    if (bgClass.includes('blue')) return 'from-blue-500 to-indigo-600';
    if (bgClass.includes('purple')) return 'from-purple-500 to-violet-600';
    if (bgClass.includes('green') || bgClass.includes('emerald')) return 'from-emerald-500 to-teal-600';
    if (bgClass.includes('rose') || bgClass.includes('red')) return 'from-rose-500 to-pink-600';
    if (bgClass.includes('gray') || bgClass.includes('slate')) return 'from-slate-600 to-slate-800';
    return 'from-amber-500 to-orange-600'; // Default fallback
  };

  const getThemeIconColor = () => {
    switch (themeColor) {
      case 'emerald': return 'text-emerald-400';
      case 'blue': return 'text-blue-400';
      case 'rose': return 'text-rose-400';
      case 'violet': return 'text-violet-400';
      case 'slate': return 'text-white';
      case 'amber': default: return 'text-amber-400';
    }
  }

  const startEditingBudget = (member: FamilyMember, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBudgetId(member.id);
    setTempBudget(member.monthlyBudget ? member.monthlyBudget.toString() : '');
  };

  const saveBudget = (memberId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const val = parseFloat(tempBudget);
    if (!isNaN(val) && val >= 0) {
      onUpdateMember(memberId, { monthlyBudget: val });
    }
    setEditingBudgetId(null);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBudgetId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
           <h2 className="text-3xl font-extrabold text-slate-900">Carteiras Digitais</h2>
           <p className="text-slate-500 mt-1">Visão individualizada do patrimônio de cada membro.</p>
        </div>
        <div className="bg-slate-900 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-xl shadow-slate-200 border border-slate-800">
           <div className="p-2 bg-white/10 rounded-full">
             <ShieldCheck size={24} className={getThemeIconColor()} />
           </div>
           <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Patrimônio Familiar</p>
              <p className="text-2xl font-bold text-white leading-none">{formatCurrency(totalFamilyBalance)}</p>
           </div>
        </div>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {walletsData.map((wallet) => {
          const gradient = getGradientClass(wallet.avatarColor);
          
          // Budget Logic
          const hasBudget = (wallet.monthlyBudget || 0) > 0;
          const budget = wallet.monthlyBudget || 0;
          const percentSpent = hasBudget ? (wallet.expensesTotal / budget) * 100 : 0;
          
          // Color logic for progress bar
          let progressColor = 'bg-emerald-500';
          if (percentSpent > 75) progressColor = 'bg-amber-500';
          if (percentSpent > 95) progressColor = 'bg-rose-500';

          return (
            <div 
              key={wallet.id} 
              onClick={() => onViewDetails(wallet.id)}
              className="group relative bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
            >
              
              {/* Modern Gradient Header */}
              <div className={`relative h-36 bg-gradient-to-br ${gradient} p-6 flex flex-col justify-between overflow-hidden`}>
                 {/* Decorative Blobs */}
                 <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16 transform transition-transform group-hover:scale-110 duration-700"></div>
                 <div className="absolute bottom-0 left-0 w-32 h-32 bg-black opacity-10 rounded-full blur-2xl -ml-10 -mb-10"></div>
                 
                 <div className="relative z-10 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          {wallet.name.charAt(0)}
                       </div>
                       <span className="text-white/90 font-bold tracking-wide text-sm bg-black/10 px-3 py-1 rounded-full backdrop-blur-sm">
                          {wallet.name}
                       </span>
                    </div>
                    
                    {/* Botão de Meta/Orçamento */}
                    <button 
                      onClick={(e) => startEditingBudget(wallet, e)}
                      className="p-2 bg-white/20 rounded-full text-white/80 hover:bg-white hover:text-amber-600 transition-colors backdrop-blur-sm"
                      title="Definir Meta de Gastos"
                    >
                       <Target size={18} />
                    </button>
                 </div>

                 <div className="relative z-10">
                    <p className="text-indigo-100 text-xs font-medium mb-1 opacity-80 uppercase tracking-wider">Saldo Disponível</p>
                    <p className="text-3xl font-extrabold text-white tracking-tight">{formatCurrency(wallet.balance)}</p>
                 </div>
              </div>

              {/* Stats Grid */}
              <div className="p-5 grid grid-cols-2 gap-3">
                 {/* Income */}
                 <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50 flex flex-col justify-between group-hover:bg-emerald-50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
                          <ArrowUpRight size={14} />
                       </div>
                       <span className="text-xs font-bold text-emerald-700">Entradas</span>
                    </div>
                    <p className="text-lg font-bold text-emerald-900 truncate">{formatCurrency(wallet.income)}</p>
                 </div>

                 {/* Expense */}
                 <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100/50 flex flex-col justify-between group-hover:bg-rose-50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="p-1.5 bg-rose-100 rounded-lg text-rose-600">
                          <ArrowDownRight size={14} />
                       </div>
                       <span className="text-xs font-bold text-rose-700">Saídas</span>
                    </div>
                    <p className="text-lg font-bold text-rose-900 truncate">{formatCurrency(wallet.expensesTotal)}</p>
                 </div>
                 
                 {/* Investment (Full Width) */}
                 <div className="col-span-2 bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100/50 flex items-center justify-between group-hover:bg-indigo-50 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                          <TrendingUp size={16} />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-indigo-700">Investimentos</p>
                          <p className="text-xs text-indigo-400">Acumulado</p>
                       </div>
                    </div>
                    <p className="text-lg font-bold text-indigo-900">{formatCurrency(wallet.investments)}</p>
                 </div>
              </div>

              {/* Progress & Action */}
              <div className="px-5 pb-5 mt-auto">
                 {editingBudgetId === wallet.id ? (
                   <div className="mb-4 animate-in fade-in slide-in-from-bottom-2" onClick={(e) => e.stopPropagation()}>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Definir Orçamento Mensal</label>
                      <div className="flex items-center gap-2">
                         <input 
                           type="number" 
                           autoFocus
                           className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                           placeholder="Ex: 2000"
                           value={tempBudget}
                           onChange={(e) => setTempBudget(e.target.value)}
                         />
                         <button onClick={(e) => saveBudget(wallet.id, e)} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"><Check size={16} /></button>
                         <button onClick={cancelEditing} className="p-2 bg-rose-100 text-rose-500 rounded-lg hover:bg-rose-200"><X size={16} /></button>
                      </div>
                   </div>
                 ) : (
                   <>
                     <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                        <span>{hasBudget ? 'Consumo do Orçamento' : 'Sem Meta Definida'}</span>
                        {hasBudget && <span>{Math.round(percentSpent)}%</span>}
                     </div>
                     <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                        {hasBudget ? (
                          <div 
                             className={`h-full rounded-full transition-all duration-1000 ${progressColor}`} 
                             style={{ width: `${Math.min(percentSpent, 100)}%` }}
                          ></div>
                        ) : (
                          <div className="h-full w-full bg-slate-200/50"></div>
                        )}
                     </div>
                     {hasBudget && (
                        <div className="flex justify-between text-[10px] font-medium text-slate-400 mb-4">
                           <span>Gasto: {formatCurrency(wallet.expensesTotal)}</span>
                           <span>Meta: {formatCurrency(budget)}</span>
                        </div>
                     )}
                     {!hasBudget && <div className="mb-4 text-[10px] text-slate-300 italic">Clique no ícone de alvo para definir.</div>}
                   </>
                 )}

                 <button className="w-full py-3.5 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                    Ver Extrato Detalhado
                    <ChevronRight size={16} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                 </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};