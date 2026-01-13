import { AgentConfig, Palette } from './types';

export const PAINTER_PALETTES: Palette[] = [
    { name: "Monet", accent: "#14b8a6", accent_soft: "#ccfbf1", card_bg_light: "#f9fafb", card_bg_dark: "#020617" },
    { name: "Van Gogh", accent: "#f97316", accent_soft: "#ffedd5", card_bg_light: "#fefce8", card_bg_dark: "#030712" },
    { name: "Picasso", accent: "#6366f1", accent_soft: "#e0e7ff", card_bg_light: "#eff6ff", card_bg_dark: "#020617" },
    { name: "Kandinsky", accent: "#ec4899", accent_soft: "#fce7f3", card_bg_light: "#fdf2ff", card_bg_dark: "#020617" },
    { name: "Hokusai", accent: "#0ea5e9", accent_soft: "#e0f2fe", card_bg_light: "#f0f9ff", card_bg_dark: "#020617" },
    { name: "Rothko", accent: "#a855f7", accent_soft: "#f3e8ff", card_bg_light: "#faf5ff", card_bg_dark: "#020617" },
    { name: "Matisse", accent: "#22c55e", accent_soft: "#dcfce7", card_bg_light: "#f0fdf4", card_bg_dark: "#020617" },
    { name: "Frida Kahlo", accent: "#e11d48", accent_soft: "#ffe4e6", card_bg_light: "#fff1f2", card_bg_dark: "#020617" },
    { name: "Dali", accent: "#06b6d4", accent_soft: "#cffafe", card_bg_light: "#ecfeff", card_bg_dark: "#020617" },
    { name: "Pollock", accent: "#facc15", accent_soft: "#fef9c3", card_bg_light: "#fefce8", card_bg_dark: "#020617" },
];

export const DEFAULT_AGENTS: AgentConfig[] = [
  {
    id: "extract_510k_structured",
    label: "Structure Extractor",
    default_model: "gemini-2.5-flash",
    max_tokens: 4000,
    system_prompt: `You are an expert FDA regulatory consultant. Extract the following fields from the 510(k) summary provided by the user. Return ONLY valid JSON.
    Fields:
    - device_name (string)
    - submitter_information (dictionary of key-value pairs)
    - classification (string)
    - regulation_number (string)
    - product_code (string)
    - panel (string)
    - predicates (string)
    - indications_for_use (string)
    - technological_characteristics (string - summary)
    - performance_data (string - summary)
    - substantial_equivalence_discussion (string - summary)`
  },
  {
    id: "generate_dashboard_summary",
    label: "Executive Summarizer",
    default_model: "gemini-2.5-flash",
    max_tokens: 4000,
    system_prompt: `You are a medical device analyst. Write a comprehensive Markdown executive summary of this 510(k). 
    Focus on:
    1. The device's intended use.
    2. How it compares to the predicate.
    3. Key performance testing results.
    4. Regulatory conclusion.
    
    Use bolding, bullet points, and clear headers.`
  }
];

export const STRINGS = {
    en: {
        title: "WOW FDA 510(k) Analyzer",
        subtitle: "Upload or paste a 510(k) Summary and get a structured, interactive regulatory dashboard.",
        upload_label: "Upload 510(k) text file (TXT, MD, JSON)",
        paste_label: "Or paste 510(k) text / markdown",
        analyze_button: "Analyze 510(k)",
        dashboard_tab: "Dashboard & Chat",
        landing_tab: "Upload / Paste",
        pipeline_tab: "Agent Pipeline",
        status_input_ready: "Input Ready",
        status_parsing: "Parsing",
        status_dashboard: "Dashboard Generated",
        status_chat: "Chat Ready",
        checklist_title: "Regulatory Completeness Checklist",
        checklist_present: "Present",
        checklist_missing: "Missing",
        save_snapshot: "Save Snapshot",
        history_section: "Document History",
        chat_placeholder: "Ask about this document...",
    },
    zh_tw: {
        title: "WOW FDA 510(k) 分析器",
        subtitle: "上傳或貼上 510(k) 摘要，獲得結構化、互動式法規儀表板。",
        upload_label: "上傳 510(k) 文字檔案 (TXT, MD, JSON)",
        paste_label: "或貼上 510(k) 文字／Markdown",
        analyze_button: "分析 510(k)",
        dashboard_tab: "儀表板與對話",
        landing_tab: "上傳／貼上",
        pipeline_tab: "多代理流程",
        status_input_ready: "輸入就緒",
        status_parsing: "解析中",
        status_dashboard: "儀表板完成",
        status_chat: "對話就緒",
        checklist_title: "法規完整性檢查表",
        checklist_present: "已填入",
        checklist_missing: "缺少",
        save_snapshot: "儲存快照",
        history_section: "文件歷史",
        chat_placeholder: "詢問有關此文件...",
    },
};