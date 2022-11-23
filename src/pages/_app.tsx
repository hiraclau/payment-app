import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
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
      <Script
        src="https://js.iugu.com/v2"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('script loaded correctly');
        }}></Script>
      <Component {...pageProps} />{' '}
    </>
  );
}
