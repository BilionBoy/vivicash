import React, { useState } from 'react';
import { FamilyMember, Transaction, ThemeColor } from '../types';
import { Button } from './Button';
import { Trash2, Plus, UserPlus, Palette, Check } from 'lucide-react';
import { generateUUID } from '../utils/dateUtils';

interface Props {
  members: FamilyMember[];
  transactions: Transaction[];
  onAddMember: (member: Omit<FamilyMember, 'id' | 'monthlyBudget'>) => void;
  onRemoveMember: (id: string) => void;
  onUpdateTheme: (theme: ThemeColor) => void;
  currentTheme: ThemeColor;
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-rose-500',
  'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500', 'bg-emerald-500',
  'bg-teal-500', 'bg-cyan-500', 'bg-slate-500', 'bg-zinc-800'
];

const THEMES: { id: ThemeColor, name: string, colorClass: string }[] = [
  { id: 'amber', name: 'Dourado (Padrão)', colorClass: 'bg-amber-500' },
  { id: 'emerald', name: 'Esmeralda', colorClass: 'bg-emerald-500' },
  { id: 'blue', name: 'Azul Real', colorClass: 'bg-blue-500' },
  { id: 'rose', name: 'Rosa Vibrante', colorClass: 'bg-rose-500' },
  { id: 'violet', name: 'Violeta', colorClass: 'bg-violet-500' },
  { id: 'slate', name: 'Escuro', colorClass: 'bg-slate-800' },
];

export const Settings: React.FC<Props> = ({ members, transactions, onAddMember, onRemoveMember, onUpdateTheme, currentTheme }) => {
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);

  const handleAdd = () => {
    if (!newMemberName.trim()) return;
    onAddMember({ name: newMemberName, avatarColor: selectedColor });
    setNewMemberName('');
    setSelectedColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
  };

  const getTransactionCount = (memberId: string) => {
    return transactions.filter(t => t.memberId === memberId).length;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900">Ajustes do Sistema</h2>
        <p className="text-slate-500 mt-1">Gerencie membros da família e personalize o aplicativo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Aparência (Personalização) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 h-full">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Palette size={20} />
              </div>
              Aparência do VIVICASH
            </h3>
            
            <p className="text-sm text-slate-500 mb-4 font-medium">Escolha a cor principal do sistema:</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onUpdateTheme(theme.id)}
                  className={`relative p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${currentTheme === theme.id ? 'border-slate-400 bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className={`w-8 h-8 rounded-full ${theme.colorClass} shadow-sm`}></div>
                  <span className={`text-xs font-bold ${currentTheme === theme.id ? 'text-slate-800' : 'text-slate-500'}`}>{theme.name}</span>
                  {currentTheme === theme.id && (
                    <div className="absolute top-2 right-2 text-emerald-500">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
               <p className="text-xs text-slate-500 leading-relaxed text-center">
                 A cor selecionada será aplicada aos botões principais, cards de destaque e elementos de navegação do aplicativo.
               </p>
            </div>
          </div>
        </div>

        {/* Gestão de Membros */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <UserPlus size={20} />
              </div>
              Gerenciar Membros
            </h3>

            {/* Adicionar Novo */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Adicionar Nova Carteira</label>
              <div className="space-y-4">
                <input 
                  type="text" 
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Nome do membro (ex: Avós)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                />
                
                <div>
                  <p className="text-xs text-slate-400 mb-2 font-semibold">Escolha uma cor</p>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full transition-transform ${color} ${selectedColor === color ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'hover:scale-105'}`}
                      />
                    ))}
                  </div>
                </div>

                <Button onClick={handleAdd} disabled={!newMemberName.trim()} className="w-full" colorTheme={currentTheme}>
                  <Plus size={18} className="mr-2" /> Adicionar Membro
                </Button>
              </div>
            </div>

            {/* Lista Existente */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Membros Ativos</label>
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${member.avatarColor} flex items-center justify-center text-white font-bold`}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{member.name}</p>
                      <p className="text-xs text-slate-400">{getTransactionCount(member.id)} transações</p>
                    </div>
                  </div>
                  
                  {members.length > 1 && (
                    <button 
                      onClick={() => onRemoveMember(member.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remover membro"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};