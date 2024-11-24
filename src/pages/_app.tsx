import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import '@/styles/globals.css';
import { NextPageWithLayout } from '../pageWithLayouts';

import { ThemeProvider } from '@material-tailwind/react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

import { logEvent } from 'firebase/analytics';
import { analytics } from '../lib/firebase/initFirebase';

interface AppPropsWithLayout extends AppProps {
  Component: NextPageWithLayout;
}

function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || ((page) => page);
  const key: string = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (analytics) {
        logEvent(analytics, 'page_view', {
          page_path: url,
          page_title: document.title,
          page_location: window.location.href,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <GoogleReCaptchaProvider reCaptchaKey={key}>
      <ThemeProvider>{getLayout(<Component {...pageProps} />)}</ThemeProvider>
    </GoogleReCaptchaProvider>
  );
}

export default App;
