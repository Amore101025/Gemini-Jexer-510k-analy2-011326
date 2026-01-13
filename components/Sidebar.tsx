import React from 'react';
import { Palette, DocumentSnapshot, AppState } from '../types';
import { PAINTER_PALETTES, STRINGS } from '../constants';
import { Moon, Sun, History, Save, Smartphone, Monitor } from 'lucide-react';

interface SidebarProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  saveSnapshot: () => void;
  loadSnapshot: (index: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ state, setState, saveSnapshot, loadSnapshot }) => {
  const strings = STRINGS[state.language];
  const currentPalette = PAINTER_PALETTES[state.painterStyleIndex];

  return (
    <aside className={`w-80 h-screen overflow-y-auto border-r flex flex-col transition-colors duration-300
      ${state.themeMode === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-slate-900 border-slate-800'}`}>
      
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <h2 className={`text-xl font-bold mb-1 ${state.themeMode === 'light' ? 'text-gray-900' : 'text-white'}`}>
          WOW Controls
        </h2>
        <p className={`text-xs ${state.themeMode === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
          {currentPalette.name} Style
        </p>
      </div>

      <div className="p-6 space-y-8 flex-1">
        {/* Theme Mode */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-3 block">Theme</label>
          <div className="flex gap-2 bg-gray-200/50 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setState(s => ({ ...s, themeMode: 'light' }))}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-sm transition-all
                ${state.themeMode === 'light' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Sun size={16} className="mr-2" /> Light
            </button>
            <button
              onClick={() => setState(s => ({ ...s, themeMode: 'dark' }))}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-sm transition-all
                ${state.themeMode === 'dark' ? 'bg-slate-700 shadow text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Moon size={16} className="mr-2" /> Dark
            </button>
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-3 block">Language</label>
          <div className="flex gap-2">
            {(['en', 'zh_tw'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setState(s => ({ ...s, language: lang }))}
                className={`px-3 py-1 text-xs rounded-full border transition-colors
                  ${state.language === lang 
                    ? `border-${currentPalette.accent} bg-${currentPalette.accent} text-white` 
                    : 'border-gray-300 dark:border-gray-700 opacity-60'}`}
                style={{
                    backgroundColor: state.language === lang ? currentPalette.accent : 'transparent',
                    borderColor: state.language === lang ? currentPalette.accent : undefined
                }}
              >
                {lang === 'en' ? 'English' : '繁體中文'}
              </button>
            ))}
          </div>
        </div>

        {/* Magic Style Wheel */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-3 block">Magic Style Wheel</label>
          <input 
            type="range" 
            min="0" 
            max={PAINTER_PALETTES.length - 1} 
            value={state.painterStyleIndex}
            onChange={(e) => setState(s => ({ ...s, painterStyleIndex: parseInt(e.target.value) }))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            style={{ accentColor: currentPalette.accent }}
          />
          <div className="mt-2 text-xs text-right font-medium" style={{ color: currentPalette.accent }}>
            {currentPalette.name}
          </div>
        </div>

        {/* Density */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-3 block">Layout Density</label>
          <div className="flex gap-2 bg-gray-200/50 dark:bg-gray-800 p-1 rounded-lg">
             <button
              onClick={() => setState(s => ({ ...s, density: 'comfortable' }))}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-sm transition-all
                ${state.density === 'comfortable' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-300'}`}
            >
               <Monitor size={16} className="mr-2" /> Comfy
            </button>
             <button
              onClick={() => setState(s => ({ ...s, density: 'compact' }))}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-sm transition-all
                ${state.density === 'compact' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-300'}`}
            >
               <Smartphone size={16} className="mr-2" /> Dense
            </button>
          </div>
        </div>

        {/* History */}
        <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
             <div className="flex justify-between items-center mb-4">
                 <label className="text-xs font-semibold uppercase tracking-wider opacity-70">{strings.history_section}</label>
                 <button onClick={saveSnapshot} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors" title={strings.save_snapshot}>
                     <Save size={16} />
                 </button>
             </div>
             
             <div className="space-y-2">
                 {state.documents.length === 0 && (
                     <p className="text-xs text-gray-400 italic">No snapshots yet.</p>
                 )}
                 {state.documents.map((doc, idx) => (
                     <button
                        key={doc.id}
                        onClick={() => loadSnapshot(idx)}
                        className={`w-full text-left px-3 py-2 rounded text-xs truncate transition-all flex items-center
                            ${state.currentDocIndex === idx 
                                ? 'bg-gray-200 dark:bg-gray-800 font-medium' 
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800/50 opacity-70'}`}
                        style={{ borderLeft: state.currentDocIndex === idx ? `3px solid ${currentPalette.accent}` : '3px solid transparent' }}
                     >
                         <History size={12} className="mr-2 flex-shrink-0" />
                         {doc.label}
                     </button>
                 ))}
             </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;