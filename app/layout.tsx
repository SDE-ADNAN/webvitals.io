import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WebVitals.io - Real-Time Web Performance Monitoring',
  description: 'Monitor your website Core Web Vitals in real-time',
  keywords: ['web vitals', 'performance monitoring', 'core web vitals', 'LCP', 'FID', 'CLS'],
  authors: [{ name: 'Adnan Khan', url: 'https://github.com/SDE-ADNAN' }],
  creator: 'Adnan Khan',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://webvitals.io',
    title: 'WebVitals.io - Real-Time Web Performance Monitoring',
    description: 'Monitor your website Core Web Vitals in real-time',
    siteName: 'WebVitals.io',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebVitals.io - Real-Time Web Performance Monitoring',
    description: 'Monitor your website Core Web Vitals in real-time',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
