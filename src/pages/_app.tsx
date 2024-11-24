import type { AppProps } from 'next/app';

import '@/styles/globals.css';
import { NextPageWithLayout } from '../pageWithLayouts';

import { ThemeProvider } from '@material-tailwind/react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

interface AppPropsWithLayout extends AppProps {
  Component: NextPageWithLayout;
}
function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || ((page) => page);
  const key: any = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={key}
    >
      <ThemeProvider>{getLayout(<Component {...pageProps} />)}</ThemeProvider>
    </GoogleReCaptchaProvider>
  );
}

export default App;
