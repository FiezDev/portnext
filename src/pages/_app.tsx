import '@/styles/globals.css';
import { ThemeProvider } from '@material-tailwind/react';
import type { AppProps } from 'next/app';
import { NextPageWithLayout } from '../pageWithLayouts';

interface AppPropsWithLayout extends AppProps {
  Component: NextPageWithLayout;
}
function App({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <ThemeProvider>{getLayout(<Component {...pageProps} />)}</ThemeProvider>
  );
}

export default App;
