import { GoogleGenAI } from "@google/genai";
import { Transaction, TransactionType } from "../types";

// Initialize the Google GenAI client with the API key from process.env
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFinances = async (transactions: Transaction[]): Promise<string> => {
  if (transactions.length === 0) {
    return "စာရင်းအချက်အလက်များ မရှိသေးပါ။";
  }

  // Calculate basics to help the AI
  const income = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const expense = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Serialize the data for the prompt
  const dataSummary = JSON.stringify(transactions.map(t => ({
    date: t.date,
    type: t.type,
    amount: t.amount,
    label: t.label
  })));

  const prompt = `
    You are a helpful Burmese financial assistant. 
    Analyze the following monthly transaction data formatted in JSON:
    ${dataSummary}

    Total Income: ${income}
    Total Expense: ${expense}

    Please provide a short, friendly summary and advice in the Burmese language (Myanmar Unicode).
    1. Summarize the spending.
    2. Point out the largest expenses.
    3. Give a short advice on saving if expenses are high.
    
    Keep the tone encouraging and polite. Use plain text suitable for rendering in a React component.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "အချက်အလက်များကို ဆန်းစစ်၍မရနိုင်ပါ။";
  } catch (error) {
    console.error("Error analyzing finances:", error);
    return "Gemini AI နှင့် ချိတ်ဆက်ရာတွင် အမှားအယွင်းရှိနေပါသည်။";
  }
};