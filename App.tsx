import React, { useEffect, useRef, useState } from 'react';
import { loadState, saveState, clearState } from './services/storage';
import type { FinancialState, Transaction, FamilyMember, ThemeColor } from './types';

import { Dashboard } from './components/Dashboard';
import { Wallets } from './components/Wallets';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { TransactionModal } from './components/TransactionModal';
import { Button } from './components/Button';

/** Simple logo placeholder (kept minimal) */
const VivicashLogo = ({ className = "w-8 h-8", textSize = "text-xl", dark = false, theme = 'amber' }: { className?: string, textSize?: string, dark?: boolean, theme?: ThemeColor }) => {
  return (
    <div className={`${className} flex items-center justify-center`} aria-hidden>
      <span style={{ fontSize: 18 }} role="img" aria-label="logo">🏡</span>
    </div>
  );
};

type TabType = 'dashboard' | 'transactions' | 'reports' | 'wallets' | 'settings';

const App: React.FC = () => {
  // load persisted state once on init
  const [state, setState] = useState<FinancialState>(() => loadState());
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // editing transaction (for edit flow)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // debounce save
  const saveTimeout = useRef<number | null>(null);

  useEffect(() => {
    // whenever state changes, debounce save to localStorage
    if (saveTimeout.current) {
      window.clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = window.setTimeout(() => {
      saveState(state);
      saveTimeout.current = null;
    }, 500);

    return () => {
      if (saveTimeout.current) {
        window.clearTimeout(saveTimeout.current);
        saveTimeout.current = null;
      }
    };
  }, [state]);

  // flush on unload to ensure latest state persisted
  useEffect(() => {
    const handler = () => {
      // clear debounce and save synchronously
      if (saveTimeout.current) {
        window.clearTimeout(saveTimeout.current);
        saveTimeout.current = null;
      }
      try {
        // final synchronous save
        saveState(state);
      } catch {
        // ignore
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state]);

  // helper actions that update state and therefore persist
  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const id = (crypto && (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2, 9));
    setState(prev => ({ ...prev, transactions: [{ id, ...t }, ...prev.transactions] }));
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(tx => tx.id === id ? { ...tx, ...updates } : tx)
    }));
  };

  const deleteTransaction = (id: string) => {
    setState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
  };

  const updateMember = (id: string, updates: Partial<FamilyMember>) => {
    setState(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === id ? { ...m, ...updates } : m),
    }));
  };

  const addMember = (member: Omit<FamilyMember, 'id' | 'monthlyBudget'>) => {
    const id = (crypto && (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2, 9));
    setState(prev => ({ ...prev, members: [...prev.members, { id, ...member, monthlyBudget: 0 }] }));
  };

  const removeMember = (id: string) => {
    // remove member and related transactions
    setState(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== id),
      transactions: prev.transactions.filter(t => t.memberId !== id),
    }));
  };

  const setTheme = (theme: ThemeColor) => {
    setState(prev => ({ ...prev, themeColor: theme }));
  };

  const handleClearData = () => {
    clearState();
    setState(loadState());
  };

  // open modal to create new transaction
  const handleOpenNew = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  // open modal to edit existing transaction
  const handleEditTransaction = (txId: string) => {
    const tx = state.transactions.find(t => t.id === txId) || null;
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleSaveFromModal = (payload: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      // update existing
      updateTransaction(editingTransaction.id, payload as Partial<Transaction>);
    } else {
      addTransaction(payload);
    }
  };

  const handleViewDetails = (memberId: string) => {
    // navigate to wallets or transactions; keep simple: go to wallets and highlight member via sidebar (not implemented)
    setActiveTab('wallets');
    // optional: could open detail modal — for now just navigate
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="p-4 flex items-center gap-4 border-b">
        <VivicashLogo />
        <h1 className="text-lg font-bold">VIVICASH</h1>

        <nav className="ml-6 flex items-center gap-2">
          <button className={`px-3 py-1 rounded ${activeTab === 'dashboard' ? 'bg-amber-400 text-white' : 'bg-transparent text-slate-600'}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={`px-3 py-1 rounded ${activeTab === 'wallets' ? 'bg-amber-400 text-white' : 'bg-transparent text-slate-600'}`} onClick={() => setActiveTab('wallets')}>Carteiras</button>
          <button className={`px-3 py-1 rounded ${activeTab === 'transactions' ? 'bg-amber-400 text-white' : 'bg-transparent text-slate-600'}`} onClick={() => setActiveTab('transactions')}>Lançamentos</button>
          <button className={`px-3 py-1 rounded ${activeTab === 'reports' ? 'bg-amber-400 text-white' : 'bg-transparent text-slate-600'}`} onClick={() => setActiveTab('reports')}>Relatórios</button>
          <button className={`px-3 py-1 rounded ${activeTab === 'settings' ? 'bg-amber-400 text-white' : 'bg-transparent text-slate-600'}`} onClick={() => setActiveTab('settings')}>Ajustes</button>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button onClick={handleOpenNew} colorTheme={state.themeColor}>Nova Transação</Button>
          <button className="px-3 py-1 rounded bg-slate-200" onClick={handleClearData}>Limpar Dados</button>
        </div>
      </header>

      <main className="p-4">
        {activeTab === 'dashboard' && (
          <Dashboard transactions={state.transactions} members={state.members} themeColor={state.themeColor} />
        )}

        {activeTab === 'wallets' && (
          <Wallets
            transactions={state.transactions}
            members={state.members}
            onViewDetails={handleViewDetails}
            onUpdateMember={updateMember}
            themeColor={state.themeColor}
          />
        )}

        {activeTab === 'transactions' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Lançamentos</h2>
              <div className="flex gap-2">
                <Button onClick={handleOpenNew} colorTheme={state.themeColor}>Novo</Button>
              </div>
            </div>

            <div className="space-y-2">
              {state.transactions.length === 0 ? (
                <div className="p-6 bg-white rounded shadow text-slate-400">Nenhum lançamento ainda.</div>
              ) : (
                state.transactions.map(tx => (
                  <div key={tx.id} className="p-4 bg-white rounded-lg shadow-sm flex justify-between items-center">
                    <div>
                      <div className="font-bold">{tx.description}</div>
                      <div className="text-xs text-slate-400">{tx.category} • {tx.date} • {state.members.find(m => m.id === tx.memberId)?.name || '—'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}</div>
                      <button onClick={() => { setEditingTransaction(tx); setIsModalOpen(true); }} className="text-slate-500 px-2 py-1 rounded hover:bg-slate-50">Editar</button>
                      <button onClick={() => deleteTransaction(tx.id)} className="text-rose-500 px-2 py-1 rounded hover:bg-rose-50">Remover</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <Reports transactions={state.transactions} members={state.members} />
        )}

        {activeTab === 'settings' && (
          <Settings
            members={state.members}
            transactions={state.transactions}
            onAddMember={m => addMember(m)}
            onRemoveMember={removeMember}
            onUpdateTheme={setTheme}
            currentTheme={state.themeColor}
          />
        )}
      </main>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }}
        onSave={handleSaveFromModal}
        members={state.members}
        initialData={editingTransaction}
      />
    </div>
  );
};

export default App;