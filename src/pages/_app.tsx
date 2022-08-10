
import React from "react";
import type { ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'
import { AppProps } from "next/app";

import { ThemeProvider } from "@material-tailwind/react";

import PageWithLayoutType from "../pageWithLayouts";
import "@/styles/globals.css";


export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppLayoutProps = AppProps & {
  Component: PageWithLayoutType
  pageProps: any
}

function App({ Component, pageProps }: AppLayoutProps) {
  const Layout =
    Component.layout || ((children: ReactElement) => <>{children}</>)
return (
  <ThemeProvider>
    <Layout>
      <Component {...pageProps} />
    </Layout>
    </ThemeProvider>
  )
}
export default App