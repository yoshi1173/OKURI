
import { GoogleGenAI } from "@google/genai";
import { OrderData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * 注文者向けの丁寧な確認メッセージを生成
 */
export const generateFormalConfirmation = async (order: OrderData): Promise<string> => {
  const prompt = `
    お葬式用のお供え花の注文を受け付けました。
    以下の情報を元に、ご遺族や注文者に失礼のない、丁寧で格式高い確認メッセージ（日本語）を150文字程度で作成してください。
    
    【注文内容】
    御家名: ${order.familyName} 家
    葬儀場所: ${order.funeralLocation}
    お通夜日時: ${order.wakeDateTime}
    葬儀日時: ${order.funeralDateTime}
    ご注文者: ${order.contactName}
    札名: ${order.placardName}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "あなたは葬儀社の丁寧なカスタマーサポート担当です。温かみがありつつも厳かな言葉遣いで対応してください。"
      }
    });
    return response.text || "ご注文ありがとうございます。内容を確認いたしました。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "この度はご注文いただき、誠にありがとうございます。内容を確認し、追って担当者よりご連絡させていただきます。";
  }
};

/**
 * 管理者（葬儀社・店舗）向けの業務通知メールを生成
 */
export const generateAdminNotification = async (order: OrderData): Promise<string> => {
  const prompt = `
    新規の供花注文が入りました。管理者が受注処理を行うための詳細な通知メールを作成してください。
    
    【注文詳細データ】
    種類: ${order.flowerType}
    御家名: ${order.familyName} 家
    斎場: ${order.funeralLocation}
    通夜: ${order.wakeDateTime}
    葬儀: ${order.funeralDateTime}
    担当者: ${order.contactName} (${order.phoneNumber})
    郵便番号: ${order.zipCode}
    住所: ${order.address}
    枝番・建物名: ${order.addressDetail}
    振込名義: ${order.transferName}
    札名: ${order.placardName}
    
    項目を整理し、ミスが許されない葬儀業務として、見やすく正確なメール形式（件名含む）で出力してください。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "あなたは葬儀社の受注管理システムです。正確性と視認性を重視したビジネスメールを作成してください。"
      }
    });
    return response.text || "新規注文通知。詳細を確認してください。";
  } catch (error) {
    return "新規注文の自動通知です。管理画面から詳細を確認してください。";
  }
};
