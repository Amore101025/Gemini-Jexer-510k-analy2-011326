export interface Palette {
  name: string;
  accent: string;
  accent_soft: string;
  card_bg_light: string;
  card_bg_dark: string;
}

export interface AgentConfig {
  id: string;
  label: string;
  default_model: string;
  system_prompt: string;
  max_tokens: number;
}

export interface Structured510k {
  device_name?: string;
  submitter_information?: Record<string, string>;
  classification?: string;
  regulation_number?: string;
  product_code?: string;
  panel?: string;
  predicates?: string;
  indications_for_use?: string;
  technological_characteristics?: string;
  performance_data?: string;
  clinical_performance?: string;
  substantial_equivalence_discussion?: string;
}

export interface DocumentSnapshot {
  id: string;
  timestamp: string;
  label: string;
  raw_text: string;
  structured_json: Structured510k | null;
  summary_markdown: string | null;
  infographics_layout: any | null;
  chat_history: ChatMessage[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AppState {
  themeMode: 'light' | 'dark';
  language: 'en' | 'zh_tw';
  painterStyleIndex: number;
  fontScale: number;
  density: 'comfortable' | 'compact';
  
  rawInputText: string;
  structuredJson: Structured510k | null;
  summaryMarkdown: string | null;
  infographicsLayout: any | null;
  
  chatHistory: ChatMessage[];
  
  pipelineStatus: {
    inputReady: boolean;
    parsing: boolean;
    dashboard: boolean;
    chat: boolean;
  };
  
  documents: DocumentSnapshot[];
  currentDocIndex: number | null;
}

export type PipelineStep = 'structure' | 'summary' | 'infographics';