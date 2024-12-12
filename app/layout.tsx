import { ThemeProvider } from '@/lib/theme-provider';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import Providers from './providers';
import { Titillium_Web } from 'next/font/google'

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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={titillium.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>{children} </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
