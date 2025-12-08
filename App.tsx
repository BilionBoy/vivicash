import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Receipt, FileText, Plus, Menu, X, Users, DollarSign, Home, Edit2, Filter, ChevronRight, Wallet as WalletIcon, Settings as SettingsIcon } from 'lucide-react';
import { Transaction, FamilyMember, FinancialState, ThemeColor } from './types';
import { loadState, saveState } from './services/storage';
import { Dashboard } from './components/Dashboard';
import { TransactionModal } from './components/TransactionModal';
import { Reports } from './components/Reports';
import { Wallets } from './components/Wallets';
import { Settings } from './components/Settings';
import { Button } from './components/Button';
import { formatDate } from './utils/dateUtils';

// Dynamic Theme Logo
const VivicashLogo = ({ className = "w-8 h-8", textSize = "text-xl", dark = false, theme = 'amber' }: { className?: string, textSize?: string, dark?: boolean, theme?: ThemeColor }) => {
  const getLogoColors = () => {
     switch(theme) {
        case 'emerald': return { text: dark ? 'text-emerald-400' : 'text-emerald-500', from: 'from-emerald-400', to: 'to-teal-600', shadow: 'shadow-emerald-500/30' };
        case 'blue': return { text: dark ? 'text-blue-400' : 'text-blue-500', from: 'from-blue-400', to: 'to-indigo-600', shadow: 'shadow-blue-500/30' };
        case 'rose': return { text: dark ? 'text-rose-400' : 'text-rose-500', from: 'from-rose-400', to: 'to-pink-600', shadow: 'shadow-rose-500/30' };
        case 'violet': return { text: dark ? 'text-violet-400' : 'text-violet-500', from: 'from-violet-400', to: 'to-purple-600', shadow: 'shadow-violet-500/30' };
        case 'slate': return { text: dark ? 'text-slate-300' : 'text-slate-800', from: 'from-slate-600', to: 'to-slate-900', shadow: 'shadow-slate-500/30' };
        case 'amber': default: return { text: dark ? 'text-amber-400' : 'text-amber-500', from: 'from-amber-400', to: 'to-orange-600', shadow: 'shadow-amber-500/30' };
     }
  }
  const colors = getLogoColors();

  return (
    <div className="flex items-center gap-3">
      <div className={`relative flex items-center justify-center ${colors.text} ${className}`}>
        <div className={`bg-gradient-to-br ${colors.from} ${colors.to} rounded-xl w-full h-full shadow-lg ${colors.shadow} flex items-center justify-center`}>
          <Home className="text-white w-[60%] h-[60%]" strokeWidth={2.5} />
        </div>
      </div>
      <span className={`font-extrabold ${dark ? 'text-white' : 'text-slate-800'} ${textSize} tracking-tight font-sans`}>VIVICASH</span>
    </div>
  );
}

