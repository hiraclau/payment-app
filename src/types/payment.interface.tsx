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
}
