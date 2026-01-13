import { GoogleGenAI } from "@google/genai";
import { AgentConfig } from "../types";

// NOTE: In a production app, do not hardcode keys if possible. 
// This assumes the key is in process.env.API_KEY as per instructions.
const API_KEY = process.env.API_KEY || '';

let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (!aiClient) {
    if (!API_KEY) {
      console.error("API Key is missing. Please set process.env.API_KEY");
      throw new Error("Gemini API Key is missing.");
    }
    aiClient = new GoogleGenAI({ apiKey: API_KEY });
  }
  return aiClient;
};

export const runAgent = async (
  agent: AgentConfig, 
  content: string, 
  isJson: boolean = false
): Promise<string> => {
  const client = getClient();
  
  const config: any = {
    maxOutputTokens: agent.max_tokens,
  };

  if (isJson) {
     config.responseMimeType = "application/json";
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-latest', // Mapping generic names to specific models as per guidance
      contents: [
        { role: 'user', parts: [{ text: agent.system_prompt + "\n\nUser Input:\n" + content }] }
      ],
      config: config
    });
    
    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const runChat = async (
  history: { role: 'user' | 'assistant', content: string }[],
  newMessage: string,
  context: string
): Promise<string> => {
  const client = getClient();
  
  const systemInstruction = "You are an expert regulatory consultant. Answer strictly based on the provided 510(k) content context. If unsure, say so.";
  
  // Prepare history for API
  // Note: The new SDK chat format is handled via `chats.create` usually, 
  // but here we are stateless between calls for simplicity or we can use the chat helper.
  // Let's use the chat helper.
  
  const chat = client.chats.create({
    model: 'gemini-2.5-flash-latest',
    config: {
      systemInstruction: systemInstruction,
    },
    history: [
        {
            role: 'user',
            parts: [{ text: `Here is the context of the 510(k) document you are analyzing:\n\n${context}` }]
        },
        {
            role: 'model',
            parts: [{ text: "Understood. I am ready to answer questions about this 510(k) document." }]
        },
        ...history.map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }]
        }))
    ]
  });

  const response = await chat.sendMessage({ message: newMessage });
  return response.text || "";
};