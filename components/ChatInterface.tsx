import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { AppState, Palette } from '../types';
import { STRINGS } from '../constants';
import { runChat } from '../services/geminiService';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  palette: Palette;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ state, setState, palette }) => {
  const strings = STRINGS[state.language];
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.chatHistory]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    // Check if we have context
    if (!state.rawInputText) {
        alert("Please upload/paste a document first.");
        return;
    }

    const userMsg = { role: 'user' as const, content: input };
    const newHistory = [...state.chatHistory, userMsg];
    
    setState(s => ({ ...s, chatHistory: newHistory }));
    setInput('');
    setIsLoading(true);

    try {
        // Build context from structured data + summary + raw text snippet
        const context = `
        Device: ${state.structuredJson?.device_name || 'Unknown'}
        Summary: ${state.summaryMarkdown || ''}
        Full Text Snippet: ${state.rawInputText.substring(0, 10000)}...
        `;

        const response = await runChat(newHistory, input, context);
        
        setState(s => ({
            ...s,
            chatHistory: [...newHistory, { role: 'assistant', content: response }]
        }));
    } catch (e) {
        console.error(e);
        setState(s => ({
            ...s,
            chatHistory: [...newHistory, { role: 'assistant', content: "Error: Could not connect to Gemini API. Please check your API key." }]
        }));
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center gap-2">
            <Bot size={18} style={{ color: palette.accent }} />
            <span className="font-semibold text-sm">Regulatory Assistant</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {state.chatHistory.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-10">
                    <p>{strings.chat_placeholder}</p>
                </div>
            )}
            {state.chatHistory.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: palette.accent_soft }}>
                            <Bot size={14} style={{ color: palette.accent }} />
                        </div>
                    )}
                    <div 
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                        ${msg.role === 'user' 
                            ? 'text-white' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}
                        style={{ backgroundColor: msg.role === 'user' ? palette.accent : undefined }}
                    >
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                     {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <User size={14} />
                        </div>
                    )}
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start gap-3">
                     <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: palette.accent_soft }}>
                        <Loader2 size={14} className="animate-spin" style={{ color: palette.accent }} />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2 flex items-center">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce mr-1"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce mr-1 delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                </div>
            )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex gap-2 relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={strings.chat_placeholder}
                    disabled={isLoading}
                    className="flex-1 bg-gray-100 dark:bg-gray-800 border-0 rounded-full px-5 py-3 text-sm focus:ring-2 focus:outline-none"
                    style={{ '--tw-ring-color': palette.accent } as React.CSSProperties}
                />
                <button 
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="p-3 rounded-full text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                    style={{ backgroundColor: palette.accent }}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    </div>
  );
};

export default ChatInterface;