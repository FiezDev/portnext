import ReactQueryProviders from '@/lib/react-query-providers';
import { ThemeProvider } from '@/lib/theme-provider';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Titillium_Web } from 'next/font/google';
import Script from 'next/script';
import { ReactNode } from 'react';

const titillium = Titillium_Web({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Portfolio | Developer & Designer',
  description: 'Professional portfolio showcasing development and design work',
};

type RootLayoutProps = {
  children?: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => {
  const shouldLoadScript = process.env.VERCEL_ENV !== 'production';
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {shouldLoadScript && (
          <Script
            src="https://unpkg.com/react-scan/dist/auto.global.js"
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
          <ReactQueryProviders>{children}</ReactQueryProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
