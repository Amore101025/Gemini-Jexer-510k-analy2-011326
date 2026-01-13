import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AppState, Palette, Structured510k } from '../types';
import { STRINGS } from '../constants';
import { CheckCircle2, XCircle } from 'lucide-react';

interface DashboardProps {
  state: AppState;
  palette: Palette;
}

const Dashboard: React.FC<DashboardProps> = ({ state, palette }) => {
  const strings = STRINGS[state.language];
  const { structuredJson, summaryMarkdown } = state;
  const isCompact = state.density === 'compact';

  const Card: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div 
        className={`rounded-2xl border shadow-sm transition-all duration-300 ${className}
        ${state.themeMode === 'light' ? 'border-slate-200/60' : 'border-slate-700/50 shadow-none'}`}
        style={{ 
            backgroundColor: state.themeMode === 'light' ? palette.card_bg_light : palette.card_bg_dark,
            padding: isCompact ? '1rem' : '1.5rem',
            marginBottom: isCompact ? '0.5rem' : '1rem'
        }}
    >
      {children}
    </div>
  );

  const Kpi: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
    <div>
        <div className={`text-xs uppercase tracking-wider font-semibold mb-1 opacity-60`}>{label}</div>
        <div className="font-bold text-lg leading-tight" style={{ color: palette.accent }}>
            {value || "N/A"}
        </div>
    </div>
  );

  const ChecklistItem: React.FC<{ label: string; present: boolean }> = ({ label, present }) => (
      <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
          <span className="text-sm opacity-80">{label}</span>
          <span 
            className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1
            ${present 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
          >
              {present ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
              {present ? strings.checklist_present : strings.checklist_missing}
          </span>
      </div>
  );

  if (!structuredJson && !summaryMarkdown) {
      return (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
              <div className="text-6xl mb-4">📊</div>
              <p>Run analysis to generate dashboard</p>
          </div>
      );
  }

  const s = structuredJson || {} as Structured510k;

  const checklist = [
      { key: 'device_name', label: 'Device Name' },
      { key: 'product_code', label: 'Product Code' },
      { key: 'indications_for_use', label: 'Indications for Use' },
      { key: 'performance_data', label: 'Performance Data' },
      { key: 'predicates', label: 'Predicates' },
      { key: 'substantial_equivalence_discussion', label: 'SE Discussion' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top KPIs */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Kpi label="Device Name" value={s.device_name} />
            <Kpi label="Product Code" value={s.product_code} />
            <Kpi label="Panel" value={s.panel} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checklist Column */}
          <div className="lg:col-span-1">
              <Card>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b pb-2" style={{ borderColor: palette.accent_soft }}>
                      {strings.checklist_title}
                  </h3>
                  <div>
                      {checklist.map(item => (
                          <ChecklistItem 
                            key={item.key} 
                            label={item.label} 
                            present={!!s[item.key as keyof Structured510k]} 
                          />
                      ))}
                  </div>
              </Card>
              
              {/* Indications for Use Highlight */}
              <Card>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-2 border-b pb-2" style={{ borderColor: palette.accent_soft }}>
                      Indications
                  </h3>
                  <div className={`p-3 rounded-lg text-sm italic opacity-80 bg-opacity-50`} style={{ backgroundColor: palette.accent_soft }}>
                      {s.indications_for_use || "Not found."}
                  </div>
              </Card>
          </div>

          {/* Narrative Summary Column */}
          <div className="lg:col-span-2">
              <Card className="h-full">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b pb-2" style={{ borderColor: palette.accent_soft }}>
                    Executive Summary
                </h3>
                <div className="prose dark:prose-invert prose-sm max-w-none">
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {summaryMarkdown || "*Summary pending...*"}
                     </ReactMarkdown>
                </div>
              </Card>
          </div>
      </div>
      
      {/* Submitter Info Table */}
      {s.submitter_information && (
          <Card>
             <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b pb-2" style={{ borderColor: palette.accent_soft }}>
                Submitter Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(s.submitter_information).map(([k, v]) => (
                    <div key={k} className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                        <div className="text-xs uppercase opacity-50 mb-0.5">{k.replace(/_/g, ' ')}</div>
                        <div className="text-sm font-medium">{v}</div>
                    </div>
                ))}
            </div>
          </Card>
      )}
    </div>
  );
};

export default Dashboard;