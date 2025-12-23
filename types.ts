
export interface OrderData {
  flowerType: string;
  familyName: string;
  funeralLocation: string;
  wakeDateTime: string;
  funeralDateTime: string;
  contactName: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  phoneNumber: string;
  transferName: string;
  placardName: string;
  email: string;
  remarks?: string;
  hasSpecialChars: boolean;
}

export interface AdminSettings {
  passcode: string;
  adminEmails: string[];
  emailServiceId: string;
  emailTemplateIdAdmin: string;
  emailTemplateIdCustomer: string;
  emailPublicKey: string;
  isLocked: boolean; // 編集ロック状態を保存
}

export enum AppView {
  ORDER_FORM = 'ORDER_FORM',
  SUCCESS = 'SUCCESS',
  SETTINGS = 'SETTINGS'
}
