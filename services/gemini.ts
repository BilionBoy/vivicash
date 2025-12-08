import { GoogleGenAI } from "@google/genai";
import { Transaction, FamilyMember } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getFinancialAdvice = async (transactions: Transaction[], members: FamilyMember[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key não configurada. Por favor, configure a variável de ambiente para usar a IA.";
  }

  // Summarize data to send fewer tokens
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const totalInvested = transactions.filter(t => t.type === 'investment').reduce((acc, t) => acc + t.amount, 0);
  
  const categories = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const prompt = `
    Atue como um consultor financeiro pessoal sênior para uma família.
    Analise os seguintes dados financeiros resumidos:
    
    Receita Total: R$ ${totalIncome.toFixed(2)}
    Despesa Total: R$ ${totalExpense.toFixed(2)}
    Investimentos: R$ ${totalInvested.toFixed(2)}
    
    Gastos por Categoria (Top 5):
    ${Object.entries(categories).sort(([,a], [,b]) => b - a).slice(0, 5).map(([k,v]) => `- ${k}: R$ ${v.toFixed(2)}`).join('\n')}
    
    Forneça 3 conselhos práticos, curtos e diretos para melhorar a saúde financeira desta família. 
    Use formatação Markdown simples (negrito para destaque). Seja empático mas profissional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Não foi possível gerar conselhos no momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ocorreu um erro ao consultar a IA. Tente novamente mais tarde.";
  }
};
