import React, { useState, useEffect } from 'react';
import { Settings, Save, X } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings size={20} /> {t('settings')}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('google_api_key')}
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              value={googleKey}
              onChange={(e) => setGoogleKey(e.target.value)}
              placeholder="AIza..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('besttime_api_key')}
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              value={bestTimeKey}
              onChange={(e) => setBestTimeKey(e.target.value)}
              placeholder="pri_..."
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Save size={18} /> {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
