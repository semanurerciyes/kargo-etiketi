// pages/_app.tsx
import "../styles/print.css";
import '../styles/globals.css'; // ✅ CSS dosyasını projeye dahil ediyor
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
