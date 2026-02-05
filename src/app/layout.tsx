/**
 * Root Layout
 *
 * This is a minimal root layout for Next.js App Router with next-intl.
 * The locale-specific layout handles navigation and footer.
 */

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Premium Hotel',
    template: '%s | Premium Hotel',
  },
  description: 'Experience luxury and comfort at our premium hotel. Perfect for business travelers and international guests.',
  keywords: ['hotel', 'luxury', 'accommodation', 'business travel', 'Seoul', '호텔', '숙박', '비즈니스'],
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
