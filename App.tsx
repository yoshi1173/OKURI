
import React, { useState, useEffect } from 'react';
import { OrderForm } from './components/OrderForm';
import { Settings } from './components/Settings';
import { PasscodeModal } from './components/PasscodeModal';
import { SuccessView } from './components/SuccessView';
import { AppView, OrderData, AdminSettings } from './types';
import { STORAGE_KEY_SETTINGS, DEFAULT_PASSCODE, BACKGROUND_IMAGE } from './constants';
import { Settings as SettingsIcon } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.ORDER_FORM);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [settings, setSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return saved ? JSON.parse(saved) : { passcode: DEFAULT_PASSCODE, adminEmails: [] };
  });
  const [lastOrder, setLastOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const handleOrderSubmit = (data: OrderData) => {
    setLastOrder(data);
    // Simulate sending emails logic
    console.log("Sending auto-reply to:", data.email);
    console.log("Notifying admin emails:", settings.adminEmails);
    setView(AppView.SUCCESS);
  };

  const handleSettingsUpdate = (newSettings: AdminSettings) => {
    setSettings(newSettings);
    setView(AppView.ORDER_FORM);
  };

  const openSettings = () => {
    setShowPasscodeModal(true);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background with transparency */}
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center"
        style={{ backgroundImage: `url('${BACKGROUND_IMAGE}')` }}
      >
        <div className="absolute inset-0 bg-white/40"></div>
      </div>

      <header className="sticky top-0 z-50 p-4 flex justify-between items-center bg-white/70 backdrop-blur-md shadow-sm">
        <h1 
          className="text-2xl font-bold text-gray-800 tracking-wider cursor-pointer"
          onClick={() => setView(AppView.ORDER_FORM)}
        >
          お花の注文 <span className="text-pink-600">～OKURI～</span>
        </h1>
        <button 
          onClick={openSettings}
          className="p-2 text-gray-600 hover:text-pink-600 transition-colors"
          aria-label="Settings"
        >
          <SettingsIcon size={24} />
        </button>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {view === AppView.ORDER_FORM && (
          <OrderForm onSubmit={handleOrderSubmit} />
        )}
        {view === AppView.SUCCESS && lastOrder && (
          <SuccessView 
            order={lastOrder} 
            onReset={() => setView(AppView.ORDER_FORM)} 
          />
        )}
        {view === AppView.SETTINGS && (
          <Settings 
            settings={settings} 
            onSave={handleSettingsUpdate} 
            onCancel={() => setView(AppView.ORDER_FORM)} 
          />
        )}
      </main>

      {showPasscodeModal && (
        <PasscodeModal 
          correctPasscode={settings.passcode}
          onSuccess={() => {
            setShowPasscodeModal(false);
            setView(AppView.SETTINGS);
          }}
          onClose={() => setShowPasscodeModal(false)}
        />
      )}

      <footer className="p-8 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} OKURI Flower Order System. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
