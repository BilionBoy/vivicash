import React, { useMemo } from 'react';
import { Transaction, FamilyMember } from '../types';
import { Button } from './Button';
import { FileDown, Users, TrendingUp, BarChart3, AlertCircle, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Cell, Brush } from 'recharts';
import { formatDate } from '../utils/dateUtils';

interface Props {
  transactions: Transaction[];
  members: FamilyMember[];
}

export const Reports: React.FC<Props> = ({ transactions, members }) => {
  
  const monthlyData = useMemo(() => {
    const history = transactions.reduce((acc, t) => {
      // Create key from string directly to avoid timezone issues
      // t.date format is YYYY-MM-DD
      const parts = t.date.split('-');
      const key = `${parts[0]}-${parts[1]}`;
      
      if (!acc[key]) {
        acc[key] = { date: key, Receitas: 0, Despesas: 0 };
      }

      if (t.type === 'income') {
        acc[key].Receitas += t.amount;
      } else if (t.type === 'expense') {
        acc[key].Despesas += t.amount;
      }
      
      return acc;
    }, {} as Record<string, { date: string, Receitas: number, Despesas: number }>);

    return (Object.values(history) as { date: string, Receitas: number, Despesas: number }[])
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => {
        const [year, month] = item.date.split('-');
        // Construct display date safely
        const dateObj = new Date(parseInt(year), parseInt(month) - 1);
        const displayDate = dateObj.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        return {
          name: displayDate,
          Receitas: item.Receitas,
          Despesas: item.Despesas
        };
      });
  }, [transactions]);

  const memberData = useMemo(() => {
    return members.map(m => {
      const totalSpent = transactions
        .filter(t => t.memberId === m.id && t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);
      return { name: m.name, gastos: totalSpent };
    }).sort((a, b) => b.gastos - a.gastos); 
  }, [members, transactions]);

  const unpaidExpenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense' && !t.isPaid)
      .sort((a, b) => {
        // Safe string comparison for YYYY-MM-DD works
        const dateA = a.dueDate || a.date;
        const dateB = b.dueDate || b.date;
        return dateA.localeCompare(dateB);
      });
  }, [transactions]);

  // Vibrant Palette
  const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#f43f5e', '#10b981', '#ec4899'];

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header styling - Updated to Indigo (Midnight Blue)
    doc.setFillColor(30, 27, 75); // Indigo 950
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(26);
    doc.setTextColor(251, 191, 36); // Amber 400
    doc.setFont("helvetica", "bold");
    doc.text("VIVICASH", 14, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(199, 210, 254); // Indigo 200
    doc.setFont("helvetica", "normal");
    doc.text(`Relatório Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 150, 25);
    
    // Summary Box
    const income = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
    const paidExpense = transactions.filter(t => t.type === 'expense' && t.isPaid).reduce((a, b) => a + b.amount, 0);
    const balance = income - paidExpense; // Cash balance (excluding unpaid bills)

    doc.setFillColor(248, 250, 252); // Slate 50
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.roundedRect(14, 50, 180, 35, 3, 3, 'FD');

    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85); // Slate 700
    doc.text(`Receitas Totais:`, 20, 65);
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text(`R$ ${income.toFixed(2)}`, 60, 65);

    doc.setTextColor(51, 65, 85);
    doc.text(`Despesas Totais:`, 20, 75);
    doc.setTextColor(244, 63, 94); // Rose
    doc.text(`R$ ${expense.toFixed(2)}`, 60, 75);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 27, 75); // Indigo 950
    doc.text(`Saldo Final (Caixa):`, 120, 70);
    doc.text(`R$ ${balance.toFixed(2)}`, 165, 70); // Adjusted x position for longer label
    
    let yPos = 100;
    
    // Unpaid Bills
    if (unpaidExpenses.length > 0) {
      doc.setFillColor(254, 242, 242); // Rose 50
      doc.rect(14, yPos - 5, 182, 10, 'F');
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(190, 18, 60); // Rose 700
      doc.text("CONTAS PENDENTES", 16, yPos + 2);
      
      yPos += 15;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0);

      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(14, yPos - 5, 182, 8, 'F');
      doc.setFont("helvetica", "bold");
      doc.text("Vencimento", 16, yPos);
      doc.text("Descrição", 50, yPos);
      doc.text("Valor", 170, yPos);
      yPos += 8;

      doc.setFont("helvetica", "normal");
      unpaidExpenses.forEach((t) => {
        if (yPos > 280) { doc.addPage(); yPos = 20; }
        const dueDateStr = formatDate(t.dueDate || '');
        doc.text(dueDateStr, 16, yPos);
        doc.text(t.description.substring(0, 40), 50, yPos);
        doc.text(`R$ ${t.amount.toFixed(2)}`, 170, yPos);
        
        // Line
        doc.setDrawColor(241, 245, 249);
        doc.line(14, yPos + 2, 196, yPos + 2);
        yPos += 8;
      });
      yPos += 15;
    }

    // Recent Transactions
    if (yPos > 260) { doc.addPage(); yPos = 20; }
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.rect(14, yPos - 5, 182, 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 27, 75); // Indigo 950
    doc.text("ÚLTIMOS LANÇAMENTOS", 16, yPos + 2);
    
    yPos += 15;
    // Sort safely using strings
    const recent = [...transactions].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    recent.forEach((t) => {
      if (yPos > 280) { doc.addPage(); yPos = 20; }
      const dateStr = formatDate(t.date);
      const amountStr = `R$ ${t.amount.toFixed(2)}`;
      
      doc.text(dateStr, 16, yPos);
      doc.text(t.description.substring(0, 35), 45, yPos);
      doc.text(t.category, 110, yPos);
      
      if (t.type === 'income') doc.setTextColor(16, 185, 129);
      else if (t.type === 'expense') doc.setTextColor(244, 63, 94);
      else doc.setTextColor(59, 130, 246);
      
      doc.text(amountStr, 170, yPos);
      doc.setTextColor(0); // Reset
      
      doc.setDrawColor(248, 250, 252);
      doc.line(14, yPos + 2, 196, yPos + 2);
      
      yPos += 8;
    });

    doc.save("relatorio_vivicash.pdf");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Relatórios Detalhados</h2>
          <p className="text-slate-500 mt-1">Visualize o desempenho financeiro da família com clareza.</p>
        </div>
        <Button onClick={generatePDF} variant="secondary" className="shadow-lg shadow-slate-200">
          <FileDown size={18} className="mr-2" /> Exportar PDF
        </Button>
      </div>

      {/* Tabela de Contas a Pagar */}
      <div className="bg-gradient-to-br from-[#fef2f2] to-[#fff1f2] rounded-3xl shadow-sm border border-rose-100 overflow-hidden backdrop-blur-sm">
        <div className="p-5 bg-white/40 border-b border-rose-100 flex items-center justify-between">
          <h3 className="font-bold text-rose-700 flex items-center gap-2 text-lg">
            <AlertCircle size={22} /> Contas a Pagar
          </h3>
          <span className="text-sm font-bold bg-white text-rose-600 px-3 py-1.5 rounded-xl border border-rose-100 shadow-sm">
            Total: R$ {unpaidExpenses.reduce((acc, t) => acc + t.amount, 0).toFixed(2)}
          </span>
        </div>
        
        {unpaidExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-rose-50/30">
                <tr>
                  <th className="px-6 py-4 font-bold">Vencimento</th>
                  <th className="px-6 py-4 font-bold">Descrição</th>
                  <th className="px-6 py-4 font-bold">Categoria</th>
                  <th className="px-6 py-4 font-bold">Membro</th>
                  <th className="px-6 py-4 font-bold text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {unpaidExpenses.map((t) => (
                  <tr key={t.id} className="hover:bg-rose-50/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-rose-600 whitespace-nowrap">
                      {formatDate(t.dueDate || '')}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{t.description}</td>
                    <td className="px-6 py-4 text-slate-500">
                       <span className="bg-slate-100 px-2 py-1 rounded-md text-xs font-bold uppercase">{t.category}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {members.find(m => m.id === t.memberId)?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      R$ {t.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
             <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-emerald-500" />
             </div>
             <p className="font-medium text-slate-600">Parabéns! Tudo em dia.</p>
             <p className="text-sm">Nenhuma conta pendente no momento.</p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Gráfico de Evolução Mensal */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800">
             <div className="p-2 bg-slate-100 rounded-lg">
               <BarChart3 size={20} className="text-slate-600" /> 
             </div>
             Evolução Mensal
          </h3>
          <div className="h-80 w-full">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 11}} 
                    tickFormatter={(value) => `${value/1000}k`}
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px'}}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, '']}
                  />
                  <Legend verticalAlign="top" iconType="circle" wrapperStyle={{paddingBottom: '24px', fontSize: '13px', fontWeight: 600}} />
                  <Brush 
                    dataKey="name" 
                    height={30} 
                    stroke="#fbbf24" 
                    fill="#fffbeb"
                    tickFormatter={() => ''}
                  />
                  <Bar name="Receitas" dataKey="Receitas" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                  <Bar name="Despesas" dataKey="Despesas" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 text-sm flex-col gap-2">
                <BarChart3 size={40} className="opacity-20" />
                Sem dados suficientes.
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de Gastos por Membro */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800">
             <div className="p-2 bg-slate-100 rounded-lg">
                <Users size={20} className="text-slate-600" /> 
             </div>
             Gastos por Membro
          </h3>
          <div className="h-80 w-full">
            {memberData.some(m => m.gastos > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memberData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                   <XAxis type="number" hide />
                   <YAxis 
                     type="category" 
                     dataKey="name" 
                     width={80} 
                     tick={{fontSize: 13, fill: '#475569', fontWeight: 600}} 
                     axisLine={false} 
                     tickLine={false}
                   />
                   <Tooltip 
                    cursor={{fill: '#fefce8'}} 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px'}}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Gastos']} 
                   />
                   <Bar dataKey="gastos" radius={[0, 8, 8, 0]} barSize={32}>
                      {memberData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                   </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 text-sm flex-col gap-2">
                <Users size={40} className="opacity-20" />
                Sem gastos registrados.
              </div>
            )}
          </div>
        </div>
      </div>

       <div className="bg-gradient-to-r from-[#1e1b4b] to-[#2c2875] text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
          <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm">
             <TrendingUp className="text-[#fbbf24] w-8 h-8" /> 
          </div>
          <div>
            <h3 className="font-bold text-2xl mb-2 text-[#ffffff]">Dica VIVICASH</h3>
            <p className="text-[#a8b0cc] leading-relaxed max-w-2xl text-lg">
              A consistência é a chave. Registre seus gastos diariamente para que nossa Inteligência Artificial possa oferecer insights cada vez mais precisos sobre sua saúde financeira.
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 opacity-10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500 opacity-10 rounded-full -ml-10 -mb-10 blur-3xl"></div>
      </div>
    </div>
  );
};