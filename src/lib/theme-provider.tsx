import { Attribute, ThemeProvider as NextThemesProvider } from 'next-themes';
import React from 'react';

interface CustomThemeProviderProps {
  readonly children: React.ReactNode;
  readonly attribute?: Attribute | Attribute[];
  readonly defaultTheme?: string;
  readonly enableSystem?: boolean;
  readonly disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
  children,
  attribute,
  defaultTheme,
  enableSystem,
  disableTransitionOnChange,
}: CustomThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
    >
      {children}
    </NextThemesProvider>
  );
}
