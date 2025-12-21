
import React, { useEffect, useState, useRef } from 'react';
import { OrderData } from '../types';
import { generateFormalConfirmation, generateAdminNotification } from '../services/geminiService';
import { CheckCircle, ArrowLeft, FileDown, ShieldCheck, UserCheck, Loader2, Send, MailCheck, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface SuccessViewProps {
  order: OrderData;
  adminEmails: string[];
  onReset: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ order, adminEmails, onReset }) => {
  const [aiMessage, setAiMessage] = useState<string>('');
  const [adminMailContent, setAdminMailContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // 送信ステータス管理
  const [status, setStatus] = useState<{
    admin: 'idle' | 'sending' | 'sent' | 'error';
    customer: 'idle' | 'sending' | 'sent' | 'error';
  }>({ admin: 'idle', customer: 'idle' });

  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initProcess = async () => {
      // 1. Geminiで内容を生成
      const [customerMsg, adminMsg] = await Promise.all([
        generateFormalConfirmation(order),
        generateAdminNotification(order)
      ]);
      
      setAiMessage(customerMsg);
      setAdminMailContent(adminMsg);
      setIsGenerating(false);

      // 2. 自動送信シーケンス開始
      startDispatchSequence(adminMsg, customerMsg);
    };

    initProcess();
  }, [order]);

  const startDispatchSequence = async (adminMsg: string, customerMsg: string) => {
    // 管理者への送信
    setStatus(prev => ({ ...prev, admin: 'sending' }));
    await simulateEmailDispatch(adminEmails, adminMsg);
    setStatus(prev => ({ ...prev, admin: 'sent' }));

    // お客様への送信
    setStatus(prev => ({ ...prev, customer: 'sending' }));
    await simulateEmailDispatch([order.email], customerMsg);
    setStatus(prev => ({ ...prev, customer: 'sent' }));
  };

  /**
   * メールの送信をシミュレート（または実際のAPI呼び出し）
   */
  const simulateEmailDispatch = async (targets: string[], content: string) => {
    console.log(`Sending to: ${targets.join(', ')}`, content);
    
    /* 
       実稼働環境ではここを外部API（EmailJS, SendGrid, 自社サーバー等）へのfetchに置き換えます。
       例:
       await fetch('https://api.emailservice.com/send', {
         method: 'POST',
         body: JSON.stringify({ to: targets, body: content })
       });
    */
    
    return new Promise(resolve => setTimeout(resolve, 2000));
  };

  const downloadPDF = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);
    
    try {
      // html2canvasで隠しテンプレートを画像化。scaleを上げることで高精細に。
      const canvas = await html2canvas(receiptRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`供花注文控え_${order.familyName}家.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDFの作成に失敗しました。");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl shadow-xl space-y-8 animate-in zoom-in duration-500 overflow-hidden">
      
      {/* 隠しPDFテンプレート（ブラウザの表示をそのままキャプチャするため文字化けしません） */}
      <div 
        ref={receiptRef} 
        className="fixed -left-[2000px] -top-[2000px] w-[800px] bg-white p-12 text-gray-800"
        style={{ fontFamily: '"Shippori Mincho", "Noto Serif JP", serif' }}
      >
        <div className="border-b-4 border-pink-600 pb-6 mb-10 text-center">
          <h1 className="text-4xl font-bold text-pink-600 mb-2">供花注文内容確認書</h1>
          <p className="text-gray-400">OKURI Flower Order System</p>
        </div>
        
        <div className="grid grid-cols-[200px_1fr] gap-y-6 text-xl leading-relaxed">
          <div className="font-bold text-gray-500 border-b border-gray-100">御家名</div>
          <div className="border-b border-gray-100">{order.familyName} 家</div>
          
          <div className="font-bold text-gray-500 border-b border-gray-100">注文商品</div>
          <div className="border-b border-gray-100">{order.flowerType}</div>
          
          <div className="font-bold text-gray-500 border-b border-gray-100">葬儀場所</div>
          <div className="border-b border-gray-100">{order.funeralLocation}</div>
          
          <div className="font-bold text-gray-500 border-b border-gray-100">お通夜</div>
          <div className="border-b border-gray-100">{order.wakeDateTime}</div>
          
          <div className="font-bold text-gray-500 border-b border-gray-100">葬儀告別式</div>
          <div className="border-b border-gray-100">{order.funeralDateTime}</div>
          
          <div className="col-span-2 py-4"></div>
          
          <div className="font-bold text-gray-500 border-b border-gray-100">ご注文者様</div>
          <div className="border-b border-gray-100">{order.contactName} 様</div>
          
          <div className="font-bold text-gray-500 border-b border-gray-100">連絡先</div>
          <div className="border-b border-gray-100">{order.phoneNumber}</div>
          
          <div className="font-bold text-gray-500 border-b border-gray-100">振込名義人</div>
          <div className="border-b border-gray-100">{order.transferName}</div>
          
          <div className="font-bold text-gray-500 border-b border-gray-100">札名</div>
          <div className="border-b border-gray-100 font-bold text-pink-600">{order.placardName}</div>
        </div>
        
        <div className="mt-20 pt-10 border-t border-gray-200 text-center text-gray-400">
          発行: {new Date().toLocaleString('ja-JP')}
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className={`p-5 rounded-full mb-4 transition-all duration-700 ${status.customer === 'sent' ? 'bg-green-100 text-green-600' : 'bg-pink-50 text-pink-400'}`}>
          {status.customer === 'sent' ? <CheckCircle size={56} /> : <Loader2 size={56} className="animate-spin" />}
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          {status.customer === 'sent' ? 'ご注文の送信が完了しました' : '注文を処理しています...'}
        </h2>
      </div>

      {/* 自動通知ステータス・ダッシュボード */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 管理者用 */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-500 tracking-wider">店舗管理者への通知</span>
            </div>
            {status.admin === 'sent' && <MailCheck size={16} className="text-green-500" />}
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${status.admin === 'sent' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
            <p className="text-sm font-medium text-gray-700">
              {status.admin === 'sent' ? '送信済み' : '送信中...'}
            </p>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">登録された{adminEmails.length}件のアドレスへ自動配信</p>
        </div>

        {/* 注文者用 */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserCheck size={18} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-500 tracking-wider">お客様への控え送信</span>
            </div>
            {status.customer === 'sent' && <MailCheck size={16} className="text-green-500" />}
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${status.customer === 'sent' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
            <p className="text-sm font-medium text-gray-700">
              {status.customer === 'sent' ? '送信済み' : '送信中...'}
            </p>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 truncate">{order.email} へ控えを配信</p>
        </div>
      </div>

      {/* AIメッセージセクション */}
      <div className="bg-pink-50/50 p-6 rounded-2xl border border-pink-100 text-left">
        <p className="text-[10px] font-bold text-pink-600 uppercase tracking-widest mb-2 flex items-center gap-1">
          <Send size={12} /> お客様へのメッセージ（自動生成）
        </p>
        {isGenerating ? (
          <div className="flex items-center gap-2 text-slate-400 italic text-sm">
            <Loader2 size={14} className="animate-spin" /> 内容を作成中...
          </div>
        ) : (
          <p className="text-gray-700 font-medium font-serif leading-relaxed italic text-sm">
            "{aiMessage}"
          </p>
        )}
      </div>

      <div className="space-y-3">
        <button 
          onClick={downloadPDF}
          disabled={isDownloading}
          className="w-full py-4 rounded-xl bg-pink-600 text-white font-bold hover:bg-pink-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-100 disabled:bg-gray-300"
        >
          {isDownloading ? <Loader2 size={20} className="animate-spin" /> : <FileDown size={20} />}
          注文控え(PDF)を今すぐ保存
        </button>

        <button 
          onClick={onReset}
          className="w-full py-4 rounded-xl border-2 border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft size={20} />
          トップページへ
        </button>
      </div>

      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-left flex gap-3">
        <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-700 leading-relaxed">
          <strong>【重要】実際のメール配信について</strong><br />
          このデモアプリではフロントエンドのみで動作しているため、実際のメールインボックスへの到達にはバックエンドサービス（EmailJS等）との接続が必要です。現在はシミュレーションとして動作しています。PDFの文字化けはhtml2canvasの採用により完全に修正されました。
        </p>
      </div>
    </div>
  );
};
