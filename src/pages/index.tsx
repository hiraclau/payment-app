import { Formik, useFormik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';
import Image from 'next/image';

export default function HomePage() {
  const [paymentType, setPaymentType] = useState('credit-card');
  const isCreditCard = 'credit-card' === paymentType;
  const defaultFlag = '/icons/default.ico';
  const [ccFlag, setCcFlag] = useState(defaultFlag);
  const paymentOptions = {
    'credit-card': 'credit_card',
    'bank-slip': 'boleto',
    pix: 'pix',
  };

  interface IFlag {
    pattern: RegExp;
    name: string;
    icon: any;
  }

  const flags = {
    AMEX: { pattern: /^3[47][0-9]{13}$/, name: 'Amex', icon: '/icons/amex.ico' },
    DINERS: {
      pattern: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
      name: 'Diners Club',
      icon: '/icons/diners.ico',
    },
    DISCOVER: {
      pattern:
        /^65[4-9][0-9]{13}|64[4-9][0-9]{13}|6011[0-9]{12}|(622(?:12[6-9]|1[3-9][0-9]|[2-8][0-9][0-9]|9[01][0-9]|92[0-5])[0-9]{10})$/,
      name: 'Discover',
      icon: '/icons/discover.ico',
    },
    ELO: {
      pattern:
        /^4011(78|79)|^43(1274|8935)|^45(1416|7393|763(1|2))|^50(4175|6699|67[0-6][0-9]|677[0-8]|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9])|^627780|^63(6297|6368|6369)|^65(0(0(3([1-3]|[5-9])|4([0-9])|5[0-1])|4(0[5-9]|[1-3][0-9]|8[5-9]|9[0-9])|5([0-2][0-9]|3[0-8]|4[1-9]|[5-8][0-9]|9[0-8])|7(0[0-9]|1[0-8]|2[0-7])|9(0[1-9]|[1-6][0-9]|7[0-8]))|16(5[2-9]|[6-7][0-9])|50(0[0-9]|1[0-9]|2[1-9]|[3-4][0-9]|5[0-8]))/,
      name: 'Elo',
      icon: '/icons/elo.ico',
    },
    MASTERCARD: {
      pattern:
        /^((5(([1-2]|[4-5])[0-9]{8}|0((1|6)([0-9]{7}))|3(0(4((0|[2-9])[0-9]{5})|([0-3]|[5-9])[0-9]{6})|[1-9][0-9]{7})))|((508116)\\d{4,10})|((502121)\\d{4,10})|((589916)\\d{4,10})|(2[0-9]{15})|(67[0-9]{14})|(506387)\\d{4,10})/,
      name: 'Mastercard',
      icon: '/icons/mastercard.ico',
    },
    VISA: {
      pattern: /^4[0-9]{15}$/,
      name: 'Visa',
      icon: '/icons/visa.ico',
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
    //if (/[^0-9-\s]+/.test(value)) return false;

    // The Luhn Algorithm. It's so pretty.
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

  const creditCardMask = (value: string) => {
    value = value.replace(/\D/g, '');
    for (let i = 0; i < 4; i++) {
      value = value.replace(/(\d{4})(\d)/, '$1 $2');
    }
    return value;
  };

  const values = {
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
    number: Yup.number().required('Obrigatório'),
    address: Yup.string().required('Obrigatório'),
    neighborhood: Yup.string().required('Obrigatório'),
    city: Yup.string().required('Obrigatório'),
    state: Yup.string().required('Obrigatório'),
    zipCode: Yup.string().required('Obrigatório'),
    ccNumber: Yup.string()
      .required('Obrigatório')
      .test('Número do Cartão', 'Número Inválido', value => validCreditCard(value)),
    ccCVV: Yup.string().required('Obrigatório'),
    ccName: Yup.string().required('Obrigatório'),
    ccExp: Yup.string().required('Obrigatório'),
  });

  const formik = useFormik({
    initialValues: values,
    validationSchema: schema,

    onSubmit: values => {
      console.log(values);
    },
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
    handleFlag(value);
    formik.setFieldValue('ccNumber', creditCardMask(value), true);
  };

  const handleFlag = (value: string) => {
    value = value.replace(/\D/g, '');
    let key: keyof typeof flags;
    let found = null;
    for (key in flags) {
      const current = flags[key];
      found = current.pattern.test(value);
      if (found) {
        setCcFlag(current.icon);
        break;
      }
    }
    if (!found) {
      setCcFlag(defaultFlag);
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
    setPaymentType(id);
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
              onSubmit={(values, { setSubmitting }) => {
                console.info(values);
                setSubmitting(false);
              }}>
              <form className="">
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
                    <div className="form-check">
                      <input
                        id="credit-card"
                        name="paymentMethod"
                        type="radio"
                        className="form-check-input"
                        onChange={handlePaymentOption}
                      />
                      <label className="form-check-label" htmlFor="credit-card">
                        Cartão de Crédito
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        id="bank-slip"
                        name="paymentMethod"
                        type="radio"
                        className="form-check-input"
                        onChange={handlePaymentOption}
                      />
                      <label className="form-check-label" htmlFor="bank-slip">
                        Boleto
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        id="pix"
                        name="paymentMethod"
                        type="radio"
                        className="form-check-input"
                        onChange={handlePaymentOption}
                      />
                      <label className="form-check-label" htmlFor="pix">
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
                              <Image src={ccFlag} alt="flag" width={24} height={16} />
                              {/* <svg height={12} viewBox="0 0 638 234" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                  <g id="elo" fill-rule="nonzero">
                                    <path
                                      d="M95.7,51.6 C102.5,49.3 109.8,48.1 117.4,48.1 C150.6,48.1 178.3,71.7 184.6,103 L231.6,93.4 C220.8,40.2 173.8,0.1 117.4,0.1 C104.5,0.1 92.1,2.2 80.5,6.1 L95.7,51.6 Z"
                                      id="Shape"
                                      fill="#FFF100"></path>
                                    <path
                                      d="M40.2,204 L72,168 C57.8,155.4 48.9,137.1 48.9,116.6 C48.9,96.2 57.8,77.8 72,65.3 L40.2,29.4 C16.1,50.8 0.9,81.9 0.9,116.7 C0.9,151.4 16.1,182.6 40.2,204 Z"
                                      id="Shape"
                                      fill="#00A3DF"></path>
                                    <path
                                      d="M184.6,130.4 C178.2,161.7 150.6,185.2 117.4,185.2 C109.8,185.2 102.5,184 95.6,181.7 L80.4,227.2 C92,231.1 104.5,233.2 117.4,233.2 C173.8,233.2 220.8,193.2 231.6,140 L184.6,130.4 Z"
                                      id="Shape"
                                      fill="#EE4023"></path>
                                    <g id="Group" transform="translate(287.000000, 29.000000)" fill="#000000">
                                      <path
                                        d="M101.2,133.6 C93.4,141.2 82.9,145.8 71.3,145.6 C63.3,145.5 55.9,143.1 49.7,139.1 L34.1,163.9 C44.8,170.6 57.3,174.6 70.9,174.8 C90.6,175.1 108.6,167.3 121.7,154.6 L101.2,133.6 Z M73,32.5 C33.8,31.9 1.4,63.3 0.8,102.5 C0.6,117.2 4.8,131 12.3,142.4 L141.1,87.3 C133.9,56.4 106.3,33.1 73,32.5 Z M30.3,108.1 C30.1,106.5 30,104.8 30,103.1 C30.4,80 49.4,61.5 72.5,61.9 C85.1,62.1 96.3,67.8 103.8,76.8 L30.3,108.1 Z M181.6,0.5 L181.6,137.8 L205.4,147.7 L194.1,174.8 L170.5,165 C165.2,162.7 161.6,159.2 158.9,155.2 C156.3,151.2 154.3,145.6 154.3,138.2 L154.3,0.5 L181.6,0.5 Z"
                                        id="Shape"></path>
                                      <path
                                        d="M267.5,64 C271.7,62.6 276.1,61.9 280.8,61.9 C301.1,61.9 317.9,76.3 321.8,95.4 L350.5,89.5 C343.9,57 315.2,32.6 280.8,32.6 C272.9,32.6 265.3,33.9 258.3,36.2 L267.5,64 Z M233.6,156.9 L253,135 C244.3,127.3 238.9,116.1 238.9,103.6 C238.9,91.1 244.4,79.9 253,72.3 L233.6,50.4 C218.9,63.4 209.6,82.5 209.6,103.7 C209.6,124.9 218.9,143.9 233.6,156.9 Z M321.8,112.1 C317.9,131.2 301,145.6 280.8,145.6 C276.2,145.6 271.7,144.8 267.5,143.4 L258.2,171.2 C265.3,173.6 272.9,174.9 280.8,174.9 C315.2,174.9 343.9,150.5 350.5,118 L321.8,112.1 Z"
                                        id="Shape"></path>
                                    </g>
                                  </g>
                                </g>
                              </svg> */}
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
                  <button className="btn btn-primary btn-lg" type="submit">
                    {isCreditCard ? 'Pagar' : 'Gerar'}
                  </button>
                </footer>
              </form>
            </Formik>
          </div>
        </div>
      </main>
    </div>
  );
}
