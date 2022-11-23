import { string } from 'yup';

export interface IProduct {
  id: string;
  quantity: number;
}

export interface ICustomer {
  name: string;
  email: string;
  mobile: string;
  document: string;
}

export interface IBilling {
  number: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface IPayment {
  eventId: string;
  products: IProduct[];
  paymentType: string;
  customer: ICustomer;
  billing: IBilling;
  installments: number;
  token: string;
}

export interface CreditCard {
  message: string;
  errors: string;
  status: string;
  info_message: string;
  reversible: string;
  token: string;
  brand: string;
  bin: string;
  success: string;
  url: string;
  pdf: string;
  identification: string;
  invoice_id: string;
  LR: string;
}

export interface Pix {
  qrcode: string;
  qrcode_text: string;
}
export interface Boleto {
  digitable_line: string;
  barcode_data: string;
  barcode: string;
}
export interface PaymentResponse {
  transactionId: string;
  invoiceId: string;
  url: string;
  pix: Pix;
  boleto: Boleto;
  credit_card: CreditCard;
}

export interface CreditCardData {
  number: string;
  verification_value: string;
  first_name: string;
  last_name: string;
  month: string;
  year: string;
}

export interface PaymentToken {
  account_id: string;
  method: string;
  test: boolean;
  data: CreditCardData;
}
