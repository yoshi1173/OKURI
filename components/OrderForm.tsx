
import React, { useState, useEffect } from 'react';
import { OrderData } from '../types';
import { FLOWER_PRESETS } from '../constants';
import { CheckCircle2, Search } from 'lucide-react';

interface OrderFormProps {
  onSubmit: (data: OrderData) => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<OrderData>({
    flowerType: FLOWER_PRESETS[0].name,
    familyName: '',
    funeralLocation: '',
    wakeDateTime: '',
    funeralDateTime: '',
    contactName: '',
    zipCode: '',
    address: '',
    addressDetail: '',
    phoneNumber: '',
    transferName: '',
    placardName: '',
    email: ''
  });

  const [isSearchingZip, setIsSearchingZip] = useState(false);
  const [isNoWake, setIsNoWake] = useState(false);

  // Address lookup logic
  useEffect(() => {
    const lookupAddress = async () => {
      const cleanZip = formData.zipCode.replace(/[^\d]/g, '');
      if (cleanZip.length === 7) {
        setIsSearchingZip(true);
        try {
          const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanZip}`);
          const data = await response.json();
          if (data.results && data.results[0]) {
            const res = data.results[0];
            const fullAddress = `${res.address1}${res.address2}${res.address3}`;
            setFormData(prev => ({ ...prev, address: fullAddress }));
          }
        } catch (error) {
          console.error("Zipcode lookup failed:", error);
        } finally {
          setIsSearchingZip(false);
        }
      }
    };

    lookupAddress();
  }, [formData.zipCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNoWakeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsNoWake(checked);
    if (checked) {
      setFormData(prev => ({ ...prev, wakeDateTime: 'なし' }));
    } else {
      setFormData(prev => ({ ...prev, wakeDateTime: '' }));
    }
  };

  const selectFlower = (name: string) => {
    setFormData(prev => ({ ...prev, flowerType: name }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white/50";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1 ml-1";

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 rounded-3xl shadow-xl space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-pink-100 pb-2 inline-block">
          ご注文内容入力
        </h2>
        <p className="text-gray-500 text-sm mt-3">お花の種類を選び、必要事項をご入力ください。</p>
      </div>

      {/* Flower Selection */}
      <section className="space-y-4">
        <h3 className="font-bold text-gray-700 flex items-center">
          <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mr-2 text-sm">1</span>
          お花の種類を選択
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FLOWER_PRESETS.map((flower) => (
            <div 
              key={flower.id}
              onClick={() => selectFlower(flower.name)}
              className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all group ${
                formData.flowerType === flower.name ? 'flower-card-selected' : 'border-transparent hover:border-pink-200'
              }`}
            >
              <img src={flower.image} alt={flower.name} className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="p-3 bg-white/90">
                <p className="text-sm font-bold text-gray-800 truncate">{flower.name}</p>
                <p className="text-xs text-pink-600 font-bold">{flower.price}</p>
              </div>
              {formData.flowerType === flower.name && (
                <div className="absolute top-2 right-2 text-pink-600 bg-white rounded-full p-1 shadow-md">
                  <CheckCircle2 size={20} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 pt-4 border-t border-gray-100">
        <h3 className="font-bold text-gray-700 flex items-center">
          <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mr-2 text-sm">2</span>
          葬儀情報
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>御家名（○○家）</label>
            <input 
              required name="familyName" 
              value={formData.familyName} 
              onChange={handleChange} 
              placeholder="例：山田" 
              className={inputClass} 
            />
          </div>
          <div>
            <label className={labelClass}>葬儀場所</label>
            <input 
              required name="funeralLocation" 
              value={formData.funeralLocation} 
              onChange={handleChange} 
              placeholder="○○斎場など" 
              className={inputClass} 
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 ml-1">お通夜日時</label>
              <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer hover:text-pink-600 transition-colors">
                <input 
                  type="checkbox" 
                  checked={isNoWake} 
                  onChange={handleNoWakeToggle}
                  className="rounded text-pink-600 focus:ring-pink-500"
                />
                なし
              </label>
            </div>
            <input 
              required={!isNoWake} 
              name="wakeDateTime" 
              type={isNoWake ? "text" : "datetime-local"} 
              value={formData.wakeDateTime} 
              onChange={handleChange} 
              disabled={isNoWake}
              className={`${inputClass} ${isNoWake ? 'bg-gray-100 text-gray-400 border-gray-100' : ''}`}
              placeholder={isNoWake ? "お通夜なし" : ""}
            />
          </div>
          <div>
            <label className={labelClass}>葬儀日時</label>
            <input 
              required name="funeralDateTime" 
              type="datetime-local" 
              value={formData.funeralDateTime} 
              onChange={handleChange} 
              className={inputClass} 
            />
          </div>
        </div>
      </section>

      <section className="space-y-6 pt-4 border-t border-gray-100">
        <h3 className="font-bold text-gray-700 flex items-center">
          <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mr-2 text-sm">3</span>
          ご注文者様情報
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>ご担当者様名</label>
            <input 
              required name="contactName" 
              value={formData.contactName} 
              onChange={handleChange} 
              className={inputClass} 
            />
          </div>
          <div>
            <label className={labelClass}>メールアドレス（控え用）</label>
            <input 
              required name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              className={inputClass} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className={labelClass}>
              郵便番号 <span className="text-[10px] font-normal text-pink-500 italic">（ハイフンなし）</span>
            </label>
            <input 
              required name="zipCode" 
              placeholder="郵便番号から自動入力されます" 
              value={formData.zipCode} 
              onChange={handleChange} 
              className={`${inputClass} pr-10`}
            />
            <div className="absolute right-3 top-[38px] text-gray-300">
              {isSearchingZip ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-600"></div>
              ) : (
                <Search size={20} />
              )}
            </div>
            {isSearchingZip && <span className="text-[10px] text-pink-600 ml-1">住所を取得中...</span>}
          </div>
          <div>
            <label className={labelClass}>電話番号</label>
            <input 
              required name="phoneNumber" 
              type="tel" 
              value={formData.phoneNumber} 
              onChange={handleChange} 
              className={inputClass} 
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>住所</label>
            <input 
              required name="address" 
              value={formData.address} 
              onChange={handleChange} 
              placeholder="郵便番号から自動入力されます"
              className={`${inputClass} ${formData.address ? 'bg-pink-50/30' : ''}`} 
            />
          </div>
          <div>
            <label className={labelClass}>枝番・建物名・号室</label>
            <input 
              required name="addressDetail" 
              value={formData.addressDetail} 
              onChange={handleChange} 
              placeholder="例：1-2-3 ○○マンション 101号室"
              className={inputClass} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              振込名義人 <span className="text-[10px] font-normal text-pink-500 italic">（カタカナで入力してください）</span>
            </label>
            <input 
              required name="transferName" 
              value={formData.transferName} 
              onChange={handleChange} 
              placeholder="例：ヤマダ タロウ"
              className={inputClass} 
            />
          </div>
          <div>
            <label className={labelClass}>札名（ふだな）</label>
            <input 
              required name="placardName" 
              value={formData.placardName} 
              onChange={handleChange} 
              placeholder="例：株式会社○○ 代表取締役..." 
              className={inputClass} 
            />
          </div>
        </div>
      </section>

      <button 
        type="submit" 
        className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-pink-100 transition-all active:scale-95 text-lg"
      >
        この内容で注文を確定する
      </button>
    </form>
  );
};
