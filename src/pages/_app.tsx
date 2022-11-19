import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    import('bootstrap');
  }, []);
  return (
    <>
      <Head>
        <title>Payment</title>
      </Head>
      <Component {...pageProps} />{' '}
    </>
  );
}
