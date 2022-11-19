import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

export default function HomePage() {
  const calcDigit = (numbers: string[], length: number, verifyingDigit = 0) => {
    const sum = numbers.reduce(
      (previous: any, current: any, index: number) => parseInt(previous) + parseInt(current) * (length - index),
      0,
    );
    return ((verifyingDigit * 9 + sum) % 11) % 10;
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

  const formik = useFormik({
    initialValues: {
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
    },
    validationSchema: Yup.object({
      name: Yup.string().min(2, 'Deve ter no máximo 2 caracteres').required('Preenchimento obrigatório'),
      email: Yup.string().email('Endereço de e-mail inválido').required('Preenchimento obrigatório'),
      document: Yup.string()
        .required('Preenchimento obrigatório')
        .test('CPF', 'CPF inválido', value => validateCpf(value)),
      mobile: Yup.string().required('Preenchimento obrigatório'),
      number: Yup.string().required('Preenchimento obrigatório'),
      address: Yup.string().required('Preenchimento obrigatório'),
      neighborhood: Yup.string().required('Preenchimento obrigatório'),
      city: Yup.string().required('Preenchimento obrigatório'),
      state: Yup.string().required('Preenchimento obrigatório'),
      zipCode: Yup.string().required('Preenchimento obrigatório'),
    }),

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

  return (
    <div className="container">
      <main>
        <div className="row g-5 d-flex justify-content-center">
          <div className="col-md-7 col-lg-8">
            <h4 className="mb-3 text-center">Pagamento</h4>
            <form className="needs-validation" onSubmit={formik.handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="name" className="form-label">
                    Nome
                  </label>
                  <input type="text" className="form-control" id="name" {...formik.getFieldProps('name')} />
                  {formik.touched.name && formik.errors.name ? <div className="">{formik.errors.name}</div> : null}
                </div>
                <div className="col-sm-6">
                  <label htmlFor="document" className="form-label">
                    CPF
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="document"
                    placeholder="XXX.XXX.XXX-XX"
                    {...formik.getFieldProps('document')}
                    onChange={handleDocumentChange}
                    maxLength={14}
                  />
                  {formik.touched.document && formik.errors.document ? (
                    <div className="">{formik.errors.document}</div>
                  ) : null}
                </div>
                <div className="col-sm-6">
                  <label htmlFor="mobile" className="form-label">
                    Celular
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="mobile"
                    {...formik.getFieldProps('mobile')}
                    onChange={handleMobileChange}
                    maxLength={15}
                  />
                  {formik.touched.mobile && formik.errors.mobile ? (
                    <div className="">{formik.errors.mobile}</div>
                  ) : null}
                </div>
                <div className="col-12">
                  <label htmlFor="email" className="form-label">
                    E-mail
                  </label>
                  <input type="text" className="form-control" id="email" {...formik.getFieldProps('email')} />
                  {formik.touched.email && formik.errors.email ? <div className="">{formik.errors.email}</div> : null}
                </div>
                <div className="col-12">
                  <label htmlFor="address" className="form-label">
                    Endereço
                  </label>
                  <input type="text" className="form-control" id="address" {...formik.getFieldProps('address')} />
                  {formik.touched.address && formik.errors.address ? (
                    <div className="">{formik.errors.address}</div>
                  ) : null}
                </div>
                <div className="col-md-2">
                  <label htmlFor="number" className="form-label">
                    Número
                  </label>
                  <input type="text" className="form-control" id="number" {...formik.getFieldProps('number')} />
                  {formik.touched.number && formik.errors.number ? (
                    <div className="">{formik.errors.number}</div>
                  ) : null}
                </div>
                <div className="col-md-4">
                  <label htmlFor="zipCode" className="form-label">
                    CEP
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="zipCode"
                    {...formik.getFieldProps('zipCode')}
                    onChange={handleZipCodeChange}
                    maxLength={9}
                  />
                  {formik.touched.zipCode && formik.errors.zipCode ? (
                    <div className="">{formik.errors.zipCode}</div>
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
                    <div className="">{formik.errors.neighborhood}</div>
                  ) : null}
                </div>
                <div className="col-md-2">
                  <label htmlFor="state" className="form-label">
                    Estado
                  </label>
                  <input type="text" className="form-control" id="state" {...formik.getFieldProps('state')} />
                  {formik.touched.state && formik.errors.state ? <div className="">{formik.errors.state}</div> : null}
                </div>
                <div className="col-md-4">
                  <label htmlFor="city" className="form-label">
                    Cidade
                  </label>
                  <input type="text" className="form-control" id="city" {...formik.getFieldProps('city')} />
                  {formik.touched.city && formik.errors.city ? <div className="">{formik.errors.city}</div> : null}
                </div>
              </div>

              <hr className="my-4" />
              {/* 
              <h4 className="mb-3">Payment</h4>

              <div className="my-3">
                <div className="form-check">
                  <input id="credit" name="paymentMethod" type="radio" className="form-check-input" />
                  <label className="form-check-label" htmlFor="credit">
                    Credit card
                  </label>
                </div>
                <div className="form-check">
                  <input id="debit" name="paymentMethod" type="radio" className="form-check-input" />
                  <label className="form-check-label" htmlFor="debit">
                    Debit card
                  </label>
                </div>
                <div className="form-check">
                  <input id="paypal" name="paymentMethod" type="radio" className="form-check-input" />
                  <label className="form-check-label" htmlFor="paypal">
                    PayPal
                  </label>
                </div>
              </div>

              <div className="row gy-3">
                <div className="col-md-6">
                  <label htmlFor="cc-name" className="form-label">
                    Name on card
                  </label>
                  <input type="text" className="form-control" id="cc-name" {...formik.getFieldProps('mobile')} />
                  <small className="text-muted">Full name as displayed on card</small>
                  <div className="invalid-feedback">Name on card is required</div>
                  <div
                    data-lastpass-icon-root="true"
                    //         style="
                    //   position: relative !important;
                    //   height: 0px !important;
                    //   width: 0px !important;
                    //   float: left !important;
                    // "
                  ></div>
                </div>

                <div className="col-md-6">
                  <label htmlFor="cc-number" className="form-label">
                    Credit card number
                  </label>
                  <input type="text" className="form-control" id="cc-number" {...formik.getFieldProps('mobile')} />
                  <div className="invalid-feedback">Credit card number is required</div>
                </div>

                <div className="col-md-3">
                  <label htmlFor="cc-expiration" className="form-label">
                    Expiration
                  </label>
                  <input type="text" className="form-control" id="cc-expiration" {...formik.getFieldProps('mobile')} />
                  <div className="invalid-feedback">Expiration date required</div>
                </div>

                <div className="col-md-3">
                  <label htmlFor="cc-cvv" className="form-label">
                    CVV
                  </label>
                  <input type="text" className="form-control" id="cc-cvv" {...formik.getFieldProps('mobile')} />
                  <div className="invalid-feedback">Security code required</div>
                </div>
              </div>

              <hr className="my-4" /> */}

              <button className="w-100 btn btn-primary btn-lg" type="submit">
                Continue to checkout
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
