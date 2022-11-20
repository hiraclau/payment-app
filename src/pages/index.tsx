import { Formik, useFormik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';

export default function HomePage() {
  const [paymentType, setPaymentType] = useState('');
  const isCreditCard = 'credit-card' === paymentType;
  const paymentOptions = {
    'credit-card': 'credit_card',
    'bank-slip': 'boleto',
    pix: 'pix',
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
    formik.setFieldValue('ccNumber', creditCardMask(value), true);
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
                          <input
                            type="text"
                            className="form-control"
                            id="ccNumber"
                            {...formik.getFieldProps('ccNumber')}
                            onChange={handleCreditCardChange}
                            maxLength={19}
                          />
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

                <button className="btn btn-primary btn-lg" type="submit">
                  {isCreditCard ? 'Pagar' : 'Gerar'}
                </button>
              </form>
            </Formik>
          </div>
        </div>
      </main>
    </div>
  );
}
