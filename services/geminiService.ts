import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateSmartInsight = async (data: AppState, query: string): Promise<string> => {
  if (!apiKey) return "API Key not configured.";

  try {
    // We strictly limit the data sent to avoid token limits and privacy issues in a real app
    // Here we send a summary
    const summary = {
      totalClients: data.clients.length,
      activeClients: data.clients.filter(c => c.status === 'Active').map(c => c.brandName),
      overdueTasks: data.tasks.filter(t => t.status === 'Delayed').length,
      highPriorityPending: data.tasks.filter(t => t.priority === 'High' && t.status !== 'Done').length,
      monthlyRevenue: data.transactions.filter(t => t.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0),
      recentExpenses: data.transactions.filter(t => t.type === 'Expense').slice(0, 5),
    };

    const prompt = `
      You are an AI assistant for a digital marketing agency called "Web Wonders".
      Here is the current operational snapshot: ${JSON.stringify(summary)}.
      
      User Query: "${query}"
      
      Provide a concise, professional, and actionable insight or answer based on this data. 
      Keep it under 100 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate insights. Please try again later.";
  }
};