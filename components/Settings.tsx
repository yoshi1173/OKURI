
import React, { useState, useEffect } from 'react';
import { AdminSettings } from '../types';
import { MAX_ADMIN_EMAILS } from '../constants';
import { Plus, Trash2, Save, X, Info, HelpCircle, Lock, Unlock, Check } from 'lucide-react';

interface SettingsProps {
  settings: AdminSettings;
  onSave: (settings: AdminSettings) => void;
  onCancel: () => void;
}

const HISTORY_KEY = 'okuri_input_history_v2';

export const Settings: React.FC<SettingsProps> = ({ settings, onSave, onCancel }) => {
  const [localSettings, setLocalSettings] = useState<AdminSettings>(settings);
  const [newEmail, setNewEmail] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // 履歴読み込み用
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        // 必要に応じて処理
      } catch (e) {}
    }
  }, []);

  const handleAddEmail = () => {
    if (newEmail && localSettings.adminEmails.length < MAX_ADMIN_EMAILS && !localSettings.adminEmails.includes(newEmail)) {
      setLocalSettings({
        ...localSettings,
        adminEmails: [...localSettings.adminEmails, newEmail]
      });
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (index: number) => {
    setLocalSettings({
      ...localSettings,
      adminEmails: localSettings.adminEmails.filter((_, i) => i !== index)
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!name) return;
    setLocalSettings(prev => ({ ...prev, [name]: value }));
  };

  const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setLocalSettings(prev => ({ ...prev, passcode: val }));
  };

  const toggleLock = () => {
    setLocalSettings(prev => ({ ...prev, isLocked: !prev.isLocked }));
  };

  const handleSaveClick = () => {
    setIsSaved(true);
    setTimeout(() => {
      onSave(localSettings);
    }, 800);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white";
  const lockedInputClass = "w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-100 text-gray-500 cursor-not-allowed outline-none transition-all";
  const labelClass = "block text-sm font-bold text-gray-700 mb-1.5 ml-1";

  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl shadow-2xl space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-h-[90vh] overflow-y-auto">
      
      <div className="flex justify-between items-center border-b pb-4 sticky top-0 bg-white/95 backdrop-blur-md z-20">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">システム設定</h2>
          <p className="text-xs text-gray-400 mt-1">通知先や自動メールの設定を変更します</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowHelp(!showHelp)} className={`p-2 rounded-full transition-all ${showHelp ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}>
            <HelpCircle size={24} />
          </button>
          <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
          <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
            <Info size={18} /> 設定のヒント
          </h4>
          <p className="text-xs text-blue-700 leading-relaxed">
            パスコードを空欄にすると、次回から認証なしでこの画面を開けます。お客様が操作する環境では必ず4桁の数字を設定してください。
          </p>
        </div>
      )}

      {/* 1. セキュリティ */}
      <section className="space-y-4">
        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center text-sm">01</span>
          セキュリティ
        </h3>
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <label className={labelClass}>設定画面のパスコード (4桁 / 空欄で認証なし)</label>
          <input 
            type="text" 
            name="passcode"
            maxLength={4}
            autoComplete="off"
            value={localSettings.passcode}
            onChange={handlePasscodeChange}
            placeholder="未設定"
            className="w-56 px-6 py-4 text-center text-3xl tracking-[0.4em] rounded-xl border-2 border-white shadow-sm focus:border-pink-300 outline-none font-mono bg-white font-bold"
          />
        </div>
      </section>

      {/* 2. メール通知先 */}
      <section className="space-y-4">
        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center text-sm">02</span>
          店舗・管理者への通知先
        </h3>
        <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <div className="flex gap-2">
            <input 
              type="email" 
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="admin@example.com"
              className={inputClass}
            />
            <button 
              onClick={handleAddEmail}
              className="bg-gray-800 text-white px-6 rounded-xl hover:bg-black transition-all font-bold"
            >
              追加
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {localSettings.adminEmails.map((email, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-sm text-gray-600">{email}</span>
                <button onClick={() => handleRemoveEmail(idx)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. EmailJS自動連携設定 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-sm">03</span>
            自動メール連携 (EmailJS)
          </h3>
          <button 
            type="button"
            onClick={toggleLock}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full transition-all ${
              localSettings.isLocked 
                ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}
          >
            {localSettings.isLocked ? <><Lock size={12} /> 編集ロック中</> : <><Unlock size={12} /> 編集可能</>}
          </button>
        </div>
        
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border transition-all ${localSettings.isLocked ? 'bg-gray-50 border-gray-100' : 'bg-blue-50/30 border-blue-200'}`}>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Service ID</label>
              <input name="emailServiceId" readOnly={localSettings.isLocked} value={localSettings.emailServiceId} onChange={handleChange} className={localSettings.isLocked ? lockedInputClass : inputClass} />
            </div>
            <div>
              <label className={labelClass}>Public Key (公開キー)</label>
              <input name="emailPublicKey" readOnly={localSettings.isLocked} value={localSettings.emailPublicKey} onChange={handleChange} className={localSettings.isLocked ? lockedInputClass : inputClass} />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>管理者通知用 Template ID</label>
              <input name="emailTemplateIdAdmin" readOnly={localSettings.isLocked} value={localSettings.emailTemplateIdAdmin} onChange={handleChange} className={localSettings.isLocked ? lockedInputClass : inputClass} />
            </div>
            <div>
              <label className={labelClass}>お客様控え用 Template ID</label>
              <input name="emailTemplateIdCustomer" readOnly={localSettings.isLocked} value={localSettings.emailTemplateIdCustomer} onChange={handleChange} className={localSettings.isLocked ? lockedInputClass : inputClass} />
            </div>
          </div>
        </div>
      </section>

      <div className="flex gap-4 pt-6 sticky bottom-0 bg-white/95 py-6 border-t z-20">
        <button 
          type="button"
          onClick={handleSaveClick}
          className={`flex-1 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl active:scale-[0.98] ${
            isSaved ? 'bg-green-500 text-white' : 'bg-pink-600 text-white hover:bg-pink-700'
          }`}
        >
          {isSaved ? <><Check size={20} /> 保存しました</> : <><Save size={20} /> 設定を保存して戻る</>}
        </button>
      </div>
    </div>
  );
};
