
import React, { useState } from 'react';
import { AdminSettings } from '../types';
import { MAX_ADMIN_EMAILS } from '../constants';
import { Plus, Trash2, Save, X } from 'lucide-react';

interface SettingsProps {
  settings: AdminSettings;
  onSave: (settings: AdminSettings) => void;
  onCancel: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSave, onCancel }) => {
  const [passcode, setPasscode] = useState(settings.passcode);
  const [emails, setEmails] = useState<string[]>(settings.adminEmails);
  const [newEmail, setNewEmail] = useState('');

  const handleAddEmail = () => {
    if (newEmail && emails.length < MAX_ADMIN_EMAILS && !emails.includes(newEmail)) {
      setEmails([...emails, newEmail]);
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({ passcode, adminEmails: emails });
  };

  return (
    <div className="glass-card p-6 md:p-8 rounded-2xl shadow-xl space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800">管理者設定</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <section className="space-y-4">
        <h3 className="font-bold text-gray-700 flex items-center">
          <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mr-2 text-sm">1</span>
          パスコード設定
        </h3>
        <p className="text-sm text-gray-500">管理者画面を開くための4桁の数字を設定します。</p>
        <input 
          type="text" 
          maxLength={4}
          pattern="\d{4}"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
          className="w-32 px-4 py-3 text-center text-2xl tracking-widest rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-200 outline-none"
        />
      </section>

      <section className="space-y-4 pt-4 border-t">
        <h3 className="font-bold text-gray-700 flex items-center">
          <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mr-2 text-sm">2</span>
          通知先メールアドレス（最大10件）
        </h3>
        <p className="text-sm text-gray-500">注文が入った際に通知される管理者用アドレスを登録します。</p>
        
        <div className="flex gap-2">
          <input 
            type="email" 
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="example@mail.com"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-200 outline-none"
          />
          <button 
            onClick={handleAddEmail}
            disabled={emails.length >= MAX_ADMIN_EMAILS}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 disabled:bg-gray-300 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {emails.map((email, idx) => (
            <li key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
              <span className="text-gray-700 text-sm truncate">{email}</span>
              <button 
                onClick={() => handleRemoveEmail(idx)}
                className="text-red-400 hover:text-red-600 p-1"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
          {emails.length === 0 && <li className="text-center text-gray-400 text-sm py-4">未登録です</li>}
        </ul>
      </section>

      <div className="flex gap-4 pt-6">
        <button 
          onClick={handleSave}
          className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-900 transition-all shadow-lg"
        >
          <Save size={20} />
          設定を保存する
        </button>
        <button 
          onClick={onCancel}
          className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-600"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
};
