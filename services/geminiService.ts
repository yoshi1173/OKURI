
import { GoogleGenAI } from "@google/genai";
import { OrderData } from "../types";

export const generateFormalConfirmation = async (order: OrderData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