// Main App Component
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'reports' | 'wallets' | 'settings'>('dashboard');
  const [state, setState] = useState<FinancialState>({ transactions: [], members: [], themeColor: 'amber' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filterMemberId, setFilterMemberId] = useState<string>('all');

  // Load data on mount
  useEffect(() => {
    const data = loadState();
    setState(data);
  }, []);

  // Save data on change
  useEffect(() => {
    if (state.members.length > 0) {
      saveState(state);
    }
  }, [state]);

  const handleUpdateTheme = (newTheme: ThemeColor) => {
    setState(prev => ({ ...prev, themeColor: newTheme }));
  };

  const handleSaveTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      // Update existing
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => 
          t.id === editingTransaction.id 
            ? { ...transactionData, id: t.id } 
            : t
        )
      }));
    } else {
      // Create new
      const newTransaction: Transaction = {
        ...transactionData,
        id: crypto.randomUUID(),
      };
      setState(prev => ({ ...prev, transactions: [newTransaction, ...prev.transactions] }));
    }
  };

  const handleUpdateMember = (id: string, updates: Partial<FamilyMember>) => {
    setState(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };

  const handleAddMember = (member: Omit<FamilyMember, 'id' | 'monthlyBudget'>) => {
    const newMember: FamilyMember = {
      ...member,
      id: crypto.randomUUID(),
      monthlyBudget: 0
    };
    setState(prev => ({ ...prev, members: [...prev.members, newMember] }));
  };

  const handleRemoveMember = (id: string) => {
    const hasTransactions = state.transactions.some(t => t.memberId === id);
    if (hasTransactions) {
      alert("Não é possível remover este membro pois ele possui transações registradas. Remova as transações primeiro.");
      return;
    }
    if (confirm("Tem certeza que deseja remover este membro?")) {
      setState(prev => ({ ...prev, members: prev.members.filter(m => m.id !== id) }));
    }
  };

  const deleteTransaction = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      setState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
    }
  };

  const togglePayStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === id ? { ...t, isPaid: !t.isPaid } : t)
    }));
  };

  const openNewTransaction = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const openEditTransaction = (t: Transaction) => {
    setEditingTransaction(t);
    setIsModalOpen(true);
  };

  const filteredTransactions = useMemo(() => {
    if (filterMemberId === 'all') {
      return state.transactions;
    }
    return state.transactions.filter(t => t.memberId === filterMemberId);
  }, [state.transactions, filterMemberId]);

  const navItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'wallets', label: 'Carteiras', icon: WalletIcon },
    { id: 'transactions', label: 'Transações', icon: Receipt },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'settings', label: 'Ajustes', icon: SettingsIcon },
  ];

  // Helper for Sidebar active state gradient based on theme
  const getActiveTabClass = () => {
    switch (state.themeColor) {
      case 'emerald': return 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/20 ring-1 ring-emerald-400/50';
      case 'blue': return 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/20 ring-1 ring-blue-400/50';
      case 'rose': return 'bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/20 ring-1 ring-rose-400/50';
      case 'violet': return 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-violet-500/20 ring-1 ring-violet-400/50';
      case 'slate': return 'bg-gradient-to-r from-slate-600 to-slate-800 shadow-slate-500/20 ring-1 ring-slate-400/50';
      case 'amber': default: return 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-orange-500/20 ring-1 ring-amber-400/50';
    }
  };

  const getHoverTextClass = () => {
    switch (state.themeColor) {
      case 'emerald': return 'group-hover:text-emerald-400';
      case 'blue': return 'group-hover:text-blue-400';
      case 'rose': return 'group-hover:text-rose-400';
      case 'violet': return 'group-hover:text-violet-400';
      case 'slate': return 'group-hover:text-white';
      case 'amber': default: return 'group-hover:text-amber-400';
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 p-4 shadow-md flex justify-between items-center sticky top-0 z-30 border-b border-slate-800">
        <VivicashLogo dark theme={state.themeColor} />
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop for Mobile Sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border-r border-slate-800/50 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static flex flex-col shadow-2xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 hidden md:flex items-center justify-center border-b border-white/5">
          <VivicashLogo className="w-10 h-10" textSize="text-2xl" dark theme={state.themeColor} />
        </div>

        <nav className="p-6 space-y-2 flex-1">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Menu Principal</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium group relative overflow-hidden ${
                  isActive 
                    ? `text-white shadow-lg ${getActiveTabClass()}` 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                }`}
              >
                <Icon size={22} className={isActive ? 'text-white' : `text-slate-500 ${getHoverTextClass()} transition-colors duration-300`} />
                <span className="relative z-10">{item.label}</span>
                {isActive && <ChevronRight size={16} className="ml-auto opacity-70 animate-in slide-in-from-left-2" />}
              </button>
            )
          })}
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/20">
          <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-indigo-500/30">
               {state.members[0]?.name.charAt(0)}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-white truncate">{state.members[0]?.name}</p>
               <p className="text-xs text-slate-400 truncate">Plano Premium</p>
             </div>
             <div className={`w-2 h-2 rounded-full ${state.themeColor === 'emerald' ? 'bg-emerald-400' : 'bg-emerald-500'} animate-pulse`}></div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto pb-24 md:pb-10 relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-slate-200/50 to-transparent -z-10 mix-blend-multiply opacity-50"></div>
        
        {/* Header Actions */}
        <div className="flex justify-between items-end mb-8 md:mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 capitalize tracking-tight">
              {navItems.find(n => n.id === activeTab)?.label}
            </h1>
            <p className="text-slate-500 mt-1 font-medium">Bem-vindo ao VIVICASH.</p>
          </div>
          {activeTab !== 'settings' && (
            <Button onClick={openNewTransaction} className="shadow-xl px-6" colorTheme={state.themeColor}>
              <Plus size={22} className="mr-2" /> Novo Lançamento
            </Button>
          )}
        </div>

        {/* Views */}
        {activeTab === 'dashboard' && (
          <Dashboard transactions={state.transactions} members={state.members} themeColor={state.themeColor} />
        )}

        {activeTab === 'reports' && (
          <Reports transactions={state.transactions} members={state.members} />
        )}

        {activeTab === 'wallets' && (
          <Wallets 
            transactions={state.transactions} 
            members={state.members} 
            onViewDetails={(memberId) => {
              setFilterMemberId(memberId);
              setActiveTab('transactions');
            }}
            onUpdateMember={handleUpdateMember}
            themeColor={state.themeColor}
          />
        )}

        {activeTab === 'settings' && (
          <Settings 
            members={state.members}
            transactions={state.transactions}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            onUpdateTheme={handleUpdateTheme}
            currentTheme={state.themeColor}
          />
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Filter Bar */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm whitespace-nowrap">
                 <Filter size={14} /> Filtros
              </span>
              <button
                onClick={() => setFilterMemberId('all')}
                className={`whitespace-nowrap px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                  filterMemberId === 'all' 
                    ? 'bg-slate-800 text-white shadow-lg shadow-slate-200' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                Todos
              </button>
              {state.members.map(m => (
                <button
                  key={m.id}
                  onClick={() => setFilterMemberId(m.id)}
                  className={`whitespace-nowrap px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                    filterMemberId === m.id 
                      ? 'bg-slate-800 text-white shadow-lg shadow-slate-200' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>

            {filteredTransactions.length === 0 ? (
               <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
                 <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Receipt className="text-slate-300" size={32} />
                 </div>
                 <h3 className="text-lg font-bold text-slate-700 mb-1">Nada por aqui</h3>
                 <p className="text-slate-400 mb-6">
                    {state.transactions.length === 0 
                      ? "Comece adicionando sua primeira transação." 
                      : "Nenhuma transação encontrada para este filtro."}
                 </p>
                 {state.transactions.length === 0 && (
                   <Button onClick={openNewTransaction} variant="secondary">Adicionar agora</Button>
                 )}
               </div>
            ) : (
              <div className="grid gap-3">
              {filteredTransactions.map((t) => (
                <div 
                  key={t.id} 
                  onClick={() => openEditTransaction(t)}
                  className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/50 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center gap-5 relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                      t.type === 'income' ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600' : 
                      t.type === 'investment' ? 'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600' : 
                      'bg-gradient-to-br from-rose-100 to-rose-200 text-rose-600'
                    }`}>
                      {t.type === 'income' ? <Plus size={24} /> : t.type === 'investment' ? <DollarSign size={24} /> : <Receipt size={24} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                         <p className="font-bold text-slate-800 text-base">{t.description}</p>
                         <Edit2 size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500 items-center">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md">{formatDate(t.date)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-slate-600">{t.category}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="flex items-center gap-1">
                          <WalletIcon size={10} className="text-amber-500" /> {state.members.find(m => m.id === t.memberId)?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto relative z-10">
                    <div className="text-right">
                       <p className={`font-extrabold text-lg ${t.type === 'income' ? 'text-emerald-600' : t.type === 'investment' ? 'text-indigo-600' : 'text-slate-800'}`}>
                         {t.type === 'expense' ? '-' : '+'} R$ {t.amount.toFixed(2)}
                       </p>
                       {t.type === 'expense' && (
                         <button 
                          onClick={(e) => togglePayStatus(t.id, e)}
                          className={`mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg transition-all border ${
                            t.isPaid 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100'
                          }`}
                         >
                           {t.isPaid ? 'Pago' : 'Pendente'}
                         </button>
                       )}
                    </div>
                    <button 
                      onClick={(e) => deleteTransaction(t.id, e)} 
                      className="text-slate-300 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 rounded-xl"
                      title="Excluir transação"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Transaction Modal */}
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTransaction}
        members={state.members}
        initialData={editingTransaction}
      />
    </div>
  );
};

export default App;