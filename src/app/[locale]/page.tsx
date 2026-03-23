export const runtime = 'edge';

/**
 * Home Page - Seoul Dragon City Style Layout
 *
 * Layout Structure:
 * 1. Full-screen Hero Slider
 * 2. Booking Bar
 * 3. Special Offers Section (with tabs)
 */

import dynamic from 'next/dynamic';
import { Locale } from '@/types';
import HeroSection from '@/components/sections/HeroSection';

const BookingBar = dynamic(() => import('@/components/BookingBar'), {
  ssr: false,
  loading: () => (
    <div className="w-full bg-[#111111] text-white border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="h-[54px]" />
      </div>
    </div>
  ),
});

const SpecialOffersSection = dynamic(
  () => import('@/components/sections/SpecialOffersSection'),
  {
    loading: () => (
      <div className="py-20 md:py-28 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="h-8 w-48 bg-neutral-200 mx-auto mb-12 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white aspect-[4/3] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    ),
  }
);

interface HomePageProps {
  params: { locale: string };
}

function HotelJsonLd({ locale }: { locale: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: 'STAY HOTEL in PYEONGTAEK',
    description: locale === 'ko'
      ? '평택역 도보 2분, 프리미엄 부띠크 호텔'
      : '2 min walk from Pyeongtaek Station, Premium Boutique Hotel',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://pyeongtaekstay.com',
    telephone: '031-654-3333',
    email: 'ptstayhotel@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '평택1로 7',
      addressLocality: '평택시',
      addressRegion: '경기도',
      postalCode: '17764',
      addressCountry: 'KR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 36.9921,
      longitude: 127.0857,
    },
    checkinTime: '15:00',
    checkoutTime: '12:00',
    currenciesAccepted: 'KRW',
    paymentAccepted: 'Cash, Credit Card',
    priceRange: '₩₩',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// 홈 신뢰 정보 모듈 — 핵심 운영 정보를 빠르게 전달
const trustItems: { icon: string; label: Record<string, string> }[] = [
  { icon: '🕐', label: { ko: '체크인 15:00', en: 'Check-in 15:00', ja: 'チェックイン 15:00', zh: '入住 15:00' } },
  { icon: '🕛', label: { ko: '체크아웃 12:00', en: 'Check-out 12:00', ja: 'チェックアウト 12:00', zh: '退房 12:00' } },
  { icon: '🅿️', label: { ko: '주차 가능', en: 'Parking Available', ja: '駐車場あり', zh: '可停车' } },
  { icon: '💳', label: { ko: '현장 결제 (카드/현금)', en: 'Pay on-site (Card/Cash)', ja: '現地決済 (カード/現金)', zh: '到店付款 (卡/现金)' } },
  { icon: '✉️', label: { ko: '호텔 확인 후 확정', en: 'Confirmed after review', ja: 'ホテル確認後確定', zh: '酒店确认后确定' } },
];

function TrustInfoStrip({ locale }: { locale: string }) {
  return (
    <div className="bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:gap-x-10">
          {trustItems.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-600">
              <span className="text-sm">{item.icon}</span>
              <span>{item.label[locale] || item.label.en}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = params;

  return (
    <>
      <HotelJsonLd locale={locale} />
      {/* Hero Section - Full Screen Slider */}
      <HeroSection locale={locale as Locale} />
      {/* Booking Bar - Quick Reservation */}
      <BookingBar locale={locale as Locale} />
      {/* Trust Info Strip */}
      <TrustInfoStrip locale={locale} />
      {/* Special Offers Section */}
      <SpecialOffersSection locale={locale as Locale} />
    </>
  );
}
