export {};

declare global {
  interface Window {
    grecaptcha: Grecaptcha;
    gtag: (...args: any[]) => void;
  }

  interface Grecaptcha {
    ready(callback: () => void): void;
    render(
      container: HTMLElement | string,
      parameters: RecaptchaParameters
    ): number;
    execute(sitekey: string, options?: ReCaptchaV3Options): Promise<string>;
    reset(widgetId?: number): void;
  }

  interface RecaptchaParameters {
    sitekey: string;
    callback: (token: string) => void;
    'error-callback'?: () => void;
    'expired-callback'?: () => void;
    theme?: 'light' | 'dark';
    size?: 'compact' | 'normal' | 'invisible';
    tabindex?: number;
    [key: string]: any;
  }

  interface ReCaptchaV3Options {
    action: string;
    [key: string]: any;
  }
}
