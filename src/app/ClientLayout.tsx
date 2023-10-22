'use client';

import '@/styles/globals.css';
import { ThemeProvider } from '@material-tailwind/react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const key: any = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={key}
      scriptProps={{
        async: false,
        defer: false,
        appendTo: 'head',
        nonce: undefined,
      }}
    >
      <ThemeProvider>
        <>{children}</>
      </ThemeProvider>
    </GoogleReCaptchaProvider>
  );
}
