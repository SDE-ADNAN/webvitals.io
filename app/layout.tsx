import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WebVitals.io - Real-Time Web Performance Monitoring',
  description: 'Monitor your website Core Web Vitals in real-time',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
