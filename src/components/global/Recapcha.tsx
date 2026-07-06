'use client';

import { useEffect, useRef } from 'react';

interface RecaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

const SCRIPT_SRC = 'https://www.google.com/recaptcha/api.js?render=explicit';

// Loads the reCAPTCHA script once, on first widget mount — instead of
// blocking every page of the site from the root layout.
const loadRecaptcha = (onReady: () => void) => {
  if (window.grecaptcha) {
    onReady();
    return;
  }
  const existing = document.querySelector<HTMLScriptElement>(
    `script[src^="https://www.google.com/recaptcha/api.js"]`
  );
  if (existing) {
    existing.addEventListener('load', onReady, { once: true });
    return;
  }
  const script = document.createElement('script');
  script.src = SCRIPT_SRC;
  script.async = true;
  script.defer = true;
  script.addEventListener('load', onReady, { once: true });
  document.head.appendChild(script);
};

const Recaptcha: React.FC<RecaptchaProps> = ({ siteKey, onVerify }) => {
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  useEffect(() => {
    if (!siteKey) {
      console.warn(
        'reCAPTCHA: NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set — skipping widget render.'
      );
      return;
    }

    let cancelled = false;

    loadRecaptcha(() => {
      if (cancelled) return;
      window.grecaptcha.ready(() => {
        if (cancelled) return;
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
    });

    return () => {
      cancelled = true;
      if (widgetId.current !== null && window.grecaptcha) {
        window.grecaptcha.reset(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [siteKey, onVerify]);

  return <div ref={recaptchaRef}></div>;
};

export default Recaptcha;
