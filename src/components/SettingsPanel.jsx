import React, { useState, useEffect } from 'react';
import { Settings, Save, X, Key, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SettingsPanel = ({ isOpen, onClose, onSave }) => {
  const { t } = useTranslation();
  const [googleKey, setGoogleKey] = useState('');
  const [bestTimeKey, setBestTimeKey] = useState('');

  useEffect(() => {
    const savedGoogle = localStorage.getItem('google_api_key') || '';
    const savedBestTime = localStorage.getItem('besttime_api_key') || '';
    setGoogleKey(savedGoogle);
    setBestTimeKey(savedBestTime);
  }, []);

  const handleSave = () => {
    localStorage.setItem('google_api_key', googleKey);
    localStorage.setItem('besttime_api_key', bestTimeKey);
    onSave({ googleKey, bestTimeKey });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-50 px-8 py-6 flex justify-between items-center border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
               <Settings size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
               {t('settings')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                <Key size={14} className="text-blue-500" /> {t('google_api_key')}
              </label>
              <div className="relative group">
                <input
                  type="password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all group-hover:bg-white"
                  value={googleKey}
                  onChange={(e) => setGoogleKey(e.target.value)}
                  placeholder="AIza..."
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                <Key size={14} className="text-indigo-500" /> {t('besttime_api_key')} (Optional)
              </label>
              <div className="relative group">
                <input
                  type="password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all group-hover:bg-white"
                  value={bestTimeKey}
                  onChange={(e) => setBestTimeKey(e.target.value)}
                  placeholder="pri_..."
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
             <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
             <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
               Le chiavi API sono salvate localmente nel tuo browser. Per l'analisi dei competitor è necessaria almeno la chiave Google Maps.
             </p>
          </div>
        </div>

        <div className="px-8 pb-8 pt-2">
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 hover:shadow-blue-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} /> {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
