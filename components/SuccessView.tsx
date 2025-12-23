
import React, { useEffect, useState, useRef } from 'react';
import { OrderData, AdminSettings } from '../types';
import { generateFormalConfirmation, generateAdminNotification } from '../services/geminiService';
import { FLOWER_PRESETS } from '../constants';
import { CheckCircle, FileDown, Loader2, Send } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import emailjs from '@emailjs/browser';

interface SuccessViewProps {
  order: OrderData;
  settings: AdminSettings;
  onReset: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ order, settings, onReset }) => {
  const [aiMessage, setAiMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [status, setStatus] = useState({ admin: 'idle', customer: 'idle' });
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const flowerInfo = FLOWER_PRESETS.find(f => f.name === order.flowerType);
      const price = flowerInfo ? flowerInfo.price : '';

      // メッセージ生成（内部でキーチェック済み）
      const [customerMsg, adminMsg] = await Promise.all([
        generateFormalConfirmation(order, price),
        generateAdminNotification(order, price)
      ]);
      
      setAiMessage(customerMsg);
      setIsGenerating(false);

      // メールの送信処理
      try {
        const receiptImage = await generateUltraLightweightImage(receiptRef.current);
        
        // 管理者メール
        if (settings.adminEmails.length > 0 && settings.emailServiceId) {
          const adminParams = {
            to_name: '担当者様',
            message: adminMsg, 
            familyName: order.familyName,
            contactName: order.contactName,
            phoneNumber: order.phoneNumber,
            placardName: order.placardName,
            flower_type: order.flowerType,
            flower_price: price,
            location: order.funeralLocation,
            content_pdf: receiptImage || ""
          };
          for (const email of settings.adminEmails) {
            await emailjs.send(settings.emailServiceId, settings.emailTemplateIdAdmin, { ...adminParams, to_email: email }, settings.emailPublicKey);
          }
        }

        // お客様控え
        if (order.email && settings.emailServiceId) {
          await emailjs.send(settings.emailServiceId, settings.emailTemplateIdCustomer, {
            to_email: order.email,
            to_name: order.contactName,
            message: customerMsg,
            familyName: order.familyName,
            order_date: new Date().toLocaleDateString('ja-JP')
          }, settings.emailPublicKey);
        }
      } catch (e) {
        console.error("Email sending failed:", e);
      }
    };
    init();
  }, [order]);

  const generateUltraLightweightImage = async (element: HTMLElement | null) => {
    if (!element) return undefined;
    try {
      const canvas = await html2canvas(element, { scale: 0.6 }); 
      return canvas.toDataURL('image/jpeg', 0.2); 
    } catch (e) { return undefined; }
  };

  const downloadPDF = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`供花注文控え_${order.familyName}家.pdf`);
    } catch (e) {} finally { setIsDownloading(false); }
  };

  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl shadow-xl space-y-8 animate-in zoom-in duration-500 overflow-hidden">
      <div ref={receiptRef} className="fixed -left-[4000px] -top-[4000px] w-[800px] bg-white p-12 text-gray-800 leading-relaxed">
        <div className="border-b-4 border-pink-600 pb-6 mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">供花注文内容確認書</h1>
        </div>
        <div className="grid grid-cols-[200px_1fr] gap-y-6 text-xl mb-12">
          <div className="font-bold text-gray-400 border-b border-gray-100 pb-2">御家名</div>
          <div className="font-bold border-b border-gray-100 pb-2">{order.familyName} 家</div>
          <div className="font-bold text-gray-400 border-b border-gray-100 pb-2">お品物</div>
          <div className="border-b border-gray-100 pb-2">{order.flowerType}</div>
          <div className="font-bold text-gray-400 border-b border-gray-100 pb-2">お名札</div>
          <div className="font-bold text-pink-700 text-2xl border-b border-gray-100 pb-2">{order.placardName}</div>
          <div className="font-bold text-gray-400 border-b border-gray-100 pb-2">葬儀場所</div>
          <div className="border-b border-gray-100 pb-2">{order.funeralLocation}</div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="p-6 rounded-full mb-4 bg-green-100 text-green-600">
          <CheckCircle size={72} className="animate-bounce" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 text-center">注文が完了しました</h2>
        <p className="text-sm text-gray-500 mt-2 text-center">ご入力内容は無事に送信されました。<br/>担当者からの連絡をお待ちください。</p>
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
          <Send size={12} /> ご注文内容の確認
        </p>
        {isGenerating ? (
          <div className="flex items-center gap-2 text-slate-400 italic text-sm">
            <Loader2 size={14} className="animate-spin" /> 情報を整理しています...
          </div>
        ) : (
          <p className="text-gray-700 font-medium leading-relaxed text-sm whitespace-pre-wrap">{aiMessage}</p>
        )}
      </div>

      <div className="space-y-4 pt-4">
        <button onClick={downloadPDF} disabled={isDownloading} className="w-full py-7 rounded-2xl bg-gray-800 text-white text-xl font-bold hover:bg-gray-900 flex items-center justify-center gap-3 disabled:bg-gray-300">
          {isDownloading ? <Loader2 size={28} className="animate-spin" /> : <FileDown size={28} />}
          注文控え（PDF）を保存
        </button>
        <button onClick={onReset} className="w-full py-4 rounded-xl border-2 border-slate-200 text-slate-500 font-bold hover:bg-slate-50">
          新しい注文を入力
        </button>
      </div>
    </div>
  );
};
