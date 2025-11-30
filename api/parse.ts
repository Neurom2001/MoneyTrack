
import { GoogleGenAI, Type } from "@google/genai";

// Vercel Serverless Function / Next.js API Route Handler
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key not configured' });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    // Define the valid categories from your app to ensure AI maps correctly
    const validCategories = [
      "Food", "Transport", "Shopping", "Health", "Bills/Internet", 
      "Phone Bill", "Gift/Donation", "Work", "Education", "General",
      "Salary", "Bonus", "Business/Sales", "Allowance", "Refund"
    ];

    const systemInstruction = `
      You are a smart expense tracking assistant for a Burmese user.
      Your task is to parse Burmese natural language text into structured JSON data.

      Rules:
      1. Identify one or more transactions in the text.
      2. Extract the 'amount' as an Integer. Convert Burmese numbers (၀-၉) or words (e.g., 'သောင်းခွဲ' -> 15000) to digits.
      3. Extract the 'label' (description). Fix spelling errors if necessary (e.g., 'ပိုက်ဆန်' -> 'Pike San').
      4. Determine the 'type': 'INCOME' or 'EXPENSE'. Default to 'EXPENSE'.
         - Keywords for INCOME: 'လစာ' (Salary), 'ရ' (Received), 'ဝင်ငွေ', 'ပြန်ရ'.
      5. Categorize the transaction into the most appropriate category from this list: ${validCategories.join(', ')}.
         - Example: 'ထမင်း' -> 'Food', 'ကားခ' -> 'Transport', 'ဖုန်း' -> 'Phone Bill'.
         - If unsure, use 'General'.

      Input Example: "မနက်စာစားတာက ၄၅၀၀ ဈေးဝယ်တာက ၅၀၀၀"
      Output JSON: [{"label": "Breakfast", "amount": 4500, "type": "EXPENSE", "category": "Food"}, {"label": "Shopping", "amount": 5000, "type": "EXPENSE", "category": "Shopping"}]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              type: { type: Type.STRING, enum: ["INCOME", "EXPENSE"] },
              category: { type: Type.STRING }
            },
            required: ["label", "amount", "type", "category"]
          }
        }
      },
      contents: [
        {
          text: text
        }
      ]
    });

    // The response is guaranteed to be JSON due to responseSchema
    const parsedData = JSON.parse(response.text || "[]");
    return res.status(200).json({ transactions: parsedData });

  } catch (error: any) {
    console.error('Gemini Parse API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
