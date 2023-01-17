import { Formik, Form, useFormik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';
import Image from 'next/image';
import { CreditCardData, IPayment, PaymentResponse } from '../types/payment.interface';
import axios from 'axios';

export default function HomePage() {
  const [paymentType, setPaymentType] = useState('credit_card');
  const [sent, setSent] = useState(false);
  const [url, setUrl] = useState('');
  const isCreditCard = 'credit_card' === paymentType;
  const defaultFlag = { src: '/icons/default.ico', name: 'Bandeira do cartão não reconhecida' };
  const [ccFlag, setCcFlag] = useState(defaultFlag);
  const [clicked, setClicked] = useState(false);
  type options = {
    [key: string]: string;
  };
  const paymentOptions: options = {
    'credit-card': 'credit_card',
    'bank-slip': 'boleto',
    pix: 'pix',
  };
  const creditCardMask = (value: any): string => {
    value = value.replace(/\D/g, '');
    for (let i = 0; i < 4; i++) {
      value = value.replace(/(\d{4})(\d)/, '$1 $2');
    }
    return value;
  };
  const creditCard6Mask = (value: any): string => {
    value = value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(\d)/, '$1 $2');
    value = value.replace(/(\d{6})(\d)/, '$1 $2');
    return value;
  };
  interface IFlag {
    pattern: RegExp;
    name: string;
    icon: any;
    mask: any;
  }

  const flags = {
    AMEX: { pattern: /^3[47][0-9]{13}$/, name: 'Amex', icon: '/icons/amex.ico', mask: creditCard6Mask },
    DINERS: {
      pattern: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
      name: 'Diners Club',
      icon: '/icons/diners.ico',
      mask: creditCard6Mask,
    },
    DISCOVER: {
      pattern:
        /^65[4-9][0-9]{13}|64[4-9][0-9]{13}|6011[0-9]{12}|(622(?:12[6-9]|1[3-9][0-9]|[2-8][0-9][0-9]|9[01][0-9]|92[0-5])[0-9]{10})$/,
      name: 'Discover',
      icon: '/icons/discover.ico',
      mask: creditCardMask,
    },
    ELO: {
      pattern:
        /^4011(78|79)|^43(1274|8935)|^45(1416|7393|763(1|2))|^50(4175|6699|67[0-6][0-9]|677[0-8]|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9])|^627780|^63(6297|6368|6369)|^65(0(0(3([1-3]|[5-9])|4([0-9])|5[0-1])|4(0[5-9]|[1-3][0-9]|8[5-9]|9[0-9])|5([0-2][0-9]|3[0-8]|4[1-9]|[5-8][0-9]|9[0-8])|7(0[0-9]|1[0-8]|2[0-7])|9(0[1-9]|[1-6][0-9]|7[0-8]))|16(5[2-9]|[6-7][0-9])|50(0[0-9]|1[0-9]|2[1-9]|[3-4][0-9]|5[0-8]))/,
      name: 'Elo',
      icon: '/icons/elo.ico',
      mask: creditCardMask,
    },
    MASTERCARD: {
      pattern:
        /^((5(([1-2]|[4-5])[0-9]{8}|0((1|6)([0-9]{7}))|3(0(4((0|[2-9])[0-9]{5})|([0-3]|[5-9])[0-9]{6})|[1-9][0-9]{7})))|((508116)\\d{4,10})|((502121)\\d{4,10})|((589916)\\d{4,10})|(2[0-9]{15})|(67[0-9]{14})|(506387)\\d{4,10})/,
      name: 'Mastercard',
      icon: '/icons/mastercard.ico',
      mask: creditCardMask,
    },
    VISA: {
      pattern: /^4[0-9]{15}$/,
      name: 'Visa',
      icon: '/icons/visa.ico',
      mask: creditCardMask,
    },
  };

  const calcDigit = (numbers: string[], length: number, verifyingDigit = 0) => {
    const sum = numbers.reduce(
      (previous: any, current: any, index: number) => parseInt(previous) + parseInt(current) * (length - index),
      0,
    );
    return ((verifyingDigit * 9 + sum) % 11) % 10;
  };

  const validateMobile = (mobile: any) => {
    if ('' === mobile || undefined === mobile || null === mobile) return false;
    mobile = mobile.replace(/\D/g, '');
    const pattern = /^([0-9]{2})([0-9]{5})([0-9]{4})$/;
    return mobile.match(pattern);
  };

  const validateExpDate = (date: any) => {
    const invalid = '' === date || undefined === date || null === date;
    if (invalid) return false;
    if (5 === date.length) {
      const numbers = date.split('/');
      const day = new Date().getDay();
      const month = parseInt(numbers[0]);
      if (month > 12) return false;
      const year = 2000 + parseInt(numbers[1]);
      const expirationDate = new Date(year, month, day);
      const currentDate = new Date();
      return currentDate <= expirationDate;
    }
    return false;
  };

  const validateCpf = (cpfStr: any) => {
    if ('' === cpfStr || undefined === cpfStr || null === cpfStr) return false;
    cpfStr = cpfStr.replace(/\D/g, '');
    const elevenNumbers = cpfStr.length === 11;
    if (!elevenNumbers) {
      return false;
    }

    const regex = /^(\d)\1{10}$/;
    const repeatedNumbers = regex.test(cpfStr);
    if (repeatedNumbers) {
      return false;
    }

    const verifyingDigit = cpfStr.substring(9, 11);
    const numbers: string[] = cpfStr.substring(0, 9).split('').reverse();
    const firstDigit = calcDigit(numbers, 9);
    const secondDigit = calcDigit(numbers, 8, firstDigit);
    return verifyingDigit === `${firstDigit}${secondDigit}`;
  };

  const validCreditCard = (value: any) => {
    if ('' === value || undefined === value || null === value) return false;
    value = value.replace(/\D/g, '');
    var nCheck = 0,
      nDigit = 0,
      bEven = false;

    for (var n = value.length - 1; n >= 0; n--) {
      var cDigit = value.charAt(n),
        nDigit = parseInt(cDigit, 10);

      if (bEven) {
        if ((nDigit *= 2) > 9) nDigit -= 9;
      }

      nCheck += nDigit;
      bEven = !bEven;
    }

    return nCheck % 10 == 0;
  };

  const dateExpMask = (v: string) => {
    v = v.replace(/\D/g, '');
    v = v.replace(/(\d{2})(\d{2})/, '$1/$2');
    return v;
  };

  const cpfMask = (v: string) => {
    v = v.replace(/\D/g, '');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return v;
  };

  const zipCodeMask = (v: string) => {
    v = v.replace(/\D/g, '');
    v = v.replace(/(\d{5})(\d{3})/, '$1-$2');
    return v;
  };

  const mobileMask = (v: string) => {
    v = v.replace(/\D/g, '');
    v = v.replace(/(\d{2})(\d)/, '($1) $2');
    v = v.replace(/(\d{5})(\d)/, '$1-$2');
    return v;
  };

  const values = {
    creditCard: false,
    name: '',
    email: '',
    mobile: '',
    document: '',
    number: '',
    address: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    ccNumber: '',
    ccCVV: '',
    ccName: '',
    ccExp: '',
  };

  const schema = Yup.object({
    name: Yup.string().required('Obrigatório'),
    email: Yup.string().email('Email inválido').required('Obrigatório'),
    document: Yup.string()
      .required('Obrigatório')
      .test('CPF', 'CPF inválido', value => validateCpf(value)),
    mobile: Yup.string()
      .required('Obrigatório')
      .test('Celular', 'Celular inválido', value => validateMobile(value)),
    creditCard: Yup.boolean().default(false),
    number: Yup.number().required('Obrigatório'),
    address: Yup.string().required('Obrigatório'),
    neighborhood: Yup.string().required('Obrigatório'),
    city: Yup.string().required('Obrigatório'),
    state: Yup.string().required('Obrigatório'),
    zipCode: Yup.string().required('Obrigatório'),
    ccNumber: Yup.string().when('creditCard', {
      is: true,
      then: Yup.string()
        .required('Obrigatório')
        .test('Número do Cartão', 'Número Inválido', value => validCreditCard(value)),
    }),
    ccCVV: Yup.string().when('creditCard', {
      is: true,
      then: Yup.string().required('Obrigatório'),
    }),
    ccName: Yup.string().when('creditCard', {
      is: true,
      then: Yup.string().required('Obrigatório'),
    }),
    ccExp: Yup.string().when('creditCard', {
      is: true,
      then: Yup.string()
        .required('Obrigatório')
        .test('Data de Expiração', 'Data inválida', value => validateExpDate(value)),
    }),
  });

  const formik = useFormik({
    initialValues: values,
    validationSchema: schema,
    onSubmit: values => {},
  });

  const handleDocumentChange = (event: { target: { value: any } }) => {
    const { value } = event.target;
    formik.setFieldValue('document', cpfMask(value), true);
  };
  const handleZipCodeChange = (event: { target: { value: any } }) => {
    const { value } = event.target;
    formik.setFieldValue('zipCode', zipCodeMask(value), true);
  };

  const handleMobileChange = (event: { target: { value: any } }) => {
    const { value } = event.target;
    formik.setFieldValue('mobile', mobileMask(value), true);
  };

  const handleCreditCardChange = (event: { target: { value: any } }) => {
    const { value } = event.target;
    formik.setFieldValue('ccNumber', value, true);
    handleFlag(value);
  };

  const handleFlag = (value: string) => {
    value = value.replace(/\D/g, '');
    let key: keyof typeof flags;
    let found = null;
    for (key in flags) {
      const current = flags[key];
      found = current.pattern.test(value);
      if (found) {
        setCcFlag({ src: current.icon, name: current.name });
        formik.setFieldValue('ccNumber', current.mask(value), true);
        break;
      }
    }
    if (!found) {
      setCcFlag(defaultFlag);
      formik.setFieldValue('ccNumber', creditCardMask(value), true);
    }
  };

  const onlyLettersMask = (value: string) => {
    return value.replace(/[^a-zA-Z\u00C0-\u00FF\s]/g, '').replace(/\s{2,}/, ' ');
  };

  const onlyNumbersMask = (value: string) => {
    return value.replace(/\D/g, '');
  };

  const handleNumberChange = (event: { target: { value: any } }) => {
    const { value } = event.target;
    formik.setFieldValue('number', onlyNumbersMask(value), true);
  };

  const handleNameChange = (event: { target: { value: any } }) => {
    const { value } = event.target;
    formik.setFieldValue('name', onlyLettersMask(value), true);
  };

  const handleCcNameChange = (event: { target: { value: any } }) => {
    const { value } = event.target;
    formik.setFieldValue('ccName', onlyLettersMask(value.toUpperCase()), true);
  };

  const handleCvvChange = (event: { target: { value: any } }) => {
    const { value } = event.target;
    formik.setFieldValue('ccCVV', onlyNumbersMask(value), true);
  };

  const handleDateExpChange = (event: { target: { value: any } }) => {
    const { value } = event.target;
    formik.setFieldValue('ccExp', dateExpMask(value), true);
  };

  const handlePaymentOption = (event: { target: { value: any; id: any } }) => {
    const { id } = event.target;
    const value = 'credit-card' === id;
    console.log(value);
    const option = paymentOptions[id];
    setPaymentType(option);
    setUrl('');
    formik.setFieldValue('creditCard', value);
  };

  const handleClick = async (event: any) => {
    setSent(false);
    setClicked(true);
    console.log('formik.values', formik.values);
    const baseURL = process.env['NEXT_BASEURL'];
    const api = axios.create({ baseURL });
    let creditCardToken = '';

    if (isCreditCard) {
      const strDateArray = formik.values.ccExp.split('/');
      const month = strDateArray[0];
      const year = `20${strDateArray[1]}`;
      const strFullNameArray = formik.values.ccName.split(' ');
      const firstName = strFullNameArray[0];
      const lastName = strFullNameArray[strFullNameArray.length - 1];

      const creditCardData: CreditCardData = {
        first_name: firstName,
        last_name: lastName,
        month: month,
        year: year,
        number: formik.values.ccNumber,
        verification_value: formik.values.ccCVV,
      };

      await api
        .post('/payment_token', creditCardData)
        .then(response => {
          console.log(response.data);
          creditCardToken = response.data.id;
        })
        .catch(error => {
          console.log(error.response.data);
        });
    }

    const payment: IPayment = {
      billing: {
        address: formik.values.address,
        city: formik.values.city,
        neighborhood: formik.values.neighborhood,
        number: formik.values.number,
        state: formik.values.state,
        zipCode: formik.values.zipCode,
      },
      customer: {
        document: formik.values.document,
        email: formik.values.email,
        mobile: formik.values.mobile,
        name: formik.values.name,
      },
      eventId: process.env['NEXT_EVENT_ID'] || '',
      paymentType: paymentType,
      products: [
        {
          id: process.env['NEXT_PRODUCT_ID'] || '',
          quantity: 1,
        },
      ],
      installments: 1,
      token: creditCardToken,
    };

    console.log(paymentType);

    await api
      .post('/transactions', payment)
      .then(response => {
        console.log(response.data);
        const data: PaymentResponse = response.data;
        if (paymentType === 'credit_card') {
          setUrl(data.credit_card.pdf);
        } else if (paymentType === 'boleto') {
          setUrl(data.boleto.barcode);
        } else if (paymentType === 'pix') {
          setUrl(data.pix.qrcode);
        }
        setSent(true);
      })
      .catch(error => {
        console.log(error.response.data);
      });
    setClicked(false);
  };

  return (
    <div className="container">
      <main>
        <div className="row g-5 d-flex justify-content-center">
          <div className="col-md-7 col-lg-8">
            <h4 className="mb-3 text-center">
              <i className="bi bi-coin"></i> Pagamento
            </h4>
            <hr className="my-4" />
            <Formik
              initialValues={values}
              validationSchema={schema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                setSubmitting(true);
                console.info('values', values);
              }}>
              <Form className="">
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="name" className="form-label">
                      <i className="bi bi-person"></i> Nome
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      {...formik.getFieldProps('name')}
                      onChange={handleNameChange}
                    />
                    {formik.touched.name && formik.errors.name ? (
                      <div className="text-danger">{formik.errors.name}</div>
                    ) : null}
                  </div>
                  <div className="col-sm-6">
                    <label htmlFor="document" className="form-label">
                      <i className="bi bi-person-vcard"></i> CPF
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="document"
                      placeholder="###.###.###-##"
                      {...formik.getFieldProps('document')}
                      onChange={handleDocumentChange}
                      maxLength={14}
                    />
                    {formik.touched.document && formik.errors.document ? (
                      <div className="text-danger">{formik.errors.document}</div>
                    ) : null}
                  </div>
                  <div className="col-sm-6">
                    <label htmlFor="mobile" className="form-label">
                      <i className="bi bi-phone"></i> Celular
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="(##) #####-####"
                      id="mobile"
                      {...formik.getFieldProps('mobile')}
                      onChange={handleMobileChange}
                      maxLength={15}
                    />
                    {formik.touched.mobile && formik.errors.mobile ? (
                      <div className="text-danger">{formik.errors.mobile}</div>
                    ) : null}
                  </div>
                  <div className="col-12">
                    <label htmlFor="email" className="form-label">
                      <i className="bi bi-envelope-at"></i> Email
                    </label>
                    <input type="text" className="form-control" id="email" {...formik.getFieldProps('email')} />
                    {formik.touched.email && formik.errors.email ? (
                      <div className="text-danger">{formik.errors.email}</div>
                    ) : null}
                  </div>
                  <div className="col-10">
                    <label htmlFor="address" className="form-label">
                      <i className="bi bi-house"></i> Endereço
                    </label>
                    <input type="text" className="form-control" id="address" {...formik.getFieldProps('address')} />
                    {formik.touched.address && formik.errors.address ? (
                      <div className="text-danger">{formik.errors.address}</div>
                    ) : null}
                  </div>
                  <div className="col-md-2">
                    <label htmlFor="number" className="form-label">
                      Número
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="number"
                      {...formik.getFieldProps('number')}
                      onChange={handleNumberChange}
                    />
                    {formik.touched.number && formik.errors.number ? (
                      <div className="text-danger">{formik.errors.number}</div>
                    ) : null}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="zipCode" className="form-label">
                      CEP
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="zipCode"
                      placeholder="#####-###"
                      {...formik.getFieldProps('zipCode')}
                      onChange={handleZipCodeChange}
                      maxLength={9}
                    />
                    {formik.touched.zipCode && formik.errors.zipCode ? (
                      <div className="text-danger">{formik.errors.zipCode}</div>
                    ) : null}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="neighborhood" className="form-label">
                      Bairro
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="neighborhood"
                      {...formik.getFieldProps('neighborhood')}
                    />
                    {formik.touched.neighborhood && formik.errors.neighborhood ? (
                      <div className="text-danger">{formik.errors.neighborhood}</div>
                    ) : null}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="state" className="form-label">
                      Estado
                    </label>
                    <input type="text" className="form-control" id="state" {...formik.getFieldProps('state')} />
                    {formik.touched.state && formik.errors.state ? (
                      <div className="text-danger">{formik.errors.state}</div>
                    ) : null}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="city" className="form-label">
                      Cidade
                    </label>
                    <input type="text" className="form-control" id="city" {...formik.getFieldProps('city')} />
                    {formik.touched.city && formik.errors.city ? (
                      <div className="text-danger">{formik.errors.city}</div>
                    ) : null}
                  </div>
                </div>

                <hr className="my-4" />

                <div className="row g-3">
                  <h4 className="mb-3">Forma de pagamento</h4>
                  <div className="col-md-6">
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="creditCard"
                        id="credit-card"
                        value="credit-card"
                        onChange={handlePaymentOption}
                      />
                      <label className="form-check-label" htmlFor="inlineRadio1">
                        Cartão de Crédito
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="creditCard"
                        id="bank-slip"
                        value="bank-slip"
                        onChange={handlePaymentOption}
                      />
                      <label className="form-check-label" htmlFor="inlineRadio2">
                        Boleto
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="creditCard"
                        id="pix"
                        value="pix"
                        onChange={handlePaymentOption}
                      />
                      <label className="form-check-label" htmlFor="inlineRadio3">
                        Pix
                      </label>
                    </div>
                  </div>
                  {isCreditCard ? (
                    <div className="col-md-6">
                      <div className="row">
                        <div className="col-12">
                          <label htmlFor="cc-name" className="form-label">
                            <i className="bi bi-person"></i> Nome no cartão
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="ccName"
                            {...formik.getFieldProps('ccName')}
                            onChange={handleCcNameChange}
                          />
                          {formik.touched.ccName && formik.errors.ccName ? (
                            <div className="text-danger">{formik.errors.ccName}</div>
                          ) : null}
                        </div>
                        <div className="col-12">
                          <label htmlFor="cc-number" className="form-label">
                            <i className="bi bi-credit-card-2-front"></i> Número do cartão
                          </label>
                          <div className="row">
                            <div className="col-10">
                              <input
                                type="text"
                                className="form-control"
                                id="ccNumber"
                                {...formik.getFieldProps('ccNumber')}
                                onChange={handleCreditCardChange}
                                maxLength={19}
                              />
                            </div>
                            <div className="col-2">
                              <Image src={ccFlag.src} alt={ccFlag.name} width={24} height={16} />
                            </div>
                          </div>
                          {formik.touched.ccNumber && formik.errors.ccNumber ? (
                            <div className="text-danger">{formik.errors.ccNumber}</div>
                          ) : null}
                        </div>

                        <div className="col-sm-6">
                          <label htmlFor="cc-expiration" className="form-label">
                            <i className="bi bi-calendar4-event"></i> Data de Expiração
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="cc-expiration"
                            placeholder="MM/AA"
                            maxLength={5}
                            {...formik.getFieldProps('ccExp')}
                            onChange={handleDateExpChange}
                          />
                          {formik.touched.ccExp && formik.errors.ccExp ? (
                            <div className="text-danger">{formik.errors.ccExp}</div>
                          ) : null}
                        </div>
                        <div className="col-sm-6">
                          <label htmlFor="cc-cvv" className="form-label">
                            <i className="bi bi-credit-card-2-back"></i> CVV
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="cc-cvv"
                            {...formik.getFieldProps('ccCVV')}
                            maxLength={4}
                            onChange={handleCvvChange}
                          />
                          {formik.touched.ccCVV && formik.errors.ccCVV ? (
                            <div className="text-danger">{formik.errors.ccCVV}</div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <hr className="my-4" />
                <footer className="mb-3 text-center">
                  <button
                    className="btn btn-primary btn-lg"
                    type="submit"
                    onClick={handleClick}
                    disabled={!formik.isValid}>
                    {isCreditCard ? 'Pagar' : 'Gerar'}
                  </button>
                </footer>
                {clicked ? <Image src="/loading.gif" alt="teste" width={400} height={400} /> : null}
                {sent ? (
                  <div className="">
                    <iframe src={url} style={{ height: '100vh', width: '100%' }} />
                  </div>
                ) : null}
              </Form>
            </Formik>
          </div>
        </div>
      </main>
    </div>
  );
}
