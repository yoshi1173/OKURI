
import React, { useState, useCallback } from 'react';
import { OrderForm } from './components/OrderForm';
import { Settings } from './components/Settings';
import { PasscodeModal } from './components/PasscodeModal';
import { SuccessView } from './components/SuccessView';
import { AppView, OrderData, AdminSettings } from './types';
import { 
  STORAGE_KEY_SETTINGS, 
  BACKGROUND_IMAGE, 
  EMAILJS_DEFAULT_PUBLIC_KEY,
  EMAILJS_DEFAULT_SERVICE_ID,
  EMAILJS_DEFAULT_TEMPLATE_ID_ADMIN,
  EMAILJS_DEFAULT_TEMPLATE_ID_CUSTOMER,
  DEFAULT_ADMIN_EMAILS
} from './constants';
import { Settings as SettingsIcon } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.ORDER_FORM);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  
  const defaultSettings: AdminSettings = {
    passcode: "", // 初期値は空（誰でもすぐ作業可能）
    adminEmails: DEFAULT_ADMIN_EMAILS,
    emailServiceId: EMAILJS_DEFAULT_SERVICE_ID,
    emailTemplateIdAdmin: EMAILJS_DEFAULT_TEMPLATE_ID_ADMIN,
    emailTemplateIdCustomer: EMAILJS_DEFAULT_TEMPLATE_ID_CUSTOMER,
    emailPublicKey: EMAILJS_DEFAULT_PUBLIC_KEY,
    isLocked: true 
  };

  const [settings, setSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    const finalSettings = { ...defaultSettings };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach((key) => {
          const k = key as keyof AdminSettings;
          if (parsed[k] !== undefined) {
            (finalSettings as any)[k] = parsed[k];
          }
        });
      } catch (e) {}
    }
    return finalSettings;
  });

  const [lastOrder, setLastOrder] = useState<OrderData | null>(null);

  const handleSettingsUpdate = useCallback((newSettings: AdminSettings) => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
    setSettings(newSettings);
    setView(AppView.ORDER_FORM);
  }, []);

  const handleOrderSubmit = (data: OrderData) => {
    setLastOrder(data);
    setView(AppView.SUCCESS);
  };

  const openSettings = () => {
    if (!settings.passcode || settings.passcode === "") {
      setView(AppView.SETTINGS);
    } else {
      setShowPasscodeModal(true);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
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
            settings={settings}
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
    </div>
  );
};

export default App;
