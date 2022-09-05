import '@/styles/globals.css';
import { ThemeProvider } from '@material-tailwind/react';
import type { AppProps } from 'next/app';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { NextPageWithLayout } from '../pageWithLayouts';

interface AppPropsWithLayout extends AppProps {
  Component: NextPageWithLayout;
}
function App({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey="6LfBo9IhAAAAAN8QoD9rxKKoZeIT26tagRNpcG2I"
      scriptProps={{
        async: false,
        defer: false,
        appendTo: 'head',
        nonce: undefined,
      }}
    >
      <ThemeProvider>{getLayout(<Component {...pageProps} />)}</ThemeProvider>
    </GoogleReCaptchaProvider>
  );
}

export default App;
