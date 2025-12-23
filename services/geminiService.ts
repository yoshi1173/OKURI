
import { GoogleGenAI } from "@google/genai";
import { OrderData } from "../types";

/**
 * 注文者向けの固定メッセージ
 */
const getStaticConfirmationTemplate = (order: OrderData, flowerPrice: string) => {
  return `ご注文ありがとうございます。内容を以下の通り承りました。

【ご注文内容の控え】
・御家名: ${order.familyName} 家
・お品物: ${order.flowerType}（${flowerPrice}）
・お名札: ${order.placardName}
・葬儀場所: ${order.funeralLocation}
・開式日時: ${order.funeralDateTime}
・ご注文者様: ${order.contactName} 様

【今後の流れ】
・内容確認のため、後ほど担当者よりお電話（${order.phoneNumber}）を差し上げます。
${order.hasSpecialChars ? "・特殊漢字等の指示に基づき、お電話にて詳細を伺わせていただきます。" : ""}
・お支払いは葬儀終了後、ご指定の住所へ請求書を郵送いたします。
・銀行振込の手数料はお客様のご負担となりますこと、何卒ご了承ください。`;
};

/**
 * 管理者向けの受注通知（AIが使えない場合）
 */
const getStaticAdminTemplate = (order: OrderData, flowerPrice: string) => {
  const alert = order.hasSpecialChars ? "【重要：特殊漢字・指示内容の確認必須】\n" : "";
  return `${alert}供花注文をWebから受注しました。

・家名: ${order.familyName}家
・品目: ${order.flowerType} (${flowerPrice})
・札名: ${order.placardName}
・場所: ${order.funeralLocation}
・注文者: ${order.contactName} 様
・連絡先: ${order.phoneNumber}
・住所: ${order.address} ${order.addressDetail}`;
};

export const generateFormalConfirmation = async (order: OrderData, flowerPrice: string): Promise<string> => {
  const fallback = getStaticConfirmationTemplate(order, flowerPrice);
  
  // APIキーがない、または第三者が利用している場合は即座にテンプレートを返す
  if (!process.env.API_KEY || process.env.API_KEY === "") {
    return fallback;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `供花の注文受付。文頭は「ご注文ありがとうございます。内容を以下の通り承りました。」。家名:${order.familyName}、品物:${order.flowerType} ${flowerPrice}、札名:${order.placardName}、場所:${order.funeralLocation}、注文者:${order.contactName}。電話確認、請求書郵送、振込手数料について含める。丁寧な敬語。`,
      config: {
        systemInstruction: "供花の受付担当として丁寧な返信文を作ってください。お悔やみの言葉は含めないでください。"
      }
    });
    return response.text || fallback;
  } catch (e) {
    return fallback;
  }
};

export const generateAdminNotification = async (order: OrderData, flowerPrice: string): Promise<string> => {
  const fallback = getStaticAdminTemplate(order, flowerPrice);
  if (!process.env.API_KEY || process.env.API_KEY === "") return fallback;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `受注通知。家名:${order.familyName}、場所:${order.funeralLocation}、札名:${order.placardName}、注文者:${order.contactName}、電話:${order.phoneNumber}。${order.hasSpecialChars ? "特殊漢字あり" : ""}`,
      config: { systemInstruction: "受注情報を箇条書きでまとめてください。" }
    });
    return response.text || fallback;
  } catch (e) {
    return fallback;
  }
};
