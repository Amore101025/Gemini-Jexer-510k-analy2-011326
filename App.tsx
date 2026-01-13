import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import { runAgent } from './services/geminiService';
import { PAINTER_PALETTES, STRINGS, DEFAULT_AGENTS } from './constants';
import { AppState, Structured510k, DocumentSnapshot } from './types';
import { UploadCloud, Play, FileText, CheckCircle } from 'lucide-react';

// Default initial state
const initialState: AppState = {
  themeMode: 'light',
  language: 'en',
  painterStyleIndex: 0,
  fontScale: 1.0,
  density: 'comfortable',
  rawInputText: '',
  structuredJson: null,
  summaryMarkdown: null,
  infographicsLayout: null,
  chatHistory: [],
  pipelineStatus: {
    inputReady: false,
    parsing: false,
    dashboard: false,
    chat: false,
  },
  documents: [],
  currentDocIndex: null,
};

function App() {
  const [state, setState] = useState<AppState>(initialState);
  const [activeTab, setActiveTab] = useState<'landing' | 'dashboard' | 'pipeline'>('landing');

  const palette = PAINTER_PALETTES[state.painterStyleIndex];
  const strings = STRINGS[state.language];

  // Pipeline Runner
  const runPipeline = async () => {
    if (!state.rawInputText.trim()) return;

    setState(s => ({ 
        ...s, 
        pipelineStatus: { ...s.pipelineStatus, parsing: true },
        structuredJson: null,
        summaryMarkdown: null 
    }));
    setActiveTab('dashboard');

    try {
        // Step 1: Structure Extraction
        const structuredStr = await runAgent(DEFAULT_AGENTS[0], state.rawInputText, true);
        let structuredJson: Structured510k = {};
        try {
            structuredJson = JSON.parse(structuredStr);
        } catch (e) {
            console.warn("JSON parsing failed, trying raw text fallback");
        }

        setState(s => ({ ...s, structuredJson }));

        // Step 2: Summary Generation
        const summary = await runAgent(DEFAULT_AGENTS[1], state.rawInputText, false);
        
        setState(s => ({ 
            ...s, 
            summaryMarkdown: summary,
            pipelineStatus: { 
                inputReady: true, 
                parsing: false, 
                dashboard: true, 
                chat: true 
            }
        }));

        // Auto-save snapshot
        saveSnapshot(structuredJson, summary);

    } catch (error) {
        console.error("Pipeline failed", error);
        alert("Pipeline failed. Check API Key configuration.");
        setState(s => ({ ...s, pipelineStatus: { ...s.pipelineStatus, parsing: false } }));
    }
  };

  const saveSnapshot = (structured: any, summary: string) => {
    const newDoc: DocumentSnapshot = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        label: structured?.device_name || "Untitled 510(k)",
        raw_text: state.rawInputText,
        structured_json: structured,
        summary_markdown: summary,
        infographics_layout: null,
        chat_history: []
    };
    setState(s => ({
        ...s,
        documents: [...s.documents, newDoc],
        currentDocIndex: s.documents.length 
    }));
  };

  const loadSnapshot = (index: number) => {
      const doc = state.documents[index];
      if (doc) {
          setState(s => ({
              ...s,
              rawInputText: doc.raw_text,
              structuredJson: doc.structured_json,
              summaryMarkdown: doc.summary_markdown,
              chatHistory: doc.chat_history || [],
              currentDocIndex: index,
              pipelineStatus: { inputReady: true, parsing: false, dashboard: true, chat: true }
          }));
          setActiveTab('dashboard');
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              const text = ev.target?.result as string;
              setState(s => ({ ...s, rawInputText: text, pipelineStatus: { ...s.pipelineStatus, inputReady: true } }));
          };
          reader.readAsText(file);
      }
  };

  const themeClasses = state.themeMode === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-gray-50 text-slate-900';

  return (
    <div className={`flex h-screen w-full overflow-hidden ${themeClasses}`} style={{ fontSize: `${state.fontScale}rem` }}>
      <Sidebar 
        state={state} 
        setState={setState} 
        saveSnapshot={() => saveSnapshot(state.structuredJson, state.summaryMarkdown || "")}
        loadSnapshot={loadSnapshot}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Navigation Tabs */}
        <header className="px-8 py-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-slate-900 shadow-sm z-10">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{strings.title}</h1>
                <p className="text-sm opacity-60 mt-1">{strings.subtitle}</p>
            </div>
            
            <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                {[
                    { id: 'landing', label: strings.landing_tab },
                    { id: 'dashboard', label: strings.dashboard_tab },
                    { id: 'pipeline', label: strings.pipeline_tab }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === tab.id 
                            ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white' 
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8 relative">
            
            {/* Status Bar */}
            <div className="absolute top-4 right-8 flex gap-4 text-xs font-semibold uppercase tracking-wider">
                {Object.entries(state.pipelineStatus).map(([key, isActive]) => (
                    <div key={key} className={`flex items-center gap-1 ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-300 dark:text-gray-700'}`}>
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
                        {strings[`status_${key}` as keyof typeof strings]}
                    </div>
                ))}
            </div>

            {/* View: Landing / Input */}
            {activeTab === 'landing' && (
                <div className="max-w-4xl mx-auto mt-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Paste Area */}
                        <div className="flex flex-col gap-4">
                            <label className="font-semibold text-lg flex items-center gap-2">
                                <FileText size={20} />
                                {strings.paste_label}
                            </label>
                            <textarea
                                value={state.rawInputText}
                                onChange={(e) => setState(s => ({ ...s, rawInputText: e.target.value, pipelineStatus: { ...s.pipelineStatus, inputReady: !!e.target.value } }))}
                                className="flex-1 h-80 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:outline-none resize-none font-mono text-sm"
                                style={{ '--tw-ring-color': palette.accent } as React.CSSProperties}
                                placeholder="Paste text here..."
                            />
                        </div>

                        {/* Upload & Action */}
                        <div className="flex flex-col gap-6 justify-center">
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer relative group">
                                <UploadCloud size={48} className="text-gray-400 mb-4 group-hover:scale-110 transition-transform" />
                                <p className="font-medium text-gray-600 dark:text-gray-400">{strings.upload_label}</p>
                                <input 
                                    type="file" 
                                    accept=".txt,.md,.json"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                />
                            </div>

                            <button
                                onClick={runPipeline}
                                disabled={!state.pipelineStatus.inputReady || state.pipelineStatus.parsing}
                                className="py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                                style={{ backgroundColor: palette.accent }}
                            >
                                {state.pipelineStatus.parsing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Play size={24} fill="currentColor" />
                                        {strings.analyze_button}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View: Dashboard */}
            {activeTab === 'dashboard' && (
                <div className="flex gap-6 h-full pb-10">
                    <div className="flex-1 h-full overflow-y-auto pr-2">
                        <Dashboard state={state} palette={palette} />
                    </div>
                    <div className="w-[400px] h-full flex-shrink-0">
                        <ChatInterface state={state} setState={setState} palette={palette} />
                    </div>
                </div>
            )}

            {/* View: Pipeline (Simple view for demo) */}
            {activeTab === 'pipeline' && (
                <div className="max-w-3xl mx-auto mt-10 space-y-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold">Agent Pipeline Configuration</h2>
                        <p className="opacity-60">Visual representation of the Gemini agents used in analysis.</p>
                    </div>

                    {DEFAULT_AGENTS.map((agent, i) => (
                        <div key={agent.id} className="relative pl-10">
                            {/* Connector Line */}
                            {i !== DEFAULT_AGENTS.length - 1 && (
                                <div className="absolute left-[19px] top-10 bottom-[-32px] w-0.5 bg-gray-200 dark:bg-gray-700" />
                            )}
                            
                            {/* Node */}
                            <div className="absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md z-10" style={{ backgroundColor: palette.accent }}>
                                {i + 1}
                            </div>

                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg">{agent.label}</h3>
                                        <div className="text-xs font-mono opacity-50 bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded inline-block mt-1">
                                            {agent.id}
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                        {agent.default_model}
                                    </span>
                                </div>
                                
                                <div className="mt-4">
                                    <label className="text-xs font-semibold uppercase opacity-60">System Prompt Snippet</label>
                                    <div className="mt-1 text-sm bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800 italic opacity-80">
                                        "{agent.system_prompt.substring(0, 150)}..."
                                    </div>
                                </div>
                                
                                <div className="mt-4 flex items-center gap-2 text-sm">
                                    <CheckCircle size={16} className={state.pipelineStatus.dashboard ? 'text-green-500' : 'text-gray-300'} />
                                    <span>Status: {state.pipelineStatus.dashboard ? 'Completed' : 'Pending'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

export default App;