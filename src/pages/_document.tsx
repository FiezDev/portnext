import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap"
            rel="stylesheet"
          />
          <link
            rel="icon"
            type="image/svg+xml"
            href="https://firebasestorage.googleapis.com/v0/b/fiezport.appspot.com/o/FFLogoW.png?alt=media&token=052af4c0-84cd-4d72-b85a-14a72b112458"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
