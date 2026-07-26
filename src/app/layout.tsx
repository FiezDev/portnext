import ReactQueryProviders from '@/lib/react-query-providers';
// import { ThemeProvider } from '@/lib/theme-provider';
import type { Metadata } from 'next';
import { Noto_Sans_Thai, Titillium_Web } from 'next/font/google';
import Script from 'next/script';
import { ReactNode, Suspense } from 'react';
import AnalyticsTracker from '../components/global/AnalyticsTracker';
import FloatingChat from '../components/global/FloatingChat';
import '../styles/globals.css';

const titillium = Titillium_Web({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

// AC-T1-3: Thai-capable font so assistant Thai answers don't fall back to a
// latin-only stack. Exposed as --font-noto-thai so .chat-md can opt in without
// forcing it on the whole document.
const notoThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  display: 'swap',
  variable: '--font-noto-thai',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {isNotProduction && (
          <Script
            src="https://unpkg.com/react-scan/dist/auto.global.js"
            strategy="lazyOnload"
            async
          />
        )}
        {/* reCAPTCHA now lazy-loads inside the Recaptcha component (Contact only) */}
        <link rel="preconnect" href="https://fiez.imgix.net" crossOrigin="" />
      </head>
      <body className={`${titillium.className} ${notoThai.variable}`}>
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        > */}
        <Suspense>
          <AnalyticsTracker />
        </Suspense>
        <ReactQueryProviders>
          {children}
          {/* T7: global floating chat — sibling of children so it survives the
              in-page /portfolio PageId nav. */}
          <FloatingChat />
        </ReactQueryProviders>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
};

export default RootLayout;
