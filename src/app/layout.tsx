import ReactQueryProviders from '@/lib/react-query-providers';
import { ThemeProvider } from '@/lib/theme-provider';
import type { Metadata } from 'next';
import { Titillium_Web } from 'next/font/google';
import Script from 'next/script';
import { ReactNode } from 'react';
import AnalyticsTracker from '../components/global/AnalyticsTracker';
import '../styles/globals.css';

const titillium = Titillium_Web({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ittipol Portfolio',
  description: 'Portfolio showcasing development and personal profile',
};

type RootLayoutProps = {
  children?: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => {
  const isNotProduction = process.env.NODE_ENV !== 'production';
  return (
    <html lang="en">
      <head>
        {isNotProduction && (
          <Script
            src="https://unpkg.com/react-scan/dist/auto.global.js"
            strategy="lazyOnload"
            async
          />
        )}
        <Script
          src="https://www.google.com/recaptcha/api.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={titillium.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AnalyticsTracker />
          <ReactQueryProviders>{children}</ReactQueryProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
