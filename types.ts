
export interface OrderData {
  flowerType: string;
  familyName: string;
  funeralLocation: string;
  wakeDateTime: string;
  funeralDateTime: string;
  contactName: string;
  zipCode: string;
  address: string;
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
