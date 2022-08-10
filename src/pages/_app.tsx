import React from 'react';
import { ReactElement } from 'react';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '@material-tailwind/react';
import PageWithLayoutType from '../pageWithLayouts';
import '@/styles/globals.css';

type AppLayoutProps = AppProps & {
  Component: PageWithLayoutType;
  pageProps: any;
};

function App({ Component, pageProps }: AppLayoutProps) {
  const Layout =
    Component.layout || ((children: ReactElement) => <>{children}</>);
  return (
    <ThemeProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}
export default App;
