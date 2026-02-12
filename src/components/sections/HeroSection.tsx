'use client';

/**
 * Hero Section - Seoul Dragon City Style
 *
 * Features:
 * - Full-screen image/video slider
 * - High contrast text with shadows
 * - Slide navigation arrows
 * - Ken Burns effect
 * - Scroll down indicator
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Locale } from '@/types';

// Tiny 4x3 blurred placeholder for perceived loading performance
const BLUR_PLACEHOLDER = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAADAAQDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAABv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AhgA//9k=';

interface HeroSectionProps {
  locale: Locale;
}

interface SlideData {
  type: 'video' | 'image';
  url: string;
  title: { ko: string; en: string; ja: string; zh: string };
  subtitle: { ko: string; en: string; ja: string; zh: string };
}

// Slider content
const sliderImages: SlideData[] = [
  {
    type: 'image',
    url: '/images/rooms/party-suite/5.JPG',
    title: { ko: '도심 속 완벽한 휴식', en: 'Perfect Urban Retreat', ja: '都心の完璧な休息', zh: '城市中的完美休憩' },
    subtitle: { ko: '평택의 랜드마크, 스테이호텔에서 특별한 하루를', en: 'A Landmark in Pyeongtaek, Experience Luxury', ja: '平澤のランドマーク、ステイホテルで特別な一日を', zh: '平泽地标，在Stay Hotel度过特别的一天' },
  },
  {
    type: 'image',
    url: '/images/rooms/royal-suite/9.JPG',
    title: { ko: '프리미엄 비즈니스 스테이', en: 'Premium Business Stay', ja: 'プレミアムビジネスステイ', zh: '高端商务住宿' },
    subtitle: { ko: '비즈니스와 휴식의 완벽한 조화', en: 'Where business meets comfort', ja: 'ビジネスと休息の完璧な調和', zh: '商务与舒适的完美融合' },
  },
  {
    type: 'image',
    url: '/images/rooms/deluxe/5.JPG',
    title: { ko: '특별한 순간을 위한 공간', en: 'Space for Special Moments', ja: '特別なひとときのための空間', zh: '为特别时刻打造的空间' },
    subtitle: { ko: '소중한 추억을 만들어 드립니다', en: 'Creating precious memories', ja: '大切な思い出をお作りします', zh: '为您创造珍贵的回忆' },
  },
];

export default function HeroSection({ locale }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentContent = sliderImages[currentSlide];

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Slider Background */}
      <div className="absolute inset-0 bg-black">
        {sliderImages.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
          >
            {slide.type === 'video' ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              >
                <source src={slide.url} type="video/mp4" />
              </video>
            ) : (
              <Image
                src={slide.url}
                alt={slide.title.en}
                fill
                className={`object-cover ${index === currentSlide ? 'animate-kenburns' : ''}`}
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
                sizes="100vw"
                quality={75}
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
              />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
          </div>
        ))}
      </div>

      {/* Content - Slightly above center */}
      <div className="relative z-20 h-full flex items-start justify-center px-4 pt-[28vh] md:pt-[38vh]">
        <div className="text-center max-w-5xl">
          {/* Main Title */}
          <div className="overflow-hidden">
            <h1
              key={`title-${currentSlide}`}
              className="text-white text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-medium leading-tight animate-fadeInUp delay-200"
              style={{
                textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)',
                animationDelay: '0.3s',
                animationFillMode: 'both'
              }}
            >
              {currentContent.title[locale]}
            </h1>
          </div>

          {/* Subtitle */}
          <p
            key={`subtitle-${currentSlide}`}
            className="text-white/80 text-base md:text-lg lg:text-xl mt-4 md:mt-6 tracking-wide font-light animate-fadeInUp"
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.4)',
              animationDelay: '0.6s',
              animationFillMode: 'both'
            }}
          >
            {currentContent.subtitle[locale]}
          </p>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-16 md:bottom-24 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-70">
        <span className="text-white/60 text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <div className="w-px h-8 bg-white/40 animate-pulse" />
      </div>

      {/* Slide Indicators - Bottom center */}
      <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {sliderImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-0.5 transition-all duration-500 ${index === currentSlide
                ? 'w-12 bg-white'
                : 'w-6 bg-white/40 hover:bg-white/60'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
