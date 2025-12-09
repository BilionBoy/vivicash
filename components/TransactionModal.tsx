import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Category, FamilyMember } from '../types';
import { X, Calendar, DollarSign, Tag, User, Clock, ArrowDownCircle, ArrowUpCircle, TrendingUp, Check, AlertCircle, Wallet } from 'lucide-react';
import { getTodayString } from '../utils/dateUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (t: Omit<Transaction, 'id'>) => void;
  members: FamilyMember[];
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<Props> = ({ isOpen, onClose, onSave, members, initialData }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(Category.FOOD);
  const [date, setDate] = useState(getTodayString());
  const [dueDate, setDueDate] = useState(getTodayString());
  const [memberId, setMemberId] = useState('');
  const [isPaid, setIsPaid] = useState(true);

  // Reset or Sync logic
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit Mode
        setType(initialData.type);
        setAmount(initialData.amount.toString());
        setDescription(initialData.description);
        setCategory(initialData.category);
        setDate(initialData.date.split('T')[0]);
        setDueDate(initialData.dueDate ? initialData.dueDate.split('T')[0] : getTodayString());
        setMemberId(initialData.memberId);
        setIsPaid(initialData.isPaid);
      } else {
        // Create Mode
        setType('expense');
        setAmount('');
        setDescription('');
        setCategory(Category.FOOD);
        const today = getTodayString();
        setDate(today);
        setDueDate(today);
        setMemberId(members[0]?.id || '');
        setIsPaid(true);
      }
    }
  }, [isOpen, initialData, members]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount))) return;

    onSave({
      type,
      amount: parseFloat(amount),
      description: description || (type === 'expense' ? 'Despesa' : type === 'income' ? 'Receita' : 'Investimento'),
      category,
      date,
      memberId: memberId || members[0]?.id || '1',
      isPaid,
      dueDate: type === 'expense' && !isPaid ? dueDate : undefined
    });
    
    if (!initialData) {
        setAmount('');
        setDescription('');
    }
    onClose();
  };

  // Helper para cores baseadas no tipo
  const getTypeColor = (t: TransactionType) => {
    switch (t) {
      case 'income': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'expense': return 'text-red-600 bg-red-50 border-red-200';
      case 'investment': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center sm:p-4">
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-lg md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
        
        {/* Header Compacto */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            {initialData ? <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"/> : null}
            {initialData ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Type Selector (Segmented Control) */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-2xl">
            {(['expense', 'income', 'investment'] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`
                  relative flex flex-col items-center justify-center py-3 rounded-xl text-xs font-bold transition-all duration-200
                  ${type === t ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
                `}
              >
                {t === 'expense' && <ArrowDownCircle size={20} className={`mb-1 ${type === t ? 'text-red-500' : 'text-gray-400'}`} />}
                {t === 'income' && <ArrowUpCircle size={20} className={`mb-1 ${type === t ? 'text-emerald-500' : 'text-gray-400'}`} />}
                {t === 'investment' && <TrendingUp size={20} className={`mb-1 ${type === t ? 'text-blue-500' : 'text-gray-400'}`} />}
                <span className="capitalize">{t === 'income' ? 'Receita' : t === 'expense' ? 'Despesa' : 'Investimento'}</span>
              </button>
            ))}
          </div>

          {/* Amount Input (Hero) */}
          <div className="flex flex-col items-center justify-center py-2">
             <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Valor da Transação</label>
             <div className="relative group w-full max-w-[240px]">
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-medium ${amount ? 'text-gray-800' : 'text-gray-300'}`}>R$</span>
                <input
                  required
                  autoFocus={!initialData}
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full text-center text-5xl font-bold bg-transparent border-b-2 border-gray-100 focus:border-amber-500 outline-none text-gray-900 placeholder-gray-200 pb-2 transition-colors"
                />
             </div>
          </div>

          <div className="space-y-4">
            {/* Description */}
            <div className="group">
              <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Descrição</label>
              <input
                required
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Supermercado, Salário..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium"
              />
            </div>

            {/* Grid for Details */}
            <div className="grid grid-cols-2 gap-4">
               {/* Category */}
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Categoria</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-3.5 text-gray-400" size={16} />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full pl-9 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none appearance-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    >
                      {Object.values(Category).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-4 pointer-events-none">
                      <div className="bg-gray-400 h-1 w-1 rounded-full mb-0.5"></div>
                      <div className="bg-gray-400 h-1 w-1 rounded-full"></div>
                    </div>
                  </div>
               </div>

               {/* Date */}
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Data</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 text-gray-400" size={16} />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-2 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
               </div>
            </div>

            {/* Member / Wallet Selection */}
            <div>
               <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Carteira (Membro)</label>
               <div className="relative">
                 <Wallet className="absolute left-3 top-3.5 text-gray-400" size={16} />
                 <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full pl-9 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none appearance-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-4 pointer-events-none">
                   <div className="bg-gray-400 h-1 w-1 rounded-full mb-0.5"></div>
                   <div className="bg-gray-400 h-1 w-1 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Expense Specifics (Paid/Due Date) */}
            {type === 'expense' && (
              <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100/50 space-y-4 animate-in slide-in-from-top-2 duration-300">
                
                {/* Custom Toggle for Paid Status */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">Status do Pagamento</span>
                    <span className="text-xs text-gray-500">{isPaid ? 'Debitar da Carteira agora' : 'Agendar para depois'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPaid(!isPaid)}
                    className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${isPaid ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${isPaid ? 'translate-x-6' : 'translate-x-0'}`}
                    >
                      {isPaid ? <Check size={14} className="text-emerald-500" /> : <Clock size={14} className="text-gray-400" />}
                    </span>
                  </button>
                </div>

                {/* Due Date Field - Only appears if NOT paid */}
                {!isPaid && (
                  <div className="animate-in slide-in-from-top-4 fade-in pt-2 border-t border-red-100/50">
                     <label className="block text-xs font-semibold text-red-600 mb-1 ml-1 flex items-center gap-1">
                        <AlertCircle size={12} /> Data de Vencimento
                     </label>
                     <div className="relative">
                      <Clock className="absolute left-3 top-3.5 text-red-400" size={16} />
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full pl-9 pr-2 py-3 bg-white border border-red-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 shadow-sm transition-all text-red-700"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <button 
            onClick={handleSubmit}
            className="w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-amber-200 active:scale-[0.98] transition-all bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 flex items-center justify-center gap-2"
          >
             {initialData ? 'Atualizar Lançamento' : 'Salvar Lançamento'}
             {!initialData && <Check size={20} strokeWidth={3} />}
          </button>
        </div>
      </div>
    </div>
  );
};