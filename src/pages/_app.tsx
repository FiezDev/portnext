import '@/styles/globals.css';
import { ThemeProvider } from '@material-tailwind/react';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { NextPageWithLayout } from '../pageWithLayouts';

interface AppPropsWithLayout extends AppProps {
  Component: NextPageWithLayout;
}
function App({ Component, pageProps }: AppPropsWithLayout) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/serviceWorker.js').then(
          function (registration) {
            console.log(
              'Service Worker registration successful with scope: ',
              registration.scope
            );
          },
          function (err) {
            console.log('Service Worker registration failed: ', err);
          }
        );
      });
    }
  }, []);

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <ThemeProvider>{getLayout(<Component {...pageProps} />)}</ThemeProvider>
  );
}

export default App;
