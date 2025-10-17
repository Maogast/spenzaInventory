// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Remove the viewport meta tag from here */}
          {/* DataGrid CSS */}
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/@mui/x-data-grid@8.7.0/dist/index.css"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}