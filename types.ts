
export interface OrderData {
  flowerType: string;
  familyName: string;
  funeralLocation: string;
  wakeDateTime: string;
  funeralDateTime: string;
  contactName: string;
  zipCode: string;
  address: string;
  addressDetail: string; // 枝番・建物名など
  phoneNumber: string;
  transferName: string;
  placardName: string;
  email: string;
}

export interface AdminSettings {
  passcode: string;
  adminEmails: string[];
}

export enum AppView {
  ORDER_FORM = 'ORDER_FORM',
  SUCCESS = 'SUCCESS',
  SETTINGS = 'SETTINGS'
}
