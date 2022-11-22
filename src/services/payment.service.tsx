import axios from 'axios';

const baseURL = 'https://gateway-mobile-plus.inteegrav2.com.br/pay';
const token = '';

interface IProduct {
  id: string;
  quantity: number;
}

interface ICustomer {
  name: string;
  email: string;
  mobile: string;
  document: string;
}

interface IBilling {
  number: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

interface IPaymentCommand {
  eventId: string;
  products: IProduct[];
  paymentType: string;
  customer: ICustomer;
  billing: IBilling;
}
