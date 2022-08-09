import "@/styles/globals.css";
import { AppProps } from "next/app";
import Layout from "@/src/components/layoutPortfolio";
import React from "react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
