/**
 * Home Page - Seoul Dragon City Style Layout
 *
 * Layout Structure:
 * 1. Full-screen Hero Slider
 * 2. Hotel Brands/Services Section
 * 3. Special Offers Section (with tabs)
 * 4. Split Membership Section
 * 5. Blog/News Section
 */

import { Locale } from '@/types';
import HeroSection from '@/components/sections/HeroSection';
import BookingBar from '@/components/BookingBar';


import SpecialOffersSection from '@/components/sections/SpecialOffersSection';

import BlogSection from '@/components/sections/BlogSection';

interface HomePageProps {
  params: { locale: string };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = params;

  return (
    <>
      {/* Hero Section - Full Screen Slider */}
      <HeroSection locale={locale as Locale} />

      {/* Booking Bar - Quick Reservation */}
      <BookingBar locale={locale as Locale} />


      {/* Special Offers Section */}
      <SpecialOffersSection locale={locale as Locale} />


      {/* Blog Section */}
      <BlogSection locale={locale as Locale} />
    </>
  );
}
