
import React, { useState, useEffect } from 'react';
import { OrderData } from '../types';
import { FLOWER_PRESETS } from '../constants';
import { MessageSquareText, Tag, Phone, Loader2 } from 'lucide-react';

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
    email: '',
    remarks: '',
    hasSpecialChars: false
  });

  const [isSearchingZip, setIsSearchingZip] = useState(false);
  const [isNoWake, setIsNoWake] = useState(false);

  const [wakeDate, setWakeDate] = useState('');
  const [wakeTime, setWakeTime] = useState('18:00');
  const [funeralDate, setFuneralDate] = useState('');
  const [funeralTime, setFuneralTime] = useState('10:00');

  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = h.toString().padStart(2, '0');
      const min = m.toString().padStart(2, '0');
      timeOptions.push(`${hour}:${min}`);
    }
  }

  useEffect(() => {
    if (isNoWake) {
      setFormData(prev => ({ ...prev, wakeDateTime: 'なし' }));
    } else if (wakeDate) {
      setFormData(prev => ({ ...prev, wakeDateTime: `${wakeDate} ${wakeTime}` }));
    }
  }, [wakeDate, wakeTime, isNoWake]);

  useEffect(() => {
    if (funeralDate) {
      setFormData(prev => ({ ...prev, funeralDateTime: `${funeralDate} ${funeralTime}` }));
    }
  }, [funeralDate, funeralTime]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const selectFlower = (name: string) => {
    setFormData(prev => ({ ...prev, flowerType: name }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white/50";
  const selectClass = "w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white/50 appearance-none";

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 rounded-3xl shadow-xl space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-pink-100 pb-2 inline-block">
          ご注文内容入力
        </h2>
      </div>

      {/* 1. お花の種類 */}
      <section className="space-y-4">
        <h3 className="font-bold text-gray-700 flex items-center">
          <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mr-2 text-sm">1</span>
          お花の種類を選択
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FLOWER_PRESETS.map((flower) => (
            <div 
              key={flower.id}
              onClick={() => selectFlower(flower.name)}
              className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all ${
                formData.flowerType === flower.name ? 'flower-card-selected' : 'border-transparent hover:border-pink-100'
              }`}
            >
              <div className="bg-gray-50 flex items-center justify-center h-32 md:h-44">
                <img 
                  src={flower.image} 
                  alt={flower.name} 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div className="p-2 bg-white/90">
                <p className="text-[10px] md:text-xs font-bold text-gray-800 truncate">{flower.name}</p>
                <p className="text-[10px] text-pink-600 font-bold">{flower.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. 葬儀情報 */}
      <section className="space-y-4 pt-4 border-t border-gray-100">
        <h3 className="font-bold text-gray-700 flex items-center">
          <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mr-2 text-sm">2</span>
          葬儀情報
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-4">
            <input required name="familyName" value={formData.familyName} onChange={handleChange} placeholder="御家名（例：山田）" className={inputClass} />
            <input required name="funeralLocation" value={formData.funeralLocation} onChange={handleChange} placeholder="葬儀場所（斎場名）" className={inputClass} />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-gray-400 ml-1">お通夜開式日時</label>
              <label className="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer">
                <input type="checkbox" checked={isNoWake} onChange={(e) => setIsNoWake(e.target.checked)} className="rounded" /> なし
              </label>
            </div>
            <div className="flex gap-2">
              <input type="date" value={wakeDate} disabled={isNoWake} onChange={(e) => setWakeDate(e.target.value)} className={inputClass} />
              <select disabled={isNoWake} value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className={selectClass}>
                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 ml-1">葬儀開式日時</label>
            <div className="flex gap-2">
              <input required type="date" value={funeralDate} onChange={(e) => setFuneralDate(e.target.value)} className={inputClass} />
              <select value={funeralTime} onChange={(e) => setFuneralTime(e.target.value)} className={selectClass}>
                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ご注文者様情報 */}
      <section className="space-y-4 pt-4 border-t border-gray-100">
        <h3 className="font-bold text-gray-700 flex items-center">
          <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mr-2 text-sm">3</span>
          ご注文者様情報
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required name="contactName" value={formData.contactName} onChange={handleChange} placeholder="ご担当者様名" className={inputClass} />
          <input required name="email" type="email" value={formData.email} onChange={handleChange} placeholder="控え用メールアドレス" className={inputClass} />
          <div className="relative">
            <input required name="zipCode" placeholder="郵便番号（ハイフンなし）" value={formData.zipCode} onChange={handleChange} className={inputClass} />
            {isSearchingZip && <Loader2 size={16} className="absolute right-3 top-4 animate-spin text-pink-400" />}
          </div>
          <input required name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} placeholder="電話番号" className={inputClass} />
          <div className="md:col-span-2">
            <input required name="address" value={formData.address} onChange={handleChange} placeholder="住所" className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <input required name="addressDetail" value={formData.addressDetail} onChange={handleChange} placeholder="枝番・建物名・号室" className={inputClass} />
          </div>
          <input required name="transferName" value={formData.transferName} onChange={handleChange} placeholder="振込名義人（カタカナ）" className={inputClass} />
        </div>

        {/* 札名 */}
        <div className="pt-4">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 ml-1">
            <Tag size={18} className="text-pink-500" />
            札名（ふだめい）の指示
          </label>
          
          <div className="mb-2 ml-1 flex items-start gap-2 bg-gray-50/50 p-3 rounded-xl border border-dashed border-gray-200">
            <input 
              type="checkbox" 
              id="specialCharWarn"
              name="hasSpecialChars"
              checked={formData.hasSpecialChars}
              onChange={handleCheckboxChange}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <label htmlFor="specialCharWarn" className="text-xs text-gray-600 leading-relaxed cursor-pointer select-none font-medium">
              特殊・旧漢字や、手書き指示がある場合はチェックを入れてください
            </label>
          </div>

          <div className="mb-3 ml-1 flex items-center gap-2 text-pink-600">
            <Phone size={14} />
            <p className="text-xs font-bold">内容確認のため、こちらからお電話をさせて頂きます</p>
          </div>

          <textarea 
            required
            name="placardName"
            value={formData.placardName}
            onChange={handleChange}
            placeholder="お名札に記載するお名前をご記入ください。"
            className={`${inputClass} min-h-[100px] resize-none py-4 mb-4`}
          ></textarea>
        </div>

        {/* 備考欄 */}
        <div className="pt-4 border-t border-gray-100 mt-4">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 ml-1">
            <MessageSquareText size={18} className="text-pink-500" />
            備考欄
          </label>
          <textarea 
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="その他、ご要望などございましたらご記入ください。"
            className={`${inputClass} min-h-[100px] resize-none py-4`}
          ></textarea>
        </div>
      </section>

      <button 
        type="submit" 
        className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-5 rounded-2xl shadow-xl transition-all active:scale-95 text-lg"
      >
        この内容で注文を確定する
      </button>
    </form>
  );
};
