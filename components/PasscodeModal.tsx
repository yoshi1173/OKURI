
import React, { useState, useEffect } from 'react';
import { Lock, X } from 'lucide-react';

interface PasscodeModalProps {
  correctPasscode: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const PasscodeModal: React.FC<PasscodeModalProps> = ({ correctPasscode, onSuccess, onClose }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (input.length === 4) {
      if (input === correctPasscode) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => {
          setInput('');
          setError(false);
        }, 1000);
      }
    }
  }, [input, correctPasscode, onSuccess]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className={`bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl transition-transform ${error ? 'animate-shake' : ''}`}>
        <div className="flex justify-between items-start mb-6">
          <div className="bg-pink-100 p-3 rounded-2xl text-pink-600">
            <Lock size={24} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">管理者認証</h2>
        <p className="text-gray-500 text-sm text-center mb-8">4桁のパスコードを入力してください。</p>

        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full border-2 ${
                input.length > i ? 'bg-pink-600 border-pink-600' : 'border-gray-200'
              } ${error ? 'bg-red-500 border-red-500' : ''} transition-all`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((val, idx) => (
            <button
              key={idx}
              disabled={val === ''}
              onClick={() => {
                if (val === 'del') {
                  setInput(prev => prev.slice(0, -1));
                } else if (typeof val === 'number') {
                  if (input.length < 4) setInput(prev => prev + val);
                }
              }}
              className={`h-16 flex items-center justify-center rounded-2xl text-xl font-bold transition-all active:scale-90 ${
                val === '' ? 'invisible' : 'hover:bg-gray-100 text-gray-700 bg-gray-50'
              }`}
            >
              {val === 'del' ? '←' : val}
            </button>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};
