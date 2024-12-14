'use client';

import { useEffect, useRef } from 'react';

interface RecaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

const Recaptcha: React.FC<RecaptchaProps> = ({ siteKey, onVerify }) => {
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  useEffect(() => {
    if (!window.grecaptcha) {
      console.error('reCAPTCHA not loaded');
      return;
    }

    window.grecaptcha.ready(() => {
      if (recaptchaRef.current && widgetId.current === null) {
        widgetId.current = window.grecaptcha.render(recaptchaRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            onVerify(token);
          },
          'error-callback': () => {
            console.error('reCAPTCHA error');
          },
          'expired-callback': () => {
            console.warn('reCAPTCHA expired');
          },
          theme: 'light',
          size: 'normal',
        });
      }
    });

    return () => {
      if (widgetId.current !== null && window.grecaptcha) {
        window.grecaptcha.reset(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [siteKey, onVerify]);

  return <div ref={recaptchaRef}></div>;
};

export default Recaptcha;
